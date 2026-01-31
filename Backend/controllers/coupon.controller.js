import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// Get all available coupons
export const getAvailableCoupons = asyncHandler(async (req, res) => {
    const { minOrderAmount } = req.query;

    const currentDate = new Date();

    // Build query conditions
    const whereConditions = {
        isActive: true,
        OR: [
            { expiryDate: null }, // No expiry
            { expiryDate: { gte: currentDate } }, // Not expired
        ],
    };

    // Add minimum order filter if provided
    if (minOrderAmount) {
        whereConditions.OR = [
            ...whereConditions.OR,
            { minOrderAmount: null }, // No minimum
            { minOrderAmount: { lte: parseFloat(minOrderAmount) } }, // Order meets minimum
        ];
    }

    const coupons = await prisma.coupon.findMany({
        where: whereConditions,
        select: {
            id: true,
            code: true,
            description: true,
            discountType: true,
            discountValue: true,
            minOrderAmount: true,
            maxUsageCount: true,
            currentUsageCount: true,
            expiryDate: true,
        },
    });

    // Filter out coupons that have reached max usage
    const availableCoupons = coupons.filter((coupon) => {
        if (coupon.maxUsageCount === null) return true;
        return coupon.currentUsageCount < coupon.maxUsageCount;
    });

    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                availableCoupons,
                "Available coupons fetched successfully"
            )
        );
});

// Validate a coupon code
export const validateCoupon = asyncHandler(async (req, res) => {
    const { code, orderAmount } = req.body;

    if (!code || !orderAmount) {
        throw new ApiError(400, "Coupon code and order amount are required");
    }

    const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
    });

    if (!coupon) {
        throw new ApiError(404, "Invalid coupon code");
    }

    if (!coupon.isActive) {
        throw new ApiError(400, "This coupon is no longer active");
    }

    // Check expiry
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        throw new ApiError(400, "This coupon has expired");
    }

    // Check usage count
    if (
        coupon.maxUsageCount !== null &&
        coupon.currentUsageCount >= coupon.maxUsageCount
    ) {
        throw new ApiError(400, "This coupon has reached its usage limit");
    }

    // Check minimum order amount
    if (
        coupon.minOrderAmount !== null &&
        parseFloat(orderAmount) < parseFloat(coupon.minOrderAmount)
    ) {
        throw new ApiError(
            400,
            `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`
        );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
        discountAmount =
            (parseFloat(orderAmount) * parseFloat(coupon.discountValue)) / 100;
    } else if (coupon.discountType === "FIXED_AMOUNT") {
        discountAmount = parseFloat(coupon.discountValue);
    }

    res.status(200).json(
        new ApiResponse(
            200,
            {
                coupon: {
                    id: coupon.id,
                    code: coupon.code,
                    description: coupon.description,
                    discountType: coupon.discountType,
                    discountValue: coupon.discountValue,
                },
                discountAmount,
            },
            "Coupon is valid"
        )
    );
});

// Apply coupon to order (increment usage count)
export const applyCoupon = asyncHandler(async (req, res) => {
    const { couponId } = req.body;

    if (!couponId) {
        throw new ApiError(400, "Coupon ID is required");
    }

    const coupon = await prisma.coupon.update({
        where: { id: couponId },
        data: {
            currentUsageCount: {
                increment: 1,
            },
        },
    });

    res
        .status(200)
        .json(new ApiResponse(200, coupon, "Coupon applied successfully"));
});
