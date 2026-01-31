import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

/**
 * Get all products
 * @route GET /api/products
 * @access Public
 */

export const getAllProducts = asyncHandler(async (req, res) => {
    const products = await prisma.product.findMany({
        where: {
            isPublished: true
        },
        include: {
            vendor: {
                select: {
                    id: true,
                    companyName: true,
                    user: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            },
            inventory: {
                select: {
                    totalQty: true
                }
            },
            pricing: {
                select: {
                    type: true,
                    price: true
                }
            },
            attributes: {
                include: {
                    attributeValue: {
                        select: {
                            value: true,
                            attribute: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                products,
                "Products fetched successfully"
            )
        );
});

/**
 * Create and publish a rental product (Vendor only)
 * @route POST /api/products
 * @access Private (Vendor)
 */
export const createRentalProduct = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        totalQty,
        pricing, // Array of {type: "HOUR"|"DAY"|"WEEK", price: number}
        attributes, // Array of {attributeId, valueId}
        isPublished = false
    } = req.body;

    // Validate required fields
    if (!name || !totalQty || !pricing || pricing.length === 0) {
        throw new ApiError(400, "Name, total quantity, and at least one pricing option are required");
    }

    // Validate pricing types
    const validPricingTypes = ["HOUR", "DAY", "WEEK"];
    const invalidPricing = pricing.some(p => !validPricingTypes.includes(p.type));
    if (invalidPricing) {
        throw new ApiError(400, "Invalid pricing type. Must be HOUR, DAY, or WEEK");
    }

    // Get vendor from authenticated user
    const vendor = await prisma.vendor.findUnique({
        where: { userId: req.user.id }
    });

    if (!vendor) {
        throw new ApiError(403, "Only vendors can create products");
    }

    // Create product with inventory, pricing, and attributes in a transaction
    const product = await prisma.$transaction(async (tx) => {
        // Create the product
        const newProduct = await tx.product.create({
            data: {
                vendorId: vendor.id,
                name,
                description,
                isPublished
            }
        });

        // Create inventory
        await tx.productInventory.create({
            data: {
                productId: newProduct.id,
                totalQty
            }
        });

        // Create pricing
        const pricingData = pricing.map(p => ({
            productId: newProduct.id,
            type: p.type,
            price: p.price
        }));
        await tx.rentalPricing.createMany({
            data: pricingData
        });

        // Create product attributes if provided
        if (attributes && attributes.length > 0) {
            const attributeData = attributes.map(attr => ({
                productId: newProduct.id,
                attributeId: attr.attributeId,
                valueId: attr.valueId
            }));
            await tx.productAttribute.createMany({
                data: attributeData
            });
        }

        // Fetch the complete product with relations
        return await tx.product.findUnique({
            where: { id: newProduct.id },
            include: {
                inventory: true,
                pricing: true,
                attributes: {
                    include: {
                        attributeValue: {
                            include: {
                                attribute: true
                            }
                        }
                    }
                }
            }
        });
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                product,
                isPublished ? "Product published successfully" : "Product created as draft"
            )
        );
});
