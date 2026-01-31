import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

/**
 * Get all reviews for a product
 * @route GET /api/reviews/:productId
 * @access Public
 */
export const getProductReviews = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
        where: {
            productId
        },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Calculate average rating
    const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    res.status(200).json(
        new ApiResponse(200, {
            reviews,
            totalReviews: reviews.length,
            averageRating: parseFloat(averageRating.toFixed(1))
        }, "Reviews fetched successfully")
    );
});

/**
 * Add a review for a product
 * @route POST /api/reviews/:productId
 * @access Private (Authenticated users only)
 */
export const addReview = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
        throw new ApiError(400, "Rating must be between 1 and 5");
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
        where: { id: productId }
    });

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
        where: {
            productId_userId: {
                productId,
                userId
            }
        }
    });

    if (existingReview) {
        throw new ApiError(400, "You have already reviewed this product");
    }

    // Create review
    const review = await prisma.review.create({
        data: {
            productId,
            userId,
            rating: parseInt(rating),
            comment: comment || null
        },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                }
            }
        }
    });

    res.status(201).json(
        new ApiResponse(201, review, "Review added successfully")
    );
});

/**
 * Update a review
 * @route PUT /api/reviews/:reviewId
 * @access Private (Only review owner)
 */
export const updateReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    // Find existing review
    const existingReview = await prisma.review.findUnique({
        where: { id: reviewId }
    });

    if (!existingReview) {
        throw new ApiError(404, "Review not found");
    }

    // Check if user owns the review
    if (existingReview.userId !== userId) {
        throw new ApiError(403, "You are not authorized to update this review");
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
        throw new ApiError(400, "Rating must be between 1 and 5");
    }

    // Update review
    const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: {
            ...(rating && { rating: parseInt(rating) }),
            ...(comment !== undefined && { comment: comment || null })
        },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                }
            }
        }
    });

    res.status(200).json(
        new ApiResponse(200, updatedReview, "Review updated successfully")
    );
});

/**
 * Delete a review
 * @route DELETE /api/reviews/:reviewId
 * @access Private (Only review owner)
 */
export const deleteReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const userId = req.user.id;

    // Find existing review
    const existingReview = await prisma.review.findUnique({
        where: { id: reviewId }
    });

    if (!existingReview) {
        throw new ApiError(404, "Review not found");
    }

    // Check if user owns the review
    if (existingReview.userId !== userId) {
        throw new ApiError(403, "You are not authorized to delete this review");
    }

    // Delete review
    await prisma.review.delete({
        where: { id: reviewId }
    });

    res.status(200).json(
        new ApiResponse(200, null, "Review deleted successfully")
    );
});

/**
 * Get latest 3 reviews
 * @route GET /api/reviews/top
 * @access Public
 */
export const getTopReviews = asyncHandler(async (req, res) => {
    const latestReviews = await prisma.review.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                }
            },
            product: {
                select: {
                    id: true,
                    name: true,
                    category: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 3
    });

    res.status(200).json(
        new ApiResponse(200, latestReviews, "Latest reviews fetched successfully")
    );
});
