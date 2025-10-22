import { create } from 'zustand';

export interface OrderItem {
  product_sku: string;
  product_name: string;
  product_description?: string;
  product_image?: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface Order {
  id?: number;
  order_number: string;
  store_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_document: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_postal_code: string;
  delivery_notes: string;
  order_status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  shipping_cost: number;
  total_amount: number;
  currency: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  items: OrderItem[];
}

export interface OrderStore {
  orders: Order[];
  currentOrder: Order | null;
  
  // Acciones
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: number, updates: Partial<Order>) => void;
  setCurrentOrder: (order: Order | null) => void;
  
  // Utilidades
  generateOrderNumber: () => string;

}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  currentOrder: null,

  setOrders: (orders) => {
    set({ orders });
  },

  addOrder: (order) => {
    set((state) => ({
      orders: [...state.orders, order],
      currentOrder: order,
    }));
  },

  updateOrder: (orderId, updates) => {
    set((state) => ({
      orders: state.orders.map(order =>
        order.id === orderId
          ? { ...order, ...updates, updated_at: new Date().toISOString() }
          : order
      ),
    }));
  },

  setCurrentOrder: (order) => {
    set({ currentOrder: order });
  },

  generateOrderNumber: () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `ORD-${year}-${month}${day}-${random}`;
  },
}));
