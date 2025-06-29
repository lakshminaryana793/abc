import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminState {
  isAuthenticated: boolean;
  adminAddress: string | null;
  login: (address: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
}

// Admin credentials - In production, this should be in environment variables
const ADMIN_CREDENTIALS = {
  address: '0x742d35Cc6634C0532925a3b8D4C9db96590b5b8e', // Replace with actual admin wallet
  password: 'admin123' // In production, use proper authentication
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      adminAddress: null,

      login: async (address: string, password: string) => {
        // Simple authentication - in production, use proper JWT/OAuth
        if (address.toLowerCase() === ADMIN_CREDENTIALS.address.toLowerCase() && 
            password === ADMIN_CREDENTIALS.password) {
          set({ 
            isAuthenticated: true, 
            adminAddress: address 
          });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ 
          isAuthenticated: false, 
          adminAddress: null 
        });
      },

      checkAuth: () => {
        return get().isAuthenticated;
      }
    }),
    {
      name: 'admin-auth',
    }
  )
);