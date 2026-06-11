import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add the routes you want to be public here
const publicRoutes = ['/login', '/register', '/reset-password', '/api/graphql', '/favicon.ico'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current route is in the public routes array or is a static asset
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route)) || 
                        pathname.startsWith('/_next') || 
                        pathname.match(/\.(.*)$/); // Match file extensions (e.g., images, css)

  // Get the auth token from cookies
  const token = request.cookies.get('lapmart_token')?.value;

  if (!token && !isPublicRoute) {
    // If there is no token and the user is trying to access a protected route (like '/'),
    // redirect them to the login page.
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token && (pathname === '/login' || pathname === '/register')) {
    // If the user is already logged in, they shouldn't access login/register again.
    // Redirect them to the homepage (which they can now access).
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // The matcher ensures middleware runs on all routes except static Next.js assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
