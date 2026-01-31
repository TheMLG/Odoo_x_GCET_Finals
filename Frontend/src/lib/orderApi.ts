import api from './api';

export interface Order {
    id: string;
    orderNumber: string;
    status: 'DRAFT' | 'CONFIRMED' | 'INVOICED' | 'RETURNED' | 'CANCELLED';
    userId: string;
    vendorId: string;
    createdAt: string;
    updatedAt: string;
    vendor?: {
        id: string;
        companyName: string | null;
        gstNo: string | null;
        user: {
            firstName: string;
            lastName: string;
            email: string;
        };
    };
    items: OrderItem[];
    invoice?: Invoice;
}

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    unitPrice: string;
    rentalStart: string;
    rentalEnd: string;
    product: {
        id: string;
        name: string;
        description: string | null;
        category: string;
        product_image_url: string;
        pricing?: Array<{
            type: string;
            price: string;
        }>;
    };
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    orderId: string;
    totalAmount: string;
    status: string;
    dueDate: string;
    createdAt: string;
    payments?: Payment[];
}

export interface Payment {
    id: string;
    invoiceId: string;
    amount: string;
    status: string;
    mode: string;
    transactionId: string | null;
    createdAt: string;
}

/**
 * Create a new order from active cart
 */
export async function createOrder(): Promise<Order[]> {
    const response = await api.post('/orders');
    return response.data.data;
}

/**
 * Get all orders for the authenticated user
 * @param status Optional status filter
 */
export async function getUserOrders(status?: string): Promise<Order[]> {
    const params = status ? { status } : {};
    const response = await api.get('/orders', { params });
    return response.data.data;
}

/**
 * Get detailed information for a specific order
 * @param orderId Order ID
 */
export async function getOrderById(orderId: string): Promise<Order> {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.data;
}

/**
 * Download invoice PDF for an order
 * @param orderId Order ID
 * @param orderNumber Order number for filename
 */
export async function downloadInvoicePDF(
    orderId: string,
    orderNumber: string
): Promise<void> {
    const response = await api.get(`/orders/${orderId}/invoice/pdf`, {
        responseType: 'blob',
    });

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${orderNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
}
