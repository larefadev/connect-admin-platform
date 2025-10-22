'use client';

import React from 'react';
import { useCancelRegistration } from '@/core/auth';
import { CancelRegistrationDialog } from './CancelRegistrationDialog';

interface CancelRegistrationButtonProps {
  variant?: 'primary' | 'secondary' | 'text';
  className?: string;
  children?: React.ReactNode;
}

/**
 * Botón para cancelar el proceso de registro
 * Incluye el diálogo de confirmación integrado
 */
export const CancelRegistrationButton: React.FC<CancelRegistrationButtonProps> = ({
  variant = 'secondary',
  className = '',
  children = 'Cancelar registro',
}) => {
  const {
    isLoading,
    showConfirmDialog,
    requestCancel,
    confirmCancel,
    cancelCancel,
  } = useCancelRegistration();

  const getButtonClasses = () => {
    const baseClasses = 'px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700`;
      case 'secondary':
        return `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300`;
      case 'text':
        return `${baseClasses} text-gray-600 hover:text-gray-800 hover:bg-gray-50`;
      default:
        return baseClasses;
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={requestCancel}
        disabled={isLoading}
        className={`${getButtonClasses()} ${className}`}
      >
        {children}
      </button>

      <CancelRegistrationDialog
        isOpen={showConfirmDialog}
        isLoading={isLoading}
        onConfirm={confirmCancel}
        onCancel={cancelCancel}
      />
    </>
  );
};
