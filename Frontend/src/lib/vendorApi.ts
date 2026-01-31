import api from "./api";

export interface VendorDashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeRentals: number;
  overdueReturns: number;
  totalProducts: number;
  publishedProducts: number;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  topProducts: Array<{
    id: string;
    name: string;
    description: string | null;
    isPublished: boolean;
    quantityOnHand: number;
    pricePerDay: number;
    orderCount: number;
  }>;
}

export interface VendorProduct {
  id: string;
  vendorId: string;
  name: string;
  description: string | null;
  category: string;
  product_image_url: string | null;
  isPublished: boolean;
  createdAt: string;
  inventory: {
    id: string;
    productId: string;
    totalQty: number;
  } | null;
  pricing: Array<{
    id: string;
    productId: string;
    type: "HOUR" | "DAY" | "WEEK";
    price: string;
  }>;
}

export interface VendorOrder {
  id: string;
  userId: string;
  vendorId: string;
  status: "CONFIRMED" | "INVOICED" | "RETURNED" | "CANCELLED";
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  items: Array<{
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    rentalStart: string;
    rentalEnd: string;
    unitPrice: string;
    product: VendorProduct;
  }>;
  invoice: {
    id: string;
    orderId: string;
    totalAmount: string;
    gstAmount: string;
    status: string;
    createdAt: string;
  } | null;
}

export interface VendorInvoice {
  id: string;
  orderId: string;
  totalAmount: string;
  gstAmount: string;
  status: "DRAFT" | "PARTIAL" | "PAID";
  createdAt: string;
  order: {
    id: string;
    userId: string;
    vendorId: string;
    status: string;
    createdAt: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
    items: Array<{
      id: string;
      quantity: number;
      product: {
        id: string;
        name: string;
      };
    }>;
  };
  payments: Array<{
    id: string;
    invoiceId: string;
    amount: string;
    mode: string;
    status: string;
    paidAt: string | null;
  }>;
}

// Vendor Dashboard Stats
export const getVendorDashboardStats =
  async (): Promise<VendorDashboardStats> => {
    const response = await api.get("/vendor/stats");
    return response.data.data;
  };

// Vendor Products
export const getVendorProducts = async (): Promise<VendorProduct[]> => {
  const response = await api.get("/vendor/products");
  return response.data.data;
};

// Vendor Orders
export const getVendorOrders = async (
  status?: string,
): Promise<VendorOrder[]> => {
  const params = status ? { status } : {};
  const response = await api.get("/vendor/orders", { params });
  return response.data.data;
};

// Vendor Invoices
export const getVendorInvoices = async (
  status?: string,
): Promise<VendorInvoice[]> => {
  const params = status ? { status } : {};
  const response = await api.get("/vendor/invoices", { params });
  return response.data.data;
};

// Vendor Profile
export const getVendorProfile = async () => {
  const response = await api.get("/vendor/profile");
  return response.data.data;
};

export const updateVendorProfile = async (data: {
  companyName?: string;
  gstNo?: string;
  product_category?: string;
}) => {
  const response = await api.put("/vendor/profile", data);
  return response.data.data;
};

export const updateVendorUser = async (data: {
  firstName?: string;
  lastName?: string;
  email?: string;
}) => {
  const response = await api.put("/vendor/profile/user", data);
  return response.data.data;
};

export const changeVendorPassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const response = await api.post("/vendor/profile/change-password", data);
  return response.data;
};

// Update Order Status
export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await api.patch(`/vendor/orders/${orderId}/status`, {
    status,
  });
  return response.data.data;
};

// Delete Order
export const deleteVendorOrder = async (orderId: string) => {
  const response = await api.delete(`/vendor/orders/${orderId}`);
  return response.data.data;
};

// Create Product
export const createProduct = async (
  formData: FormData,
): Promise<VendorProduct> => {
  const response = await api.post("/vendor/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};

// Get Single Product
export const getVendorProduct = async (id: string): Promise<VendorProduct> => {
  const response = await api.get(`/vendor/products/${id}`);
  return response.data.data;
};

// Update Product
export const updateProduct = async (
  id: string,
  formData: FormData,
): Promise<VendorProduct> => {
  const response = await api.put(`/vendor/products/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};

// Delete Product
export const deleteProduct = async (id: string) => {
  const response = await api.delete(`/vendor/products/${id}`);
  return response.data.data;
};

// Vendor Analytics
export interface VendorAnalyticsData {
  stats: {
    totalRevenue: string;
    totalOrders: string;
    activeRentals: string;
    productsListed: string;
  };
  revenueData: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  categoryData: Array<{
    name: string;
    value: number;
  }>;
  topProducts: Array<{
    name: string;
    rentals: number;
    revenue: number;
  }>;
}

export const getVendorAnalytics = async (
  timeRange: string = "year",
): Promise<VendorAnalyticsData> => {
  const response = await api.get("/vendor/analytics", {
    params: { timeRange },
  });
  return response.data.data;
};
