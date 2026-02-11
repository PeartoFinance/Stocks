'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getRates, ExchangeRate } from '../services/currencyService';
import { useAuth } from './AuthContext';

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
    const { isAuthenticated, user } = useAuth();
    const [currency, setCurrencyState] = useState('USD');
    const [rates, setRates] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    // Initial load: Fetch rates + user prefs if auth
    useEffect(() => {
        async function init() {
            try {
                // Fetch rates
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

                // If user has a preference in their profile/settings, use it
                // Note: The AuthContext 'user' object might need to contain currency pref
                // If not, we might need a separate call to fetch user preferences
                // For now, check if user object has it, or default to USD
                if (isAuthenticated && user) {
                    // Temporarily using 'any' to check for currency property if it exists on user object
                    // In a real scenario, update User interface in AuthContext
                    const userCurrency = (user as any).currency || (user as any).settings?.currency;
                    if (userCurrency && rateMap[userCurrency]) {
                        setCurrencyState(userCurrency);
                    }
                }

            } catch (error) {
                console.error('Failed to init currency context:', error);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [isAuthenticated, user]);

    const setCurrency = (code: string) => {
        setCurrencyState(code);
        // TODO: Persist to backend if authenticated
        // This would require a userService similar to frontend
        if (typeof window !== 'undefined') {
            localStorage.setItem('pearto_currency', code);
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
