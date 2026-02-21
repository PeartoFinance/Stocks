'use client';

/**
 * Portfolio Analytics API
 * Handles portfolio health score and investment goals
 */

import { authenticatedFetch } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'https://apipearto.ashlya.com/api';

// Types
export interface PortfolioHealthScore {
    overall_score: number;
    diversification_score: number;
    risk_score: number;
    performance_score: number;
    recommendations: string[];
}

export interface InvestmentGoals {
    target_stocks_percent: number;
    target_bonds_percent: number;
    target_cash_percent: number;
    target_crypto_percent: number;
    target_commodities_percent: number;
    risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
    benchmark_symbol: string;
}

// API Functions

/**
 * Get portfolio health score
 */
export async function getPortfolioHealthScore(): Promise<PortfolioHealthScore> {
    return authenticatedFetch<PortfolioHealthScore>(`${API_BASE}/portfolio/analysis/health-score`);
}

/**
 * Get investment goals
 */
export async function getInvestmentGoals(): Promise<InvestmentGoals> {
    return authenticatedFetch<InvestmentGoals>(`${API_BASE}/portfolio/goals`);
}

/**
 * Update investment goals
 */
export async function updateInvestmentGoals(goals: InvestmentGoals): Promise<{ message: string }> {
    return authenticatedFetch<{ message: string }>(`${API_BASE}/portfolio/goals`, {
        method: 'PUT',
        body: JSON.stringify(goals),
    });
}

export default {
    getPortfolioHealthScore,
    getInvestmentGoals,
    updateInvestmentGoals,
};
