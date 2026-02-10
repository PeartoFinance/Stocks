'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function AuthSync() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshUser } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            // 1. Save token to localStorage (matching key used in utils/auth.ts)
            localStorage.setItem('auth_token', token);

            // 2. Refresh user state in AuthContext
            refreshUser();

            // 3. Clean up URL
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete('token');
            const newPath = `${window.location.pathname}${newParams.toString() ? `?${newParams.toString()}` : ''}`;
            router.replace(newPath);
        }
    }, [searchParams, router, refreshUser]);

    return null;
}
