import { IAdminRepository } from '../../domain/repositories/IAdminRepository';
import { AdminEntity, validateAdminEntity } from '../../domain/entities/Admin';
import { CreateAdminDTO } from '@/types/admin';
import supabase from '@/lib/Supabase';

/**
 * Register Admin Use Case
 * Handles admin registration with comprehensive validation
 */
export class RegisterAdminUseCase {
  constructor(private adminRepository: IAdminRepository) {}

  async execute(data: {
    email: string;
    password: string;
    username: string;
    name: string;
    lastName: string;
  }): Promise<{
    success: boolean;
    admin?: AdminEntity;
    message?: string;
    errors?: string[];
  }> {
    try {
      // 1. Validar reglas de negocio de la entidad
      const validationResult = validateAdminEntity({
        email: data.email,
        username: data.username,
        name: data.name,
        lastName: data.lastName,
      });

      if (!validationResult.isValid) {
        return {
          success: false,
          message: 'Datos inválidos',
          errors: validationResult.errors,
        };
      }

      // 2. Validar disponibilidad del email (NO en person, NO en admins)
      const emailValidation = await this.adminRepository.validateEmailAvailability(data.email);

      if (!emailValidation.isValid) {
        return {
          success: false,
          message: emailValidation.message,
        };
      }

      // 3. Validar que el username sea único
      const existingAdmin = await this.adminRepository.findByUsername(data.username);

      if (existingAdmin) {
        return {
          success: false,
          message: 'El nombre de usuario ya está en uso',
        };
      }

      // 4. Validar password (mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número)
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(data.password)) {
        return {
          success: false,
          message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número',
        };
      }

      // 5. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError || !authData.user) {
        return {
          success: false,
          message: authError?.message || 'Error al crear la cuenta de autenticación',
        };
      }

      // 6. Crear admin en la base de datos
      const adminDTO: CreateAdminDTO = {
        auth_id: authData.user.id,
        email: data.email,
        username: data.username,
        name: data.name,
        last_name: data.lastName,
        status: false, // Requiere aprobación
        admin_status: false, // No es super admin por defecto
      };

      const admin = await this.adminRepository.create(adminDTO);

      return {
        success: true,
        admin,
        message: 'Registro exitoso. Tu cuenta está pendiente de aprobación por un administrador.',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error inesperado al registrar',
      };
    }
  }
}
