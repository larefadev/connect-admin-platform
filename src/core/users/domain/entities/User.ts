import { BaseEntity } from '@/shared/types/common.types';

export enum UserRole {
  ADMIN = 'admin',
  RESELLER = 'reseller',
  CUSTOMER = 'customer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  avatar?: string;
  lastLogin?: string;
}

export interface Reseller extends User {
  role: UserRole.RESELLER;
  businessName: string;
  taxId?: string;
  address?: string;
  city?: string;
  country?: string;
  totalSales: number;
  commission: number;
  approvedAt?: string;
  approvedBy?: string;
}

export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}
