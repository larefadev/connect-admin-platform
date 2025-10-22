'use client';

import { useState } from 'react';
import { User, AlertCircle, CheckCircle } from 'lucide-react';
import { CancelRegistrationButton } from '@/shared/components';

interface ProfileStepProps {
  name: string;
  lastName: string;
  username: string;
  onNameChange: (name: string) => void;
  onLastNameChange: (lastName: string) => void;
  onUsernameChange: (username: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function ProfileStep({
  name,
  lastName,
  username,
  onNameChange,
  onLastNameChange,
  onUsernameChange,
  onSubmit,
  isLoading,
  error,
}: ProfileStepProps) {
  const [usernameError, setUsernameError] = useState('');

  const validateUsername = (value: string) => {
    if (value.length < 3) {
      return 'El nombre de usuario debe tener al menos 3 caracteres';
    }
    if (value.length > 20) {
      return 'El nombre de usuario no puede tener más de 20 caracteres';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return 'Solo se permiten letras, números, guiones y guiones bajos';
    }
    return '';
  };

  const handleUsernameChange = (value: string) => {
    onUsernameChange(value);
    const error = validateUsername(value);
    setUsernameError(error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const usernameValidationError = validateUsername(username);
    if (usernameValidationError) {
      setUsernameError(usernameValidationError);
      return;
    }

    onSubmit();
  };

  const isFormValid = name && lastName && username && !usernameError;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Completa tu perfil</h2>
        <p className="text-gray-600 mt-2">
          Ingresa tus datos personales para finalizar el registro
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg p-4 bg-red-50 border border-red-200">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nombre <span className="text-red-600">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={isLoading}
          className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
          placeholder="Juan"
          required
        />
      </div>

      {/* Last Name Field */}
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
          Apellido <span className="text-red-600">*</span>
        </label>
        <input
          id="lastName"
          type="text"
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
          disabled={isLoading}
          className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
          placeholder="Pérez"
          required
        />
      </div>

      {/* Username Field */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de usuario <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value.toLowerCase())}
            disabled={isLoading}
            className={`appearance-none block w-full px-4 py-3 border rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 ${
              usernameError && username
                ? 'border-red-300 focus:border-red-500'
                : username && !usernameError
                ? 'border-green-300 focus:border-green-500'
                : 'border-gray-300 focus:border-red-500'
            }`}
            placeholder="juanperez"
            required
          />
          {username && !usernameError && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
          )}
        </div>
        {usernameError && username ? (
          <p className="text-xs text-red-600 mt-1">{usernameError}</p>
        ) : (
          <p className="text-xs text-gray-500 mt-1">
            3-20 caracteres. Solo letras, números, guiones y guiones bajos.
          </p>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Información importante</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li className="flex items-start">
            <span className="text-red-600 mr-2">•</span>
            Tu cuenta será revisada y aprobada por un administrador
          </li>
          <li className="flex items-start">
            <span className="text-red-600 mr-2">•</span>
            Recibirás un correo cuando tu cuenta sea activada
          </li>
          <li className="flex items-start">
            <span className="text-red-600 mr-2">•</span>
            El proceso de aprobación puede tomar hasta 24 horas
          </li>
        </ul>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creando cuenta...
          </>
        ) : (
          'Crear cuenta de administrador'
        )}
      </button>
      <CancelRegistrationButton variant="secondary" />
    </form>
  );
}
