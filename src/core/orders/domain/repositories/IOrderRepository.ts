import { Order, OrderFilters } from '../entities/Order';
import { PaginatedResponse, PaginationParams } from '@/shared/types/common.types';

/**
 * Order Repository Interface
 */
export interface IOrderRepository {
  findAll(params: PaginationParams, filters?: OrderFilters): Promise<PaginatedResponse<Order>>;
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  update(id: string, order: Partial<Order>): Promise<Order>;
  updateStatus(id: string, status: string): Promise<Order>;
  cancel(id: string, reason: string): Promise<Order>;
  getRecentOrders(limit: number): Promise<Order[]>;
}
