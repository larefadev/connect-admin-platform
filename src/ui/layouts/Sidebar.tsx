'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/ui/features/auth/AuthContext';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  Settings,
  HelpCircle,
  Store,
  FileText,
  BarChart3,
  ChevronRight,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronLeft,
  User,
  Search
} from 'lucide-react';
import clsx from 'clsx';

interface MenuItemType {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  children?: { name: string; href: string }[];
}

const mainMenuItems: MenuItemType[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Panel de Control', href: '/dashboard' },
  { id: 'users', icon: Users, label: 'Gestión de Usuarios', href: '/users/resellers', children: [
    { name: 'Revendedores', href: '/users/resellers' },
    { name: 'Solicitudes Pendientes', href: '/users/pending' },
  ]},
  { id: 'products', icon: Package, label: 'Catálogo', href: '/products/listing', children: [
    { name: 'Productos', href: '/products/listing' },
    { name: 'Proveedores', href: '/products/brands' },
  ]},
  { id: 'orders', icon: ShoppingCart, label: 'Pedidos', href: '/orders' },
  { id: 'stores', icon: Store, label: 'Gestión de Tiendas', href: '/stores' },
];

const businessMenuItems: MenuItemType[] = [
  { id: 'payment', icon: CreditCard, label: 'Pagos', href: '/payment/transactions', children: [
    { name: 'Historial de Transacciones', href: '/payment/transactions' },
    { name: 'Solicitudes de Retiro', href: '/payment/withdrawals' },
  ]},
  { id: 'invoices', icon: FileText, label: 'Facturas', href: '/invoices' },
  { id: 'api', icon: BarChart3, label: 'Integración API', href: '/api' },
];

const supportMenuItems: MenuItemType[] = [
  { id: 'support', icon: HelpCircle, label: 'Soporte y Tickets', href: '/support' },
  { id: 'settings', icon: Settings, label: 'Configuración', href: '/settings' },
];

interface SidebarProps {
  children?: ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { logout } = useAuth();
  const { admin } = useAuthStore();

  const toggleExpanded = (itemId: string) => {
    if (isCollapsed) return;
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getPageTitle = () => {
    const allItems = [...mainMenuItems, ...businessMenuItems, ...supportMenuItems];
    const currentItem = allItems.find(item =>
      pathname === item.href ||
      (item.children && item.children.some(child => pathname === child.href))
    );
    return currentItem ? currentItem.label : 'Panel de Control';
  };

  const handleMenuClick = (item: MenuItemType) => {
    if (item.children) {
      toggleExpanded(item.id);
    } else {
      router.push(item.href);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const MenuItem = ({ item, isActive, onClick, isCollapsed }: {
    item: MenuItemType,
    isActive: boolean | undefined,
    onClick: () => void,
    isCollapsed: boolean
  }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between rounded-lg transition-all duration-200 ${
        isCollapsed 
          ? 'w-10 h-10 p-0 justify-center items-center' 
          : 'px-4 py-3'
      } ${
        isActive
          ? 'bg-red-600 text-white shadow-md'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
      title={isCollapsed ? item.label : ''}
    >
      <div className={`flex items-center transition-all duration-300 ${isCollapsed ? '' : 'space-x-3'}`}>
        <item.icon className={`flex-shrink-0 transition-all duration-300 ${
          isCollapsed ? 'w-5 h-5' : 'w-5 h-5'
        }`} />
        <span className={`font-medium transition-all duration-300 overflow-hidden ${
          isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
        }`}>
          {item.label}
        </span>
      </div>
      {item.children && !isCollapsed && (
        <ChevronRight className={`h-4 w-4 transition-transform ${
          expandedItems.includes(item.id) ? 'rotate-90' : ''
        }`} />
      )}
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black z-40 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <div className={`
        bg-white shadow-sm border-r transition-all duration-300 z-50 flex flex-col h-screen
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isMobileMenuOpen 
          ? 'fixed inset-y-0 left-0 transform translate-x-0' 
          : 'fixed inset-y-0 left-0 transform -translate-x-full lg:translate-x-0 lg:relative lg:block'
        }
      `}>
        {/* Close button for mobile */}
        <div className="absolute top-4 right-4 lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-lg"
            title="Cerrar menú"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Logo */}
        <div className={`flex items-center h-16 border-b border-gray-200 transition-all duration-300 flex-shrink-0 ${
          isCollapsed ? 'justify-center px-4' : 'px-6'
        }`}>
          <div className="flex items-center">
            <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            {!isCollapsed && (
              <div className="ml-2">
                <span className="text-xl font-semibold text-gray-900">Connect</span>
                <p className="text-xs text-gray-500">Panel de Administración</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className={`flex-1 overflow-y-scroll sidebar-scroll ${
          isCollapsed ? 'px-2 py-4' : 'px-4 py-6'
        }`} style={{ maxHeight: 'calc(100vh - 4rem)' }}>
          {/* Main Menu */}
          <div className="mb-6">
            <h3 className={`text-xs font-semibold text-gray-500 uppercase mb-3 transition-all duration-300 ${
              isCollapsed ? 'opacity-0 h-0 mb-0 overflow-hidden' : 'opacity-100 h-auto mb-3'
            }`}>
              PRINCIPAL
            </h3>
            <nav className={`transition-all duration-300 ${isCollapsed ? 'space-y-2 flex flex-col items-center' : 'space-y-2'}`}>
              {mainMenuItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.children && item.children.some(child => pathname === child.href));
                const isExpanded = expandedItems.includes(item.id);

                return (
                  <div key={item.id} className="w-full">
                    <MenuItem
                      item={item}
                      isActive={isActive}
                      onClick={() => handleMenuClick(item)}
                      isCollapsed={isCollapsed}
                    />
                    {item.children && isExpanded && !isCollapsed && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={clsx(
                              'block px-3 py-2 text-sm rounded-lg transition-colors',
                              pathname === child.href
                                ? 'bg-red-50 text-red-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            )}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Business Menu */}
          <div className="mb-6">
            <h3 className={`text-xs font-semibold text-gray-500 uppercase mb-3 transition-all duration-300 ${
              isCollapsed ? 'opacity-0 h-0 mb-0 overflow-hidden' : 'opacity-100 h-auto mb-3'
            }`}>
              NEGOCIO
            </h3>
            <nav className={`transition-all duration-300 ${isCollapsed ? 'space-y-2 flex flex-col items-center' : 'space-y-2'}`}>
              {businessMenuItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.children && item.children.some(child => pathname === child.href));
                const isExpanded = expandedItems.includes(item.id);

                return (
                  <div key={item.id} className="w-full">
                    <MenuItem
                      item={item}
                      isActive={isActive}
                      onClick={() => handleMenuClick(item)}
                      isCollapsed={isCollapsed}
                    />
                    {item.children && isExpanded && !isCollapsed && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={clsx(
                              'block px-3 py-2 text-sm rounded-lg transition-colors',
                              pathname === child.href
                                ? 'bg-red-50 text-red-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            )}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Support Menu */}
          <div>
            <h3 className={`text-xs font-semibold text-gray-500 uppercase mb-3 transition-all duration-300 ${
              isCollapsed ? 'opacity-0 h-0 mb-0 overflow-hidden' : 'opacity-100 h-auto mb-3'
            }`}>
              SOPORTE
            </h3>
            <nav className={`transition-all duration-300 ${isCollapsed ? 'space-y-2 flex flex-col items-center' : 'space-y-2'}`}>
              {supportMenuItems.map((item) => (
                <MenuItem
                  key={item.id}
                  item={item}
                  isActive={pathname === item.href}
                  onClick={() => handleMenuClick(item)}
                  isCollapsed={isCollapsed}
                />
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="bg-white border-b px-4 lg:px-6 py-4 flex-shrink-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 hover:bg-gray-100 lg:hidden rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              {isCollapsed && (
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="p-2 hover:bg-gray-100 hidden lg:block rounded-lg"
                  title="Expandir barra lateral"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              {!isCollapsed && (
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="p-2 hover:bg-gray-100 hidden lg:block rounded-lg"
                  title="Contraer barra lateral"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <h1 className="text-lg lg:text-2xl font-bold text-gray-900 truncate">
                {getPageTitle()}
              </h1>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                  {admin?.profile_image ? (
                    <Image
                      src={admin.profile_image}
                      alt={admin.username}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-gray-600" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:block">
                  {admin?.name || admin?.username || 'Administrador'}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
