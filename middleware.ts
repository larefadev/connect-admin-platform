import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que no requieren autenticación
const publicRoutes = ['/login', '/register'];

// Rutas protegidas que requieren autenticación
const protectedRoutes = ['/dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar si la ruta es pública
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Verificar si la ruta es protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Obtener el token de autenticación de las cookies
  const authCookie = request.cookies.get('connect-admin-auth');
  const hasAuthData = authCookie?.value;

  // Si la ruta es protegida y no hay token, redirigir a login
  if (isProtectedRoute && !hasAuthData) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si está en login o register y ya tiene token, redirigir a dashboard
  if (isPublicRoute && hasAuthData && pathname !== '/register') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configurar qué rutas deben pasar por el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
