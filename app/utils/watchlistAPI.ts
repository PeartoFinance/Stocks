'use client';

/**
 * Watchlist API Service
 * Manages user watchlists with JWT authentication
 */

import { authenticatedFetch } from './auth';
import { WatchlistItem, APIResponse } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '';

export interface CreateWatchlistData {
  symbol: string;
  notes?: string;
}

export interface UpdateWatchlistData {
  notes?: string;
}

export const watchlistAPI = {
  // Get user's watchlist
  async getWatchlist(): Promise<APIResponse<WatchlistItem[]>> {
    try {
      const data = await authenticatedFetch<WatchlistItem[]>(`${API_BASE}/api/user/watchlist`);
      
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[watchlistAPI] getWatchlist error:', error);
      throw error;
    }
  },

  // Add symbol to watchlist
  async addToWatchlist(watchlistData: CreateWatchlistData): Promise<APIResponse<WatchlistItem>> {
    try {
      const data = await authenticatedFetch<WatchlistItem>(`${API_BASE}/api/user/watchlist`, {
        method: 'POST',
        body: JSON.stringify(watchlistData),
      });
      
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[watchlistAPI] addToWatchlist error:', error);
      throw error;
    }
  },

  // Update watchlist item
  async updateWatchlistItem(id: string, updates: UpdateWatchlistData): Promise<APIResponse<WatchlistItem>> {
    try {
      const data = await authenticatedFetch<WatchlistItem>(`${API_BASE}/api/user/watchlist/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[watchlistAPI] updateWatchlistItem error:', error);
      throw error;
    }
  },

  // Remove from watchlist
  async removeFromWatchlist(id: string): Promise<APIResponse<{ message: string }>> {
    try {
      const data = await authenticatedFetch<{ message: string }>(`${API_BASE}/api/user/watchlist/${id}`, {
        method: 'DELETE',
      });
      
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[watchlistAPI] removeFromWatchlist error:', error);
      throw error;
    }
  },

  // Check if symbol is in watchlist
  async isInWatchlist(symbol: string): Promise<boolean> {
    try {
      const response = await this.getWatchlist();
      return response.data.some(item => item.symbol.toLowerCase() === symbol.toLowerCase());
    } catch (error) {
      console.error('[watchlistAPI] isInWatchlist error:', error);
      return false;
    }
  },

  // Get watchlist with current prices
  async getWatchlistWithPrices(): Promise<APIResponse<Array<WatchlistItem & {
    currentPrice?: number;
    change?: number;
    changePercent?: number;
  }>>> {
    try {
      const data = await authenticatedFetch<Array<WatchlistItem & {
        currentPrice?: number;
        change?: number;
        changePercent?: number;
      }>>(`${API_BASE}/api/user/watchlist/prices`);
      
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[watchlistAPI] getWatchlistWithPrices error:', error);
      throw error;
    }
  },
};

export default watchlistAPI;