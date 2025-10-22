'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRegistrationFlowStore } from '@/stores/registrationFlowStore';
import EmailStep from '@/ui/features/auth/RegisterSteps/EmailStep';
import VerificationStep from '@/ui/features/auth/RegisterSteps/VerificationStep';
import ProfileStep from '@/ui/features/auth/RegisterSteps/ProfileStep';
import SuccessStep from '@/ui/features/auth/RegisterSteps/SuccessStep';

// Flujo con verificación de email via OTP
const STEP_TITLES = {
  email: 'Paso 1 de 3',
  verification: 'Paso 2 de 3',
  profile: 'Paso 3 de 3',
  complete: 'Completado',
};

export default function RegisterPage() {
  const router = useRouter();
  const {
    currentStep,
    isLoading,
    error,
    emailData,
    profileData,
    validateEmail,
    verifyCode,
    resendCode,
    completeRegistration,
    setEmailData,
    setProfileData,
    nextStep,
    previousStep,
    reset,
  } = useRegistrationFlowStore();

  // Reset flow on mount
  useEffect(() => {
    reset();
  }, [reset]);

  const handleEmailSubmit = async () => {
    if (!emailData.email || !emailData.password) return;

    const success = await validateEmail(emailData.email, emailData.password);
    if (success) {
      nextStep();
    }
  };

  const handleVerificationSubmit = async (code: string) => {
    const success = await verifyCode(code);
    if (success) {
      nextStep();
    }
  };

  const handleResendCode = async () => {
    await resendCode();
  };

  const handleProfileSubmit = async () => {
    if (!profileData.name || !profileData.last_name || !profileData.username) return;

    const success = await completeRegistration({
      name: profileData.name,
      last_name: profileData.last_name,
      username: profileData.username,
    });

    if (success) {
      nextStep();
    }
  };

  const handleBack = () => {
    if (currentStep === 'email') {
      router.push('/login');
    } else if (currentStep !== 'complete') {
      previousStep();
    }
  };

  const getProgressPercentage = () => {
    switch (currentStep) {
      case 'email':
        return 33;
      case 'verification':
        return 66;
      case 'profile':
        return 100;
      case 'complete':
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            {currentStep !== 'complete' && (
              <button
                onClick={handleBack}
                disabled={isLoading}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {currentStep === 'email' ? 'Volver a login' : 'Atrás'}
              </button>
            )}
            {currentStep !== 'complete' && (
              <span className="text-sm font-medium text-gray-500">
                {STEP_TITLES[currentStep]}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {currentStep !== 'complete' && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
          {/* Logo */}
          {currentStep !== 'complete' && (
            <div className="flex justify-center mb-6">
              <div className="h-12 w-12 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
            </div>
          )}

          {/* Step Content */}
          {currentStep === 'email' && (
            <EmailStep
              email={emailData.email || ''}
              password={emailData.password || ''}
              onEmailChange={(email) => setEmailData({ email })}
              onPasswordChange={(password) => setEmailData({ password })}
              onSubmit={handleEmailSubmit}
              isLoading={isLoading}
              error={error}
            />
          )}

          {currentStep === 'verification' && (
            <VerificationStep
              email={emailData.email || ''}
              onVerify={handleVerificationSubmit}
              onResend={handleResendCode}
              isLoading={isLoading}
              error={error}
            />
          )}

          {currentStep === 'profile' && (
            <ProfileStep
              name={profileData.name || ''}
              lastName={profileData.last_name || ''}
              username={profileData.username || ''}
              onNameChange={(name) => setProfileData({ name })}
              onLastNameChange={(last_name) => setProfileData({ last_name })}
              onUsernameChange={(username) => setProfileData({ username })}
              onSubmit={handleProfileSubmit}
              isLoading={isLoading}
              error={error}
            />
          )}

          {currentStep === 'complete' && (
            <SuccessStep
              email={emailData.email || ''}
              username={profileData.username || ''}
            />
          )}
        </div>

        {/* Footer */}
        {currentStep !== 'complete' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="font-medium text-red-600 hover:text-red-700">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Al registrarte, aceptas nuestros{' '}
            <a href="#" className="text-red-600 hover:text-red-700 underline">
              Términos de Servicio
            </a>{' '}
            y{' '}
            <a href="#" className="text-red-600 hover:text-red-700 underline">
              Política de Privacidad
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
