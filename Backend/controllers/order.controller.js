import crypto from "crypto";
import PDFDocument from "pdfkit";
import Razorpay from "razorpay";
import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Helper to process order creation in DB
 */
const processOrderCreation = async (
  userId,
  addressId,
  couponCode,
  paymentDetails = null,
) => {
  console.log(`Processing Order Creation for User: ${userId}`);
  // 1. Get user's active cart
  const cart = await prisma.cart.findFirst({
    where: {
      userId: userId,
      status: "ACTIVE",
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    console.warn("Cart is empty or not found for user:", userId);
    throw new ApiError(400, "Cart is empty");
  }
  console.log(`Found Cart with ${cart.items.length} items`);

  // Group items by vendor
  const itemsByVendor = cart.items.reduce((acc, item) => {
    const vendorId = item.product.vendorId;
    if (!acc[vendorId]) acc[vendorId] = [];
    acc[vendorId].push(item);
    return acc;
  }, {});

  const createdOrders = [];

  // Start transaction
  await prisma.$transaction(async (tx) => {
    for (const [vendorId, items] of Object.entries(itemsByVendor)) {
      // Calculate totals
      const subTotal = items.reduce(
        (sum, item) => sum + Number(item.unitPrice) * item.quantity,
        0,
      );

      let discountAmount = 0;

      // Apply Coupon Logic
      if (couponCode) {
        const coupon = await prisma.coupon.findUnique({
          where: { code: couponCode },
        });

        if (coupon) {
          if (coupon.discountType === "PERCENTAGE") {
            discountAmount = (subTotal * coupon.discountValue) / 100;
          } else if (coupon.discountType === "FIXED") {
            discountAmount = coupon.discountValue;
          }
        }
      }

      const totalAfterDiscount = Math.max(0, subTotal - discountAmount);

      // FIX: unitPrice is tax-inclusive. Extract GST, don't add it.
      const finalAmount = totalAfterDiscount;
      const gstAmount = finalAmount - finalAmount / 1.18;
      // const gstAmount = totalAfterDiscount * 0.18; // OLD WRONG LOGIC
      // const finalAmount = totalAfterDiscount + gstAmount;

      // Create Order
      const order = await tx.order.create({
        data: {
          userId: userId,
          vendorId: vendorId,
          deliveryAddressId: addressId || undefined,
          status: "CONFIRMED",
          items: {
            create: items.map((item) => ({
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
                  quantity: item.quantity,
                },
              },
            })),
          },
        },
      });

      // Decrease inventory quantity for each ordered item
      for (const item of items) {
        await tx.productInventory.update({
          where: { productId: item.productId },
          data: {
            totalQty: {
              decrement: item.quantity,
            },
          },
        });
        console.log(
          `Decreased inventory for product ${item.productId} by ${item.quantity}`,
        );
      }

      // Create Invoice
      await tx.invoice.create({
        data: {
          orderId: order.id,
          totalAmount: finalAmount,
          gstAmount: gstAmount,
          status: "PAID",
          payments: {
            create: {
              amount: finalAmount,
              mode: paymentDetails?.mode || "ONLINE",
              status: "SUCCESS",
              transactionId: paymentDetails?.transactionId || undefined,
              paidAt: new Date(),
            },
          },
        },
      });

      createdOrders.push(order);
    }

    // Clear/Delete Cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  });

  return createdOrders;
};

/**
 * Create Razorpay Order
 * @route POST /api/orders/razorpay/create-order
 * @access Private
 */
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { couponCode, deliveryCost = 0 } = req.body;

  // Calculate amount from cart
  const cart = await prisma.cart.findFirst({
    where: { userId: req.user.id, status: "ACTIVE" },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  // Calculate total amount exactly like in order creation
  const itemsByVendor = cart.items.reduce((acc, item) => {
    const vendorId = item.product.vendorId;
    if (!acc[vendorId]) acc[vendorId] = [];
    acc[vendorId].push(item);
    return acc;
  }, {});

  let totalPayable = 0;

  for (const items of Object.values(itemsByVendor)) {
    const subTotal = items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0,
    );

    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });
      if (coupon) {
        if (coupon.discountType === "PERCENTAGE") {
          discountAmount = (subTotal * coupon.discountValue) / 100;
        } else if (coupon.discountType === "FIXED") {
          discountAmount = coupon.discountValue;
        }
      }
    }
    const totalAfterDiscount = Math.max(0, subTotal - discountAmount);

    // START FIX: unitPrice is already GST inclusive (from frontend cartStore)
    // So we don't add GST on top. We extract it for records.
    const finalAmount = totalAfterDiscount;
    const gstAmount = finalAmount - finalAmount / 1.18;
    totalPayable += finalAmount;
  }

  // Add delivery cost to total
  totalPayable += Number(deliveryCost) || 0;

  console.log(
    `Razorpay Create Order: Total Payable (inc GST + delivery) = ${totalPayable}`,
  );

  // Create Razorpay order
  const options = {
    amount: Math.round(totalPayable * 100), // amount in paisa
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { ...order, key: process.env.RAZORPAY_KEY_ID },
          "Razorpay order created",
        ),
      );
  } catch (error) {
    console.error("Razorpay Error:", error);
    throw new ApiError(500, "Failed to create Razorpay order");
  }
});

/**
 * Verify Razorpay Payment and Create Order
 * @route POST /api/orders/razorpay/verify
 * @access Private
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    addressId,
    couponCode,
    deliveryCost = 0,
  } = req.body;

  console.log("Verifying Razorpay Payment:", {
    razorpay_order_id,
    razorpay_payment_id,
  });

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature === razorpay_signature) {
    // Payment successful, create order in DB
    try {
      console.log("Signature Verified. Creating Order...");
      const createdOrders = await processOrderCreation(
        req.user.id,
        addressId,
        couponCode,
        {
          mode: "RAZORPAY",
          transactionId: razorpay_payment_id,
        },
      );
      console.log(
        "Order Created Successfully:",
        createdOrders.map((o) => o.id),
      );

      res.status(201).json(
        new ApiResponse(
          201,
          {
            orderIds: createdOrders.map((order) => order.id),
            count: createdOrders.length,
          },
          "Payment verified and order placed successfully",
        ),
      );
    } catch (error) {
      console.error("Order Creation Failed after Payment:", error);
      // Determine if it's an API error or generic
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        500,
        "Payment verified but order creation failed: " + error.message,
      );
    }
  } else {
    console.error("Signature Mismatch:", {
      generated_signature,
      received: razorpay_signature,
    });
    throw new ApiError(400, "Payment verification failed: Signature Mismatch");
  }
});

/**
 * Create order from cart (Legacy/Direct)
 * @route POST /api/orders
 * @access Private
 */
export const createOrder = asyncHandler(async (req, res) => {
  console.log("createOrder: Calling processOrderCreation directly");
  const { addressId, couponCode } = req.body;
  const createdOrders = await processOrderCreation(
    req.user.id,
    addressId,
    couponCode,
  );

  res.status(201).json(
    new ApiResponse(
      201,
      {
        orderIds: createdOrders.map((order) => order.id),
        count: createdOrders.length,
      },
      "Order placed successfully",
    ),
  );
});

// Force restart for Prisma Client update
// Get user's orders
export const getUserOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  console.log(
    `getUserOrders: Fetching for user ${req.user.id}, status=${status || "all"}`,
  );

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

export const getOrderById = getOrderDetails;

// Generate and download invoice PDF
export const generateInvoicePDF = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  try {
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
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.orderNumber}.pdf`,
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Helper function for drawing rounded rectangles
    const drawRoundedRect = (x, y, width, height, radius, fillColor) => {
      doc.roundedRect(x, y, width, height, radius).fill(fillColor);
    };

    // ========== HEADER SECTION ==========
    // Header background
    drawRoundedRect(40, 40, 515, 80, 8, "#1e40af");

    // Company name
    doc
      .fontSize(28)
      .fillColor("#ffffff")
      .text("RentX", 60, 55, { continued: false });

    doc
      .fontSize(10)
      .fillColor("#93c5fd")
      .text("Premium Rental Service Platform", 60, 88);

    // Invoice label on right
    doc
      .fontSize(24)
      .fillColor("#ffffff")
      .text("INVOICE", 400, 65, { align: "right", width: 140 });

    doc.moveDown(4);

    // ========== INVOICE DETAILS BOX ==========
    const detailsY = 140;
    drawRoundedRect(40, detailsY, 250, 100, 6, "#f1f5f9");
    drawRoundedRect(305, detailsY, 250, 100, 6, "#f1f5f9");

    // Left box - Invoice details (label on top, value below)
    doc.fontSize(8).fillColor("#64748b");
    doc.text("Invoice Number", 55, detailsY + 12);
    doc.fontSize(9).fillColor("#1e293b");
    doc.text(order.invoice?.invoiceNumber || "N/A", 55, detailsY + 24, {
      width: 100,
    });

    doc.fontSize(8).fillColor("#64748b");
    doc.text("Order Number", 160, detailsY + 12);
    doc.fontSize(9).fillColor("#1e293b");
    doc.text(order.orderNumber, 160, detailsY + 24, { width: 120 });

    doc.fontSize(8).fillColor("#64748b");
    doc.text("Date", 55, detailsY + 52);
    doc.fontSize(9).fillColor("#1e293b");
    doc.text(
      new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      55,
      detailsY + 64,
    );

    doc.fontSize(8).fillColor("#64748b");
    doc.text("Status", 160, detailsY + 52);
    // Status with color
    const statusColor =
      order.status === "CONFIRMED" ? "#16a34a"
      : order.status === "CANCELLED" ? "#dc2626"
      : "#f59e0b";
    doc
      .fontSize(9)
      .fillColor(statusColor)
      .text(order.status, 160, detailsY + 64);

    // Right box - Customer details
    doc
      .fontSize(11)
      .fillColor("#1e40af")
      .text("Bill To:", 320, detailsY + 12);
    doc.fontSize(10).fillColor("#1e293b");
    doc.text(
      `${order.user.firstName} ${order.user.lastName}`,
      320,
      detailsY + 32,
    );
    doc.fontSize(9).fillColor("#64748b");
    doc.text(order.user.email, 320, detailsY + 50);

    // Vendor info if exists
    if (order.vendor) {
      doc.fontSize(9).fillColor("#64748b");
      doc.text(
        `Vendor: ${order.vendor.companyName || `${order.vendor.user.firstName} ${order.vendor.user.lastName}`}`,
        320,
        detailsY + 68,
      );
    }

    // ========== ITEMS TABLE ==========
    const tableTop = 265;

    // Table header background
    drawRoundedRect(40, tableTop, 515, 30, 4, "#1e40af");

    // Table headers
    doc.fontSize(10).fillColor("#ffffff");
    doc.text("Item Description", 55, tableTop + 10, { width: 180 });
    doc.text("Period", 240, tableTop + 10, { width: 90 });
    doc.text("Qty", 335, tableTop + 10, { width: 40, align: "center" });
    doc.text("Rate", 385, tableTop + 10, { width: 70, align: "right" });
    doc.text("Amount", 465, tableTop + 10, { width: 75, align: "right" });

    // Table rows
    let yPosition = tableTop + 40;
    doc.fontSize(9);

    order.items.forEach((item, index) => {
      const startDate = new Date(item.rentalStart).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
      const endDate = new Date(item.rentalEnd).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });

      // Alternate row background
      if (index % 2 === 0) {
        doc.rect(40, yPosition - 5, 515, 28).fill("#f8fafc");
      }

      doc
        .fillColor("#1e293b")
        .text(item.product.name, 55, yPosition, { width: 180 });
      doc
        .fillColor("#64748b")
        .text(`${startDate} - ${endDate}`, 240, yPosition, { width: 90 });
      doc.fillColor("#1e293b").text(item.quantity.toString(), 335, yPosition, {
        width: 40,
        align: "center",
      });
      doc.text(`Rs. ${parseFloat(item.unitPrice).toFixed(2)}`, 385, yPosition, {
        width: 70,
        align: "right",
      });

      const lineTotal = item.quantity * parseFloat(item.unitPrice);
      doc
        .fillColor("#1e40af")
        .text(`Rs. ${lineTotal.toFixed(2)}`, 465, yPosition, {
          width: 75,
          align: "right",
        });

      yPosition += 28;
    });

    // Table bottom border
    doc
      .moveTo(40, yPosition + 5)
      .lineTo(555, yPosition + 5)
      .strokeColor("#e2e8f0")
      .stroke();

    // ========== TOTALS SECTION ==========
    yPosition += 25;

    // Totals box
    drawRoundedRect(350, yPosition, 205, 100, 6, "#f1f5f9");

    const subtotal = order.items.reduce(
      (sum, item) => sum + item.quantity * parseFloat(item.unitPrice),
      0,
    );
    const gstRate = 0.18;
    const baseAmount = subtotal / (1 + gstRate);
    const gstAmount = subtotal - baseAmount;

    // Totals text
    doc.fontSize(9).fillColor("#64748b");
    doc.text("Subtotal (excl. GST):", 365, yPosition + 15);
    doc.text("GST (18%):", 365, yPosition + 35);

    doc.fillColor("#1e293b");
    doc.text(`Rs. ${baseAmount.toFixed(2)}`, 480, yPosition + 15, {
      width: 60,
      align: "right",
    });
    doc.text(`Rs. ${gstAmount.toFixed(2)}`, 480, yPosition + 35, {
      width: 60,
      align: "right",
    });

    // Divider line
    doc
      .moveTo(365, yPosition + 55)
      .lineTo(540, yPosition + 55)
      .strokeColor("#cbd5e1")
      .stroke();

    // Grand total
    doc.fontSize(12).fillColor("#1e40af");
    doc.text("Total:", 365, yPosition + 70);
    doc.fontSize(14).fillColor("#1e40af");
    doc.text(`Rs. ${subtotal.toFixed(2)}`, 460, yPosition + 68, {
      width: 80,
      align: "right",
    });

    // ========== PAYMENT STATUS ==========
    if (
      order.invoice &&
      order.invoice.payments &&
      order.invoice.payments.length > 0
    ) {
      yPosition += 120;
      const successfulPayments = order.invoice.payments.filter(
        (p) => p.status === "SUCCESS",
      );

      const isPaid = successfulPayments.length > 0;
      const badgeColor = isPaid ? "#dcfce7" : "#fef3c7";
      const textColor = isPaid ? "#16a34a" : "#d97706";
      const statusText = isPaid ? "PAID" : "PENDING";

      drawRoundedRect(40, yPosition, 80, 25, 4, badgeColor);
      doc
        .fontSize(10)
        .fillColor(textColor)
        .text(statusText, 55, yPosition + 7);
    }

    // ========== FOOTER ==========
    doc
      .fontSize(9)
      .fillColor("#64748b")
      .text("Thank you for choosing RentX!", 40, 730, {
        align: "center",
        width: 515,
      });

    doc
      .fontSize(8)
      .fillColor("#94a3b8")
      .text(
        "For any queries, contact us at support@rentx.com | www.rentx.com",
        40,
        745,
        { align: "center", width: 515 },
      );

    // Footer line
    doc.moveTo(40, 720).lineTo(555, 720).strokeColor("#e2e8f0").stroke();

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw new ApiError(500, `Failed to generate PDF: ${error.message}`);
  }
});
