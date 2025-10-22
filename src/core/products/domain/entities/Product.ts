import { BaseEntity } from '@/shared/domain/types/common.types';

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

export interface Product extends BaseEntity {
  name: string;
  description: string;
  sku: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold: number;
  status: ProductStatus;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  images: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  tags?: string[];
  isVirtual: boolean;
  isFeatured: boolean;
}

export interface Brand extends BaseEntity {
  name: string;
  logo?: string;
  description?: string;
  website?: string;
  status: 'active' | 'inactive';
}

export interface Category extends BaseEntity {
  name: string;
  slug: string;
  parentId?: string;
  description?: string;
  image?: string;
  order: number;
}

export interface ProductFilters {
  status?: ProductStatus;
  brandId?: string;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}
