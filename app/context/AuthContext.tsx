'use client';

/**
 * Unified Auth Context
 * Integrates JWT utility patterns with robust UI helpers and profile syncing.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
// Importing from your new utility pattern
import { login as apiLogin, register as apiRegister, logout as apiLogout, isAuthenticated as checkAuth, getCurrentUser, getAuthHeaders } from '../utils/auth';

export type Role = 'user' | 'admin' | 'author' | 'reporter' | 'employee' | 'vendor' | string;

export interface User {
  id: string | number;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatarUrl?: string;
  lastLoginAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVendor: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://apipearto.ashlya.com/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to transform backend data to our User interface
  const mapUserData = useCallback((data: any): User => {
    console.log('Mapping user data:', data); // Debug log
    return {
      id: data.user_id || data.id,
      email: data.email,
      name: data.name || `${data.first_name || data.firstName || ''} ${data.last_name || data.lastName || ''}`.trim() || data.email?.split('@')[0] || 'User',
      firstName: data.first_name || data.firstName || '',
      lastName: data.last_name || data.lastName || '',
      role: data.role || 'user',
      avatarUrl: data.avatar_url || data.avatarUrl,
      lastLoginAt: data.last_login_at || data.lastLoginAt
    };
  }, []);

  // Initialize Auth
  useEffect(() => {
    const initAuth = async () => {
      if (checkAuth()) {
        // Fetch full profile from API
        try {
          const res = await fetch(`${API_BASE}/user/profile`, {
            headers: getAuthHeaders()
          });
          if (res.ok) {
            const data = await res.json();
            setUser(mapUserData(data));
          } else {
            // Fallback to token data
            const userData = getCurrentUser();
            if (userData) setUser(mapUserData(userData));
          }
        } catch (err) {
          // Fallback to token data
          const userData = getCurrentUser();
          if (userData) setUser(mapUserData(userData));
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [mapUserData]);

  const handleLogin = useCallback(async (email: string, password: string) => {
    const response = await apiLogin({ email, password });
    setUser(mapUserData(response.user));
  }, [mapUserData]);

  const handleRegister = useCallback(async (name: string, email: string, password: string) => {
    const firstName = name.split(' ')[0];
    const lastName = name.split(' ').slice(1).join(' ');
    const response = await apiRegister({ name, email, password });
    setUser(mapUserData(response.user));
  }, [mapUserData]);

  const handleLogout = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Update failed');
      const data = await res.json();
      setUser(mapUserData(data));
    } catch (err) { 
      console.error('Profile update failed', err); 
      throw err; 
    }
  }, [user, mapUserData]);

  const refreshUser = useCallback(async () => {
    if (!checkAuth()) return;
    try {
      const res = await fetch(`${API_BASE}/user/profile`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setUser(mapUserData(data));
      }
    } catch (err) {
      console.error('Profile refresh failed', err);
    }
  }, [mapUserData]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isVendor: user?.role === 'vendor' || user?.role === 'admin',
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateProfile,
    refreshUser
  }), [user, isLoading, handleLogin, handleRegister, handleLogout, updateProfile, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hooks
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export function useRequireAuth() {
  const auth = useAuth();
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
  }, [auth.isAuthenticated, auth.isLoading]);
  return auth;
}