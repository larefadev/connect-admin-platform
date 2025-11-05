import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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

        // Guardar en cookie para que el middleware pueda leerlo
        if (typeof document !== 'undefined') {
          document.cookie = `connect-admin-auth=true; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 días
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          admin: null,
          error: null,
        });

        // Eliminar cookie
        if (typeof document !== 'undefined') {
          document.cookie = 'connect-admin-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
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
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        admin: state.admin,
      }),
    }
  )
);
