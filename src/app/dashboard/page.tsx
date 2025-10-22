'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/ui/layouts/DashboardLayout';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
} from 'lucide-react';
import { StatCard, RecentOrdersTable, TopProductsList } from './_components';
import { useDashboardMetrics } from '@/core/dashboard';
import { useProducts } from '@/core/products';
import { useB2BOrders } from '@/core/orders/application/useOrdersB2B';
import { useCustomers } from '@/core/users';

export default function DashboardPage() {
  // Usar un storeId fijo para demo (en producción vendría del contexto de autenticación)
  const DEMO_STORE_ID = 1;
  
  // Hooks para obtener datos reales
  const { metrics, loading: metricsLoading, error: metricsError } = useDashboardMetrics(DEMO_STORE_ID);
  const { getProductStats } = useProducts();
  const { orders, loading: ordersLoading, error: ordersError } = useB2BOrders(DEMO_STORE_ID);
  // const { getCustomerStats } = useCustomers(DEMO_STORE_ID); // Para uso futuro

  // Estados locales para datos específicos del dashboard
  const [recentOrders, setRecentOrders] = useState<Array<{
    id: string;
    customer: string;
    amount: string;
    status: string;
    date: string;
  }>>([]);
  const [topProducts, setTopProducts] = useState<Array<{
    name: string;
    sales: number;
    revenue: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos adicionales
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Cargar estadísticas específicas
        const productStats = await getProductStats();

        // Procesar pedidos B2B para el dashboard
        const recentB2BOrders = orders.slice(0, 5).map(order => ({
          id: order.id || 'N/A',
          customer: order.delivery_contact_name || 'Cliente B2B',
          amount: `$${order.total_amount.toLocaleString()}`,
          status: order.order_status,
          date: order.created_at || new Date().toISOString()
        }));

        setRecentOrders(recentB2BOrders);
        setTopProducts(productStats.topProducts || []);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Cargar datos siempre, incluso si no hay órdenes
    loadDashboardData();
  }, [orders, getProductStats]);

  // Crear estadísticas para las tarjetas
  const stats = [
    {
      name: 'Total de Usuarios',
      value: metrics.totalCustomers.toLocaleString(),
      change: metrics.newCustomersThisMonth > 0 ? `+${metrics.newCustomersThisMonth}` : '0',
      changeType: 'increase' as const,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Total de Productos',
      value: metrics.totalProducts.toLocaleString(),
      change: '+8%',
      changeType: 'increase' as const,
      icon: Package,
      color: 'bg-green-500',
    },
    {
      name: 'Total de Pedidos',
      value: metrics.totalOrders.toLocaleString(),
      change: metrics.pendingOrders > 0 ? `${metrics.pendingOrders} pendientes` : 'Sin pendientes',
      changeType: metrics.pendingOrders > 0 ? 'decrease' as const : 'increase' as const,
      icon: ShoppingCart,
      color: 'bg-yellow-500',
    },
    {
      name: 'Ingresos',
      value: `$${metrics.totalRevenue.toLocaleString()}`,
      change: `Ticket promedio: $${metrics.averageTicket.toFixed(2)}`,
      changeType: 'increase' as const,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
  ];

  if (metricsLoading || ordersLoading || loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
            <p className="text-gray-600 mt-1">Cargando datos del dashboard...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (metricsError || ordersError) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
            <p className="text-red-600 mt-1">Error al cargar datos: {metricsError || ordersError}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
          <p className="text-gray-600 mt-1">Bienvenido de nuevo! Esto es lo que está pasando con tu tienda.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.name} stat={stat} />
          ))}
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentOrdersTable orders={recentOrders} />
          <TopProductsList products={topProducts} />
        </div>
      </div>
    </DashboardLayout>
  );
}
