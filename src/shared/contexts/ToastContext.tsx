'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { ToastData } from '../components/ui/Toast';

interface ToastContextType {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'>) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<ToastData>) => void;
  registerAbortController: (toastId: string, controller: AbortController) => void;
  cancelOperation: (toastId: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const STORAGE_KEY = 'toasts-persistent';
const MAX_STORAGE_SIZE = 100 * 1024; // 100KB máximo

// Map para almacenar AbortControllers activos fuera del estado de React (persistente)
const abortControllersMap = new Map<string, AbortController>();

// Función para serializar toasts (eliminar callbacks no serializables)
function serializeToasts(toasts: ToastData[]): Omit<ToastData, 'onCancel' | 'onClose'>[] {
  return toasts.map(({ onCancel, onClose, ...rest }) => rest);
}

// Función para guardar toasts en sessionStorage
function saveToastsToStorage(toasts: ToastData[]) {
  if (typeof window === 'undefined') return;

  try {
    // Solo persistir toasts en estado "loading" (operaciones activas)
    const loadingToasts = toasts.filter((toast) => toast.type === 'loading');
    
    if (loadingToasts.length === 0) {
      // Si no hay toasts activos, limpiar el storage
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }

    const serialized = serializeToasts(loadingToasts);
    const json = JSON.stringify(serialized);
    
    // Verificar tamaño antes de guardar
    if (json.length > MAX_STORAGE_SIZE) {
      console.warn('⚠️ Los toasts exceden el tamaño máximo, no se guardarán');
      return;
    }

    sessionStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('❌ Error guardando toasts en sessionStorage:', error);
  }
}

// Función para cargar toasts desde sessionStorage
function loadToastsFromStorage(): ToastData[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored) as Omit<ToastData, 'onCancel' | 'onClose'>[];
    
    // Convertir a ToastData (sin callbacks, ya que no se pueden restaurar)
    return parsed.map((toast) => ({
      ...toast,
      // Los callbacks no se restauran ya que no son serializables
      // Se mostrarán como toasts "loading" pero sin funcionalidad de cancelación
    }));
  } catch (error) {
    console.error('❌ Error cargando toasts desde sessionStorage:', error);
    return [];
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  // Cargar toasts persistentes al inicializar
  const [toasts, setToasts] = useState<ToastData[]>(() => {
    if (typeof window === 'undefined') return [];
    return loadToastsFromStorage();
  });

  // Guardar toasts en sessionStorage cuando cambian
  useEffect(() => {
    saveToastsToStorage(toasts);
  }, [toasts]);

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastData = {
      ...toast,
      id,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<ToastData>) => {
    setToasts((prev) =>
      prev.map((toast) => (toast.id === id ? { ...toast, ...updates } : toast))
    );
  }, []);

  const registerAbortController = useCallback((toastId: string, controller: AbortController) => {
    abortControllersMap.set(toastId, controller);
  }, []);

  const cancelOperation = useCallback((toastId: string) => {
    const controller = abortControllersMap.get(toastId);
    if (controller) {
      controller.abort();
      abortControllersMap.delete(toastId);
    }
  }, []);

  // Limpiar AbortController cuando se remueve un toast
  const removeToastWithCleanup = useCallback((id: string) => {
    // Limpiar AbortController asociado
    abortControllersMap.delete(id);
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ 
      toasts, 
      addToast, 
      removeToast: removeToastWithCleanup, 
      updateToast,
      registerAbortController,
      cancelOperation
    }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

