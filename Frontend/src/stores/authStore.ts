import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Array<{
    role: {
      id: string;
      name: 'ADMIN' | 'VENDOR' | 'CUSTOMER';
    };
  }>;
  vendor?: {
    id: string;
    companyName: string;
    gstNo: string;
    product_category: string;
  };
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  fetchCurrentUser: () => Promise<void>;
  hasRole: (role: 'ADMIN' | 'VENDOR' | 'CUSTOMER') => boolean;
  getUserRole: () => 'ADMIN' | 'VENDOR' | 'CUSTOMER' | null;
  getDashboardPath: () => string;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'customer' | 'vendor';
  companyName?: string;
  gstNo?: string;
  product_category?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, accessToken } = response.data.data;
          
          // Store token in localStorage
          localStorage.setItem('accessToken', accessToken);
          
          set({ user, isAuthenticated: true });
          return true;
        } catch (error: any) {
          console.error('Login error:', error.response?.data || error.message);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (data: SignupData) => {
        set({ isLoading: true });
        try {
          const endpoint = data.role === 'vendor' 
            ? '/auth/register/vendor' 
            : '/auth/register/user';
          
          const response = await api.post(endpoint, data);
          const { user, accessToken } = response.data.data;
          
          // Store token in localStorage
          localStorage.setItem('accessToken', accessToken);
          
          set({ user, isAuthenticated: true });
          return true;
        } catch (error: any) {
          console.error('Signup error:', error.response?.data || error.message);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('accessToken');
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      fetchCurrentUser: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/auth/current-user');
          const user = response.data.data;
          set({ user, isAuthenticated: true });
        } catch (error) {
          console.error('Fetch user error:', error);
          localStorage.removeItem('accessToken');
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },

      hasRole: (role: 'ADMIN' | 'VENDOR' | 'CUSTOMER') => {
        const { user } = get();
        if (!user) return false;
        return user.roles.some((userRole) => userRole.role.name === role);
      },

      getUserRole: () => {
        const { user } = get();
        if (!user || !user.roles || user.roles.length === 0) return null;
        // Priority: ADMIN > VENDOR > CUSTOMER
        if (user.roles.some((r) => r.role.name === 'ADMIN')) return 'ADMIN';
        if (user.roles.some((r) => r.role.name === 'VENDOR')) return 'VENDOR';
        if (user.roles.some((r) => r.role.name === 'CUSTOMER')) return 'CUSTOMER';
        return null;
      },

      getDashboardPath: () => {
        const { getUserRole } = get();
        const role = getUserRole();
        switch (role) {
          case 'ADMIN':
            return '/admin';
          case 'VENDOR':
            return '/vendor';
          case 'CUSTOMER':
          default:
            return '/';
        }
      },
    }),
    {
      name: 'rental-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
