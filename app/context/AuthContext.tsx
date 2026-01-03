'use client';

/**
 * Auth Context
 * Handles user authentication with the core server API
 * - Login/Logout/Signup
 * - Google Sign-in (Firebase)
 * - Role-based access control
 */

import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from 'react';

export type BaseRole = 'user' | 'admin' | 'author' | 'reporter' | 'employee' | 'vendor';
export type Role = BaseRole | string;

export type VerificationFlags = { email?: boolean; mobile?: boolean; twoFA?: boolean; kyc?: boolean };

export type User = {
    id?: number;
    name: string;
    email: string;
    role: Role;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    coverUrl?: string;
    verifications?: VerificationFlags;
    lastLoginAt?: string;
};

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isVendor: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string, referralCode?: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (updates: Partial<Pick<User, 'name' | 'firstName' | 'lastName' | 'avatarUrl' | 'coverUrl'>>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'auth_user';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        try {
            const raw = typeof window !== 'undefined' ? localStorage.getItem(AUTH_USER_KEY) : null;
            if (raw) {
                setUser(JSON.parse(raw));
            }
        } catch {
            /* ignore */
        }
        setIsLoading(false);
    }, []);

    // Fetch avatar from server to ensure it persists across refreshes
    useEffect(() => {
        const fetchServerProfile = async () => {
            if (!user?.email) return;
            try {
                const res = await fetch(`${API_BASE}/api/user/profile`, {
                    headers: { 'x-user-email': user.email }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.avatar_url && data.avatar_url !== user.avatarUrl) {
                        const updated = { ...user, avatarUrl: data.avatar_url };
                        setUser(updated);
                        if (typeof window !== 'undefined') {
                            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
                        }
                    }
                }
            } catch {
                /* ignore server errors */
            }
        };
        fetchServerProfile();
    }, [user?.email]);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Invalid email or password');
            }

            const data = await response.json();

            const u: User = {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role as Role,
                avatarUrl: data.user.avatarUrl,
                firstName: data.user.name?.split(' ')[0],
                lastName: data.user.name?.split(' ').slice(1).join(' '),
                verifications: { email: true },
                lastLoginAt: new Date().toISOString(),
            };

            if (typeof window !== 'undefined') {
                localStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
            }
            setUser(u);

            // Track session
            try {
                await fetch(`${API_BASE}/api/auth/track-session`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-email': email,
                    },
                    body: JSON.stringify({ email }),
                });
            } catch (sessionError) {
                console.error('Session tracking error:', sessionError);
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }, []);

    const signup = useCallback(async (name: string, email: string, password: string, referralCode?: string) => {
        try {
            const response = await fetch(`${API_BASE}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, referralCode }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Signup failed');
            }

            const data = await response.json();

            const firstName = name.split(' ')[0];
            const lastName = name.split(' ').slice(1).join(' ');

            const u: User = {
                id: data.user?.id,
                name,
                email,
                role: 'user',
                firstName,
                lastName,
                verifications: { email: true },
                lastLoginAt: new Date().toISOString(),
                avatarUrl: data.user?.avatarUrl
            };

            if (typeof window !== 'undefined') {
                localStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
            }
            setUser(u);

            // Track session
            try {
                await fetch(`${API_BASE}/api/auth/track-session`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-email': email,
                    },
                    body: JSON.stringify({ email }),
                });
            } catch (sessionError) {
                console.error('Session tracking error:', sessionError);
            }
        } catch (error) {
            throw error;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            if (user?.email) {
                await fetch(`${API_BASE}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-email': user.email,
                    },
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        }

        if (typeof window !== 'undefined') {
            localStorage.removeItem(AUTH_USER_KEY);
        }
        setUser(null);
    }, [user?.email]);

    const updateProfile = useCallback(async (updates: Partial<Pick<User, 'name' | 'firstName' | 'lastName' | 'avatarUrl' | 'coverUrl'>>) => {
        if (!user) return;

        const updated: User = { ...user, ...updates };
        if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
        }
        setUser(updated);

        // Update on server
        try {
            await fetch(`${API_BASE}/api/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': user.email,
                },
                body: JSON.stringify(updates),
            });
        } catch (error) {
            console.error('Profile update error:', error);
        }
    }, [user]);

    const value = useMemo(() => ({
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isVendor: user?.role === 'vendor' || user?.role === 'admin',
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
    }), [user, isLoading, login, signup, logout, updateProfile]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export default AuthContext;
