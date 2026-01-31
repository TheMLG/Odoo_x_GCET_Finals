import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

/**
 * Get user's active cart with items
 * @route GET /api/cart
 * @access Private
 */
export const getCart = asyncHandler(async (req, res) => {
    let cart = await prisma.cart.findFirst({
        where: {
            userId: req.user.id,
            status: "ACTIVE"
        },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            pricing: true,
                            inventory: true,
                            vendor: {
                                select: {
                                    id: true,
                                    companyName: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // If no active cart exists, create one
    if (!cart) {
        cart = await prisma.cart.create({
            data: {
                userId: req.user.id,
                status: "ACTIVE"
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                pricing: true,
                                inventory: true
                            }
                        }
                    }
                }
            }
        });
    }

    return res.status(200).json(
        new ApiResponse(200, cart, "Cart fetched successfully")
    );
});

/**
 * Add item to cart
 * @route POST /api/cart/items
 * @access Private
 */
export const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity, rentalStart, rentalEnd, unitPrice } = req.body;

    // Validate required fields
    if (!productId || !quantity || !rentalStart || !rentalEnd || !unitPrice) {
        throw new ApiError(400, "All fields are required");
    }

    // Verify product exists and is published
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            inventory: true
        }
    });

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (!product.isPublished) {
        throw new ApiError(400, "Product is not available for rent");
    }

    // Check inventory availability
    if (product.inventory.totalQty < quantity) {
        throw new ApiError(400, `Only ${product.inventory.totalQty} units available`);
    }

    // Get or create active cart
    let cart = await prisma.cart.findFirst({
        where: {
            userId: req.user.id,
            status: "ACTIVE"
        }
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: {
                userId: req.user.id,
                status: "ACTIVE"
            }
        });
    }

    // Check if product already in cart
    const existingItem = await prisma.cartItem.findFirst({
        where: {
            cartId: cart.id,
            productId: productId
        }
    });

    let cartItem;
    if (existingItem) {
        // Update existing item
        cartItem = await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
                quantity: existingItem.quantity + quantity,
                rentalStart: new Date(rentalStart),
                rentalEnd: new Date(rentalEnd),
                unitPrice: parseFloat(unitPrice)
            },
            include: {
                product: {
                    include: {
                        pricing: true,
                        inventory: true
                    }
                }
            }
        });
    } else {
        // Create new item
        cartItem = await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                quantity,
                rentalStart: new Date(rentalStart),
                rentalEnd: new Date(rentalEnd),
                unitPrice: parseFloat(unitPrice)
            },
            include: {
                product: {
                    include: {
                        pricing: true,
                        inventory: true
                    }
                }
            }
        });
    }

    return res.status(201).json(
        new ApiResponse(201, cartItem, "Item added to cart successfully")
    );
});

/**
 * Update cart item quantity
 * @route PATCH /api/cart/items/:itemId
 * @access Private
 */
export const updateCartItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { quantity, rentalStart, rentalEnd } = req.body;

    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findUnique({
        where: { id: itemId },
        include: {
            cart: true,
            product: {
                include: {
                    inventory: true
                }
            }
        }
    });

    if (!cartItem) {
        throw new ApiError(404, "Cart item not found");
    }

    if (cartItem.cart.userId !== req.user.id) {
        throw new ApiError(403, "Unauthorized to update this cart item");
    }

    // Check inventory if quantity is being updated
    if (quantity && quantity > cartItem.product.inventory.totalQty) {
        throw new ApiError(400, `Only ${cartItem.product.inventory.totalQty} units available`);
    }

    const updatedItem = await prisma.cartItem.update({
        where: { id: itemId },
        data: {
            ...(quantity && { quantity }),
            ...(rentalStart && { rentalStart: new Date(rentalStart) }),
            ...(rentalEnd && { rentalEnd: new Date(rentalEnd) })
        },
        include: {
            product: {
                include: {
                    pricing: true,
                    inventory: true
                }
            }
        }
    });

    return res.status(200).json(
        new ApiResponse(200, updatedItem, "Cart item updated successfully")
    );
});

/**
 * Remove item from cart
 * @route DELETE /api/cart/items/:itemId
 * @access Private
 */
export const removeFromCart = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findUnique({
        where: { id: itemId },
        include: {
            cart: true
        }
    });

    if (!cartItem) {
        throw new ApiError(404, "Cart item not found");
    }

    if (cartItem.cart.userId !== req.user.id) {
        throw new ApiError(403, "Unauthorized to remove this cart item");
    }

    await prisma.cartItem.delete({
        where: { id: itemId }
    });

    return res.status(200).json(
        new ApiResponse(200, null, "Item removed from cart successfully")
    );
});

/**
 * Clear entire cart
 * @route DELETE /api/cart
 * @access Private
 */
export const clearCart = asyncHandler(async (req, res) => {
    const cart = await prisma.cart.findFirst({
        where: {
            userId: req.user.id,
            status: "ACTIVE"
        }
    });

    if (!cart) {
        throw new ApiError(404, "No active cart found");
    }

    await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
    });

    return res.status(200).json(
        new ApiResponse(200, null, "Cart cleared successfully")
    );
});
