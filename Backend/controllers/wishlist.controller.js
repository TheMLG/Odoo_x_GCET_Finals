import prisma from '../config/prisma.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Get user's wishlist with products
 * GET /api/wishlist
 */
export const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  let wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              inventory: true,
              pricing: true,
              vendor: {
                select: {
                  id: true,
                  companyName: true,
                }
              }
            }
          }
        },
        orderBy: {
          addedAt: 'desc'
        }
      }
    }
  });

  // Create wishlist if it doesn't exist
  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                inventory: true,
                pricing: true,
                vendor: {
                  select: {
                    id: true,
                    companyName: true,
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  // Transform products to match frontend format
  const products = wishlist.items.map(item => {
    const product = item.product;
    const pricing = product.pricing.reduce((acc, p) => {
      if (p.type === 'HOUR') acc.pricePerHour = parseFloat(p.price);
      if (p.type === 'DAY') acc.pricePerDay = parseFloat(p.price);
      if (p.type === 'WEEK') acc.pricePerWeek = parseFloat(p.price);
      return acc;
    }, {});

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      images: [product.product_image_url],
      isRentable: true,
      isPublished: product.isPublished,
      costPrice: 0,
      pricePerHour: pricing.pricePerHour || 0,
      pricePerDay: pricing.pricePerDay || 0,
      pricePerWeek: pricing.pricePerWeek || 0,
      quantityOnHand: product.inventory?.totalQty || 0,
      vendorId: product.vendorId,
      attributes: {},
      createdAt: product.createdAt.toISOString(),
      addedToWishlistAt: item.addedAt.toISOString(),
    };
  });

  res.json(new ApiResponse(200, products, 'Wishlist retrieved successfully'));
});

/**
 * Add product to wishlist
 * POST /api/wishlist/items
 */
export const addToWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) {
    throw new ApiError(400, 'Product ID is required');
  }

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Get or create wishlist
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId }
  });

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId }
    });
  }

  // Check if product is already in wishlist
  const existingItem = await prisma.wishlistItem.findUnique({
    where: {
      wishlistId_productId: {
        wishlistId: wishlist.id,
        productId: productId
      }
    }
  });

  if (existingItem) {
    throw new ApiError(400, 'Product already in wishlist');
  }

  // Add product to wishlist
  await prisma.wishlistItem.create({
    data: {
      wishlistId: wishlist.id,
      productId: productId
    }
  });

  res.json(new ApiResponse(201, null, 'Product added to wishlist'));
});

/**
 * Remove product from wishlist
 * DELETE /api/wishlist/items/:productId
 */
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId }
  });

  if (!wishlist) {
    throw new ApiError(404, 'Wishlist not found');
  }

  const deletedItem = await prisma.wishlistItem.deleteMany({
    where: {
      wishlistId: wishlist.id,
      productId: productId
    }
  });

  if (deletedItem.count === 0) {
    throw new ApiError(404, 'Product not found in wishlist');
  }

  res.json(new ApiResponse(200, null, 'Product removed from wishlist'));
});

/**
 * Clear entire wishlist (remove all items)
 * DELETE /api/wishlist/clear
 */
export const clearWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId }
  });

  if (!wishlist) {
    throw new ApiError(404, 'Wishlist not found');
  }

  await prisma.wishlistItem.deleteMany({
    where: {
      wishlistId: wishlist.id
    }
  });

  res.json(new ApiResponse(200, null, 'Wishlist cleared successfully'));
});

/**
 * Delete entire wishlist (remove wishlist entity and all items)
 * DELETE /api/wishlist
 */
export const deleteWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  console.log(`Attempting to delete wishlist for user: ${userId}`);

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: { items: true }
  });

  if (!wishlist) {
    console.log(`No wishlist found for user: ${userId}`);
    throw new ApiError(404, 'Wishlist not found');
  }

  console.log(`Found wishlist ${wishlist.id} with ${wishlist.items.length} items`);

  // Delete the wishlist (items will cascade delete due to schema)
  await prisma.wishlist.delete({
    where: { id: wishlist.id }
  });

  console.log(`Successfully deleted wishlist ${wishlist.id}`);
  res.json(new ApiResponse(200, null, 'Wishlist deleted successfully'));
});

/**
 * Check if product is in wishlist
 * GET /api/wishlist/check/:productId
 */
export const checkInWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId }
  });

  let isInWishlist = false;

  if (wishlist) {
    const item = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId: productId
        }
      }
    });
    isInWishlist = !!item;
  }

  res.json(new ApiResponse(200, { isInWishlist }, 'Wishlist check completed'));
});
