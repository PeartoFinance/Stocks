'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getRates, ExchangeRate } from '../services/currencyService';
import { useAuth } from './AuthContext';
import { authenticatedFetch } from '../utils/auth';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://apipearto.ashlya.com/api').replace(/\/$/, '');

interface UserPreferences {
    currency: string;
    taxResidency?: string;
    languagePref?: string;
    countryCode?: string;
}

interface CurrencyContextType {
    currency: string;
    symbol: string;
    rates: Record<string, number>;
    loading: boolean;
    setCurrency: (code: string) => void;
    convertPrice: (amount: number) => number;
    formatPrice: (amount: number, minimumFractionDigits?: number, maximumFractionDigits?: number, options?: Intl.NumberFormatOptions) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [currency, setCurrencyState] = useState('USD');
    const [rates, setRates] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    // Initial load: Fetch rates + user prefs if authenticated
    useEffect(() => {
        async function init() {
            try {
                // Fetch rates (public endpoint)
                const ratesData = await getRates();

                // Transform array to map for O(1) lookup
                const rateMap: Record<string, number> = {};
                if (Array.isArray(ratesData)) {
                    ratesData.forEach((r: ExchangeRate) => {
                        rateMap[r.targetCurrency] = r.rate;
                    });
                }
                // USD is always base 1
                rateMap['USD'] = 1;
                setRates(rateMap);

                // Fetch user preferences from backend (same API as core frontend)
                if (isAuthenticated) {
                    try {
                        const prefs = await authenticatedFetch<UserPreferences>(
                            `${API_BASE}/user/preferences`
                        );
                        if (prefs?.currency && rateMap[prefs.currency]) {
                            setCurrencyState(prefs.currency);
                        }
                    } catch (prefsError) {
                        console.warn('[CurrencyContext] Failed to fetch preferences, checking localStorage:', prefsError);
                        // Fallback to localStorage
                        const cached = typeof window !== 'undefined' ? localStorage.getItem('pearto_currency') : null;
                        if (cached && rateMap[cached]) {
                            setCurrencyState(cached);
                        }
                    }
                } else {
                    // Not authenticated — use localStorage cache
                    const cached = typeof window !== 'undefined' ? localStorage.getItem('pearto_currency') : null;
                    if (cached && rateMap[cached]) {
                        setCurrencyState(cached);
                    }
                }

            } catch (error) {
                console.error('Failed to init currency context:', error);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [isAuthenticated]);

    const setCurrency = (code: string) => {
        setCurrencyState(code);

        // Always cache in localStorage for fast initial load
        if (typeof window !== 'undefined') {
            localStorage.setItem('pearto_currency', code);
        }

        // Persist to backend if authenticated (fire-and-forget)
        if (isAuthenticated) {
            authenticatedFetch(`${API_BASE}/user/preferences`, {
                method: 'PUT',
                body: JSON.stringify({ currency: code }),
            }).catch((err) => {
                console.warn('[CurrencyContext] Failed to persist currency preference:', err);
            });
        }
    };

    const convertPrice = (amount: number) => {
        if (amount === undefined || amount === null) return 0;
        if (currency === 'USD') return amount;

        const rate = rates[currency];
        if (!rate) return amount; // Fallback to USD if rate missing

        return amount * rate;
    };

    const formatPrice = (amount: number, minimumFractionDigits = 2, maximumFractionDigits = 2, options: Intl.NumberFormatOptions = {}) => {
        // Handle invalid inputs gracefully
        if (amount === undefined || amount === null || isNaN(amount)) return '-';

        const converted = convertPrice(amount);

        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits,
                maximumFractionDigits,
                ...options
            }).format(converted);
        } catch (e) {
            // Fallback for invalid currency codes
            return `$${amount.toFixed(2)}`;
        }
    };

    const getSymbol = () => {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).formatToParts(0).find(x => x.type === 'currency')?.value || currency;
        } catch (e) {
            return '$';
        }
    };

    return (
        <CurrencyContext.Provider value={{ currency, symbol: getSymbol(), rates, loading, setCurrency, convertPrice, formatPrice }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
