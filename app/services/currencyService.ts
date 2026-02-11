
import { stockAPI } from '../utils/api';

export interface ExchangeRate {
    pair: string;
    rate: number;
    targetCurrency: string;
    last_updated: string;
}

// We can reuse the apiFetch helper from api.ts if we export it, or just use fetch directly
// consistent with navigationService implementation
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://apipearto.ashlya.com/api').replace(/\/$/, '');

/**
 * Fetch all available exchange rates
 */
export async function getRates(): Promise<ExchangeRate[]> {
    try {
        // Construct URL - handle potential double slash if API_BASE ends with /api and endpoint starts with /api
        let url = `${API_BASE}/currency/rates`;

        console.log('[CurrencyService] Fetching rates:', url);

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            // Cache for slightly longer than navigation since rates don't change *that* fast in this context
            next: { revalidate: 300 } // 5 minutes
        });

        if (!response.ok) {
            throw new Error(`Currency rates fetch failed: ${response.status}`);
        }

        const data = await response.json();
        return data.rates || [];
    } catch (error) {
        console.error('Failed to fetch currency rates:', error);
        return [];
    }
}
