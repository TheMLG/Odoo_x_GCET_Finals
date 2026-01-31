import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import bcrypt from "bcryptjs";

// Get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 10 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = role
    ? {
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
      "Users fetched successfully"
    )
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

  res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
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
      new ApiResponse(201, userWithoutPassword, "User created successfully")
    );
});

// Update user
export const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { email, firstName, lastName } = req.body;

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
    .json(new ApiResponse(200, user, "User updated successfully"));
});

// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  await prisma.user.delete({
    where: { id: userId },
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

  const where = isPublished !== undefined ? { isPublished: isPublished === "true" } : {};

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
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
      "Products fetched successfully"
    )
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
        invoice: true,
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where }),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
      "Orders fetched successfully"
    )
  );
});

// Get dashboard statistics
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalVendors,
    totalProducts,
    totalOrders,
    recentOrders,
  ] = await Promise.all([
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
      },
    }),
  ]);

  const stats = {
    totalUsers,
    totalVendors,
    totalProducts,
    totalOrders,
    recentOrders,
  };

  res
    .status(200)
    .json(new ApiResponse(200, stats, "Dashboard stats fetched successfully"));
});
