'use client';

/**
 * Country Context
 * Manages user's country for country-specific data filtering
 * - Auto-detects via IP (server-side)
 * - Allows manual override (stored in localStorage)
 * - Sends X-User-Country header with API calls
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// Country interface matching backend schema
interface Country {
    code: string;
    name: string;
    native_name?: string;
    currency_code?: string;
    currency_symbol?: string;
    flag_emoji?: string;
    default_market_index?: string;
}

interface CountryContextType {
    country: string; // ISO-2 country code
    countryData: Country | null;
    countries: Country[];
    isLoading: boolean;
    source: 'auto' | 'manual'; // auto = IP detected, manual = user override
    setCountry: (code: string) => void;
    clearOverride: () => void; // Reset to auto-detect
    refreshCountries: () => Promise<void>;
}

const CountryContext = createContext<CountryContextType | null>(null);

const STORAGE_KEY = 'user_country_override';
const DEFAULT_COUNTRY = 'US';

/**
 * Get country header for API requests
 */
export function getCountryHeader(country?: string): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const code = country || localStorage.getItem(STORAGE_KEY) || '';
    return code ? { 'X-User-Country': code } : {};
}

/**
 * Get current country code from localStorage
 */
export function getCurrentCountry(): string {
    if (typeof window === 'undefined') return DEFAULT_COUNTRY;
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_COUNTRY;
}

interface CountryProviderProps {
    children: ReactNode;
}

export function CountryProvider({ children }: CountryProviderProps) {
    const [country, setCountryState] = useState<string>(DEFAULT_COUNTRY);
    const [countryData, setCountryData] = useState<Country | null>(null);
    const [countries, setCountries] = useState<Country[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [source, setSource] = useState<'auto' | 'manual'>('auto');

    // Fetch list of active countries
    const refreshCountries = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/countries`);
            if (res.ok) {
                const data = await res.json();
                setCountries(data.countries || []);
                return data.countries || [];
            }
        } catch (e) {
            console.warn('[CountryContext] Failed to fetch countries:', e);
        }
        return [];
    }, []);

    // Auto-detect country from server
    const detectCountry = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/geo`);
            if (res.ok) {
                const data = await res.json();
                return data.country || DEFAULT_COUNTRY;
            }
        } catch (e) {
            console.warn('[CountryContext] Geo detection failed:', e);
        }
        return DEFAULT_COUNTRY;
    }, []);

    // Initialize on mount
    useEffect(() => {
        const init = async () => {
            setIsLoading(true);

            // Check for manual override first
            const override = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;

            // Fetch countries list
            const countryList = await refreshCountries();

            let selectedCode: string;
            if (override && countryList.some((c: Country) => c.code === override)) {
                selectedCode = override;
                setSource('manual');
            } else {
                // Auto-detect from IP
                selectedCode = await detectCountry();
                setSource('auto');
            }

            setCountryState(selectedCode);

            // Set detailed country data
            const found = countryList.find((c: Country) => c.code === selectedCode);
            setCountryData(found || null);

            setIsLoading(false);
        };

        init();
    }, [refreshCountries, detectCountry]);

    // Set country manually
    const setCountry = useCallback((code: string) => {
        const upperCode = code.toUpperCase();
        setCountryState(upperCode);
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, upperCode);
        }
        setSource('manual');

        // Update country data
        const found = countries.find(c => c.code === upperCode);
        setCountryData(found || null);
    }, [countries]);

    // Clear manual override and return to auto-detect
    const clearOverride = useCallback(async () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
        }
        setSource('auto');

        const detected = await detectCountry();
        setCountryState(detected);

        const found = countries.find(c => c.code === detected);
        setCountryData(found || null);
    }, [detectCountry, countries]);

    const value: CountryContextType = {
        country,
        countryData,
        countries,
        isLoading,
        source,
        setCountry,
        clearOverride,
        refreshCountries
    };

    return (
        <CountryContext.Provider value={value}>
            {children}
        </CountryContext.Provider>
    );
}

/**
 * Hook to access country context
 */
export function useCountry() {
    const context = useContext(CountryContext);
    if (!context) {
        throw new Error('useCountry must be used within a CountryProvider');
    }
    return context;
}

/**
 * Hook to get country header for fetch calls
 */
export function useCountryHeader() {
    const { country } = useCountry();
    return { 'X-User-Country': country };
}

export default CountryContext;
