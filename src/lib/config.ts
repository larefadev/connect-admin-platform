export const getAppUrl = () => {
  // En el cliente, usar la URL actual del navegador
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // En el servidor, usar variable de entorno o fallback
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

export const getResetPasswordUrl = () => {
  const baseUrl = getAppUrl();
  return `${baseUrl}/reset-password`;
};

// Función para obtener la URL correcta según el entorno
export const getRedirectUrl = (path: string) => {
  const baseUrl = getAppUrl();
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};
