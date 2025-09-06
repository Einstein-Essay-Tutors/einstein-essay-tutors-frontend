import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },

  // Security headers now handled by middleware.ts for better compatibility
  // Backup CSP configuration in case middleware is not working in production
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development';

    const connectSrc = isDevelopment
      ? "'self' http://localhost:8000 https://api.einsteinessaytutors.com https://accounts.google.com https://www.googleapis.com https://oauth2.googleapis.com https://*.googleapis.com https://securetoken.googleapis.com"
      : "'self' https://api.einsteinessaytutors.com https://accounts.google.com https://www.googleapis.com https://oauth2.googleapis.com https://*.googleapis.com https://securetoken.googleapis.com";

    const googleScriptSources = [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://accounts.google.com',
      'https://accounts.google.com/gsi/client',
      'https://apis.google.com',
      'https://gsi.google.com',
      'https://*.gstatic.com',
      'https://ssl.gstatic.com',
    ].join(' ');

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src ${googleScriptSources}`,
              `script-src-elem ${googleScriptSources}`,
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
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Image optimization configuration for production
  images: {
    unoptimized: false, // Enable image optimization for better performance
  },

  // Environment variables validation
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
};

export default nextConfig;
