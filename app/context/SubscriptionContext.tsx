'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface SubscriptionContextType {
  planName: string;
  isPro: boolean;
  status: string;
  loading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  planName: 'Free',
  isPro: false,
  status: 'inactive',
  loading: true,
});

export const useSubscription = () => useContext(SubscriptionContext);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [planName, setPlanName] = useState('Free');
  const [isPro, setIsPro] = useState(false);
  const [status, setStatus] = useState('inactive');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!isAuthenticated) {
        setPlanName('Free');
        setIsPro(false);
        setStatus('inactive');
        setLoading(false);
        return;
      }

      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://apipearto.ashlya.com/api';
        const token = localStorage.getItem('token');
        
        const res = await fetch(`${API_BASE}/subscription/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          setPlanName(data.planName || 'Free');
          setIsPro(data.isPro || false);
          setStatus(data.status || 'inactive');
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [isAuthenticated, user]);

  return (
    <SubscriptionContext.Provider value={{ planName, isPro, status, loading }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
