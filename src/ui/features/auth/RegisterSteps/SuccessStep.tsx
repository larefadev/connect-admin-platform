'use client';

import { CheckCircle, Clock, Mail } from 'lucide-react';
import Link from 'next/link';

interface SuccessStepProps {
  email: string;
  username: string;
}

export default function SuccessStep({ email, username }: SuccessStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Registro exitoso!</h2>
        <p className="text-lg text-gray-600">
          Tu cuenta ha sido creada correctamente
        </p>
      </div>

      {/* Account Info */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border border-red-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
          <Mail className="h-5 w-5 text-red-600 mr-2" />
          Detalles de tu cuenta
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-600">Correo electrónico</p>
            <p className="text-sm font-medium text-gray-900">{email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Nombre de usuario</p>
            <p className="text-sm font-medium text-gray-900">@{username}</p>
          </div>
        </div>
      </div>

      {/* Pending Approval Notice */}
      <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
        <div className="flex items-start">
          <Clock className="h-6 w-6 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">
              Cuenta pendiente de aprobación
            </h3>
            <p className="text-sm text-yellow-800 mb-3">
              Tu cuenta ha sido creada exitosamente y está en proceso de revisión.
              Un administrador la aprobará pronto.
            </p>
            <ul className="text-sm text-yellow-800 space-y-2">
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2 font-bold">1.</span>
                <span>
                  Nuestro equipo revisará tu solicitud en las próximas <strong>24 horas</strong>
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2 font-bold">2.</span>
                <span>
                  Recibirás un <strong>correo electrónico</strong> cuando tu cuenta sea activada
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2 font-bold">3.</span>
                <span>
                  Una vez aprobada, podrás <strong>iniciar sesión</strong> en el panel de administración
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* What happens next */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">¿Qué sigue?</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold text-xs mr-3">
              1
            </div>
            <p>
              Revisa tu correo electrónico <strong>{email}</strong> para confirmar que
              recibiste nuestra notificación
            </p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold text-xs mr-3">
              2
            </div>
            <p>
              Espera la aprobación de un administrador (normalmente en menos de 24 horas)
            </p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold text-xs mr-3">
              3
            </div>
            <p>
              Una vez aprobada, inicia sesión y comienza a gestionar la plataforma Connect
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <Link
          href="/login"
          className="block w-full text-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          Ir a iniciar sesión
        </Link>
        <Link
          href="/"
          className="block w-full text-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>

      {/* Support Info */}
      <div className="text-center pt-4">
        <p className="text-xs text-gray-500">
          ¿Tienes alguna pregunta?{' '}
          <a href="mailto:soporte@connect.com" className="text-red-600 hover:text-red-700 font-medium">
            Contacta a soporte
          </a>
        </p>
      </div>
    </div>
  );
}
