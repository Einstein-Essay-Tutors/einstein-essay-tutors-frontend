/**
 * Centralized API configuration
 * This ensures consistent API URL usage throughout the application
 */

// Base URL without /api/ suffix - will be added by this utility
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

// Remove trailing slashes and /api/ suffix if present to normalize
const normalizedBaseUrl = BASE_URL.replace(/\/+$/, '').replace(/\/api\/?$/, '')

/**
 * Get the complete API endpoint URL
 * @param endpoint - The endpoint path (without leading slash)
 * @returns Complete API URL
 */
export function getApiUrl(endpoint: string): string {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${normalizedBaseUrl}/api/${cleanEndpoint}`
}

/**
 * Get the base API URL (includes /api/)
 */
export const API_BASE_URL = `${normalizedBaseUrl}/api/`

/**
 * Get the base URL without /api/ suffix
 */
export const BASE_APP_URL = normalizedBaseUrl

const config = {
  getApiUrl,
  API_BASE_URL,
  BASE_APP_URL,
}

export default config