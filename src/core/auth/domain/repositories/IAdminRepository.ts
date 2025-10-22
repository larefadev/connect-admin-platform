import { AdminEntity } from '../entities/Admin';
import { CreateAdminDTO, UpdateAdminDTO, EmailValidationResponse } from '@/types/admin';

/**
 * Admin Repository Interface
 * Defines the contract for admin data access
 * Following Clean Architecture - Domain layer defines interfaces
 */
export interface IAdminRepository {
  /**
   * Find admin by email
   */
  findByEmail(email: string): Promise<AdminEntity | null>;

  /**
   * Find admin by auth ID (Supabase Auth UUID)
   */
  findByAuthId(authId: string): Promise<AdminEntity | null>;

  /**
   * Find admin by username
   */
  findByUsername(username: string): Promise<AdminEntity | null>;

  /**
   * Create a new admin
   */
  create(data: CreateAdminDTO): Promise<AdminEntity>;

  /**
   * Update admin
   */
  update(id: number, data: UpdateAdminDTO): Promise<AdminEntity>;

  /**
   * Delete admin
   */
  delete(id: number): Promise<boolean>;

  /**
   * Check if email exists in person or admins table
   * Returns validation result with detailed info
   */
  validateEmailAvailability(email: string): Promise<EmailValidationResponse>;

  /**
   * Verify that admin exists and is active
   */
  isAdminActiveByEmail(email: string): Promise<boolean>;

  /**
   * Get all admins (for future admin management)
   */
  findAll(): Promise<AdminEntity[]>;
}
