import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Get all orders for the authenticated user
 * @route GET /api/v1/orders
 * @query status - Optional filter by order status
 */
export const getUserOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const whereClause = {
    userId: req.user.id,
  };

  // Add status filter if provided
  if (
    status &&
    ["CONFIRMED", "INVOICED", "RETURNED", "CANCELLED"].includes(
      status.toUpperCase(),
    )
  ) {
    whereClause.status = status.toUpperCase();
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              product_image_url: true,
              category: true,
            },
          },
        },
      },
      deliveryAddress: true,
      invoice: {
        include: {
          payments: true,
        },
      },
      vendor: {
        select: {
          id: true,
          companyName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Transform orders to match frontend interface
  const transformedOrders = orders.map((order) => {
    // Get the first item's product for display (most orders have one main product)
    const primaryItem = order.items[0];
    const totalQuantity = order.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    // Calculate total amount from invoice or items
    const totalAmount =
      order.invoice ?
        Number(order.invoice.totalAmount)
      : order.items.reduce(
          (sum, item) => sum + Number(item.unitPrice) * item.quantity,
          0,
        );

    // Get rental period from items (use first item's dates for display)
    const rentalStart = primaryItem ? new Date(primaryItem.rentalStart) : null;
    const rentalEnd = primaryItem ? new Date(primaryItem.rentalEnd) : null;

    // Map status to frontend format (lowercase)
    const statusMap = {
      CONFIRMED: "confirmed",
      INVOICED: "ongoing",
      RETURNED: "returned",
      CANCELLED: "cancelled",
    };

    return {
      id: order.id,
      orderNumber: `RO-${new Date(order.createdAt).getFullYear()}-${order.id.slice(0, 8).toUpperCase()}`,
      status: statusMap[order.status] || "draft",
      productName: primaryItem?.product?.name || "Unknown Product",
      productImage: primaryItem?.product?.product_image_url || "",
      quantity: totalQuantity,
      rentalPeriod: {
        start: rentalStart,
        end: rentalEnd,
      },
      totalAmount,
      invoiceUrl: order.invoice ? `/api/v1/orders/${order.id}/invoice` : null,
      deliveryAddress:
        order.deliveryAddress ?
          `${order.deliveryAddress.addressLine1}, ${order.deliveryAddress.city}`
        : "No address provided",
      // Additional details
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name,
        productImage: item.product?.product_image_url,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        rentalStart: item.rentalStart,
        rentalEnd: item.rentalEnd,
      })),
      vendor: order.vendor,
      createdAt: order.createdAt,
    };
  });

  // Log the result
  console.log(
    `[Orders] User ${req.user.id} fetched ${transformedOrders.length} orders`,
    {
      userId: req.user.id,
      statusFilter: status || "all",
      orderCount: transformedOrders.length,
      orders: transformedOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
      })),
    },
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, transformedOrders, "Orders fetched successfully"),
    );
});

/**
 * Get single order by ID for the authenticated user
 * @route GET /api/v1/orders/:orderId
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: req.user.id,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              description: true,
              product_image_url: true,
              category: true,
            },
          },
        },
      },
      deliveryAddress: true,
      invoice: {
        include: {
          payments: true,
        },
      },
      vendor: {
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      coupon: true,
    },
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Transform to frontend format
  const primaryItem = order.items[0];
  const totalQuantity = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const totalAmount =
    order.invoice ?
      Number(order.invoice.totalAmount)
    : order.items.reduce(
        (sum, item) => sum + Number(item.unitPrice) * item.quantity,
        0,
      );

  const statusMap = {
    CONFIRMED: "confirmed",
    INVOICED: "ongoing",
    RETURNED: "returned",
    CANCELLED: "cancelled",
  };

  const transformedOrder = {
    id: order.id,
    orderNumber: `RO-${new Date(order.createdAt).getFullYear()}-${order.id.slice(0, 8).toUpperCase()}`,
    status: statusMap[order.status] || "draft",
    productName: primaryItem?.product?.name || "Unknown Product",
    productImage: primaryItem?.product?.product_image_url || "",
    quantity: totalQuantity,
    rentalPeriod: {
      start: primaryItem ? new Date(primaryItem.rentalStart) : null,
      end: primaryItem ? new Date(primaryItem.rentalEnd) : null,
    },
    totalAmount,
    discountAmount: Number(order.discountAmount),
    invoiceUrl: order.invoice ? `/api/v1/orders/${order.id}/invoice` : null,
    deliveryAddress:
      order.deliveryAddress ?
        {
          fullName: order.deliveryAddress.fullName,
          phoneNumber: order.deliveryAddress.phoneNumber,
          addressLine1: order.deliveryAddress.addressLine1,
          addressLine2: order.deliveryAddress.addressLine2,
          city: order.deliveryAddress.city,
          state: order.deliveryAddress.state,
          postalCode: order.deliveryAddress.postalCode,
          country: order.deliveryAddress.country,
        }
      : null,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product?.name,
      productDescription: item.product?.description,
      productImage: item.product?.product_image_url,
      category: item.product?.category,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      rentalStart: item.rentalStart,
      rentalEnd: item.rentalEnd,
    })),
    vendor: {
      id: order.vendor.id,
      companyName: order.vendor.companyName,
      contactName:
        order.vendor.user ?
          `${order.vendor.user.firstName} ${order.vendor.user.lastName}`
        : null,
      email: order.vendor.user?.email,
    },
    invoice:
      order.invoice ?
        {
          id: order.invoice.id,
          totalAmount: Number(order.invoice.totalAmount),
          gstAmount: Number(order.invoice.gstAmount),
          status: order.invoice.status,
          createdAt: order.invoice.createdAt,
        }
      : null,
    coupon:
      order.coupon ?
        {
          code: order.coupon.code,
          discountType: order.coupon.discountType,
          discountValue: Number(order.coupon.discountValue),
        }
      : null,
    createdAt: order.createdAt,
  };

  res
    .status(200)
    .json(new ApiResponse(200, transformedOrder, "Order fetched successfully"));
});

/**
 * Create order(s) from user's cart
 * Groups items by vendor - creates one order per vendor
 * @route POST /api/v1/orders
 * @body addressId - Delivery address ID (required)
 * @body paymentMethod - Payment method used (required)
 * @body couponCode - Optional coupon code
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { addressId, paymentMethod, couponCode } = req.body;

  // Validate required fields
  if (!addressId) {
    throw new ApiError(400, "Delivery address is required");
  }

  if (!paymentMethod) {
    throw new ApiError(400, "Payment method is required");
  }

  // Get user's active cart with items
  const cart = await prisma.cart.findFirst({
    where: {
      userId: req.user.id,
      status: "ACTIVE",
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              vendor: true,
              inventory: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  // Verify address belongs to user
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId: req.user.id,
    },
  });

  if (!address) {
    throw new ApiError(404, "Delivery address not found");
  }

  // Check coupon if provided
  let coupon = null;
  if (couponCode) {
    coupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
    });

    if (!coupon || !coupon.isActive) {
      throw new ApiError(400, "Invalid or expired coupon");
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      throw new ApiError(400, "Coupon has expired");
    }

    if (
      coupon.maxUsageCount &&
      coupon.currentUsageCount >= coupon.maxUsageCount
    ) {
      throw new ApiError(400, "Coupon usage limit reached");
    }
  }

  // Group cart items by vendor
  const itemsByVendor = cart.items.reduce((acc, item) => {
    const vendorId = item.product.vendorId;
    if (!acc[vendorId]) {
      acc[vendorId] = [];
    }
    acc[vendorId].push(item);
    return acc;
  }, {});

  // Create orders in a transaction
  const createdOrders = await prisma.$transaction(async (tx) => {
    const orders = [];

    for (const [vendorId, items] of Object.entries(itemsByVendor)) {
      // Calculate totals for this order
      const subtotal = items.reduce(
        (sum, item) => sum + Number(item.unitPrice) * item.quantity,
        0,
      );

      // Calculate discount if coupon applies
      let discountAmount = 0;
      if (coupon) {
        if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
          // Coupon doesn't apply to this order (below minimum)
        } else if (coupon.discountType === "PERCENTAGE") {
          discountAmount = (subtotal * Number(coupon.discountValue)) / 100;
        } else if (coupon.discountType === "FIXED_AMOUNT") {
          discountAmount = Number(coupon.discountValue);
        }
      }

      const gstRate = 0.18; // 18% GST
      const gstAmount = (subtotal - discountAmount) * gstRate;
      const totalAmount = subtotal - discountAmount + gstAmount;

      console.log("Creating order with data:", {
        userId: req.user.id,
        vendorId,
        deliveryAddressId: addressId,
        couponId: coupon?.id || null,
        discountAmount,
        status: "CONFIRMED",
      });

      // Create order
      const order = await tx.order.create({
        data: {
          userId: req.user.id,
          vendorId: vendorId,
          deliveryAddressId: addressId,
          couponId: coupon?.id || null,
          discountAmount: discountAmount,
          status: "CONFIRMED",
        },
      });

      // Create order items and reservations
      for (const item of items) {
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            rentalStart: item.rentalStart,
            rentalEnd: item.rentalEnd,
            unitPrice: item.unitPrice,
          },
        });

        // Create reservation
        await tx.reservation.create({
          data: {
            orderItemId: orderItem.id,
            productId: item.productId,
            reservedFrom: item.rentalStart,
            reservedTo: item.rentalEnd,
            quantity: item.quantity,
          },
        });
      }

      // Create invoice
      await tx.invoice.create({
        data: {
          orderId: order.id,
          totalAmount: totalAmount,
          gstAmount: gstAmount,
          status: "DRAFT",
        },
      });

      orders.push(order);
    }

    // Update coupon usage if used
    if (coupon) {
      await tx.coupon.update({
        where: { id: coupon.id },
        data: { currentUsageCount: { increment: 1 } },
      });
    }

    // Mark cart as converted
    await tx.cart.update({
      where: { id: cart.id },
      data: { status: "CONVERTED" },
    });

    return orders;
  });

  console.log(
    `[Orders] Created ${createdOrders.length} order(s) for user ${req.user.id}`,
    {
      userId: req.user.id,
      orderIds: createdOrders.map((o) => o.id),
      addressId,
      paymentMethod,
    },
  );

  res.status(201).json(
    new ApiResponse(
      201,
      {
        orderIds: createdOrders.map((o) => o.id),
        count: createdOrders.length,
      },
      `${createdOrders.length} order(s) created successfully`,
    ),
  );
});
