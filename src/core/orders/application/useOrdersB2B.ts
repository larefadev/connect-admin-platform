import { useState, useEffect, useCallback } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import supabase from '@/lib/Supabase';
import emailNotificationService from '@/shared/application/services/emailNotification.service';



import { 
  B2BOrder, 
  B2BOrderItem, 
  CreateB2BOrderRequest, 
  UpdateB2BOrderRequest,
  CartItem
} from '@/core/orders/domain/entities/b2b-order';

// Función para transformar los datos del pedido B2B al formato esperado por el endpoint de email
const transformB2BOrderForEmail = (order: B2BOrder, storeProfile?: any, userEmail?: string) => {
  // Mapear priority_level de número a string
  const priorityLevelMap = {
    1: 'normal',
    2: 'high', 
    3: 'urgent'
  };

  return {
    order_number: order.order_number,
    created_at: order.created_at || new Date().toISOString(),
    order_status: order.order_status,
    payment_status: order.payment_status,
    customer_name: storeProfile?.name || 'Tienda B2B',
    customer_email: userEmail || 'dev@larefa.com', // Email del usuario autenticado
    customer_phone: storeProfile?.phone || '',
    customer_document: '', // Campo no disponible en la tabla
    subtotal: order.subtotal,
    tax_amount: order.tax_amount,
    shipping_cost: order.shipping_cost,
    discount_amount: order.discount_amount,
    total_amount: order.total_amount,
    payment_method: order.payment_method || '',
    currency: order.currency || 'MXN',
    notes: order.store_notes || order.internal_notes || '',
    
    // Campos específicos B2B
    delivery_address: order.delivery_address,
    delivery_city: order.delivery_city,
    delivery_state: order.delivery_state,
    delivery_postal_code: order.delivery_postal_code || '',
    delivery_contact_name: order.delivery_contact_name || '',
    delivery_contact_phone: order.delivery_contact_phone || '',
    delivery_notes: order.delivery_notes || '',
    payment_terms: order.payment_terms || 'immediate',
    purchase_order_number: order.purchase_order_number || '',
    priority_level: priorityLevelMap[order.priority_level] || 'normal',
    internal_notes: order.internal_notes || '',
    store_notes: order.store_notes || '',
    
    // Items del pedido
    items: (order.items || []).map(item => ({
      product_sku: item.product_sku,
      product_name: item.product_name,
      product_description: item.product_description || '',
      product_image: item.product_image || '',
      product_brand: item.product_brand || '',
      unit_price: item.unit_price,
      retail_price: item.retail_price || item.unit_price,
      quantity: item.quantity,
      total_price: item.total_price,
      discount_percentage: item.discount_percentage || 0,
      discount_amount: item.discount_amount || 0,
      tax_rate: item.tax_rate || 0,
      tax_amount: item.tax_amount || 0,
      item_notes: item.item_notes || ''
    }))
  } as const;
};

// Store de Zustand para el carrito B2B con persistencia (solo para páginas que lo necesiten)
interface B2BCartStore {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateCartItemQuantity: (productSku: string, quantity: number) => void;
  removeFromCart: (productSku: string) => void;
  clearCart: () => void;
}

const useB2BCartStore = create<B2BCartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (item: CartItem) => {
        set((state) => {
          const existingItem = state.cart.find(cartItem => cartItem.product_sku === item.product_sku);
          if (existingItem) {
            return {
              cart: state.cart.map(cartItem =>
                cartItem.product_sku === item.product_sku
                  ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                  : cartItem
              )
            };
          }
          return { cart: [...state.cart, item] };
        });
      },
      updateCartItemQuantity: (productSku: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(productSku);
          return;
        }
        set((state) => ({
          cart: state.cart.map(item =>
            item.product_sku === productSku
              ? { ...item, quantity, total_price: quantity * item.unit_price - (item.discount_amount || 0) }
              : item
          )
        }));
      },
      removeFromCart: (productSku: string) => {
        set((state) => ({
          cart: state.cart.filter(item => item.product_sku !== productSku)
        }));
      },
      clearCart: () => {
        set({ cart: [] });
      }
    }),
    {
      name: 'b2b-cart-storage',
    }
  )
);

export const useB2BOrders = (storeId: number | undefined, ownerEmail?: string, storeProfile?: any, userEmail?: string, includeCart: boolean = false) => {
  const [orders, setOrders] = useState<B2BOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Usar el store de Zustand para el carrito solo si se necesita
  const cartStore = includeCart ? useB2BCartStore() : null;

  // Obtener todos los pedidos B2B de la tienda
  const fetchOrders = useCallback(async () => {
    if (!storeId) return;
    
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('b2b_orders_test')
        .select(`
          *,
          items:b2b_order_items_test(*)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setOrders(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener pedidos');
    } finally {
      setLoading(false);
    }
  }, [storeId]);


  // Obtener todos los pedidos
  const fecthAllOrders = useCallback(async () => {
    try{
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('b2b_orders_test')
        .select(`
          *,
          items:b2b_order_items_test(*)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setOrders(data || []);
    }catch(error){
      setError(error instanceof Error ? error.message : 'Error al obtener pedidos');
    }
  },[])

  // Obtener un pedido por ID
  const fetchOrderById = useCallback(async (id: string): Promise<B2BOrder | null> => {
    if (!storeId) return null;
    
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('b2b_orders_test')
        .select(`
          *,
          items:b2b_order_items_test(*)
        `)
        .eq('id', id)
        .eq('store_id', storeId)
        .single();

      if (fetchError) throw fetchError;

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener el pedido');
      return null;
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  // Crear un nuevo pedido B2B
  const createOrder = useCallback(async (orderData: CreateB2BOrderRequest): Promise<B2BOrder | null> => {
    if (!storeId) return null;
    
    try {
      setLoading(true);
      setError(null);

      // Generar número de pedido único
      const orderNumber = `B2B-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Calcular totales
      const subtotal = orderData.items.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price) - (item.discount_amount || 0), 0
      );
      const taxAmount = orderData.items.reduce((sum, item) => 
        sum + (item.tax_amount || 0), 0
      );
      const discountAmount = orderData.items.reduce((sum, item) => 
        sum + (item.discount_amount || 0), 0
      );
      const shippingCost = 0; // Por defecto
      const totalAmount = subtotal + taxAmount + shippingCost - discountAmount;

      // Crear el pedido
      const { data: orderResult, error: orderError } = await supabase
        .from('b2b_orders_test')
        .insert([{
          order_number: orderNumber,
          store_id: storeId,
          // Información de entrega
          delivery_address: orderData.delivery_address,
          delivery_city: orderData.delivery_city,
          delivery_state: orderData.delivery_state,
          delivery_postal_code: orderData.delivery_postal_code,
          delivery_contact_name: orderData.delivery_contact_name,
          delivery_contact_phone: orderData.delivery_contact_phone,
          delivery_notes: orderData.delivery_notes,
          // Estados del pedido
          order_status: 'pending',
          payment_status: 'pending',
          // Información de pago
          payment_method: orderData.payment_method,
          payment_terms: orderData.payment_terms || 'immediate',
          purchase_order_number: orderData.purchase_order_number,
          // Montos
          subtotal,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          shipping_cost: shippingCost,
          total_amount: totalAmount,
          currency: 'MXN',
          // Información adicional
          priority_level: orderData.priority_level || 1,
          internal_notes: orderData.internal_notes,
          store_notes: orderData.store_notes,
          inventory_reserved: false
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Crear los items del pedido
      const itemsWithOrderId = orderData.items.map((item) => ({
        ...item,
        b2b_order_id: orderResult.id,
        total_price: (item.quantity * item.unit_price) - (item.discount_amount || 0),
        inventory_reserved_qty: 0
      }));

      const { error: itemsError } = await supabase
        .from('b2b_order_items_test')
        .insert(itemsWithOrderId);

      if (itemsError) throw itemsError;
      const newOrder = await fetchOrderById(orderResult.id);

      if (newOrder && ownerEmail) {
        try {
          const transformedOrderData = transformB2BOrderForEmail(newOrder, storeProfile, userEmail);

          
          await emailNotificationService.sendB2BEmailNotification(transformedOrderData, 'dev@larefa.com');
        } catch (emailError) {
          console.error('Error al enviar notificación B2B por email:', emailError);
          // No lanzamos el error para no interrumpir el flujo del pedido
        }
      }
      
      // Actualizar el estado local
      if (newOrder) {
        setOrders(prev => [newOrder, ...prev]);
        // Limpiar el carrito después de crear el pedido (si está disponible)
        if (cartStore?.clearCart) {
          cartStore.clearCart();
        }
      }

      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el pedido');
      return null;
    } finally {
      setLoading(false);
    }
  }, [storeId, fetchOrderById]);

  // Actualizar un pedido
  const updateOrder = useCallback(async (id: string, updates: UpdateB2BOrderRequest): Promise<B2BOrder | null> => {
    if (!storeId) return null;
    
    try {
      setLoading(true);
      setError(null);

      // Verificar que el pedido pertenezca a la tienda actual
      const existingOrder = await fetchOrderById(id);
      if (!existingOrder) {
        throw new Error('Pedido no encontrado o no pertenece a esta tienda');
      }

      // Actualizar items si se proporcionan
      if (updates.items) {
        // Eliminar items existentes
        const { error: deleteError } = await supabase
          .from('b2b_order_items_test')
          .delete()
          .eq('b2b_order_id', id);

        if (deleteError) throw deleteError;

        // Insertar nuevos items
        const itemsWithOrderId = updates.items.map((item, index) => ({
          ...item,
          b2b_order_id: id,
          total_price: (item.quantity || 0) * (item.unit_price || 0) - (item.discount_amount || 0),
          inventory_reserved_qty: 0
        }));

        const { error: itemsError } = await supabase
          .from('b2b_order_items_test')
          .insert(itemsWithOrderId);

        if (itemsError) throw itemsError;
      }

      const updateData: Partial<B2BOrder> = {};
      if (updates.order_status) updateData.order_status = updates.order_status;
      if (updates.payment_status) updateData.payment_status = updates.payment_status;
      if (updates.delivery_address) updateData.delivery_address = updates.delivery_address;
      if (updates.delivery_city) updateData.delivery_city = updates.delivery_city;
      if (updates.delivery_state) updateData.delivery_state = updates.delivery_state;
      if (updates.delivery_postal_code !== undefined) updateData.delivery_postal_code = updates.delivery_postal_code;
      if (updates.delivery_contact_name !== undefined) updateData.delivery_contact_name = updates.delivery_contact_name;
      if (updates.delivery_contact_phone !== undefined) updateData.delivery_contact_phone = updates.delivery_contact_phone;
      if (updates.delivery_notes !== undefined) updateData.delivery_notes = updates.delivery_notes;
      if (updates.payment_method !== undefined) updateData.payment_method = updates.payment_method;
      if (updates.payment_terms !== undefined) updateData.payment_terms = updates.payment_terms;
      if (updates.purchase_order_number !== undefined) updateData.purchase_order_number = updates.purchase_order_number;
      if (updates.priority_level) updateData.priority_level = updates.priority_level;
      if (updates.internal_notes !== undefined) updateData.internal_notes = updates.internal_notes;
      if (updates.store_notes !== undefined) updateData.store_notes = updates.store_notes;

      if (Object.keys(updateData).length > 0) {
        const { error: orderError } = await supabase
          .from('b2b_orders_test')
          .update(updateData)
          .eq('id', id);

        if (orderError) throw orderError;
      }

      // Obtener el pedido actualizado
      const updatedOrder = await fetchOrderById(id);
      
      // Actualizar el estado local
      if (updatedOrder) {
        setOrders(prev => prev.map(order => 
          order.id === id ? updatedOrder : order
        ));
      }

      return updatedOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el pedido');
      return null;
    } finally {
      setLoading(false);
    }
  }, [storeId, fetchOrderById]);

  // Eliminar un pedido
  const deleteOrder = useCallback(async (id: string): Promise<boolean> => {
    if (!storeId) return false;
    
    try {
      setLoading(true);
      setError(null);

      // Verificar que el pedido pertenezca a la tienda actual
      const existingOrder = await fetchOrderById(id);
      if (!existingOrder) {
        throw new Error('Pedido no encontrado o no pertenece a esta tienda');
      }

      const { error } = await supabase
        .from('b2b_orders_test')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Actualizar el estado local
      setOrders(prev => prev.filter(order => order.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el pedido');
      return false;
    } finally {
      setLoading(false);
    }
  }, [storeId, fetchOrderById]);

  // Cambiar estado de un pedido
  const updateOrderStatus = useCallback(async (id: string, status: B2BOrder['order_status']): Promise<boolean> => {
    if (!storeId) return false;
    
    try {
      setLoading(true);
      setError(null);

      // Verificar que el pedido pertenezca a la tienda actual
      const existingOrder = await fetchOrderById(id);
      if (!existingOrder) {
        throw new Error('Pedido no encontrado o no pertenece a esta tienda');
      }

      const updateData: any = { order_status: status };
      
      // Actualizar timestamps según el estado
      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      } else if (status === 'shipped') {
        updateData.shipped_at = new Date().toISOString();
      } else if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('b2b_orders_test')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Actualizar el estado local
      setOrders(prev => prev.map(order => 
        order.id === id ? { ...order, ...updateData } : order
      ));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el estado');
      return false;
    } finally {
      setLoading(false);
    }
  }, [storeId, fetchOrderById]);

  // Buscar pedidos
  const searchOrders = useCallback(async (searchTerm: string) => {
    if (!storeId) return;
    
    try {
      setLoading(true);
      setError(null);

      const { data, error: searchError } = await supabase
        .from('b2b_orders_test')
        .select(`
          *,
          items:b2b_order_items_test(*)
        `)
        .eq('store_id', storeId)
        .or(`order_number.ilike.%${searchTerm}%,delivery_contact_name.ilike.%${searchTerm}%,purchase_order_number.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (searchError) throw searchError;

      setOrders(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  // Funciones del carrito - usar las del store de Zustand solo si está disponible
  const addToCart = cartStore?.addToCart || (() => {});
  const updateCartItemQuantity = cartStore?.updateCartItemQuantity || (() => {});
  const removeFromCart = cartStore?.removeFromCart || (() => {});
  const clearCart = cartStore?.clearCart || (() => {});

  // Calcular totales del carrito
  const cartTotals = useCallback(() => {
    const cart = cartStore?.cart || [];
    const subtotal = cart.reduce((sum: number, item: CartItem) => sum + item.total_price, 0);
    const taxAmount = cart.reduce((sum: number, item: CartItem) => sum + (item.tax_amount || 0), 0);
    const discountAmount = cart.reduce((sum: number, item: CartItem) => sum + (item.discount_amount || 0), 0);
    const shippingCost = 0; // Por defecto
    const total = subtotal + taxAmount + shippingCost - discountAmount;
    const totalItems = cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

    return {
      subtotal,
      taxAmount,
      discountAmount,
      shippingCost,
      total,
      totalItems,
      totalAmount: total
    };
  }, [cartStore?.cart]);

  // Cargar pedidos al montar el componente
  useEffect(() => {
    if (storeId) {
      fetchOrders();
    }
  }, [storeId, fetchOrders]);

  return {
    orders,
    cart: cartStore?.cart || [],
    loading,
    error,
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    searchOrders,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    cartTotals,
    clearError: () => setError(null),
    fecthAllOrders
  };
};
