import { User, Reseller, UserFilters } from '../entities/User';
import { PaginatedResponse, PaginationParams } from '@/shared/domain/types/common.types';

/**
 * User Repository Interface
 * Defines the contract for user data access
 */
export interface IUserRepository {
  findAll(params: PaginationParams, filters?: UserFilters): Promise<PaginatedResponse<User>>;
  findById(id: string): Promise<User | null>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  findResellers(params: PaginationParams, filters?: UserFilters): Promise<PaginatedResponse<Reseller>>;
  approveReseller(id: string, approvedBy: string): Promise<Reseller>;
  suspendUser(id: string, reason: string): Promise<User>;
}
