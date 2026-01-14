'use client';

/**
 * useUserApi Hook
 * 
 * Provides a standardized way for user-facing pages to make API calls
 * with automatic country context from geo-detection or user preference.
 * Includes JWT authentication support matching backend patterns.
 * 
 * Usage:
 *   const api = useUserApi();
 *   const data = await api.get('/api/posts');
 *   await api.post('/api/contact', { message: 'Hello' });
 */

import { useCallback } from 'react';
import { useCountry } from '@/app/context/CountryContext';
import { getAuthHeaders, isAuthenticated } from '@/app/utils/auth';

interface ApiOptions {
    headers?: Record<string, string>;
    requireAuth?: boolean;
}

export function useUserApi() {
    const { country } = useCountry();

    const buildHeaders = useCallback((extra?: Record<string, string>, requireAuth = false) => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-User-Country': country || 'US',
            ...extra
        };
        
        // Add auth headers if required or if user is authenticated
        if (requireAuth || isAuthenticated()) {
            Object.assign(headers, getAuthHeaders());
        }
        
        return headers;
    }, [country]);

    const get = useCallback(async <T = unknown>(url: string, options?: ApiOptions): Promise<T> => {
        const response = await fetch(url, {
            method: 'GET',
            headers: buildHeaders(options?.headers, options?.requireAuth),
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        return response.json();
    }, [buildHeaders]);

    const post = useCallback(async <T = unknown>(url: string, data?: unknown, options?: ApiOptions): Promise<T> => {
        const response = await fetch(url, {
            method: 'POST',
            headers: buildHeaders(options?.headers, options?.requireAuth),
            body: data ? JSON.stringify(data) : undefined,
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        return response.json();
    }, [buildHeaders]);

    const put = useCallback(async <T = unknown>(url: string, data?: unknown, options?: ApiOptions): Promise<T> => {
        const response = await fetch(url, {
            method: 'PUT',
            headers: buildHeaders(options?.headers, options?.requireAuth),
            body: data ? JSON.stringify(data) : undefined,
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        return response.json();
    }, [buildHeaders]);

    const del = useCallback(async <T = unknown>(url: string, options?: ApiOptions): Promise<T> => {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: buildHeaders(options?.headers, options?.requireAuth),
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        return response.json();
    }, [buildHeaders]);

    return {
        get,
        post,
        put,
        delete: del,
        countryCode: country,
        buildHeaders,
        isAuthenticated: isAuthenticated(),
    };
}

export default useUserApi;
