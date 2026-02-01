import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Get all products
 * @route GET /api/products
 * @access Public
 */

export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    where: {
      isPublished: true,
      // Only fetch products with inventory greater than 0
      inventory: {
        totalQty: {
          gt: 0,
        },
      },
    },
    include: {
      vendor: {
        select: {
          id: true,
          companyName: true,
          product_category: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      inventory: {
        select: {
          totalQty: true,
        },
      },
      pricing: {
        select: {
          type: true,
          price: true,
        },
      },
      attributes: {
        include: {
          attributeValue: {
            select: {
              value: true,
              attribute: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Transformation logic to match frontend expectations
  const transformedProducts = products.map((product) => {
    // Transform pricing array to object
    const pricingObj = {
      pricePerHour: 0,
      pricePerDay: 0,
      pricePerWeek: 0,
      pricePerMonth: 0,
    };

    if (product.pricing && Array.isArray(product.pricing)) {
      product.pricing.forEach((p) => {
        const price = Number(p.price);
        if (p.type === "HOUR") pricingObj.pricePerHour = price;
        if (p.type === "DAY") pricingObj.pricePerDay = price;
        if (p.type === "WEEK") pricingObj.pricePerWeek = price;
        if (p.type === "MONTH") pricingObj.pricePerMonth = price;
      });
    }

    // Transform inventory
    const inventoryObj = {
      quantityOnHand: product.inventory?.totalQty || 0,
    };

    // Transform attributes to key-value object
    const attributesObj = {};
    if (Array.isArray(product.attributes)) {
      product.attributes.forEach((attr) => {
        if (
          attr.attributeValue?.attribute?.name &&
          attr.attributeValue?.value
        ) {
          attributesObj[attr.attributeValue.attribute.name] =
            attr.attributeValue.value;
        }
      });
    }

    return {
      id: product.id,
      vendorId: product.vendorId,
      name: product.name,
      description: product.description,
      category: product.category,
      product_image_url: product.product_image_url,
      isPublished: product.isPublished,
      createdAt: product.createdAt,
      pricing: pricingObj,
      inventory: inventoryObj,
      attributes: attributesObj,
      vendor: product.vendor,
    };
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        transformedProducts,
        "Products fetched successfully",
      ),
    );
});

/**
 * Get product by ID
 * @route GET /api/products/:productId
 * @access Public
 */
export const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      vendor: {
        select: {
          id: true,
          companyName: true,
          product_category: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      inventory: {
        select: {
          totalQty: true,
        },
      },
      pricing: {
        select: {
          type: true,
          price: true,
        },
      },
      attributes: {
        include: {
          attribute: {
            select: {
              name: true,
            },
          },
          attributeValue: {
            select: {
              value: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Transform pricing array to object
  const pricingObj = {
    pricePerHour: 0,
    pricePerDay: 0,
    pricePerWeek: 0,
    pricePerMonth: 0,
  };

  if (product.pricing && Array.isArray(product.pricing)) {
    product.pricing.forEach((p) => {
      const price = Number(p.price);
      if (p.type === "HOUR") pricingObj.pricePerHour = price;
      if (p.type === "DAY") pricingObj.pricePerDay = price;
      if (p.type === "WEEK") pricingObj.pricePerWeek = price;
      if (p.type === "MONTH") pricingObj.pricePerMonth = price;
    });
  }

  // Transform inventory
  const inventoryObj = {
    quantityOnHand: product.inventory?.totalQty || 0,
  };

  // Transform attributes to key-value object
  const attributesObj = {};
  if (Array.isArray(product.attributes)) {
    product.attributes.forEach((attr) => {
      if (attr.attributeValue?.attribute?.name && attr.attributeValue?.value) {
        attributesObj[attr.attributeValue.attribute.name] =
          attr.attributeValue.value;
      }
    });
  }

  const transformedProduct = {
    id: product.id,
    vendorId: product.vendorId,
    name: product.name,
    description: product.description,
    category: product.category,
    product_image_url: product.product_image_url,
    isPublished: product.isPublished,
    createdAt: product.createdAt,
    pricing: pricingObj,
    inventory: inventoryObj,
    attributes: attributesObj,
    vendor: product.vendor,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, transformedProduct, "Product fetched successfully"),
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
    isPublished = false,
  } = req.body;

  // Validate required fields
  if (!name || !totalQty || !pricing || pricing.length === 0) {
    throw new ApiError(
      400,
      "Name, total quantity, and at least one pricing option are required",
    );
  }

  // Validate pricing types
  const validPricingTypes = ["HOUR", "DAY", "WEEK", "MONTH"];
  const invalidPricing = pricing.some(
    (p) => !validPricingTypes.includes(p.type),
  );
  if (invalidPricing) {
    throw new ApiError(400, "Invalid pricing type. Must be HOUR, DAY, or WEEK");
  }

  // Get vendor from authenticated user
  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
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
        isPublished,
      },
    });

    // Create inventory
    await tx.productInventory.create({
      data: {
        productId: newProduct.id,
        totalQty,
      },
    });

    // Auto-calculate pricing if missing
    let pricingDataInput = [...pricing];
    const dayPriceObj = pricingDataInput.find((p) => p.type === "DAY");

    if (dayPriceObj) {
      const dayPrice = Number(dayPriceObj.price);

      // Auto-calc Week
      if (!pricingDataInput.some((p) => p.type === "WEEK")) {
        pricingDataInput.push({ type: "WEEK", price: dayPrice * 7 });
      }

      // Auto-calc Month
      if (!pricingDataInput.some((p) => p.type === "MONTH")) {
        pricingDataInput.push({ type: "MONTH", price: dayPrice * 30 });
      }
    }

    // Create pricing
    const pricingData = pricingDataInput.map((p) => ({
      productId: newProduct.id,
      type: p.type,
      price: p.price,
    }));
    await tx.rentalPricing.createMany({
      data: pricingData,
    });

    // Create product attributes if provided
    if (attributes && attributes.length > 0) {
      const attributeData = attributes.map((attr) => ({
        productId: newProduct.id,
        attributeId: attr.attributeId,
        valueId: attr.valueId,
      }));
      await tx.productAttribute.createMany({
        data: attributeData,
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
                attribute: true,
              },
            },
          },
        },
      },
    });
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        product,
        isPublished ?
          "Product published successfully"
        : "Product created as draft",
      ),
    );
});
