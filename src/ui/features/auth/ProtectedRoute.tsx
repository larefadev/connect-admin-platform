'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { container } from '@/shared/infrastructure/di/container';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute Component
 * Verifies authentication and authorization before rendering children
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, admin, login, logout, setLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsChecking(true);
      setLoading(true);

      try {
        // Check authentication status using use case
        const result = await container.checkAuthStatusUseCase.execute();

        if (!result.isAuthenticated || !result.admin) {
          // Not authenticated or not authorized - redirect to login
          logout();
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }

        // Update store with admin data if needed
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
        console.error('Auth check error:', error);
        logout();
        router.push('/login');
      } finally {
        setIsChecking(false);
        setLoading(false);
      }
    };

    // Only check auth if we're not already authenticated
    if (!isAuthenticated) {
      checkAuth();
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, admin, pathname, router, login, logout, setLoading]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
}
