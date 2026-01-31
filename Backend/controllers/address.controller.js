import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Get all addresses for the authenticated user
 * @route GET /api/v1/addresses
 */
export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  res
    .status(200)
    .json(new ApiResponse(200, addresses, "Addresses fetched successfully"));
});

/**
 * Get single address by ID
 * @route GET /api/v1/addresses/:addressId
 */
export const getAddressById = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId: req.user.id,
    },
  });

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, address, "Address fetched successfully"));
});

/**
 * Create new address
 * @route POST /api/v1/addresses
 */
export const createAddress = asyncHandler(async (req, res) => {
  const {
    fullName,
    phoneNumber,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country = "India",
    isDefault = false,
  } = req.body;

  // Validate required fields
  if (
    !fullName ||
    !phoneNumber ||
    !addressLine1 ||
    !city ||
    !state ||
    !postalCode
  ) {
    throw new ApiError(
      400,
      "Required fields: fullName, phoneNumber, addressLine1, city, state, postalCode",
    );
  }

  // If this is set as default, unset other defaults
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: req.user.id,
      fullName,
      phoneNumber,
      addressLine1,
      addressLine2: addressLine2 || null,
      city,
      state,
      postalCode,
      country,
      isDefault,
    },
  });

  res
    .status(201)
    .json(new ApiResponse(201, address, "Address created successfully"));
});

/**
 * Update address
 * @route PUT /api/v1/addresses/:addressId
 */
export const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const {
    fullName,
    phoneNumber,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    isDefault,
  } = req.body;

  // Verify address belongs to user
  const existingAddress = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId: req.user.id,
    },
  });

  if (!existingAddress) {
    throw new ApiError(404, "Address not found");
  }

  // If setting as default, unset other defaults
  if (isDefault && !existingAddress.isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id: addressId },
    data: {
      ...(fullName && { fullName }),
      ...(phoneNumber && { phoneNumber }),
      ...(addressLine1 && { addressLine1 }),
      ...(addressLine2 !== undefined && { addressLine2 }),
      ...(city && { city }),
      ...(state && { state }),
      ...(postalCode && { postalCode }),
      ...(country && { country }),
      ...(isDefault !== undefined && { isDefault }),
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, address, "Address updated successfully"));
});

/**
 * Delete address
 * @route DELETE /api/v1/addresses/:addressId
 */
export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  // Verify address belongs to user
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId: req.user.id,
    },
  });

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  // Check if address is used in any orders
  const ordersWithAddress = await prisma.order.count({
    where: { deliveryAddressId: addressId },
  });

  if (ordersWithAddress > 0) {
    throw new ApiError(400, "Cannot delete address that is used in orders");
  }

  await prisma.address.delete({
    where: { id: addressId },
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Address deleted successfully"));
});

/**
 * Set address as default
 * @route PATCH /api/v1/addresses/:addressId/default
 */
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  // Verify address belongs to user
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId: req.user.id,
    },
  });

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  // Unset all other defaults and set this one
  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId: req.user.id, isDefault: true },
      data: { isDefault: false },
    }),
    prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    }),
  ]);

  const updatedAddress = await prisma.address.findUnique({
    where: { id: addressId },
  });

  res
    .status(200)
    .json(new ApiResponse(200, updatedAddress, "Default address updated"));
});
