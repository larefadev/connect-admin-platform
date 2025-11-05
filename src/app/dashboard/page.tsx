'use client';

import DashboardLayout from '@/ui/layouts/DashboardLayout';
import { Package, Users, ShoppingCart, DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  // Datos de ejemplo - en producción vendrían de la API
  const stats = [
    {
      name: 'Total de Productos',
      value: '2,459',
      change: '+12.5%',
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      name: 'Usuarios Activos',
      value: '1,293',
      change: '+8.2%',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      name: 'Pedidos del Mes',
      value: '847',
      change: '+23.1%',
      icon: ShoppingCart,
      color: 'bg-purple-500',
    },
    {
      name: 'Ingresos',
      value: '$45,231',
      change: '+15.3%',
      icon: DollarSign,
      color: 'bg-orange-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Bienvenido al Panel de Administración</h1>
          <p className="text-red-100">Gestiona tu marketplace desde un solo lugar</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {stat.change}
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.name}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/products/listing"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Package className="h-5 w-5 text-gray-600 mr-3" />
                <span className="font-medium text-gray-900">Ver Productos</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-400" />
            </Link>
            <Link
              href="/dashboard/users/resellers"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-600 mr-3" />
                <span className="font-medium text-gray-900">Gestionar Usuarios</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-400" />
            </Link>
            <Link
              href="/dashboard/orders"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <ShoppingCart className="h-5 w-5 text-gray-600 mr-3" />
                <span className="font-medium text-gray-900">Ver Pedidos</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-400" />
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
          <div className="text-center py-8 text-gray-500">
            <p>No hay actividad reciente para mostrar</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
