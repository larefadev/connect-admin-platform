import { BaseEntity } from '@/shared/types/common.types';

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

export interface Product {
  SKU: string;
  name: string;
  price: number;
  image?: string;
  brand?: string;
  brand_code?: string;
  description?: string;
  category?: string;
  provider?: string;
  provider_id?: number;
  provider_sku?: string; // Campo para búsqueda por provider SKU
  totalStock?: number; // Stock total sumado de todas las sucursales
  is_visible?: boolean; // Estado de visibilidad del producto
  [key: string]: unknown;
}

export interface ProductStats {
  totalProducts: number;
  totalCategories: number;
  averagePrice: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: string;
  }>;
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


export interface ProductCategory {
  id :number,
  code : string,
  name : string,
  description : string,
  department_id : number,
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
