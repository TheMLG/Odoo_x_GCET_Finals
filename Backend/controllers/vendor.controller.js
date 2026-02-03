import bcrypt from "bcryptjs";
import PDFDocument from "pdfkit";
import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const parseJsonField = (value, fallback = null) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch (err) {
    return fallback;
  }
};

const normalizeAttributeSchema = (schema) => {
  if (!Array.isArray(schema)) return [];
  return schema
    .map((item) => ({
      name: typeof item?.name === "string" ? item.name.trim() : "",
      options:
        Array.isArray(item?.options) ?
          item.options.map((o) => String(o).trim()).filter(Boolean)
        : [],
    }))
    .filter((item) => item.name.length > 0 && item.options.length > 0);
};

const validateAttributeSchema = (schema) => {
  const names = schema.map((s) => s.name);
  const nameSet = new Set(names);
  if (nameSet.size !== names.length) {
    return "Attribute names must be unique";
  }
  return null;
};

const validateVariants = (variants, attributeSchema) => {
  if (!Array.isArray(variants) || variants.length === 0) return null;

  const schemaMap = new Map(
    attributeSchema.map((s) => [s.name, new Set(s.options)]),
  );

  const seenCombos = new Set();
  for (const v of variants) {
    if (!v || typeof v !== "object") {
      return "Invalid variant data";
    }

    const attrs = v.attributes || {};
    const attrKeys = Object.keys(attrs);
    if (attributeSchema.length > 0 && attrKeys.length === 0) {
      return "Variant attributes are required";
    }

    for (const key of attrKeys) {
      if (!schemaMap.has(key)) {
        return `Variant attribute "${key}" is not in attribute schema`;
      }
      const value = String(attrs[key]);
      const allowed = schemaMap.get(key);
      if (!allowed.has(value)) {
        return `Variant attribute "${key}" has invalid value "${value}"`;
      }
    }

    // Ensure all schema attributes are provided for the variant
    for (const schemaAttr of attributeSchema) {
      if (schemaAttr.name && !(schemaAttr.name in attrs)) {
        return `Variant missing attribute "${schemaAttr.name}"`;
      }
    }

    const comboKey = JSON.stringify(
      Object.keys(attrs)
        .sort()
        .reduce((acc, k) => {
          acc[k] = String(attrs[k]);
          return acc;
        }, {}),
    );
    if (seenCombos.has(comboKey)) {
      return "Duplicate variant attribute combinations are not allowed";
    }
    seenCombos.add(comboKey);

    if (!v.pricePerDay || Number(v.pricePerDay) <= 0) {
      return "Variant pricePerDay must be greater than 0";
    }
    if (v.totalQty === undefined || Number(v.totalQty) < 0) {
      return "Variant totalQty must be 0 or greater";
    }
  }

  return null;
};

// Get vendor profile
export const getVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
      },
      products: {
        include: {
          inventory: true,
          pricing: true,
        },
      },
    },
  });

  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, vendor, "Vendor profile fetched successfully"));
});

// Update vendor profile
export const updateVendorProfile = asyncHandler(async (req, res) => {
  const { companyName, gstNo, product_category } = req.body;

  const vendor = await prisma.vendor.update({
    where: { userId: req.user.id },
    data: {
      ...(companyName && { companyName }),
      ...(gstNo && { gstNo }),
      ...(product_category && { product_category }),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, vendor, "Vendor profile updated successfully"));
});

// Update vendor user information (personal details)
export const updateVendorUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone } = req.body;

  // Check if email already exists for a different user
  if (email) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== req.user.id) {
      throw new ApiError(400, "Email already exists");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(email && { email }),
      ...(phone !== undefined && { phone: phone || null }),
    },
    include: {
      vendor: true,
    },
  });

  // Remove password from response
  const { password, ...userWithoutPassword } = updatedUser;

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userWithoutPassword,
        "User information updated successfully",
      ),
    );
});

// Change vendor password
export const changeVendorPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validation
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters long");
  }

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      password: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      password: hashedPassword,
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed successfully"));
});

// Create new product
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    pricePerHour,
    pricePerDay,
    pricePerWeek,
    totalQty,
    isPublished,
    attributeSchema: attributeSchemaRaw,
    variants: variantsRaw,
  } = req.body;

  const hasAttributeSchemaPayload = attributeSchemaRaw !== undefined;
  const attributeSchema = normalizeAttributeSchema(
    parseJsonField(attributeSchemaRaw, []),
  );
  const variants = parseJsonField(variantsRaw, []);

  const hasVariants = Array.isArray(variants) && variants.length > 0;

  if (hasVariants) {
    const schemaError = validateAttributeSchema(attributeSchema);
    if (schemaError) {
      throw new ApiError(400, schemaError);
    }
    const variantError = validateVariants(variants, attributeSchema);
    if (variantError) {
      throw new ApiError(400, variantError);
    }
  }

  if (!name || (!hasVariants && (!pricePerDay || !totalQty))) {
    throw new ApiError(
      400,
      hasVariants ?
        "Name is required"
      : "Name, daily price and total quantity are required",
    );
  }

  // Handle image upload
  let product_image_url;
  if (req.file) {
    const uploadResponse = await uploadOnCloudinary(req.file.path);
    if (!uploadResponse) {
      throw new ApiError(500, "Failed to upload image");
    }
    product_image_url = uploadResponse.url;
  } else {
    throw new ApiError(400, "Product image is required");
  }

  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
  });

  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found");
  }

  // Use transaction to ensure all related records are created
  const product = await prisma.$transaction(async (tx) => {
    // 1. Create Product
    const newProduct = await tx.product.create({
      data: {
        vendorId: vendor.id,
        name,
        description,
        category,
        product_image_url,
        isPublished: isPublished === "true" || isPublished === true,
        attributeSchema: attributeSchema.length > 0 ? attributeSchema : null,
      },
    });

    if (hasVariants) {
      const variantData = variants.map((v) => ({
        productId: newProduct.id,
        name: v.name || null,
        attributes: v.attributes || {},
        pricePerHour:
          v.pricePerHour !== undefined && v.pricePerHour !== "" ?
            parseFloat(v.pricePerHour)
          : null,
        pricePerDay: parseFloat(v.pricePerDay),
        pricePerWeek:
          v.pricePerWeek !== undefined && v.pricePerWeek !== "" ?
            parseFloat(v.pricePerWeek)
          : null,
        pricePerMonth:
          v.pricePerMonth !== undefined && v.pricePerMonth !== "" ?
            parseFloat(v.pricePerMonth)
          : null,
        totalQty: parseInt(v.totalQty),
        isActive: v.isActive !== false,
      }));

      await tx.productVariant.createMany({
        data: variantData,
      });

      const totalVariantQty = variantData.reduce(
        (sum, v) => sum + (v.totalQty || 0),
        0,
      );

      await tx.productInventory.create({
        data: {
          productId: newProduct.id,
          totalQty: totalVariantQty,
        },
      });
    } else {
      // 2. Create ProductInventory
      await tx.productInventory.create({
        data: {
          productId: newProduct.id,
          totalQty: parseInt(totalQty),
        },
      });

      // 3. Create RentalPricing
      const pricingData = [];

      // Day price (required)
      pricingData.push({
        productId: newProduct.id,
        type: "DAY",
        price: parseFloat(pricePerDay),
      });

      // Hour price (optional)
      if (pricePerHour) {
        pricingData.push({
          productId: newProduct.id,
          type: "HOUR",
          price: parseFloat(pricePerHour),
        });
      }

      // Week price (optional)
      if (pricePerWeek) {
        pricingData.push({
          productId: newProduct.id,
          type: "WEEK",
          price: parseFloat(pricePerWeek),
        });
      }

      await tx.rentalPricing.createMany({
        data: pricingData,
      });
    }

    return newProduct;
  });

  const fullProduct = await prisma.product.findUnique({
    where: { id: product.id },
    include: {
      inventory: true,
      pricing: true,
      variants: true,
    },
  });

  res
    .status(201)
    .json(new ApiResponse(201, fullProduct, "Product created successfully"));
});

// Get vendor products
export const getVendorProducts = asyncHandler(async (req, res) => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
  });

  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found");
  }

  const products = await prisma.product.findMany({
    where: { vendorId: vendor.id },
    include: {
      inventory: true,
      pricing: true,
      variants: true,
      attributes: {
        include: {
          attributeValue: {
            include: {
              attribute: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, products, "Vendor products fetched successfully"),
    );
});

// Get vendor orders
export const getVendorOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
  });

  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found");
  }

  const where = {
    vendorId: vendor.id,
    ...(status && { status }),
  };

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
      invoice: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res
    .status(200)
    .json(new ApiResponse(200, orders, "Vendor orders fetched successfully"));
});

// Update order status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!["CONFIRMED", "INVOICED", "RETURNED", "CANCELLED"].includes(status)) {
    throw new ApiError(400, "Invalid order status");
  }

  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
  });

  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found");
  }

  // Check if order belongs to vendor
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      vendorId: vendor.id,
    },
  });

  if (!order) {
    throw new ApiError(404, "Order not found or access denied");
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedOrder, "Order status updated successfully"),
    );
});

// Get vendor dashboard stats (comprehensive for dashboard)
export const getVendorStats = asyncHandler(async (req, res) => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
  });

  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found");
  }

  // Get all vendor orders with invoices for revenue calculation
  const orders = await prisma.order.findMany({
    where: { vendorId: vendor.id },
    include: {
      invoice: {
        include: {
          payments: {
            where: { status: "SUCCESS" },
          },
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  // Calculate total revenue from successful payments
  const totalRevenue = orders.reduce((sum, order) => {
    if (order.invoice) {
      const paidAmount = order.invoice.payments.reduce(
        (pSum, payment) => pSum + parseFloat(payment.amount),
        0,
      );
      return sum + paidAmount;
    }
    return sum;
  }, 0);

  // Count active rentals (INVOICED status)
  const activeRentals = orders.filter((o) => o.status === "INVOICED").length;

  // Count overdue returns (INVOICED with past return date)
  const now = new Date();
  const overdueReturns = orders.filter((order) => {
    if (order.status !== "INVOICED") return false;
    // Check if any order item has past rental end date
    return order.items.some((item) => new Date(item.rentalEnd) < now);
  }).length;

  // Calculate revenue by month (last 6 months)
  const revenueByMonth = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    const month = date.getMonth();

    const monthRevenue = orders.reduce((sum, order) => {
      if (order.invoice) {
        const orderDate = new Date(order.createdAt);
        if (
          orderDate.getMonth() === month &&
          orderDate.getFullYear() === year
        ) {
          const paidAmount = order.invoice.payments.reduce(
            (pSum, payment) => pSum + parseFloat(payment.amount),
            0,
          );
          return sum + paidAmount;
        }
      }
      return sum;
    }, 0);

    revenueByMonth.push({ month: monthName, revenue: monthRevenue });
  }

  // Get top products (by number of order items)
  const products = await prisma.product.findMany({
    where: { vendorId: vendor.id },
    include: {
      inventory: true,
      pricing: true,
      orderItems: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const topProducts = products
    .map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      isPublished: product.isPublished,
      quantityOnHand: product.inventory?.totalQty || 0,
      pricePerDay: product.pricing.find((p) => p.type === "DAY")?.price || 0,
      orderCount: product.orderItems.length,
    }))
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 5);

  const [totalProducts, publishedProducts] = await Promise.all([
    prisma.product.count({
      where: { vendorId: vendor.id },
    }),
    prisma.product.count({
      where: { vendorId: vendor.id, isPublished: true },
    }),
  ]);

  const stats = {
    totalRevenue,
    totalOrders: orders.length,
    activeRentals,
    overdueReturns,
    totalProducts,
    publishedProducts,
    revenueByMonth,
    topProducts,
  };

  res
    .status(200)
    .json(new ApiResponse(200, stats, "Vendor stats fetched successfully"));
});

// Get vendor invoices
export const getVendorInvoices = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
  });

  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found");
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      order: {
        vendorId: vendor.id,
      },
      ...(status && { status }),
    },
    include: {
      order: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, invoices, "Vendor invoices fetched successfully"),
    );
});

// Generate vendor invoice PDF
export const generateVendorInvoicePDF = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
  });

  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found");
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      vendorId: vendor.id,
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
    throw new ApiError(404, "Order not found or access denied");
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
  drawRoundedRect(40, 40, 515, 80, 8, "#1e40af");

  doc
    .fontSize(28)
    .fillColor("#ffffff")
    .text("RentX", 60, 55, { continued: false });

  doc
    .fontSize(10)
    .fillColor("#93c5fd")
    .text("Premium Rental Service Platform", 60, 88);

  doc
    .fontSize(24)
    .fillColor("#ffffff")
    .text("INVOICE", 400, 65, { align: "right", width: 140 });

  doc.moveDown(4);

  // ========== INVOICE DETAILS BOX ==========
  const detailsY = 140;
  drawRoundedRect(40, detailsY, 250, 100, 6, "#f1f5f9");
  drawRoundedRect(305, detailsY, 250, 100, 6, "#f1f5f9");

  // Left box - Invoice details
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
  drawRoundedRect(40, tableTop, 515, 30, 4, "#1e40af");

  doc.fontSize(10).fillColor("#ffffff");
  doc.text("Item Description", 55, tableTop + 10, { width: 180 });
  doc.text("Period", 240, tableTop + 10, { width: 90 });
  doc.text("Qty", 335, tableTop + 10, { width: 40, align: "center" });
  doc.text("Rate", 385, tableTop + 10, { width: 70, align: "right" });
  doc.text("Amount", 465, tableTop + 10, { width: 75, align: "right" });

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

  doc
    .moveTo(40, yPosition + 5)
    .lineTo(555, yPosition + 5)
    .strokeColor("#e2e8f0")
    .stroke();

  // ========== TOTALS SECTION ==========
  yPosition += 25;

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.quantity * parseFloat(item.unitPrice),
    0,
  );
  const gstAmount = order.invoice ? parseFloat(order.invoice.gstAmount) : 0;
  const totalAmount =
    order.invoice ? parseFloat(order.invoice.totalAmount) : subtotal;
  const paidAmount =
    order.invoice ?
      order.invoice.payments
        .filter((p) => p.status === "SUCCESS")
        .reduce((sum, p) => sum + parseFloat(p.amount), 0)
    : 0;
  const balanceDue = totalAmount - paidAmount;

  drawRoundedRect(350, yPosition, 205, 120, 6, "#f1f5f9");

  doc.fontSize(9).fillColor("#64748b");
  doc.text("Subtotal:", 365, yPosition + 15, { width: 80 });
  doc
    .fillColor("#1e293b")
    .text(`Rs. ${subtotal.toFixed(2)}`, 455, yPosition + 15, {
      width: 85,
      align: "right",
    });

  doc
    .fillColor("#64748b")
    .text("GST (18%):", 365, yPosition + 35, { width: 80 });
  doc
    .fillColor("#1e293b")
    .text(`Rs. ${gstAmount.toFixed(2)}`, 455, yPosition + 35, {
      width: 85,
      align: "right",
    });

  doc
    .moveTo(365, yPosition + 55)
    .lineTo(540, yPosition + 55)
    .strokeColor("#cbd5e1")
    .stroke();

  doc
    .fontSize(11)
    .fillColor("#1e40af")
    .text("Total:", 365, yPosition + 65, {
      width: 80,
    });
  doc
    .fontSize(11)
    .fillColor("#1e40af")
    .text(`Rs. ${totalAmount.toFixed(2)}`, 455, yPosition + 65, {
      width: 85,
      align: "right",
    });

  doc
    .fontSize(9)
    .fillColor("#16a34a")
    .text("Paid:", 365, yPosition + 85, {
      width: 80,
    });
  doc
    .fillColor("#16a34a")
    .text(`Rs. ${paidAmount.toFixed(2)}`, 455, yPosition + 85, {
      width: 85,
      align: "right",
    });

  if (balanceDue > 0) {
    doc.fillColor("#dc2626").text("Balance Due:", 365, yPosition + 102, {
      width: 80,
    });
    doc
      .fillColor("#dc2626")
      .text(`Rs. ${balanceDue.toFixed(2)}`, 455, yPosition + 102, {
        width: 85,
        align: "right",
      });
  }

  // ========== FOOTER ==========
  const footerY = 720;
  doc.moveTo(40, footerY).lineTo(555, footerY).strokeColor("#e2e8f0").stroke();

  doc.fontSize(8).fillColor("#64748b");
  doc.text("Thank you for your business!", 40, footerY + 15, {
    align: "center",
    width: 515,
  });
  doc.text(
    "For any queries, please contact support@rentx.com",
    40,
    footerY + 28,
    { align: "center", width: 515 },
  );

  doc.end();
});

// Get single vendor product
export const getVendorProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
  });

  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found");
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      vendorId: vendor.id,
    },
    include: {
      inventory: true,
      pricing: true,
      variants: true,
    },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

// Update product
export const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const {
    name,
    description,
    category,
    pricePerHour,
    pricePerDay,
    pricePerWeek,
    totalQty,
    isPublished,
    attributeSchema: attributeSchemaRaw,
    variants: variantsRaw,
    deletedVariantIds: deletedVariantIdsRaw,
  } = req.body;

  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
  });

  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found");
  }

  const existingProduct = await prisma.product.findFirst({
    where: {
      id: productId,
      vendorId: vendor.id,
    },
  });

  if (!existingProduct) {
    throw new ApiError(404, "Product not found");
  }

  // Handle image upload
  let product_image_url = existingProduct.product_image_url;
  if (req.file) {
    const uploadResponse = await uploadOnCloudinary(req.file.path);
    if (!uploadResponse) {
      throw new ApiError(500, "Failed to upload image");
    }
    product_image_url = uploadResponse.url;
  }

  const attributeSchema = normalizeAttributeSchema(
    parseJsonField(attributeSchemaRaw, []),
  );
  const variants = parseJsonField(variantsRaw, []);
  const deletedVariantIds = parseJsonField(deletedVariantIdsRaw, []);
  const hasVariants = Array.isArray(variants) && variants.length > 0;

  if (hasVariants) {
    const schemaError = validateAttributeSchema(attributeSchema);
    if (schemaError) {
      throw new ApiError(400, schemaError);
    }
    const variantError = validateVariants(variants, attributeSchema);
    if (variantError) {
      throw new ApiError(400, variantError);
    }
  }

  // Transaction for atomic updates
  const updatedProduct = await prisma.$transaction(async (tx) => {
    // 1. Update Product
    const product = await tx.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        category,
        product_image_url,
        isPublished: isPublished === "true" || isPublished === true,
        ...(hasAttributeSchemaPayload ?
          {
            attributeSchema:
              attributeSchema.length > 0 ? attributeSchema : null,
          }
        : {}),
      },
    });

    // Deactivate variants if requested
    if (Array.isArray(deletedVariantIds) && deletedVariantIds.length > 0) {
      await tx.productVariant.updateMany({
        where: { id: { in: deletedVariantIds }, productId },
        data: { isActive: false },
      });
    }

    if (hasVariants) {
      for (const v of variants) {
        if (v.id) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              name: v.name || null,
              attributes: v.attributes || {},
              pricePerHour:
                v.pricePerHour !== undefined && v.pricePerHour !== "" ?
                  parseFloat(v.pricePerHour)
                : null,
              pricePerDay: parseFloat(v.pricePerDay),
              pricePerWeek:
                v.pricePerWeek !== undefined && v.pricePerWeek !== "" ?
                  parseFloat(v.pricePerWeek)
                : null,
              pricePerMonth:
                v.pricePerMonth !== undefined && v.pricePerMonth !== "" ?
                  parseFloat(v.pricePerMonth)
                : null,
              totalQty: parseInt(v.totalQty),
              isActive: v.isActive !== false,
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId,
              name: v.name || null,
              attributes: v.attributes || {},
              pricePerHour:
                v.pricePerHour !== undefined && v.pricePerHour !== "" ?
                  parseFloat(v.pricePerHour)
                : null,
              pricePerDay: parseFloat(v.pricePerDay),
              pricePerWeek:
                v.pricePerWeek !== undefined && v.pricePerWeek !== "" ?
                  parseFloat(v.pricePerWeek)
                : null,
              pricePerMonth:
                v.pricePerMonth !== undefined && v.pricePerMonth !== "" ?
                  parseFloat(v.pricePerMonth)
                : null,
              totalQty: parseInt(v.totalQty),
              isActive: v.isActive !== false,
            },
          });
        }
      }
    }

    if (
      hasVariants ||
      (Array.isArray(deletedVariantIds) && deletedVariantIds.length > 0)
    ) {
      const activeVariants = await tx.productVariant.findMany({
        where: { productId, isActive: true },
        select: { totalQty: true },
      });
      const totalVariantQty = activeVariants.reduce(
        (sum, v) => sum + (v.totalQty || 0),
        0,
      );

      await tx.productInventory.upsert({
        where: { productId },
        create: {
          productId,
          totalQty: totalVariantQty,
        },
        update: {
          totalQty: totalVariantQty,
        },
      });
    } else {
      // 2. Update Inventory
      if (totalQty) {
        await tx.productInventory.upsert({
          where: { productId },
          create: {
            productId,
            totalQty: parseInt(totalQty),
          },
          update: {
            totalQty: parseInt(totalQty),
          },
        });
      }

      // 3. Update Pricing (Delete all and recreate)
      if (pricePerDay || pricePerHour || pricePerWeek) {
        await tx.rentalPricing.deleteMany({
          where: { productId },
        });

        const pricingData = [];

        if (pricePerDay) {
          pricingData.push({
            productId,
            type: "DAY",
            price: parseFloat(pricePerDay),
          });
        }

        if (pricePerHour) {
          pricingData.push({
            productId,
            type: "HOUR",
            price: parseFloat(pricePerHour),
          });
        }

        if (pricePerWeek) {
          pricingData.push({
            productId,
            type: "WEEK",
            price: parseFloat(pricePerWeek),
          });
        }

        if (pricingData.length > 0) {
          await tx.rentalPricing.createMany({
            data: pricingData,
          });
        }
      }
    }

    return product;
  });

  const fullProduct = await prisma.product.findUnique({
    where: { id: updatedProduct.id },
    include: {
      inventory: true,
      pricing: true,
      variants: true,
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, fullProduct, "Product updated successfully"));
});

// Delete product
export const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
  });

  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found");
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      vendorId: vendor.id,
    },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Check for active orders/relations that block deletion
  // For now, we'll try to delete related data first. If it fails due to foreign key constraints (like orders), we catch it.

  try {
    await prisma.$transaction(async (tx) => {
      // Delete dependencies first
      await tx.productInventory.deleteMany({ where: { productId } });
      await tx.rentalPricing.deleteMany({ where: { productId } });
      await tx.productAttribute.deleteMany({ where: { productId } });
      await tx.productVariant.deleteMany({ where: { productId } });

      // Finally delete product
      await tx.product.delete({
        where: { id: productId },
      });
    });

    res
      .status(200)
      .json(new ApiResponse(200, {}, "Product deleted successfully"));
  } catch (error) {
    console.error("Delete product error:", error);
    if (error.code === "P2003") {
      // Foreign key constraint failed
      throw new ApiError(
        400,
        "Cannot delete product because it has active orders or cart items",
      );
    }
    throw error;
  }
});

// Delete vendor order
export const deleteVendorOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  // Get vendor from user
  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
  });

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  // Find the order and verify it belongs to this vendor
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      vendorId: vendor.id,
    },
    include: {
      invoice: true,
      items: true,
    },
  });

  if (!order) {
    throw new ApiError(404, "Order not found or doesn't belong to this vendor");
  }

  // Delete in a transaction
  await prisma.$transaction(async (tx) => {
    // Delete invoice and payments if exists
    if (order.invoice) {
      await tx.payment.deleteMany({
        where: { invoiceId: order.invoice.id },
      });
      await tx.invoice.delete({
        where: { id: order.invoice.id },
      });
    }

    // Delete reservations through order items
    for (const item of order.items) {
      await tx.reservation.deleteMany({
        where: { orderItemId: item.id },
      });
    }

    // Delete order items
    await tx.orderItem.deleteMany({
      where: { orderId: order.id },
    });

    // Delete the order
    await tx.order.delete({
      where: { id: order.id },
    });
  });

  res.status(200).json(new ApiResponse(200, {}, "Order deleted successfully"));
});

// Get vendor analytics data
export const getVendorAnalytics = asyncHandler(async (req, res) => {
  const { timeRange = "year" } = req.query;

  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
  });

  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found");
  }

  // Calculate date range
  const now = new Date();
  let startDate = new Date();

  switch (timeRange) {
    case "week":
      startDate.setDate(now.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "quarter":
      startDate.setMonth(now.getMonth() - 3);
      break;
    case "year":
    default:
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  // Get all vendor orders within date range
  const orders = await prisma.order.findMany({
    where: {
      vendorId: vendor.id,
      createdAt: {
        gte: startDate,
      },
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              category: true,
            },
          },
        },
      },
      invoice: {
        include: {
          payments: {
            where: { status: "SUCCESS" },
          },
        },
      },
    },
  });

  // Calculate monthly revenue data
  const monthlyData = {};
  orders.forEach((order) => {
    const month = new Date(order.createdAt).toLocaleDateString("en-US", {
      month: "short",
    });
    if (!monthlyData[month]) {
      monthlyData[month] = { month, revenue: 0, orders: 0 };
    }
    // Use paid amount from successful payments
    const paidAmount =
      order.invoice?.payments?.reduce(
        (sum, payment) => sum + parseFloat(payment.amount),
        0,
      ) || 0;
    monthlyData[month].revenue += paidAmount;
    monthlyData[month].orders += 1;
  });

  const revenueData = Object.values(monthlyData);

  // Calculate category distribution
  const categoryCount = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const category = item.product?.category || "Uncategorized";
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
  });

  const categoryData = Object.keys(categoryCount).map((category) => ({
    name: category,
    value: categoryCount[category],
  }));

  // Calculate top products
  const productRentals = {};
  const productRevenue = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const productName = item.product?.name || "Unknown";
      productRentals[productName] =
        (productRentals[productName] || 0) + item.quantity;
      productRevenue[productName] =
        (productRevenue[productName] || 0) +
        Number(item.unitPrice || 0) * item.quantity;
    });
  });

  const topProducts = Object.keys(productRentals)
    .map((name) => ({
      name,
      rentals: productRentals[name],
      revenue: productRevenue[name],
    }))
    .sort((a, b) => b.rentals - a.rentals)
    .slice(0, 5);

  // Calculate summary stats
  const totalRevenue = orders.reduce((sum, order) => {
    const paidAmount =
      order.invoice?.payments?.reduce(
        (pSum, payment) => pSum + parseFloat(payment.amount),
        0,
      ) || 0;
    return sum + paidAmount;
  }, 0);

  const totalOrders = orders.length;
  const activeRentals = orders.filter((o) => o.status === "INVOICED").length;

  const [totalProducts, publishedProducts] = await Promise.all([
    prisma.product.count({
      where: { vendorId: vendor.id },
    }),
    prisma.product.count({
      where: { vendorId: vendor.id, isPublished: true },
    }),
  ]);

  const stats = {
    totalRevenue: `₹${(totalRevenue / 1000).toFixed(1)}k`,
    totalOrders: totalOrders.toString(),
    activeRentals: activeRentals.toString(),
    productsListed: totalProducts.toString(),
  };

  res.status(200).json(
    new ApiResponse(
      200,
      {
        stats,
        revenueData,
        categoryData,
        topProducts,
      },
      "Vendor analytics data fetched successfully",
    ),
  );
});
