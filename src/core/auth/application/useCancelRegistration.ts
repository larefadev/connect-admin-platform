'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CancelRegistrationUseCase } from './use-cases/CancelRegistration';

/**
 * Hook para manejar la cancelación del proceso de registro
 * Proporciona estado y funciones para el flujo de cancelación
 */
export const useCancelRegistration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const router = useRouter();

  const cancelRegistrationUseCase = new CancelRegistrationUseCase();

  /**
   * Solicita la cancelación del registro (muestra el diálogo de confirmación)
   */
  const requestCancel = () => {
    setShowConfirmDialog(true);
  };

  /**
   * Confirma y ejecuta la cancelación del registro
   */
  const confirmCancel = async () => {
    setIsLoading(true);
    
    try {
      // Obtener el auth_id del usuario actual si existe
      const authId = localStorage.getItem('temp_auth_id') || null;
      
      const result = await cancelRegistrationUseCase.execute(authId);
      
      if (result.success) {
        // Limpiar datos temporales del localStorage
        localStorage.removeItem('temp_auth_id');
        localStorage.removeItem('registration_email');
        localStorage.removeItem('registration_step');
        
        // Redirigir a la página de login
        router.push('/auth/login');
      } else {
        // Si no se puede cancelar (proceso ya completado), cerrar diálogo
        setShowConfirmDialog(false);
        alert(result.message || 'No se pudo cancelar el registro');
      }
    } catch (error) {
      console.error('Error al cancelar registro:', error);
      alert('Error inesperado al cancelar el registro');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cancela la acción de cancelación (cierra el diálogo)
   */
  const cancelCancel = () => {
    setShowConfirmDialog(false);
  };

  return {
    isLoading,
    showConfirmDialog,
    requestCancel,
    confirmCancel,
    cancelCancel,
  };
};
