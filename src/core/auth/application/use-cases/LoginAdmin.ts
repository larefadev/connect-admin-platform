import { IAdminRepository } from '../../domain/repositories/IAdminRepository';
import { AdminEntity } from '../../domain/entities/Admin';
import supabase from '@/lib/Supabase';

/**
 * Login Admin Use Case
 * Handles admin authentication with validation
 */
export class LoginAdminUseCase {
  constructor(private adminRepository: IAdminRepository) {}

  async execute(email: string, password: string): Promise<{
    success: boolean;
    admin?: AdminEntity;
    message?: string;
    requiresApproval?: boolean;
  }> {
    try {
      // 1. Validar que el email exista en la tabla admins
      const admin = await this.adminRepository.findByEmail(email);

      if (!admin) {
        return {
          success: false,
          message: 'Credenciales inválidas. Verifica tu correo.',
        };
      }

      // 2. Validar que el admin NO esté en la tabla person (seguridad adicional)
      const validation = await this.adminRepository.validateEmailAvailability(email);

      if (validation.existsInPerson) {
        return {
          success: false,
          message: 'Error de configuración de cuenta. Contacta al soporte técnico.',
        };
      }

      // 3. Validar que la cuenta esté activa (status = true)
      if (!admin.status) {
        return {
          success: false,
          requiresApproval: true,
          message: 'Tu cuenta está pendiente de aprobación. Por favor espera a que un administrador la active.',
        };
      }

      // 4. Autenticar con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        return {
          success: false,
          message: 'Credenciales inválidas. Verifica tu contraseña.',
        };
      }

      // 5. Verificar que el auth_id coincida
      if (authData.user.id !== admin.authId) {
        return {
          success: false,
          message: 'Error de autenticación. Contacta al soporte técnico.',
        };
      }

      // 6. Login exitoso
      return {
        success: true,
        admin,
        message: 'Inicio de sesión exitoso',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error inesperado al iniciar sesión',
      };
    }
  }

  /**
   * Logout helper
   */
  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }
}
