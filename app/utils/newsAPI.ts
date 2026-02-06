'use client';

/**
 * News API Service
 * Matches backend news endpoints with country filtering
 */

import { NewsItem, APIResponse } from '../types';

// Ensure no trailing slash on the base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '';

// Get headers for API requests (Country and optional Email)
function getBaseHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  const country = localStorage.getItem('user_country_override') || 'US';
  const email = localStorage.getItem('auth_user_email'); // Useful if backend filters news by user preferences
  
  const headers: Record<string, string> = {
    'X-User-Country': country,
  };

  if (email) {
    headers['X-User-Email'] = email;
  }

  return headers;
}

// Helper to make API requests with context
async function newsFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // Ensure endpoint starts with a slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${path}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getBaseHeaders(),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export const newsAPI = {
  // Get general market news
  async getMarketNews(limit: number = 20): Promise<APIResponse<NewsItem[]>> {
    try {
      const response = await newsFetch<{ items: NewsItem[] }>(`/news/published?limit=${limit}`);
      return {
        data: response.items || [],
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[newsAPI] getMarketNews error:', error);
      return { data: [], success: false, timestamp: new Date().toISOString() };
    }
  },

  // Get news for specific symbol
  async getSymbolNews(symbol: string, limit: number = 10): Promise<APIResponse<NewsItem[]>> {
    try {
      const data = await newsFetch<NewsItem[]>(`/news/symbol/${symbol}?limit=${limit}`);
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[newsAPI] getSymbolNews error:', error);
      return { data: [], success: false, timestamp: new Date().toISOString() };
    }
  },

  // Get trending news
  async getTrendingNews(limit: number = 15): Promise<APIResponse<NewsItem[]>> {
    try {
      const data = await newsFetch<NewsItem[]>(`/news/trending?limit=${limit}`);
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[newsAPI] getTrendingNews error:', error);
      return { data: [], success: false, timestamp: new Date().toISOString() };
    }
  },

  // Search news
  async searchNews(query: string, limit: number = 20): Promise<APIResponse<NewsItem[]>> {
    try {
      const data = await newsFetch<NewsItem[]>(
        `/api/news/search?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[newsAPI] searchNews error:', error);
      return { data: [], success: false, timestamp: new Date().toISOString() };
    }
  },

  // Get news by category
  async getNewsByCategory(category: string, limit: number = 20): Promise<APIResponse<NewsItem[]>> {
    try {
      const data = await newsFetch<NewsItem[]>(
        `/news/category/${category}?limit=${limit}`
      );
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[newsAPI] getNewsByCategory error:', error);
      return { data: [], success: false, timestamp: new Date().toISOString() };
    }
  },

  // Get economic calendar events
  async getEconomicCalendar(days: number = 7): Promise<APIResponse<any[]>> {
    try {
      const data = await newsFetch<any[]>(`/news/economic-calendar?days=${days}`);
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[newsAPI] getEconomicCalendar error:', error);
      return { data: [], success: false, timestamp: new Date().toISOString() };
    }
  },

  // Get earnings calendar
  async getEarningsCalendar(days: number = 7): Promise<APIResponse<any[]>> {
    try {
      const data = await newsFetch<any[]>(`/news/earnings-calendar?days=${days}`);
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[newsAPI] getEarningsCalendar error:', error);
      return { data: [], success: false, timestamp: new Date().toISOString() };
    }
  },
};

export default newsAPI;