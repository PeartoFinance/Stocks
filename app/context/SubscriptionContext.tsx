'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchSubscription } from '@/app/utils/subscriptionAPI';

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
    const loadSubscription = async () => {
      if (!isAuthenticated) {
        setPlanName('Free');
        setIsPro(false);
        setStatus('inactive');
        setLoading(false);
        return;
      }

      try {
        const data = await fetchSubscription();
        setPlanName(data.tier === 'free' ? 'Free' : data.tier.charAt(0).toUpperCase() + data.tier.slice(1));
        setIsPro(data.tier !== 'free');
        setStatus(data.status || 'inactive');
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
        setPlanName('Free');
        setIsPro(false);
        setStatus('inactive');
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [isAuthenticated, user]);

  return (
    <SubscriptionContext.Provider value={{ planName, isPro, status, loading }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
