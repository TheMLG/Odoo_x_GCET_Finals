import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, RentalOrder, Quotation, Invoice } from '@/types/rental';
import api from '@/lib/api';

interface RentalState {
  products: Product[];
  orders: RentalOrder[];
  quotations: Quotation[];
  invoices: Invoice[];
  isLoadingProducts: boolean;
  productsError: string | null;
  
  // Date and location state
  location: string;
  deliveryDate: Date | null;
  pickupDate: Date | null;
  
  // Date and location actions
  setLocation: (location: string) => void;
  setDeliveryDate: (date: Date | null) => void;
  setPickupDate: (date: Date | null) => void;
  setRentalDates: (deliveryDate: Date | null, pickupDate: Date | null) => void;
  
  // Product actions
  fetchProducts: () => Promise<void>;
  setProducts: (products: Product[]) => void;
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
      products: [],
      orders: [],
      quotations: [],
      invoices: [],
      isLoadingProducts: false,
      productsError: null,
      location: 'Delhi',
      deliveryDate: null,
      pickupDate: null,
      
      setLocation: (location) => set({ location }),
      
      setDeliveryDate: (date) => set({ deliveryDate: date }),
      
      setPickupDate: (date) => set({ pickupDate: date }),
      
      setRentalDates: (deliveryDate, pickupDate) => set({ deliveryDate, pickupDate }),
      
      fetchProducts: async () => {
        set({ isLoadingProducts: true, productsError: null });
        try {
          const response = await api.get('/products');
          const fetchedProducts = response.data.data || [];
          
          // Transform backend data to match frontend Product type
          const transformedProducts: Product[] = fetchedProducts.map((p: any) => {
            // Backend returns pricing as an object: { pricePerDay, pricePerWeek, pricePerMonth }
            const pricing = p.pricing || {};
            
            return {
              id: p.id,
              name: p.name,
              description: p.description || '',
              category: p.category || 'General',
              images: p.product_image_url ? [p.product_image_url] : [],
              isRentable: true,
              isPublished: p.isPublished ?? false,
              costPrice: 0,
              pricePerHour: 0, // Backend doesn't have hourly pricing yet
              pricePerDay: Number(pricing.pricePerDay) || 0,
              pricePerWeek: Number(pricing.pricePerWeek) || 0,
              quantityOnHand: p.inventory?.quantityOnHand || 0,
              vendorId: p.vendorId,
              attributes: typeof p.attributes === 'object' && !Array.isArray(p.attributes) ? p.attributes : {},
              createdAt: p.createdAt,
            };
          });
          
          set({ products: transformedProducts, isLoadingProducts: false, productsError: null });
        } catch (error: any) {
          console.error('Failed to fetch products:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch products';
          set({ 
            products: [],
            productsError: errorMessage,
            isLoadingProducts: false 
          });
        }
      },
      
      setProducts: (products) => set({ products }),
      
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
      partialize: (state) => ({ 
        location: state.location,
        deliveryDate: state.deliveryDate,
        pickupDate: state.pickupDate,
        // Don't persist products, orders, quotations, invoices - fetch from API
      }),
    }
  )
);
