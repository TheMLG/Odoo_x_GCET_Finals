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
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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
    throw new ApiError(401, "Invalid credentials");
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
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
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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

// Logout
export const logout = asyncHandler(async (req, res) => {
  res
    .status(200)
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
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
