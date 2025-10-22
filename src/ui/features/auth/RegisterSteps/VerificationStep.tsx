'use client';

import { useState, useRef, useEffect } from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { CancelRegistrationButton } from '@/shared/components';

interface VerificationStepProps {
  email: string;
  onVerify: (code: string) => void;
  onResend: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function VerificationStep({
  email,
  onVerify,
  onResend,
  isLoading,
  error,
}: VerificationStepProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Timer countdown
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  useEffect(() => {
    // Auto-submit when all fields are filled
    if (code.every((digit) => digit !== '') && !isLoading) {
      onVerify(code.join(''));
    }
  }, [code, isLoading, onVerify]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only take last digit
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // Focus previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');

    if (digits.length === 6) {
      setCode(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend || isLoading) return;

    setCanResend(false);
    setTimer(60);
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    await onResend();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Verifica tu correo</h2>
        <p className="text-gray-600 mt-2">
          Hemos enviado un código de verificación a<br />
          <span className="font-medium text-gray-900">{email}</span>
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

      {/* Code Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
          Ingresa el código de 6 dígitos
        </label>
        <div className="flex justify-center gap-2 mb-4">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={isLoading}
              className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                error && digit
                  ? 'border-red-300 bg-red-50'
                  : digit
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300'
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            />
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center">
          <div className="inline-flex items-center text-sm text-gray-600">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verificando código...
          </div>
        </div>
      )}

      {/* Resend Code */}
      <div className="text-center pt-4">
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={isLoading}
            className="text-sm font-medium text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Reenviar código
          </button>
        ) : (
          <p className="text-sm text-gray-500">
            Reenviar código en <span className="font-medium text-gray-900">{formatTime(timer)}</span>
          </p>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-xs text-blue-800">
          <span className="font-medium">Consejo:</span> Revisa tu carpeta de spam si no ves el correo.
          El código expira en 10 minutos.
        </p>
      </div>
      <CancelRegistrationButton variant="secondary" />
    </div>
  );
}
