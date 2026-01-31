import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, RentalOrder, Quotation, Invoice } from '@/types/rental';
import { mockProducts, mockOrders, mockQuotations, mockInvoices } from '@/data/mockData';

interface RentalState {
  products: Product[];
  orders: RentalOrder[];
  quotations: Quotation[];
  invoices: Invoice[];
  
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Order actions
  addOrder: (order: Omit<RentalOrder, 'id' | 'createdAt'>) => void;
  updateOrder: (id: string, updates: Partial<RentalOrder>) => void;
  
  // Quotation actions
  addQuotation: (quotation: Omit<Quotation, 'id' | 'createdAt'>) => void;
  updateQuotation: (id: string, updates: Partial<Quotation>) => void;
  
  // Invoice actions
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
}

export const useRentalStore = create<RentalState>()(
  persist(
    (set) => ({
      products: mockProducts,
      orders: mockOrders,
      quotations: mockQuotations,
      invoices: mockInvoices,
      
      addProduct: (product) => {
        const newProduct: Product = {
          ...product,
          id: `prod-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ products: [...state.products, newProduct] }));
      },
      
      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },
      
      deleteProduct: (id) => {
        set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
      },
      
      addOrder: (order) => {
        const newOrder: RentalOrder = {
          ...order,
          id: `order-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ orders: [...state.orders, newOrder] }));
      },
      
      updateOrder: (id, updates) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, ...updates } : o)),
        }));
      },
      
      addQuotation: (quotation) => {
        const newQuotation: Quotation = {
          ...quotation,
          id: `quote-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ quotations: [...state.quotations, newQuotation] }));
      },
      
      updateQuotation: (id, updates) => {
        set((state) => ({
          quotations: state.quotations.map((q) => (q.id === id ? { ...q, ...updates } : q)),
        }));
      },
      
      addInvoice: (invoice) => {
        const newInvoice: Invoice = {
          ...invoice,
          id: `inv-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ invoices: [...state.invoices, newInvoice] }));
      },
      
      updateInvoice: (id, updates) => {
        set((state) => ({
          invoices: state.invoices.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        }));
      },
    }),
    {
      name: 'rental-data',
    }
  )
);
