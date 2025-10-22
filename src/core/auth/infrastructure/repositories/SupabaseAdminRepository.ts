import { IAdminRepository } from '../../domain/repositories/IAdminRepository';
import { AdminEntity, createAdminEntity } from '../../domain/entities/Admin';
import { CreateAdminDTO, UpdateAdminDTO, EmailValidationResponse } from '@/types/admin';
import supabase from '@/lib/Supabase';

/**
 * Supabase implementation of IAdminRepository
 * Infrastructure layer - implements domain interfaces
 */
export class SupabaseAdminRepository implements IAdminRepository {
  /**
   * Find admin by email
   */
  async findByEmail(email: string): Promise<AdminEntity | null> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return createAdminEntity(data);
  }

  /**
   * Find admin by auth ID
   */
  async findByAuthId(authId: string): Promise<AdminEntity | null> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('auth_id', authId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return createAdminEntity(data);
  }

  /**
   * Find admin by username
   */
  async findByUsername(username: string): Promise<AdminEntity | null> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return createAdminEntity(data);
  }

  /**
   * Create new admin
   */
  async create(dto: CreateAdminDTO): Promise<AdminEntity> {
    const { data, error } = await supabase
      .from('admins')
      .insert({
        auth_id: dto.auth_id,
        email: dto.email,
        username: dto.username,
        name: dto.name,
        last_name: dto.last_name,
        profile_image: dto.profile_image,
        status: dto.status ?? false,
        admin_status: dto.admin_status ?? false,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error al crear administrador');
    }

    return createAdminEntity(data);
  }

  /**
   * Update admin
   */
  async update(id: number, dto: UpdateAdminDTO): Promise<AdminEntity> {
    const { data, error } = await supabase
      .from('admins')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error al actualizar administrador');
    }

    return createAdminEntity(data);
  }

  /**
   * Delete admin
   */
  async delete(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', id);

    return !error;
  }

  /**
   * Validate email availability
   * Checks both person and admins tables
   */
  async validateEmailAvailability(email: string): Promise<EmailValidationResponse> {
    // Check in person table
    const { data: personData } = await supabase
      .from('person')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    const existsInPerson = !!personData;

    // Check in admins table
    const { data: adminData } = await supabase
      .from('admins')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    const existsInAdmins = !!adminData;

    // Determine validation result
    if (existsInPerson) {
      return {
        isValid: false,
        existsInPerson: true,
        existsInAdmins: false,
        message: 'Este correo ya está registrado como usuario regular. Los administradores deben usar un correo diferente.',
      };
    }

    if (existsInAdmins) {
      return {
        isValid: false,
        existsInPerson: false,
        existsInAdmins: true,
        message: 'Este correo ya está registrado como administrador.',
      };
    }

    return {
      isValid: true,
      existsInPerson: false,
      existsInAdmins: false,
      message: 'Correo disponible',
    };
  }

  /**
   * Check if admin is active
   */
  async isAdminActiveByEmail(email: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('admins')
      .select('status')
      .eq('email', email)
      .maybeSingle();

    if (error || !data) {
      return false;
    }

    return data.status === true;
  }

  /**
   * Get all admins
   */
  async findAll(): Promise<AdminEntity[]> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(createAdminEntity);
  }
}
