'use client';

/**
 * Authentication utilities for JWT token management
 * Matches backend JWT authentication patterns
 */

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

const TOKEN_KEY = 'auth_token';
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '';

// Get stored token
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

// Store token
export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

// Remove token
export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  
  try {
    // Basic JWT validation (check if not expired)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

// Get auth headers for API requests
export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Login user
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await response.json();
  setToken(data.token);
  return data;
}

// Register user
export async function register(userData: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  const data = await response.json();
  setToken(data.token);
  return data;
}

// Logout user
export function logout(): void {
  removeToken();
  // Redirect to login page if needed
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

// Get current user info from token
export function getCurrentUser(): any | null {
  const token = getToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

// Refresh token if needed
export async function refreshToken(): Promise<string | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      setToken(data.token);
      return data.token;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  return null;
}

// Make authenticated API request
export async function authenticatedFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // Get user data from localStorage
  const userCountry = typeof window !== 'undefined' ? localStorage.getItem('userCountry') || 'US' : 'US';
  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';
  
  const headers = {
    'Content-Type': 'application/json',
    'x-user-country': userCountry,
    'x-user-email': userEmail,
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Try to refresh token
    const newToken = await refreshToken();
    if (newToken) {
      // Retry with new token
      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };
      
      const retryResponse = await fetch(url, {
        ...options,
        headers: retryHeaders,
      });
      
      if (!retryResponse.ok) {
        throw new Error(`API Error: ${retryResponse.status}`);
      }
      
      return retryResponse.json();
    } else {
      // Refresh failed, logout user
      logout();
      throw new Error('Authentication required');
    }
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}