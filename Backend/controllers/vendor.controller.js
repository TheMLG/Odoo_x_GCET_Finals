import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
  const { firstName, lastName, email } = req.body;

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
  } = req.body;

  if (!name || !pricePerDay || !totalQty) {
    throw new ApiError(
      400,
      "Name, daily price and total quantity are required",
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
      },
    });

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

    return newProduct;
  });

  const fullProduct = await prisma.product.findUnique({
    where: { id: product.id },
    include: {
      inventory: true,
      pricing: true,
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
      },
    });

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

    return product;
  });

  const fullProduct = await prisma.product.findUnique({
    where: { id: updatedProduct.id },
    include: {
      inventory: true,
      pricing: true,
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
