'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { container } from '@/shared/infrastructure/di/container';
import supabase from '@/lib/Supabase';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, admin, login, logout: logoutStore, setLoading } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // Check auth on mount and setup auth state listener
  useEffect(() => {
    const initAuth = async () => {
      try {
        const result = await container.checkAuthStatusUseCase.execute();

        if (result.isAuthenticated && result.admin) {
          login({
            id: result.admin.authId,
            email: result.admin.email,
            username: result.admin.username,
            name: result.admin.name,
            last_name: result.admin.lastName,
            profile_image: result.admin.profileImage,
            status: result.admin.status,
            admin_status: result.admin.adminStatus,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();

    // Setup Supabase auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        logoutStore();
        router.push('/login');
      } else if (event === 'SIGNED_IN' && session) {
        // Verify admin and update store
        const result = await container.checkAuthStatusUseCase.execute();
        if (result.isAuthenticated && result.admin) {
          login({
            id: result.admin.authId,
            email: result.admin.email,
            username: result.admin.username,
            name: result.admin.name,
            last_name: result.admin.lastName,
            profile_image: result.admin.profileImage,
            status: result.admin.status,
            admin_status: result.admin.adminStatus,
          });
        }
      } else if (event === 'TOKEN_REFRESHED') {
        // Token was refreshed, verify admin status
        const result = await container.checkAuthStatusUseCase.execute();
        if (!result.isAuthenticated) {
          logoutStore();
          router.push('/login');
        }
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [login, logoutStore, router]);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const result = await container.checkAuthStatusUseCase.execute();

      if (!result.isAuthenticated || !result.admin) {
        logoutStore();
        return;
      }

      if (!admin || admin.id !== result.admin.authId) {
        login({
          id: result.admin.authId,
          email: result.admin.email,
          username: result.admin.username,
          name: result.admin.name,
          last_name: result.admin.lastName,
          profile_image: result.admin.profileImage,
          status: result.admin.status,
          admin_status: result.admin.adminStatus,
        });
      }
    } catch (error) {
      console.error('Check auth error:', error);
      logoutStore();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await container.loginAdminUseCase.logout();
      logoutStore();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mt-4"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading: isInitializing,
        checkAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
