import { IAdminRepository } from '../../domain/repositories/IAdminRepository';
import { AdminEntity } from '../../domain/entities/Admin';
import supabase from '@/lib/Supabase';

/**
 * Check Auth Status Use Case
 * Verifies current authentication status and admin data
 */
export class CheckAuthStatusUseCase {
  constructor(private adminRepository: IAdminRepository) {}

  async execute(): Promise<{
    isAuthenticated: boolean;
    admin?: AdminEntity;
    message?: string;
  }> {
    try {
      // 1. Obtener sesión actual de Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        return {
          isAuthenticated: false,
          message: 'No hay sesión activa',
        };
      }

      const user = sessionData.session.user;

      // 2. Verificar que el usuario exista en la tabla admins
      const admin = await this.adminRepository.findByAuthId(user.id);

      if (!admin) {
        // Usuario autenticado pero no es admin - cerrar sesión
        await supabase.auth.signOut();
        return {
          isAuthenticated: false,
          message: 'Usuario no autorizado',
        };
      }

      // 3. Verificar que la cuenta esté activa
      if (!admin.status) {
        return {
          isAuthenticated: false,
          admin,
          message: 'Cuenta inactiva o pendiente de aprobación',
        };
      }

      // 4. Todo OK - usuario autenticado y autorizado
      return {
        isAuthenticated: true,
        admin,
      };
    } catch (error) {
      return {
        isAuthenticated: false,
        message: error instanceof Error ? error.message : 'Error al verificar autenticación',
      };
    }
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.refreshSession();
      return !error;
    } catch {
      return false;
    }
  }
}
