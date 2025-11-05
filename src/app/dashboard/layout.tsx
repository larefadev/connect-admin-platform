'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { container } from '@/shared/infrastructure/di/container';
import { ToastProvider, useToast } from '@/shared/contexts/ToastContext';
import { ToastContainer } from '@/shared/components/ui/Toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

/**
 * Protected Dashboard Layout
 * All routes under /dashboard require authentication
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, admin, login, logout, setLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setIsChecking(true);
      setLoading(true);

      try {
        // Check authentication status using use case
        const result = await container.checkAuthStatusUseCase.execute();

        if (!result.isAuthenticated || !result.admin) {
          // Not authenticated - redirect to login
          console.log('🔒 No autenticado - redirigiendo a login');
          logout();
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
          setIsAuthorized(false);
          return;
        }

        // Check if admin is approved
        if (!result.admin.adminStatus) {
          console.log('⚠️ Admin no aprobado');
          logout();
          router.push('/login');
          setIsAuthorized(false);
          return;
        }

        // Update store with admin data
        if (!admin || admin.id !== result.admin.authId) {
          console.log('✅ Actualizando datos de admin en store');
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

        setIsAuthorized(true);
      } catch (error) {
        console.error('❌ Error verificando autenticación:', error);
        logout();
        router.push('/login');
        setIsAuthorized(false);
      } finally {
        setIsChecking(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router, login, logout, setLoading, admin]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-red-600 rounded-lg flex items-center justify-center mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authorized
  if (!isAuthorized) {
    return null;
  }

  // Render children if authenticated and authorized
  return (
    <ToastProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ToastProvider>
  );
}
