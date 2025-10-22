'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { CancelRegistrationButton } from '@/shared/components';

interface EmailStepProps {
  email: string;
  password: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function EmailStep({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  isLoading,
  error,
}: EmailStepProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const validatePassword = (pass: string) => {
    const minLength = pass.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumber = /\d/.test(pass);

    if (!minLength) return 'La contraseña debe tener al menos 8 caracteres';
    if (!hasUpperCase) return 'Debe contener al menos una letra mayúscula';
    if (!hasLowerCase) return 'Debe contener al menos una letra minúscula';
    if (!hasNumber) return 'Debe contener al menos un número';

    return '';
  };

  const handlePasswordChange = (value: string) => {
    onPasswordChange(value);
    const error = validatePassword(value);
    setPasswordError(error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    // Validar formato de contraseña
    const passError = validatePassword(password);
    if (passError) {
      setPasswordError(passError);
      return;
    }

    onSubmit();
  };

  const isFormValid = email && password && confirmPassword && password === confirmPassword && !passwordError;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Crea tu cuenta de administrador</h2>
        <p className="text-gray-600 mt-2">
          Ingresa tu correo electrónico y crea una contraseña segura
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

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            disabled={isLoading}
            className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
            placeholder="tu@email.com"
            required
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Usa un correo corporativo o personal único para administradores
        </p>
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            disabled={isLoading}
            className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {passwordError && password && (
          <p className="text-xs text-red-600 mt-1">{passwordError}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirmar contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {confirmPassword && password !== confirmPassword && (
          <p className="text-xs text-red-600 mt-1">Las contraseñas no coinciden</p>
        )}
      </div>

      {/* Password Requirements */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-xs font-medium text-gray-700 mb-2">La contraseña debe contener:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li className="flex items-center">
            <span className={`mr-2 ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
              {password.length >= 8 ? '✓' : '○'}
            </span>
            Al menos 8 caracteres
          </li>
          <li className="flex items-center">
            <span className={`mr-2 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
              {/[A-Z]/.test(password) ? '✓' : '○'}
            </span>
            Una letra mayúscula
          </li>
          <li className="flex items-center">
            <span className={`mr-2 ${/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
              {/[a-z]/.test(password) ? '✓' : '○'}
            </span>
            Una letra minúscula
          </li>
          <li className="flex items-center">
            <span className={`mr-2 ${/\d/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
              {/\d/.test(password) ? '✓' : '○'}
            </span>
            Un número
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
            Validando...
          </>
        ) : (
          'Continuar'
        )}
      </button>
      <CancelRegistrationButton variant="secondary" />  
    </form>
  );
}
