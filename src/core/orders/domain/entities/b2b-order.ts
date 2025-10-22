import { Order } from "./Order";


// Interfaces para pedidos B2B - utilizadas en el sistema de pedidos B2B
export interface B2BOrderItem {
  id?: string;
  b2b_order_id?: string;
  product_sku: string;
  product_name: string;
  product_description?: string;
  product_image?: string;
  product_brand?: string;
  unit_price: number;
  retail_price?: number;
  quantity: number;
  total_price: number;
  discount_percentage?: number;
  discount_amount?: number;
  tax_rate?: number;
  tax_amount?: number;
  quantity_shipped?: number;
  expected_delivery_date?: string;
  item_notes?: string;
  inventory_reserved_qty?: number;
  created_at?: string;
  updated_at?: string;
}

export interface B2BOrder {
  id?: string;
  order_number: string;
  store_id: number;
  // Información del cliente/tienda
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_document?: string;
  // Información de entrega
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_postal_code?: string;
  delivery_contact_name?: string;
  delivery_contact_phone?: string;
  delivery_notes?: string;
  // Estados del pedido
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'partial' | 'refunded';
  // Información de pago
  payment_method?: string;
  payment_terms?: string;
  credit_limit_used?: number;
  purchase_order_number?: string;
  // Montos
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  discount_percentage?: number;
  shipping_cost: number;
  total_amount: number;
  currency: string;
  // Información adicional
  priority_level: 1 | 2 | 3; // 1=normal, 2=high, 3=urgent
  internal_notes?: string;
  store_notes?: string;
  inventory_reserved: boolean;
  // Timestamps
  created_at?: string;
  updated_at?: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  // Relaciones
  items?: B2BOrderItem[];
}

export interface CreateB2BOrderRequest {
  store_id: number;
  // Información del cliente/tienda
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_document?: string;
  // Información de entrega
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_postal_code?: string;
  delivery_contact_name?: string;
  delivery_contact_phone?: string;
  delivery_notes?: string;
  // Información de pago
  payment_method?: string;
  payment_terms?: string;
  purchase_order_number?: string;
  priority_level?: 1 | 2 | 3;
  internal_notes?: string;
  store_notes?: string;
  items: Omit<B2BOrderItem, 'id' | 'b2b_order_id' | 'created_at' | 'updated_at'>[];
}

export interface UpdateB2BOrderRequest {
  id: string;
  order_status?: B2BOrder['order_status'];
  payment_status?: B2BOrder['payment_status'];
  delivery_address?: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_postal_code?: string;
  delivery_contact_name?: string;
  delivery_contact_phone?: string;
  delivery_notes?: string;
  payment_method?: string;
  payment_terms?: string;
  purchase_order_number?: string;
  priority_level?: 1 | 2 | 3;
  internal_notes?: string;
  store_notes?: string;
  items?: Partial<B2BOrderItem>[];
}

export interface CartItem {
  product_sku: string;
  product_name: string;
  product_description?: string;
  product_image?: string;
  product_brand?: string;
  unit_price: number;
  retail_price?: number;
  quantity: number;
  total_price: number;
  discount_percentage?: number;
  discount_amount?: number;
  tax_rate?: number;
  tax_amount?: number;
  item_notes?: string;
}



export interface EmailNotificationPayload {
  orderData: Order;
  ownerEmail: string;
}

export interface B2BEmailOrderData {
  order_number: string;
  created_at: string;
  order_status: string;
  payment_status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_document: string;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  currency: string;
  notes: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_postal_code: string;
  delivery_contact_name: string;
  delivery_contact_phone: string;
  delivery_notes: string;
  payment_terms: string;
  purchase_order_number: string;
  priority_level: string;
  internal_notes: string;
  store_notes: string;
  items: Array<{
      product_sku: string;
      product_name: string;
      product_description: string;
      product_image: string;
      product_brand: string;
      unit_price: number;
      retail_price: number;
      quantity: number;
      total_price: number;
      discount_percentage: number;
      discount_amount: number;
      tax_rate: number;
      tax_amount: number;
      item_notes: string;
  }>;
}

export interface B2BEmailNotificationPayload {
  orderData: B2BEmailOrderData;
  ownerEmail: string;
}