import { APIResponse } from '../types';

/**
 * Vendor API Service
 * Handles all interactions with the public vendor endpoints
 */

export interface Vendor {
  id: string;
  name: string;
  description: string;
  category: string;
  services: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  logoUrl?: string;
  website?: string;
  phone?: string;
  email?: string;
  metadata?: Record<string, any>;
  countryCode?: string;
  createdAt?: string;
}

export interface VendorReview {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  userAvatar?: string;
  isVerified: boolean;
  date: string;
}

const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const API_BASE = RAW_API_BASE.replace(/\/$/, '');
const API_INCLUDES_PATH = API_BASE.endsWith('/api');
const COUNTRY_KEY = 'user_country_override';

function getCountryCode(): string {
  if (typeof window === 'undefined') return 'US';
  return localStorage.getItem(COUNTRY_KEY) || 'US';
}

function buildHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-User-Country': getCountryCode(),
  };
}

function buildUrl(endpoint: string): string {
  let cleanEndpoint = endpoint;
  if (API_INCLUDES_PATH && endpoint.startsWith('/api/')) {
    cleanEndpoint = endpoint.replace('/api/', '/');
  }
  return `${API_BASE}${cleanEndpoint}`;
}

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = buildUrl(endpoint);
  const response = await fetch(url, {
    ...options,
    cache: 'no-store',
    mode: 'cors',
    credentials: 'omit',
    headers: {
      ...buildHeaders(),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Vendor API Error: ${response.status}`);
  }

  return response.json();
}

export const vendorAPI = {
  /**
   * Fetch active vendors with optional filtering
   */
  async getVendors(filters: {
    category?: string;
    service?: string;
    featured?: boolean;
    limit?: number;
  }): Promise<APIResponse<Vendor[]>> {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.service) params.append('service', filters.service);
      if (filters.featured) params.append('featured', 'true');
      if (filters.limit) params.append('limit', filters.limit.toString());

      const data = await apiFetch<{ vendors: Vendor[] }>(`/api/public/vendors?${params.toString()}`);

      return {
        data: data.vendors || [],
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[vendorAPI] getVendors error:', error);
      return { data: [], success: false, timestamp: new Date().toISOString() };
    }
  },

  /**
   * Get full details for a single vendor
   */
  async getVendorDetails(vendorId: string): Promise<APIResponse<Vendor>> {
    try {
      const data = await apiFetch<Vendor>(`/public/vendors/${vendorId}`);
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[vendorAPI] getVendorDetails error:', error);
      throw error;
    }
  },

  /**
   * Get paginated reviews for a vendor
   */
  async getReviews(vendorId: string, page: number = 1, limit: number = 10): Promise<APIResponse<{
    reviews: VendorReview[];
    total: number;
    pages: number;
    current: number;
  }>> {
    try {
      const data = await apiFetch<any>(`/public/vendors/${vendorId}/reviews?page=${page}&limit=${limit}`);
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[vendorAPI] getReviews error:', error);
      throw error;
    }
  },

  /**
   * Post a new review (Requires Auth)
   */
  async postReview(vendorId: string, rating: number, comment: string): Promise<APIResponse<{ ok: boolean; id: string; message?: string }>> {
    try {
      const data = await apiFetch<any>(`/public/vendors/${vendorId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
      });
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[vendorAPI] postReview error:', error);
      throw error;
    }
  },

  /**
   * Get vendor by ID (alias for getVendorDetails)
   */
  async getVendorById(vendorId: string): Promise<APIResponse<Vendor>> {
    return this.getVendorDetails(vendorId);
  },

  /**
   * Get vendor reviews (alias for getReviews)
   */
  async getVendorReviews(vendorId: string, page: number = 1, limit: number = 50): Promise<APIResponse<VendorReview[]>> {
    try {
      const response = await this.getReviews(vendorId, page, limit);
      return {
        data: response.data?.reviews || [],
        success: response.success,
        timestamp: response.timestamp,
      };
    } catch (error) {
      console.error('[vendorAPI] getVendorReviews error:', error);
      return { data: [], success: false, timestamp: new Date().toISOString() };
    }
  },

  /**
   * Get historical performance metrics for a vendor
   */
  async getHistory(vendorId: string, metric?: string, days: number = 365): Promise<APIResponse<any[]>> {
    try {
      const params = new URLSearchParams();
      params.append('days', days.toString());
      if (metric) params.append('metric', metric);

      const data = await apiFetch<any[]>(`/public/vendors/${vendorId}/history?${params.toString()}`);
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[vendorAPI] getHistory error:', error);
      return { data: [], success: false, timestamp: new Date().toISOString() };
    }
  }
};

export default vendorAPI;