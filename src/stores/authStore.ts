import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Admin {
  id: string;
  email: string;
  username: string;
  name?: string;
  last_name?: string;
  profile_image?: string;
  status: boolean;
  admin_status: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  admin: Admin | null;
  loading: boolean;
  error: string | null;

  // Actions
  login: (admin: Admin) => void;
  logout: () => void;
  updateAdmin: (admin: Partial<Admin>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      admin: null,
      loading: false,
      error: null,

      login: (admin: Admin) => {
        set({
          isAuthenticated: true,
          admin,
          error: null,
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          admin: null,
          error: null,
        });
      },

      updateAdmin: (adminData: Partial<Admin>) => {
        const currentAdmin = get().admin;
        if (currentAdmin) {
          set({
            admin: { ...currentAdmin, ...adminData },
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      checkAuth: async () => {
        const { admin } = get();
        return !!admin && get().isAuthenticated;
      },
    }),
    {
      name: 'connect-admin-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        admin: state.admin,
      }),
    }
  )
);
