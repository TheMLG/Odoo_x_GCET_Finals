import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import PDFDocument from "pdfkit";

/**
 * Create order from cart
 * @route POST /api/orders
 * @access Private
 */
export const createOrder = asyncHandler(async (req, res) => {
    // 1. Get user's active cart
    console.log("createOrder: Fetching cart for user", req.user.id);
    const cart = await prisma.cart.findFirst({
        where: {
            userId: req.user.id,
            status: "ACTIVE"
        },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        }
    });

    if (!cart || cart.items.length === 0) {
        console.log("createOrder: Cart is empty or not found");
        throw new ApiError(400, "Cart is empty");
    }

    console.log("createOrder: Found cart with items:", cart.items.length);

    // 2. Group items by vendor (since we need separate orders per vendor ideally, but for now assuming single order per checkout or handling logic)
    // For this implementation, we'll assume one order per checkout for simplicity, or we can create multiple orders. 
    // Given the schema has `vendorId` on Order, we MUST create separate orders if items belong to different vendors.

    const itemsByVendor = cart.items.reduce((acc, item) => {
        const vendorId = item.product.vendorId;
        if (!acc[vendorId]) acc[vendorId] = [];
        acc[vendorId].push(item);
        return acc;
    }, {});

    console.log("createOrder: Grouped items by vendor:", Object.keys(itemsByVendor));

    const createdOrders = [];

    // Start transaction
    await prisma.$transaction(async (tx) => {
        for (const [vendorId, items] of Object.entries(itemsByVendor)) {
            console.log("createOrder: Creating order for vendor", vendorId);
            // Calculate totals
            const orderTotal = items.reduce((sum, item) => sum + (Number(item.unitPrice) * item.quantity), 0);
            const gstAmount = orderTotal * 0.18; // 18% GST
            const finalAmount = orderTotal + gstAmount;

            // Create Order
            const order = await tx.order.create({
                data: {
                    userId: req.user.id,
                    vendorId: vendorId,
                    status: "CONFIRMED",
                    items: {
                        create: items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            rentalStart: item.rentalStart,
                            rentalEnd: item.rentalEnd,
                            unitPrice: item.unitPrice,
                            reservations: {
                                create: {
                                    productId: item.productId,
                                    reservedFrom: item.rentalStart,
                                    reservedTo: item.rentalEnd,
                                    quantity: item.quantity
                                }
                            }
                        }))
                    }
                }
            });
            console.log("createOrder: Created order", order.id);

            // Create Invoice
            const invoice = await tx.invoice.create({
                data: {
                    orderId: order.id,
                    totalAmount: finalAmount,
                    gstAmount: gstAmount,
                    status: "PAID", // Assuming immediate payment for now
                    payments: {
                        create: {
                            amount: finalAmount,
                            mode: "ONLINE",
                            status: "SUCCESS",
                            paidAt: new Date()
                        }
                    }
                }
            });

            createdOrders.push(order);
        }

        // 3. Clear/Delete Cart
        console.log("createOrder: Deleting cart items");
        await tx.cartItem.deleteMany({
            where: { cartId: cart.id }
        });

        // Optionally delete the cart itself or keep it empty
        // await tx.cart.delete({ where: { id: cart.id } });
    });

    console.log("createOrder: Transaction complete. Orders created:", createdOrders.length);

    res.status(201).json(
        new ApiResponse(201, createdOrders, "Order placed successfully")
    );
});

// Force restart for Prisma Client update
// Get user's orders
export const getUserOrders = asyncHandler(async (req, res) => {
    const { status } = req.query;
    console.log(`getUserOrders: Fetching for user ${req.user.id}, status=${status || 'all'}`);

    const where = {
        userId: req.user.id,
        ...(status && { status }),
    };

    const orders = await prisma.order.findMany({
        where,
        include: {
            vendor: {
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            },
            items: {
                include: {
                    product: {
                        include: {
                            pricing: true,
                        },
                    },
                },
            },
            invoice: {
                include: {
                    payments: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    console.log(`getUserOrders: Found ${orders.length} orders`);
    res
        .status(200)
        .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

// Get single order details
export const getOrderDetails = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            userId: req.user.id,
        },
        include: {
            vendor: {
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            },
            items: {
                include: {
                    product: {
                        include: {
                            pricing: true,
                            inventory: true,
                        },
                    },
                },
            },
            invoice: {
                include: {
                    payments: true,
                },
            },
        },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    res
        .status(200)
        .json(new ApiResponse(200, order, "Order details fetched successfully"));
});

// Generate and download invoice PDF
export const generateInvoicePDF = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            userId: req.user.id,
        },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                },
            },
            vendor: {
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            },
            items: {
                include: {
                    product: true,
                },
            },
            invoice: {
                include: {
                    payments: true,
                },
            },
        },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice-${order.orderNumber}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Add company header
    doc
        .fontSize(20)
        .fillColor("#2563eb")
        .text("SharePal", { align: "left" })
        .fontSize(10)
        .fillColor("#666")
        .text("Rental Service Platform", { align: "left" })
        .moveDown(2);

    // Invoice title
    doc
        .fontSize(24)
        .fillColor("#000")
        .text("INVOICE", { align: "center" })
        .moveDown(1);

    // Order details section
    doc.fontSize(10).fillColor("#666");
    doc.text(`Order Number: ${order.orderNumber}`, 50, doc.y);
    doc.text(
        `Invoice Number: ${order.invoice?.invoiceNumber || "N/A"}`,
        50,
        doc.y
    );
    doc.text(
        `Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`,
        50,
        doc.y
    );
    doc.text(`Status: ${order.status}`, 50, doc.y);
    doc.moveDown(2);

    // Customer details
    doc.fontSize(12).fillColor("#000").text("Bill To:", 50, doc.y);
    doc.fontSize(10).fillColor("#666");
    doc.text(
        `${order.user.firstName} ${order.user.lastName}`,
        50,
        doc.y
    );
    doc.text(`${order.user.email}`, 50, doc.y);
    if (order.user.phone) {
        doc.text(`${order.user.phone}`, 50, doc.y);
    }
    doc.moveDown(2);

    // Vendor details
    if (order.vendor) {
        doc.fontSize(12).fillColor("#000").text("Vendor:", 50, doc.y);
        doc.fontSize(10).fillColor("#666");
        doc.text(
            order.vendor.companyName ||
            `${order.vendor.user.firstName} ${order.vendor.user.lastName}`,
            50,
            doc.y
        );
        if (order.vendor.gstNo) {
            doc.text(`GST No: ${order.vendor.gstNo}`, 50, doc.y);
        }
        doc.moveDown(2);
    }

    // Table header
    const tableTop = doc.y;
    doc.fontSize(10).fillColor("#000");

    // Draw table headers
    doc.text("Item", 50, tableTop, { width: 200 });
    doc.text("Rental Period", 260, tableTop, { width: 100 });
    doc.text("Qty", 370, tableTop, { width: 40, align: "center" });
    doc.text("Price", 420, tableTop, { width: 70, align: "right" });
    doc.text("Amount", 500, tableTop, { width: 70, align: "right" });

    // Draw line under header
    doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

    // Table rows
    let yPosition = tableTop + 25;
    doc.fontSize(9).fillColor("#666");

    order.items.forEach((item) => {
        const startDate = new Date(item.rentalStart).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
        });
        const endDate = new Date(item.rentalEnd).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
        });

        doc.text(item.product.name, 50, yPosition, { width: 200 });
        doc.text(`${startDate} - ${endDate}`, 260, yPosition, { width: 100 });
        doc.text(item.quantity.toString(), 370, yPosition, {
            width: 40,
            align: "center",
        });
        doc.text(`₹${parseFloat(item.unitPrice).toFixed(2)}`, 420, yPosition, {
            width: 70,
            align: "right",
        });
        const lineTotal = item.quantity * parseFloat(item.unitPrice);
        doc.text(`₹${lineTotal.toFixed(2)}`, 500, yPosition, {
            width: 70,
            align: "right",
        });

        yPosition += 30;
    });

    // Draw line before totals
    yPosition += 10;
    doc
        .moveTo(50, yPosition)
        .lineTo(550, yPosition)
        .stroke();
    yPosition += 15;

    // Calculate totals
    const subtotal = order.items.reduce(
        (sum, item) => sum + item.quantity * parseFloat(item.unitPrice),
        0
    );
    const gstRate = 0.18;
    const baseAmount = subtotal / (1 + gstRate);
    const gstAmount = subtotal - baseAmount;

    // Totals section
    doc.fontSize(10).fillColor("#666");
    doc.text("Subtotal (excl. GST):", 400, yPosition);
    doc.text(`₹${baseAmount.toFixed(2)}`, 500, yPosition, {
        width: 70,
        align: "right",
    });
    yPosition += 20;

    doc.text("GST (18%):", 400, yPosition);
    doc.text(`₹${gstAmount.toFixed(2)}`, 500, yPosition, {
        width: 70,
        align: "right",
    });
    yPosition += 20;

    // Draw line before grand total
    doc
        .moveTo(400, yPosition)
        .lineTo(550, yPosition)
        .stroke();
    yPosition += 15;

    // Grand total
    doc.fontSize(12).fillColor("#000");
    doc.text("Total:", 400, yPosition, { continued: false });
    doc.text(`₹${subtotal.toFixed(2)}`, 500, yPosition, {
        width: 70,
        align: "right",
    });

    // Payment status
    if (order.invoice && order.invoice.payments.length > 0) {
        yPosition += 40;
        doc.fontSize(10).fillColor("#666");
        doc.text("Payment Status:", 50, yPosition);
        const successfulPayments = order.invoice.payments.filter(
            (p) => p.status === "SUCCESS"
        );
        if (successfulPayments.length > 0) {
            doc.fillColor("#16a34a").text("PAID", 150, yPosition);
        } else {
            doc.fillColor("#dc2626").text("PENDING", 150, yPosition);
        }
    }

    // Footer
    doc
        .fontSize(8)
        .fillColor("#666")
        .text(
            "Thank you for choosing SharePal! For any queries, contact support@sharepal.com",
            50,
            750,
            { align: "center" }
        );

    // Finalize PDF
    doc.end();
});
