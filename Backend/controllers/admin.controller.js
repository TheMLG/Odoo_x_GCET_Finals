import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import { triggerRentalReminder } from "../services/rentalReminderCron.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

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

// Get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 10 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where =
    role ?
      {
        roles: {
          some: {
            role: {
              name: role.toUpperCase(),
            },
          },
        },
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        roles: {
          include: {
            role: true,
          },
        },
        vendor: true,
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
      "Users fetched successfully",
    ),
  );
});

// Get user by ID
export const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      roles: {
        include: {
          role: true,
        },
      },
      vendor: true,
      orders: {
        include: {
          items: true,
          invoice: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

// Create user (admin only)
export const createUser = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;

  if (!email || !password || !firstName || !lastName || !role) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, "User with email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const roleRecord = await prisma.role.findUnique({
    where: { name: role.toUpperCase() },
  });

  if (!roleRecord) {
    throw new ApiError(400, "Invalid role");
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      roles: {
        create: {
          roleId: roleRecord.id,
        },
      },
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  const { password: _, ...userWithoutPassword } = user;

  res
    .status(201)
    .json(
      new ApiResponse(201, userWithoutPassword, "User created successfully"),
    );
});

// Update user
export const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { email, firstName, lastName, phone } = req.body;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(email && { email }),
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(phone !== undefined && { phone: phone || null }),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      createdAt: true,
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  res.status(200).json(new ApiResponse(200, user, "User updated successfully"));
});

// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      vendor: true,
      orders: true,
      carts: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Use transaction to ensure all deletes succeed or fail together
  await prisma.$transaction(async (tx) => {
    // Delete user roles first (due to foreign key constraint)
    await tx.userRole.deleteMany({
      where: { userId },
    });

    // Delete carts and cart items
    if (user.carts.length > 0) {
      const cartIds = user.carts.map((cart) => cart.id);
      await tx.cartItem.deleteMany({
        where: { cartId: { in: cartIds } },
      });
      await tx.cart.deleteMany({
        where: { userId },
      });
    }

    // If user has vendor, delete vendor-related data
    if (user.vendor) {
      const vendorId = user.vendor.id;

      // Get all products for this vendor
      const products = await tx.product.findMany({
        where: { vendorId },
        select: { id: true },
      });
      const productIds = products.map((p) => p.id);

      if (productIds.length > 0) {
        // Delete product-related data
        await tx.reservation.deleteMany({
          where: { productId: { in: productIds } },
        });
        await tx.orderItem.deleteMany({
          where: { productId: { in: productIds } },
        });
        await tx.cartItem.deleteMany({
          where: { productId: { in: productIds } },
        });
        await tx.productAttribute.deleteMany({
          where: { productId: { in: productIds } },
        });
        await tx.productVariant.deleteMany({
          where: { productId: { in: productIds } },
        });
        await tx.rentalPricing.deleteMany({
          where: { productId: { in: productIds } },
        });
        await tx.productInventory.deleteMany({
          where: { productId: { in: productIds } },
        });
        await tx.product.deleteMany({
          where: { vendorId },
        });
      }

      // Delete orders where user is the vendor
      const vendorOrders = await tx.order.findMany({
        where: { vendorId },
        include: { invoice: true },
      });

      for (const order of vendorOrders) {
        if (order.invoice) {
          // Delete payments first
          await tx.payment.deleteMany({
            where: { invoiceId: order.invoice.id },
          });
          // Delete invoice
          await tx.invoice.delete({
            where: { id: order.invoice.id },
          });
        }
        // Delete order items
        await tx.orderItem.deleteMany({
          where: { orderId: order.id },
        });
      }

      // Delete vendor orders
      await tx.order.deleteMany({
        where: { vendorId },
      });

      // Finally delete vendor
      await tx.vendor.delete({
        where: { id: vendorId },
      });
    }

    // Delete orders where user is the customer
    const customerOrders = await tx.order.findMany({
      where: { userId },
      include: { invoice: true },
    });

    for (const order of customerOrders) {
      if (order.invoice) {
        // Delete payments first
        await tx.payment.deleteMany({
          where: { invoiceId: order.invoice.id },
        });
        // Delete invoice
        await tx.invoice.delete({
          where: { id: order.invoice.id },
        });
      }
      // Delete reservations through order items
      const orderItems = await tx.orderItem.findMany({
        where: { orderId: order.id },
      });
      for (const item of orderItems) {
        await tx.reservation.deleteMany({
          where: { orderItemId: item.id },
        });
      }
      // Delete order items
      await tx.orderItem.deleteMany({
        where: { orderId: order.id },
      });
    }

    // Delete customer orders
    await tx.order.deleteMany({
      where: { userId },
    });

    // Finally, delete the user
    await tx.user.delete({
      where: { id: userId },
    });
  });

  res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"));
});

// Get all vendors
export const getAllVendors = asyncHandler(async (req, res) => {
  const vendors = await prisma.vendor.findMany({
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
      products: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res
    .status(200)
    .json(new ApiResponse(200, vendors, "Vendors fetched successfully"));
});

// Get all products
export const getAllProducts = asyncHandler(async (req, res) => {
  const { isPublished, page = 1, limit = 10 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where =
    isPublished !== undefined ? { isPublished: isPublished === "true" } : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
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
        inventory: true,
        pricing: true,
        variants: true,
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  // Transform products to match frontend expectations
  const transformedProducts = products.map((product) => {
    // Transform pricing array to object
    const pricingObj = {
      pricePerDay: 0,
      pricePerWeek: 0,
      pricePerMonth: 0,
    };

    if (product.pricing && Array.isArray(product.pricing)) {
      product.pricing.forEach((p) => {
        if (p.type === "DAY") pricingObj.pricePerDay = Number(p.price);
        if (p.type === "WEEK") pricingObj.pricePerWeek = Number(p.price);
        if (p.type === "MONTH") pricingObj.pricePerMonth = Number(p.price);
      });
    }

    if (
      product.variants &&
      product.variants.length > 0 &&
      pricingObj.pricePerDay === 0 &&
      pricingObj.pricePerWeek === 0 &&
      pricingObj.pricePerMonth === 0
    ) {
      const minPrice = (key) => {
        const values = product.variants
          .map((v) => (v[key] !== null ? Number(v[key]) : 0))
          .filter((v) => v > 0);
        return values.length > 0 ? Math.min(...values) : 0;
      };
      pricingObj.pricePerDay = minPrice("pricePerDay");
      pricingObj.pricePerWeek = minPrice("pricePerWeek");
      pricingObj.pricePerMonth = minPrice("pricePerMonth");
    }

    // Transform inventory
    const inventoryObj = {
      quantityOnHand: product.inventory?.totalQty || 0,
    };

    return {
      ...product,
      pricing: pricingObj,
      inventory: inventoryObj,
    };
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        products: transformedProducts,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
      "Products fetched successfully",
    ),
  );
});

// Get all orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = status ? { status } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
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
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where }),
  ]);

  // Transform orders to include totalAmount and paidAmount
  const transformedOrders = orders.map((order) => {
    const totalAmount = order.invoice?.totalAmount || 0;
    const paidAmount =
      order.invoice?.payments?.reduce(
        (sum, payment) =>
          sum + (payment.status === "SUCCESS" ? Number(payment.amount) : 0),
        0,
      ) || 0;

    return {
      ...order,
      totalAmount: Number(totalAmount),
      paidAmount: Number(paidAmount),
    };
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        orders: transformedOrders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
      "Orders fetched successfully",
    ),
  );
});

// Get dashboard statistics
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalVendors, totalProducts, totalOrders, recentOrders] =
    await Promise.all([
      prisma.user.count(),
      prisma.vendor.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
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
          invoice: {
            include: {
              payments: true,
            },
          },
        },
      }),
    ]);

  // Transform recent orders to include totalAmount and paidAmount
  const transformedRecentOrders = recentOrders.map((order) => {
    const totalAmount = order.invoice?.totalAmount || 0;
    const paidAmount =
      order.invoice?.payments?.reduce(
        (sum, payment) =>
          sum + (payment.status === "SUCCESS" ? Number(payment.amount) : 0),
        0,
      ) || 0;

    return {
      ...order,
      totalAmount: Number(totalAmount),
      paidAmount: Number(paidAmount),
    };
  });

  const stats = {
    totalUsers,
    totalVendors,
    totalProducts,
    totalOrders,
    recentOrders: transformedRecentOrders,
  };

  res
    .status(200)
    .json(new ApiResponse(200, stats, "Dashboard stats fetched successfully"));
});

// Get analytics data
export const getAnalytics = asyncHandler(async (req, res) => {
  const { timeRange = "year" } = req.query;

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

  // Get all orders within date range
  const orders = await prisma.order.findMany({
    where: {
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
              vendor: {
                select: {
                  product_category: true,
                },
              },
            },
          },
        },
      },
      vendor: {
        select: {
          id: true,
          companyName: true,
        },
      },
      invoice: {
        select: {
          totalAmount: true,
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
    monthlyData[month].revenue += Number(order.invoice?.totalAmount || 0);
    monthlyData[month].orders += 1;
  });

  // Get monthly users data
  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      createdAt: true,
    },
  });

  const monthlyUsers = {};
  users.forEach((user) => {
    const month = new Date(user.createdAt).toLocaleDateString("en-US", {
      month: "short",
    });
    if (!monthlyUsers[month]) {
      monthlyUsers[month] = 0;
    }
    monthlyUsers[month] += 1;
  });

  // Combine monthly data
  const revenueData = Object.keys(monthlyData).map((month) => ({
    ...monthlyData[month],
    users: monthlyUsers[month] || 0,
  }));

  // Calculate category distribution
  const categoryCount = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const category =
        item.product?.vendor?.product_category || "Uncategorized";
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
      productRentals[productName] = (productRentals[productName] || 0) + 1;
      productRevenue[productName] =
        (productRevenue[productName] || 0) + Number(item.unitPrice || 0);
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

  // Calculate vendor performance
  const vendorStats = {};
  orders.forEach((order) => {
    const vendorId = order.vendor?.id;
    const vendorName = order.vendor?.companyName || "Unknown";
    if (!vendorStats[vendorId]) {
      vendorStats[vendorId] = {
        name: vendorName,
        orders: 0,
        revenue: 0,
      };
    }
    vendorStats[vendorId].orders += 1;
    vendorStats[vendorId].revenue += Number(order.invoice?.totalAmount || 0);
  });

  const vendorPerformance = Object.values(vendorStats)
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5);

  // Calculate summary stats
  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.invoice?.totalAmount || 0),
    0,
  );
  const totalOrders = orders.length;
  const activeUsers = await prisma.user.count();
  const totalProducts = await prisma.product.count();

  const stats = {
    totalRevenue: `₹${(totalRevenue / 1000).toFixed(1)}k`,
    totalOrders: totalOrders.toString(),
    activeUsers: activeUsers.toString(),
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
        vendorPerformance,
      },
      "Analytics data fetched successfully",
    ),
  );
});

// Get admin profile
export const getAdminProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "Admin profile not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "Admin profile fetched successfully"));
});

// Update admin profile
export const updateAdminProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { email, firstName, lastName } = req.body;

  // Check if email is being changed and if it's already taken
  if (email) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: userId,
        },
      },
    });

    if (existingUser) {
      throw new ApiError(409, "Email is already in use");
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(email && { email }),
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

// Change admin password
export const changeAdminPassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters long");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
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
    where: { id: userId },
    data: { password: hashedPassword },
  });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

  // Update Product
// Update Product
export const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const {
    name,
    description,
    isPublished,
    inventory, // { quantityOnHand: number }
    pricing, // { pricePerDay: number, pricePerWeek: number, pricePerMonth: number }
    attributeSchema: attributeSchemaRaw,
    variants: variantsRaw,
    deletedVariantIds: deletedVariantIdsRaw,
  } = req.body;

  const hasAttributeSchemaPayload = attributeSchemaRaw !== undefined;
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

  // Use transaction to ensure all updates succeed or fail together
  const updatedProduct = await prisma.$transaction(async (tx) => {
    // 1. Update basic product details
    const product = await tx.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        isPublished,
        ...(hasAttributeSchemaPayload ?
          {
            attributeSchema:
              attributeSchema.length > 0 ? attributeSchema : null,
          }
        : {}),
      },
    });

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
                  Number(v.pricePerHour)
                : null,
              pricePerDay: Number(v.pricePerDay),
              pricePerWeek:
                v.pricePerWeek !== undefined && v.pricePerWeek !== "" ?
                  Number(v.pricePerWeek)
                : null,
              pricePerMonth:
                v.pricePerMonth !== undefined && v.pricePerMonth !== "" ?
                  Number(v.pricePerMonth)
                : null,
              totalQty: Number(v.totalQty),
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
                  Number(v.pricePerHour)
                : null,
              pricePerDay: Number(v.pricePerDay),
              pricePerWeek:
                v.pricePerWeek !== undefined && v.pricePerWeek !== "" ?
                  Number(v.pricePerWeek)
                : null,
              pricePerMonth:
                v.pricePerMonth !== undefined && v.pricePerMonth !== "" ?
                  Number(v.pricePerMonth)
                : null,
              totalQty: Number(v.totalQty),
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
      // 2. Update Inventory if provided
      if (inventory) {
        // Check if inventory record exists
        const existingInventory = await tx.productInventory.findUnique({
          where: { productId },
        });

        if (existingInventory) {
          await tx.productInventory.update({
            where: { productId },
            data: {
              totalQty: Number(inventory.quantityOnHand || 0),
            },
          });
        } else {
          await tx.productInventory.create({
            data: {
              productId,
              totalQty: Number(inventory.quantityOnHand || 0),
            },
          });
        }
      }

      // 3. Update Pricing if provided
      if (pricing) {
        // Auto-calculate prices if missing
        let pricePerDay = Number(pricing.pricePerDay || 0);
        let pricePerWeek = Number(pricing.pricePerWeek || 0);
        let pricePerMonth = Number(pricing.pricePerMonth || 0);

        if (pricePerDay > 0) {
          if (pricePerWeek === 0) pricePerWeek = pricePerDay * 7;
          if (pricePerMonth === 0) pricePerMonth = pricePerDay * 30;
        }

        // Delete existing pricing
        await tx.rentalPricing.deleteMany({
          where: { productId },
        });

        // Create new pricing records
        const pricingData = [];
        if (pricePerDay > 0) {
          pricingData.push({
            productId,
            type: "DAY",
            price: pricePerDay,
          });
        }
        if (pricePerWeek > 0) {
          pricingData.push({
            productId,
            type: "WEEK",
            price: pricePerWeek,
          });
        }
        if (pricePerMonth > 0) {
          pricingData.push({
            productId,
            type: "MONTH",
            price: pricePerMonth,
          });
        }

        if (pricingData.length > 0) {
          await tx.rentalPricing.createMany({
            data: pricingData,
          });
        }
      }
    }

    // 4. Fetch the complete updated product
    return await tx.product.findUnique({
      where: { id: productId },
      include: {
        inventory: true,
        pricing: true,
        variants: true,
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
      },
    });
  });

  // Transform the response to match frontend expectations (same as getAllProducts)
  const pricingObj = {
    pricePerDay: 0,
    pricePerWeek: 0,
    pricePerMonth: 0,
  };

  if (updatedProduct.pricing && Array.isArray(updatedProduct.pricing)) {
    updatedProduct.pricing.forEach((p) => {
      if (p.type === "DAY") pricingObj.pricePerDay = Number(p.price);
      if (p.type === "WEEK") pricingObj.pricePerWeek = Number(p.price);
      if (p.type === "MONTH") pricingObj.pricePerMonth = Number(p.price);
    });
  }

  const inventoryObj = {
    quantityOnHand: updatedProduct.inventory?.totalQty || 0,
  };

  const finalResponse = {
    ...updatedProduct,
    pricing: pricingObj,
    inventory: inventoryObj,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, finalResponse, "Product updated successfully"));
});

// Delete Product
export const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // Use transaction to delete all related data
  await prisma.$transaction(async (tx) => {
    // 1. Delete dependent relations first
    await tx.reservation.deleteMany({ where: { productId } });
    await tx.orderItem.deleteMany({ where: { productId } });
    await tx.cartItem.deleteMany({ where: { productId } });
    await tx.productAttribute.deleteMany({ where: { productId } });
    await tx.productVariant.deleteMany({ where: { productId } });
    await tx.rentalPricing.deleteMany({ where: { productId } });

    // 2. Delete inventory (one-to-one)
    await tx.productInventory.deleteMany({ where: { productId } });

    // 3. Finally delete the product
    await tx.product.delete({ where: { id: productId } });
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Product deleted successfully"));
});

// Manually trigger rental return reminder emails
export const sendRentalReminders = asyncHandler(async (req, res) => {
  await triggerRentalReminder();

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Rental reminder emails triggered successfully"),
    );
});
