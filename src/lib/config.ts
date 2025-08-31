/**
 * Centralized configuration for all environment variables
 * This ensures consistent usage throughout the application and makes variable management easier
 */

// Base URL for API subdomain (no /api/ prefix needed)
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Remove trailing slashes to normalize
const normalizedBaseUrl = BASE_URL.replace(/\/+$/, '');

/**
 * Get the complete API endpoint URL
 * @param endpoint - The endpoint path (without leading slash)
 * @returns Complete API URL
 */
export function getApiUrl(endpoint: string): string {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${normalizedBaseUrl}/${cleanEndpoint}`;
}

// API Configuration
export const API_BASE_URL = `${normalizedBaseUrl}/`;
export const BASE_APP_URL = normalizedBaseUrl;

// App Configuration
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Einstein Essay Tutors';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Support Configuration
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+1 (206) 468-7859';
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@einsteinessaytutors.com';
export const LEGAL_EMAIL =
  process.env.NEXT_PUBLIC_LEGAL_EMAIL || 'legal@einsteinessaytutors.com';
export const PRIVACY_EMAIL =
  process.env.NEXT_PUBLIC_PRIVACY_EMAIL || 'privacy@einsteinessaytutors.com';

// Security Configuration
export const SECURE_COOKIES = process.env.NEXT_PUBLIC_SECURE_COOKIES === 'true';

// Analytics & Monitoring
export const GOOGLE_ANALYTICS_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Payment Configuration
export const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

// Environment
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_DEVELOPMENT = NODE_ENV === 'development';

const config = {
  // API
  getApiUrl,
  API_BASE_URL,
  BASE_APP_URL,

  // App
  APP_NAME,
  APP_URL,

  // Support
  WHATSAPP_NUMBER,
  SUPPORT_EMAIL,
  LEGAL_EMAIL,
  PRIVACY_EMAIL,

  // Security
  SECURE_COOKIES,

  // Analytics & Monitoring
  GOOGLE_ANALYTICS_ID,
  SENTRY_DSN,

  // Payment
  PAYPAL_CLIENT_ID,

  // Environment
  NODE_ENV,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
};

export default config;
