import api from "./api";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  rentalStart: string;
  rentalEnd: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: "draft" | "confirmed" | "ongoing" | "returned" | "cancelled";
  productName: string;
  productImage: string;
  quantity: number;
  rentalPeriod: {
    start: string | null;
    end: string | null;
  };
  totalAmount: number;
  invoiceUrl: string | null;
  deliveryAddress: string;
  items?: OrderItem[];
  vendor?: {
    id: string;
    companyName: string;
  };
  createdAt: string;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  message: string;
}

export interface OrderResponse {
  success: boolean;
  data: Order;
  message: string;
}

/**
 * Get all orders for the authenticated user
 * @param status - Optional filter by order status
 */
export const getOrders = async (status?: string): Promise<Order[]> => {
  try {
    const params = status ? { status: status.toUpperCase() } : {};
    const response = await api.get<OrdersResponse>("/orders", { params });
    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

/**
 * Get single order by ID
 * @param orderId - Order ID
 */
export const getOrderById = async (orderId: string): Promise<Order> => {
  if (!orderId || typeof orderId !== "string") {
    throw new Error("Invalid order ID");
  }

  try {
    const response = await api.get<OrderResponse>(`/orders/${orderId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

export interface CreateOrderRequest {
  addressId: string;
  paymentMethod: string;
  couponCode?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  data: {
    orderIds: string[];
    count: number;
  };
  message: string;
}

/**
 * Create order(s) from user's cart
 * @param data - Order creation data
 */
export const createOrder = async (
  data: CreateOrderRequest,
): Promise<{ orderIds: string[]; count: number }> => {
  if (!data.addressId) {
    throw new Error("Address ID is required");
  }
  if (!data.paymentMethod) {
    throw new Error("Payment method is required");
  }

  try {
    const response = await api.post<CreateOrderResponse>("/orders", data);
    return response.data.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

/**
 * Create a Razorpay order
 */
export const createRazorpayOrder = async (data: any): Promise<any> => {
  const response = await api.post('/orders/razorpay/create-order', data);
  return response.data.data;
};

/**
 * Verify Razorpay payment and place order
 */
export const verifyPayment = async (data: any): Promise<any> => {
  const response = await api.post('/orders/razorpay/verify', data);
  return response.data.data;
};
