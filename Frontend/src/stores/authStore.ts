import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types/rental';
import { mockUsers } from '@/data/mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'vendor';
  companyName?: string;
  gstNo?: string;
  productCategory?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (email: string, _password: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const user = mockUsers.find((u) => u.email === email);
        if (user) {
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      
      signup: async (data: SignupData) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const newUser: User = {
          id: `user-${Date.now()}`,
          email: data.email,
          name: data.name,
          companyName: data.companyName || '',
          gstin: data.gstNo || '',
          role: data.role as UserRole,
          createdAt: new Date().toISOString(),
        };
        
        set({ user: newUser, isAuthenticated: true });
        return true;
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'rental-auth',
    }
  )
);
