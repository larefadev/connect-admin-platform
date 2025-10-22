import { Product, Brand, ProductFilters } from '../entities/Product';
import { PaginatedResponse, PaginationParams } from '@/shared/domain/types/common.types';

/**
 * Product Repository Interface
 */
export interface IProductRepository {
  findAll(params: PaginationParams, filters?: ProductFilters): Promise<PaginatedResponse<Product>>;
  findById(id: string): Promise<Product | null>;
  create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  update(id: string, product: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
  updateStock(id: string, quantity: number): Promise<Product>;
  findByBrand(brandId: string, params: PaginationParams): Promise<PaginatedResponse<Product>>;
  findLowStock(threshold?: number): Promise<Product[]>;
}

export interface IBrandRepository {
  findAll(params: PaginationParams): Promise<PaginatedResponse<Brand>>;
  findById(id: string): Promise<Brand | null>;
  create(brand: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>): Promise<Brand>;
  update(id: string, brand: Partial<Brand>): Promise<Brand>;
  delete(id: string): Promise<void>;
}
