import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import bcrypt from "bcryptjs";

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
      new ApiResponse(200, products, "Vendor products fetched successfully")
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

  if (!["CONFIRMED", "PICKED_UP", "RETURNED", "CANCELLED"].includes(status)) {
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
      new ApiResponse(200, updatedOrder, "Order status updated successfully")
    );
});

// Get vendor dashboard stats
export const getVendorStats = asyncHandler(async (req, res) => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
  });

  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found");
  }

  const [totalProducts, publishedProducts, totalOrders, pendingOrders] =
    await Promise.all([
      prisma.product.count({
        where: { vendorId: vendor.id },
      }),
      prisma.product.count({
        where: { vendorId: vendor.id, isPublished: true },
      }),
      prisma.order.count({
        where: { vendorId: vendor.id },
      }),
      prisma.order.count({
        where: { vendorId: vendor.id, status: "CONFIRMED" },
      }),
    ]);

  const stats = {
    totalProducts,
    publishedProducts,
    totalOrders,
    pendingOrders,
  };

  res
    .status(200)
    .json(new ApiResponse(200, stats, "Vendor stats fetched successfully"));
});

// Update vendor user info (firstName, lastName, email)
export const updateVendorUserInfo = asyncHandler(async (req, res) => {
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
      vendor: {
        select: {
          id: true,
          companyName: true,
          gstNo: true,
          product_category: true,
        },
      },
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, user, "User info updated successfully"));
});

// Change vendor password
export const changeVendorPassword = asyncHandler(async (req, res) => {
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
