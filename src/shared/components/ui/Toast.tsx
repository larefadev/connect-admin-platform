'use client';

import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/shared/contexts/ToastContext';

export interface ToastData {
  id: string;
  title: string;
  message?: string;
  type?: 'info' | 'success' | 'error' | 'loading';
  progress?: {
    current: number;
    total: number;
    updated?: number;
    created?: number;
    skipped?: number;
  };
  duration?: number;
  onClose?: () => void;
  onCancel?: () => void;
}

interface ToastProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

export function Toast({ toast, onRemove }: ToastProps) {
  const { cancelOperation } = useToast();
  const {
    id,
    title,
    message,
    type = 'info',
    progress,
    duration = type === 'loading' ? Infinity : 5000,
  } = toast;

  // Función para manejar cancelación (usa onCancel si existe, sino usa el contexto)
  const handleCancel = () => {
    if (toast.onCancel) {
      toast.onCancel();
    } else {
      // Si no hay onCancel (toast restaurado desde sessionStorage), usar el contexto
      cancelOperation(id);
    }
  };

  // Auto-remove toast after duration (except loading)
  useEffect(() => {
    if (type !== 'loading' && duration > 0 && duration !== Infinity) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, type, duration, onRemove]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'loading':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'loading':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const progressPercentage = progress
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <div
      className={`${getBgColor()} border rounded-lg shadow-lg p-4 min-w-[320px] max-w-md animate-in slide-in-from-top-2 fade-in duration-300`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1">
          <div className="flex-shrink-0 mr-3">{getIcon()}</div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900">{title}</h4>
            {message && (
              <p className="mt-1 text-sm text-gray-600">{message}</p>
            )}

            {/* Progress Bar */}
            {progress && type === 'loading' && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>
                    {progress.current} de {progress.total} productos
                  </span>
                  <span>{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                {(progress.updated !== undefined ||
                  progress.created !== undefined ||
                  progress.skipped !== undefined) && (
                  <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
                    {progress.updated !== undefined && (
                      <span>Actualizados: {progress.updated}</span>
                    )}
                    {progress.created !== undefined && (
                      <span>| Creados: {progress.created}</span>
                    )}
                    {progress.skipped !== undefined && progress.skipped > 0 && (
                      <span>| Omitidos: {progress.skipped}</span>
                    )}
                  </div>
                )}
                {/* Cancel Button - Mostrar siempre para toasts loading, usar contexto si no hay onCancel */}
                {type === 'loading' && (
                  <div className="pt-2">
                    <button
                      onClick={handleCancel}
                      className="w-full px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Final Status Message */}
            {progress && type !== 'loading' && progress.current === progress.total && (
              <div className="mt-2 text-xs text-gray-600">
                {progress.updated !== undefined && progress.updated > 0 && (
                  <span>Actualizados: {progress.updated}</span>
                )}
                {progress.created !== undefined && progress.created > 0 && (
                  <span> | Creados: {progress.created}</span>
                )}
                {progress.skipped !== undefined && progress.skipped > 0 && (
                  <span> | Omitidos: {progress.skipped}</span>
                )}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            if (toast.onClose) {
              toast.onClose();
            }
            onRemove(id);
          }}
          className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

