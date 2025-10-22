import supabase from '@/lib/Supabase';

/**
 * Cancel Registration Use Case
 * Handles cancellation of the registration process and cleanup of temporary data
 */
export class CancelRegistrationUseCase {
  async execute(authId?: string | null): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      // Si hay un authId, intentar eliminar el usuario temporal de Supabase Auth
      if (authId) {
        // Primero verificar si el usuario existe en la tabla admins
        const { data: adminData } = await supabase
          .from('admins')
          .select('id')
          .eq('auth_id', authId)
          .maybeSingle();

        // Si el admin ya fue creado en la base de datos, no eliminar el usuario de auth
        if (adminData) {
          return {
            success: false,
            message: 'No se puede cancelar el registro. El proceso ya fue completado.',
          };
        }

        // Si el usuario temporal existe en auth pero no en admins, intentar eliminarlo
        // Nota: Supabase no permite eliminar usuarios desde el cliente por seguridad
        // Solo podemos cerrar la sesión si existe
        const { error: signOutError } = await supabase.auth.signOut();
        
        if (signOutError) {
          console.warn('Error al cerrar sesión durante cancelación:', signOutError.message);
        }
      }

      return {
        success: true,
        message: 'Registro cancelado exitosamente.',
      };
    } catch (error) {
      console.error('Error al cancelar registro:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error inesperado al cancelar el registro',
      };
    }
  }
}
