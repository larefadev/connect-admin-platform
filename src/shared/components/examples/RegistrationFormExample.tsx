'use client';

import React from 'react';
import { CancelRegistrationButton } from '../CancelRegistrationButton';

/**
 * Ejemplo de cómo integrar el botón de cancelación en un formulario de registro
 * Este componente muestra diferentes variantes del botón
 */
export const RegistrationFormExample: React.FC = () => {
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Registro de Administrador</h2>
      
      {/* Formulario de ejemplo */}
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="admin@ejemplo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-4">
          {/* Botón de cancelación - variante secundaria (recomendada) */}
          <CancelRegistrationButton 
            variant="secondary"
            className="flex-1"
          />
          
          {/* Botón principal del formulario */}
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Continuar
          </button>
        </div>

        {/* Ejemplo de botón de cancelación como texto (para usar en headers) */}
        <div className="pt-2 text-center">
          <CancelRegistrationButton 
            variant="text"
            className="text-sm"
          >
            ← Cancelar y volver al inicio
          </CancelRegistrationButton>
        </div>
      </form>

      {/* Ejemplo de uso en diferentes contextos */}
      <div className="mt-8 p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Otras variantes:</h3>
        
        <div className="space-y-2">
          {/* Variante primaria (para casos donde cancelar es la acción principal) */}
          <CancelRegistrationButton 
            variant="primary"
            className="w-full"
          >
            Cancelar registro
          </CancelRegistrationButton>
          
          {/* Variante de texto con icono personalizado */}
          <CancelRegistrationButton 
            variant="text"
            className="w-full justify-center"
          >
            ✕ Abandonar proceso
          </CancelRegistrationButton>
        </div>
      </div>
    </div>
  );
};
