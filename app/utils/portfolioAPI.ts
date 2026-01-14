'use client';

/**
 * Portfolio API Service
 * Matches backend portfolio endpoints with JWT authentication
 */

import { authenticatedFetch } from './auth';
import { PortfolioPosition, APIResponse } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '';

export interface CreatePositionData {
  symbol: string;
  shares: number;
  averageCost: number;
  notes?: string;
}

export interface UpdatePositionData {
  shares?: number;
  averageCost?: number;
  notes?: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  positions: PortfolioPosition[];
}

export const portfolioAPI = {
  // Get user's portfolio summary
  async getPortfolio(): Promise<APIResponse<PortfolioSummary>> {
    try {
      const data = await authenticatedFetch<PortfolioSummary>(`${API_BASE}/api/portfolio`);
      
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[portfolioAPI] getPortfolio error:', error);
      throw error;
    }
  },

  // Get all positions
  async getPositions(): Promise<APIResponse<PortfolioPosition[]>> {
    try {
      const data = await authenticatedFetch<PortfolioPosition[]>(`${API_BASE}/api/portfolio/positions`);
      
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[portfolioAPI] getPositions error:', error);
      throw error;
    }
  },

  // Get specific position
  async getPosition(id: string): Promise<APIResponse<PortfolioPosition>> {
    try {
      const data = await authenticatedFetch<PortfolioPosition>(`${API_BASE}/api/portfolio/positions/${id}`);
      
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[portfolioAPI] getPosition error:', error);
      throw error;
    }
  },

  // Add new position
  async addPosition(positionData: CreatePositionData): Promise<APIResponse<PortfolioPosition>> {
    try {
      const data = await authenticatedFetch<PortfolioPosition>(`${API_BASE}/api/portfolio/positions`, {
        method: 'POST',
        body: JSON.stringify(positionData),
      });
      
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[portfolioAPI] addPosition error:', error);
      throw error;
    }
  },

  // Update existing position
  async updatePosition(id: string, updates: UpdatePositionData): Promise<APIResponse<PortfolioPosition>> {
    try {
      const data = await authenticatedFetch<PortfolioPosition>(`${API_BASE}/api/portfolio/positions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[portfolioAPI] updatePosition error:', error);
      throw error;
    }
  },

  // Delete position
  async deletePosition(id: string): Promise<APIResponse<{ message: string }>> {
    try {
      const data = await authenticatedFetch<{ message: string }>(`${API_BASE}/api/portfolio/positions/${id}`, {
        method: 'DELETE',
      });
      
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[portfolioAPI] deletePosition error:', error);
      throw error;
    }
  },

  // Get portfolio performance history
  async getPerformanceHistory(period: string = '1y'): Promise<APIResponse<Array<{ date: string; value: number }>>> {
    try {
      const data = await authenticatedFetch<Array<{ date: string; value: number }>>(
        `${API_BASE}/api/portfolio/performance?period=${period}`
      );
      
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[portfolioAPI] getPerformanceHistory error:', error);
      throw error;
    }
  },

  // Get portfolio analytics
  async getAnalytics(): Promise<APIResponse<{
    allocation: Array<{ sector: string; percentage: number; value: number }>;
    topHoldings: Array<{ symbol: string; percentage: number; value: number }>;
    riskMetrics: {
      beta: number;
      volatility: number;
      sharpeRatio: number;
    };
  }>> {
    try {
      const data = await authenticatedFetch<{
        allocation: Array<{ sector: string; percentage: number; value: number }>;
        topHoldings: Array<{ symbol: string; percentage: number; value: number }>;
        riskMetrics: {
          beta: number;
          volatility: number;
          sharpeRatio: number;
        };
      }>(`${API_BASE}/api/portfolio/analytics`);
      
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[portfolioAPI] getAnalytics error:', error);
      throw error;
    }
  },
};

export default portfolioAPI;