/**
 * API service for managing services
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  detailed_description?: string;
  icon: string;
  cover_image?: string;
  features: string[];
  service_types?: string[];
  subjects?: string[];
  process_steps?: any[];
  pricing: string;
  turnaround: string;
  is_featured: boolean;
  order: number;
  href: string;
}

export interface ServiceResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Service[];
}

/**
 * Fetch all active services
 */
export async function fetchServices(): Promise<ServiceResponse> {
  const response = await fetch(`${API_BASE_URL}/services/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 3600 }, // Revalidate every hour
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch services: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch services by featured status
 */
export async function fetchFeaturedServices(): Promise<ServiceResponse> {
  const response = await fetch(`${API_BASE_URL}/services/?featured=true`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch featured services: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch a single service by slug
 */
export async function fetchServiceBySlug(slug: string): Promise<Service> {
  const response = await fetch(`${API_BASE_URL}/services/${slug}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Service not found');
    }
    throw new Error(`Failed to fetch service: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Map icon names to Lucide React icons
 * This helps maintain compatibility with the existing frontend
 */
export const iconMap: { [key: string]: string } = {
  'BookOpen': 'BookOpen',
  'FileText': 'FileText',
  'GraduationCap': 'GraduationCap',
  'Edit': 'Edit',
  'Brain': 'Brain',
  'Heart': 'Heart',
  'Users': 'Users',
  'Clock': 'Clock',
  'CheckCircle': 'CheckCircle',
  'Star': 'Star',
  'Award': 'Award',
  'Shield': 'Shield',
};

/**
 * Get the appropriate icon name for Lucide React
 */
export function getIconName(iconName: string): string {
  return iconMap[iconName] || 'FileText';
}