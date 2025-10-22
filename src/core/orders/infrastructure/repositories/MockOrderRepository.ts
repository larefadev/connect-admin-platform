import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { Order, OrderFilters, OrderStatus, PaymentStatus } from '../../domain/entities/Order';
import { PaginatedResponse, PaginationParams } from '@/shared/domain/types/common.types';

/**
 * Mock implementation of Order Repository
 */
export class MockOrderRepository implements IOrderRepository {
  private mockOrders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-12345',
      customerId: 'c1',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      items: [
        {
          productId: '1',
          productName: 'Wireless Headphones',
          sku: 'WHP-001',
          quantity: 1,
          price: 199.99,
          subtotal: 199.99,
        },
      ],
      subtotal: 199.99,
      tax: 20.00,
      shippingCost: 10.00,
      discount: 0,
      total: 229.99,
      status: OrderStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: 'Credit Card',
      shippingAddress: {
        fullName: 'John Doe',
        phone: '+1234567890',
        addressLine1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
      },
      billingAddress: {
        fullName: 'John Doe',
        phone: '+1234567890',
        addressLine1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
      },
      trackingNumber: 'TRK123456',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-16T10:00:00Z',
      deliveredAt: '2024-01-18T10:00:00Z',
    },
    {
      id: '2',
      orderNumber: 'ORD-12346',
      customerId: 'c2',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      items: [
        {
          productId: '2',
          productName: 'Smart Watch',
          sku: 'SWX-002',
          quantity: 1,
          price: 399.99,
          subtotal: 399.99,
        },
      ],
      subtotal: 399.99,
      tax: 40.00,
      shippingCost: 15.00,
      discount: 0,
      total: 454.99,
      status: OrderStatus.PROCESSING,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: 'PayPal',
      shippingAddress: {
        fullName: 'Jane Smith',
        phone: '+0987654321',
        addressLine1: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'USA',
      },
      billingAddress: {
        fullName: 'Jane Smith',
        phone: '+0987654321',
        addressLine1: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'USA',
      },
      createdAt: '2024-01-16T10:00:00Z',
      updatedAt: '2024-01-16T10:00:00Z',
    },
  ];

  async findAll(params: PaginationParams, filters?: OrderFilters): Promise<PaginatedResponse<Order>> {
    let filtered = [...this.mockOrders];

    if (filters?.status) {
      filtered = filtered.filter(o => o.status === filters.status);
    }

    if (filters?.paymentStatus) {
      filtered = filtered.filter(o => o.paymentStatus === filters.paymentStatus);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(o =>
        o.orderNumber.toLowerCase().includes(search) ||
        o.customerName.toLowerCase().includes(search)
      );
    }

    const start = (params.page - 1) * params.limit;
    const end = start + params.limit;
    const data = filtered.slice(start, end);

    return {
      data,
      total: filtered.length,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(filtered.length / params.limit),
    };
  }

  async findById(id: string): Promise<Order | null> {
    return this.mockOrders.find(o => o.id === id) || null;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.mockOrders.find(o => o.orderNumber === orderNumber) || null;
  }

  async create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: String(this.mockOrders.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.mockOrders.push(newOrder);
    return newOrder;
  }

  async update(id: string, order: Partial<Order>): Promise<Order> {
    const index = this.mockOrders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');

    this.mockOrders[index] = {
      ...this.mockOrders[index],
      ...order,
      updatedAt: new Date().toISOString(),
    };
    return this.mockOrders[index];
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    const index = this.mockOrders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');

    this.mockOrders[index] = {
      ...this.mockOrders[index],
      status: status as OrderStatus,
      updatedAt: new Date().toISOString(),
    };

    return this.mockOrders[index];
  }

  async cancel(id: string, reason: string): Promise<Order> {
    const index = this.mockOrders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');

    this.mockOrders[index] = {
      ...this.mockOrders[index],
      status: OrderStatus.CANCELLED,
      cancelReason: reason,
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.mockOrders[index];
  }

  async getRecentOrders(limit: number): Promise<Order[]> {
    return this.mockOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}
