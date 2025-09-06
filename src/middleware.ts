import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Create response
  const response = NextResponse.next();

  // Remove any existing CSP headers to prevent conflicts
  response.headers.delete('content-security-policy');
  response.headers.delete('Content-Security-Policy');

  // Determine environment - check if we're in development
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Build connect-src directive based on environment
  const connectSrc = isDevelopment
    ? "'self' http://localhost:8000 https://api.einsteinessaytutors.com https://accounts.google.com https://www.googleapis.com https://oauth2.googleapis.com https://*.googleapis.com https://securetoken.googleapis.com"
    : "'self' https://api.einsteinessaytutors.com https://accounts.google.com https://www.googleapis.com https://oauth2.googleapis.com https://*.googleapis.com https://securetoken.googleapis.com";

  // Set our comprehensive CSP policy that includes all Google OAuth domains
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://accounts.google.com https://accounts.google.com/gsi/client https://apis.google.com https://gsi.google.com https://*.gstatic.com https://ssl.gstatic.com",
    "script-src-elem 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://accounts.google.com https://accounts.google.com/gsi/client https://apis.google.com https://gsi.google.com https://*.gstatic.com https://ssl.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://accounts.google.com https://fonts.googleapis.com https://*.gstatic.com https://ssl.gstatic.com",
    "style-src-elem 'self' 'unsafe-inline' https://accounts.google.com https://fonts.googleapis.com https://*.gstatic.com https://ssl.gstatic.com",
    "font-src 'self' https://fonts.gstatic.com https://*.gstatic.com",
    `connect-src ${connectSrc}`,
    "img-src 'self' data: https: blob: https://accounts.google.com https://*.gstatic.com",
    "frame-src 'self' https://accounts.google.com https://content.googleapis.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // Add other security headers
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  // Apply to all routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
