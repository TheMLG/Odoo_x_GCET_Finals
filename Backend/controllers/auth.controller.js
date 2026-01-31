import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// Generate access and refresh tokens
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        vendor: true,
      },
    });

    const accessToken = jwt.sign(
      {
        _id: user.id,
        email: user.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { _id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate tokens");
  }
};

// Register User (Customer)
export const registerUser = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // Validation
  if (!email || !password || !firstName || !lastName) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, "User with email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Get or create CUSTOMER role
  let customerRole = await prisma.role.findUnique({
    where: { name: "CUSTOMER" },
  });

  if (!customerRole) {
    customerRole = await prisma.role.create({
      data: { name: "CUSTOMER" },
    });
  }

  // Create user with CUSTOMER role
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      roles: {
        create: {
          roleId: customerRole.id,
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

  // Create welcome coupon for new user
  try {
    const couponCode = `WELCOME-${user.id.substring(0, 6).toUpperCase()}`;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days from now

    await prisma.coupon.create({
      data: {
        code: couponCode,
        description: "Welcome to SharePal! Enjoy 10% off on your first order.",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderAmount: null,
        maxUsageCount: 1,
        currentUsageCount: 0,
        expiryDate: expiryDate,
        isActive: true,
        userId: user.id,
        isWelcomeCoupon: true,
      },
    });
  } catch (couponError) {
    // Log error but don't fail user registration
    console.error("Failed to create welcome coupon:", couponError);
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user.id
  );

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  res
    .status(201)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json(
      new ApiResponse(
        201,
        {
          user: userWithoutPassword,
          accessToken,
          refreshToken,
        },
        "User registered successfully"
      )
    );
});

// Register Vendor
export const registerVendor = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, companyName, gstNo, product_category } = req.body;

  // Validation
  if (
    !email ||
    !password ||
    !firstName ||
    !lastName ||
    !companyName ||
    !gstNo ||
    !product_category
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, "User with email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Get or create VENDOR role
  let vendorRole = await prisma.role.findUnique({
    where: { name: "VENDOR" },
  });

  if (!vendorRole) {
    vendorRole = await prisma.role.create({
      data: { name: "VENDOR" },
    });
  }

  // Create user with VENDOR role and vendor profile
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      roles: {
        create: {
          roleId: vendorRole.id,
        },
      },
      vendor: {
        create: {
          companyName,
          gstNo,
          product_category,
        },
      },
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
      vendor: true,
    },
  });

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user.id
  );

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  res
    .status(201)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json(
      new ApiResponse(
        201,
        {
          user: userWithoutPassword,
          accessToken,
          refreshToken,
        },
        "Vendor registered successfully"
      )
    );
});

// Login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
      vendor: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user.id
  );

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json(
      new ApiResponse(
        200,
        {
          user: userWithoutPassword,
          accessToken,
          refreshToken,
        },
        "Login successful"
      )
    );
});

export const logout = asyncHandler(async (req, res) => {
  res
    .status(200)
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    })
    .json(new ApiResponse(200, {}, "Logout successful"));
});

// Get current user
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
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
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});

// Refresh access token
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await prisma.user.findUnique({
      where: { id: decodedToken._id },
    });

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user.id);

    res
      .status(200)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

// Forgot Password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  // Save OTP to DB
  await prisma.user.update({
    where: { id: user.id },
    data: {
      otp,
      otpExpiry,
    },
  });

  // Send Email
  try {
    const { sendEmail } = await import("../utils/emailService.js");
    await sendEmail(
      email,
      "Password Reset OTP",
      `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
      `<h1>Password Reset OTP</h1><p>Your OTP for password reset is: <strong>${otp}</strong></p><p>It is valid for 10 minutes.</p>`
    );
  } catch (error) {
    console.error("Email send failed:", error);
    throw new ApiError(500, "Failed to send OTP email");
  }

  res.status(200).json(new ApiResponse(200, {}, "OTP sent successfully"));
});

// Verify OTP
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (user.otpExpiry < new Date()) {
    throw new ApiError(400, "OTP expired");
  }

  res.status(200).json(new ApiResponse(200, {}, "OTP verified successfully"));
});

// Reset Password
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (user.otpExpiry < new Date()) {
    throw new ApiError(400, "OTP expired");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password and clear OTP
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      otp: null,
      otpExpiry: null,
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});

// Change Password (for authenticated users)
export const changePassword = asyncHandler(async (req, res) => {
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

// Update User Profile (for authenticated users)
export const updateUserProfile = asyncHandler(async (req, res) => {
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
      roles: {
        include: {
          role: true,
        },
      },
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
        "Profile updated successfully",
      ),
    );
});
