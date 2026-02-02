'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// FIXED: Interface now matches your JSON structure exactly
export interface Country {
    code: string;
    name: string;
    nativeName?: string | null;
    currencyCode?: string;
    currencySymbol?: string;
    flagEmoji?: string;
    defaultMarketIndex?: string | null;
}

interface CountryContextType {
    country: string;
    countryData: Country | null;
    countries: Country[];
    isLoading: boolean;
    source: 'auto' | 'manual';
    setCountry: (code: string) => void;
    clearOverride: () => void;
    refreshCountries: () => Promise<Country[]>;
}

// FIXED: Initialized with null and correct Type
const CountryContext = createContext<CountryContextType | null>(null);

const STORAGE_KEY = 'user_country_override';
const DEFAULT_COUNTRY = 'US';

export function getCountryHeader(country?: string): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const code = country || localStorage.getItem(STORAGE_KEY) || '';
    return code ? { 'X-User-Country': code } : {};
}

export function getCurrentCountry(): string {
    if (typeof window === 'undefined') return DEFAULT_COUNTRY;
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_COUNTRY;
}

export function CountryProvider({ children }: { children: ReactNode }) {
    const [country, setCountryState] = useState<string>(DEFAULT_COUNTRY);
    const [countryData, setCountryData] = useState<Country | null>(null);
    const [countries, setCountries] = useState<Country[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [source, setSource] = useState<'auto' | 'manual'>('auto');

    const refreshCountries = useCallback(async (): Promise<Country[]> => {
        try {
            const res = await fetch(`${API_BASE}/countries`);
            if (res.ok) {
                const data = await res.json();
                // Check if the data is the array itself or inside a 'countries' key
                const list = Array.isArray(data) ? data : (data.countries || []);
                setCountries(list);
                return list;
            }
        } catch (e) {
            console.error("Failed to fetch countries:", e);
        }
        return [];
    }, []);

    const detectCountry = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/geo`);
            if (res.ok) {
                const data = await res.json();
                return data.countryCode || DEFAULT_COUNTRY;
            }
        } catch (e) {
            console.error("Geo-detection failed:", e);
        }
        return DEFAULT_COUNTRY;
    }, []);

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            const override = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
            const countryList = await refreshCountries();

            let selectedCode: string;
            if (override && countryList.length > 0 && countryList.some((c: Country) => c.code === override)) {
                selectedCode = override;
                setSource('manual');
            } else {
                selectedCode = await detectCountry();
                setSource('auto');
            }

            setCountryState(selectedCode);
            const found = countryList.find((c: Country) => c.code === selectedCode);
            setCountryData(found || null);
            setIsLoading(false);
        };
        init();
    }, [refreshCountries, detectCountry]);

    const setCountry = useCallback((code: string) => {
        const upperCode = code.toUpperCase();
        setCountryState(upperCode);
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, upperCode);
        }
        setSource('manual');
        // FIXED: Explicit type for 'c'
        const found = countries.find((c: Country) => c.code === upperCode);
        setCountryData(found || null);
    }, [countries]);

    const clearOverride = useCallback(async () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
        }
        setSource('auto');
        const detected = await detectCountry();
        setCountryState(detected);
        // FIXED: Explicit type for 'c'
        const found = countries.find((c: Country) => c.code === detected);
        setCountryData(found || null);
    }, [detectCountry, countries]);

    const value = {
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

// Named exports for hooks
export function useCountry() {
    const context = useContext(CountryContext);
    if (!context) {
        throw new Error('useCountry must be used within a CountryProvider');
    }
    return context;
}

export function useCountryHeader() {
    const { country } = useCountry();
    return { 'X-User-Country': country };
}