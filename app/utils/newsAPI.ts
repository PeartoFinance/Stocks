'use client';

/**
 * News API Service
 * Matches backend news endpoints with country filtering
 */

import { NewsItem, APIResponse } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '';

// Get country header for API requests
function getCountryHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const country = localStorage.getItem('user_country_override') || 'US';
  return { 'X-User-Country': country };
}

// Helper to make API requests with country context
async function newsFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getCountryHeader(),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);\n  }

  return response.json();
}

export const newsAPI = {
  // Get general market news
  async getMarketNews(limit: number = 20): Promise<APIResponse<NewsItem[]>> {
    try {\n      const data = await newsFetch<NewsItem[]>(`/api/news/market?limit=${limit}`);\n      \n      return {\n        data,\n        success: true,\n        timestamp: new Date().toISOString(),\n      };\n    } catch (error) {\n      console.error('[newsAPI] getMarketNews error:', error);\n      return { data: [], success: false, timestamp: new Date().toISOString() };\n    }\n  },\n\n  // Get news for specific symbol\n  async getSymbolNews(symbol: string, limit: number = 10): Promise<APIResponse<NewsItem[]>> {\n    try {\n      const data = await newsFetch<NewsItem[]>(`/api/news/symbol/${symbol}?limit=${limit}`);\n      \n      return {\n        data,\n        success: true,\n        timestamp: new Date().toISOString(),\n      };\n    } catch (error) {\n      console.error('[newsAPI] getSymbolNews error:', error);\n      return { data: [], success: false, timestamp: new Date().toISOString() };\n    }\n  },\n\n  // Get trending news\n  async getTrendingNews(limit: number = 15): Promise<APIResponse<NewsItem[]>> {\n    try {\n      const data = await newsFetch<NewsItem[]>(`/api/news/trending?limit=${limit}`);\n      \n      return {\n        data,\n        success: true,\n        timestamp: new Date().toISOString(),\n      };\n    } catch (error) {\n      console.error('[newsAPI] getTrendingNews error:', error);\n      return { data: [], success: false, timestamp: new Date().toISOString() };\n    }\n  },\n\n  // Search news\n  async searchNews(query: string, limit: number = 20): Promise<APIResponse<NewsItem[]>> {\n    try {\n      const data = await newsFetch<NewsItem[]>(\n        `/api/news/search?q=${encodeURIComponent(query)}&limit=${limit}`\n      );\n      \n      return {\n        data,\n        success: true,\n        timestamp: new Date().toISOString(),\n      };\n    } catch (error) {\n      console.error('[newsAPI] searchNews error:', error);\n      return { data: [], success: false, timestamp: new Date().toISOString() };\n    }\n  },\n\n  // Get news by category\n  async getNewsByCategory(category: string, limit: number = 20): Promise<APIResponse<NewsItem[]>> {\n    try {\n      const data = await newsFetch<NewsItem[]>(\n        `/api/news/category/${category}?limit=${limit}`\n      );\n      \n      return {\n        data,\n        success: true,\n        timestamp: new Date().toISOString(),\n      };\n    } catch (error) {\n      console.error('[newsAPI] getNewsByCategory error:', error);\n      return { data: [], success: false, timestamp: new Date().toISOString() };\n    }\n  },\n\n  // Get economic calendar events\n  async getEconomicCalendar(days: number = 7): Promise<APIResponse<Array<{\n    id: string;\n    title: string;\n    country: string;\n    eventDate: string;\n    importance: 'low' | 'medium' | 'high';\n    forecast?: string;\n    previous?: string;\n    actual?: string;\n  }>>> {\n    try {\n      const data = await newsFetch<Array<{\n        id: string;\n        title: string;\n        country: string;\n        eventDate: string;\n        importance: 'low' | 'medium' | 'high';\n        forecast?: string;\n        previous?: string;\n        actual?: string;\n      }>>(`/api/news/economic-calendar?days=${days}`);\n      \n      return {\n        data,\n        success: true,\n        timestamp: new Date().toISOString(),\n      };\n    } catch (error) {\n      console.error('[newsAPI] getEconomicCalendar error:', error);\n      return { data: [], success: false, timestamp: new Date().toISOString() };\n    }\n  },\n\n  // Get earnings calendar\n  async getEarningsCalendar(days: number = 7): Promise<APIResponse<Array<{\n    symbol: string;\n    companyName: string;\n    earningsDate: string;\n    epsEstimate?: number;\n    epsActual?: number;\n    surprisePercent?: number;\n  }>>> {\n    try {\n      const data = await newsFetch<Array<{\n        symbol: string;\n        companyName: string;\n        earningsDate: string;\n        epsEstimate?: number;\n        epsActual?: number;\n        surprisePercent?: number;\n      }>>(`/api/news/earnings-calendar?days=${days}`);\n      \n      return {\n        data,\n        success: true,\n        timestamp: new Date().toISOString(),\n      };\n    } catch (error) {\n      console.error('[newsAPI] getEarningsCalendar error:', error);\n      return { data: [], success: false, timestamp: new Date().toISOString() };\n    }\n  },\n};\n\nexport default newsAPI;