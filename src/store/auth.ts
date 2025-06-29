import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthService, User } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (updates: { name?: string; avatar_url?: string }) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      isAuthenticated: false,
      isAdmin: false,

      signIn: async (email: string, password: string) => {
        set({ loading: true });
        
        const { user, error } = await AuthService.signIn(email, password);
        
        if (error) {
          set({ loading: false });
          return { success: false, error };
        }

        const isAdmin = AuthService.isAdmin(user);
        
        set({
          user: user ? {
            id: user.id,
            email: user.email!,
            role: isAdmin ? 'admin' : 'user',
            created_at: user.created_at
          } : null,
          isAuthenticated: !!user,
          isAdmin,
          loading: false
        });

        return { success: true };
      },

      signUp: async (email: string, password: string, name?: string) => {
        set({ loading: true });
        
        const { user, error } = await AuthService.signUp(email, password, { name });
        
        if (error) {
          set({ loading: false });
          return { success: false, error };
        }

        // Note: User will need to verify email before being fully authenticated
        set({ loading: false });
        return { success: true };
      },

      signOut: async () => {
        set({ loading: true });
        await AuthService.signOut();
        set({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          loading: false
        });
      },

      checkAuth: async () => {
        set({ loading: true });
        
        const user = await AuthService.getCurrentUser();
        const isAdmin = user ? AuthService.isAdmin(user) : false;
        
        set({
          user: user ? {
            id: user.id,
            email: user.email!,
            role: isAdmin ? 'admin' : 'user',
            created_at: user.created_at
          } : null,
          isAuthenticated: !!user,
          isAdmin,
          loading: false
        });
      },

      updateProfile: async (updates) => {
        const { user, error } = await AuthService.updateProfile(updates);
        
        if (error) {
          return { success: false, error };
        }

        if (user) {
          const currentUser = get().user;
          if (currentUser) {
            set({
              user: {
                ...currentUser,
                ...updates
              }
            });
          }
        }

        return { success: true };
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin
      })
    }
  )
);

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  const store = useAuthStore.getState();
  
  if (event === 'SIGNED_IN' && session?.user) {
    const isAdmin = AuthService.isAdmin(session.user);
    store.checkAuth();
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      loading: false
    });
  }
});