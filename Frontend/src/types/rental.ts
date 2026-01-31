// Types for Rental Management System

export type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  companyName?: string;
  gstin?: string;
  role: UserRole;
  createdAt: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  attributes: Record<string, string>;
  pricePerHour: number;
  pricePerDay: number;
  pricePerWeek: number;
  quantityAvailable: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  isRentable: boolean;
  isPublished: boolean;
  costPrice: number;
  pricePerHour: number;
  pricePerDay: number;
  pricePerWeek: number;
  quantityOnHand: number;
  vendorId: string;
  attributes: Record<string, string>;
  variants?: ProductVariant[];
  createdAt: string;
}

export type RentalDuration = 'hourly' | 'daily' | 'weekly' | 'custom';

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  rentalDuration: RentalDuration;
  startDate: string;
  endDate: string;
  totalPrice: number;
  selectedAttributes?: Record<string, string>;
}

export type QuotationStatus = 'draft' | 'sent' | 'confirmed' | 'cancelled';

export interface Quotation {
  id: string;
  customerId: string;
  items: CartItem[];
  status: QuotationStatus;
  totalAmount: number;
  notes?: string;
  validUntil: string;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'picked_up' | 'returned' | 'completed' | 'cancelled';

export interface RentalOrder {
  id: string;
  quotationId?: string;
  customerId: string;
  vendorId: string;
  items: CartItem[];
  status: OrderStatus;
  totalAmount: number;
  paidAmount: number;
  securityDeposit: number;
  pickupDate?: string;
  returnDate?: string;
  actualReturnDate?: string;
  lateFee: number;
  notes?: string;
  createdAt: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  orderId: string;
  customerId: string;
  items: CartItem[];
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  dueDate: string;
  createdAt: string;
}

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank_transfer';

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeRentals: number;
  overdueReturns: number;
  topProducts: { productId: string; name: string; rentals: number }[];
  revenueByMonth: { month: string; revenue: number }[];
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  product: {
    id: string;
    name: string;
    category: string;
  };
}
