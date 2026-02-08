'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { stockAPI } from '../../utils/api';
import { Stock } from '../../types';
import ChartAnalysis from './ChartAnalysis';

interface ChartAnalysisWrapperProps {
  activeTab: 'all' | 'gainers' | 'losers' | 'trending';
}

export default function ChartAnalysisWrapper({ activeTab }: ChartAnalysisWrapperProps) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let response;
        switch (activeTab) {
          case 'gainers':
            response = await stockAPI.getGainers();
            break;
          case 'losers':
            response = await stockAPI.getLosers();
            break;
          case 'trending':
            response = await stockAPI.getTrendingStocks();
            break;
          case 'all':
          default:
            // For 'all' tab, we'll get a combination of all types
            const [gainersRes, losersRes, trendingRes] = await Promise.all([
              stockAPI.getGainers(),
              stockAPI.getLosers(),
              stockAPI.getTrendingStocks()
            ]);
            
            const allStocks = [
              ...(gainersRes.success ? gainersRes.data || [] : []),
              ...(losersRes.success ? losersRes.data || [] : []),
              ...(trendingRes.success ? trendingRes.data || [] : [])
            ];
            
            // Remove duplicates based on symbol
            const uniqueStocks = allStocks.filter((stock, index, self) =>
              index === self.findIndex((s) => s.symbol === stock.symbol)
            );
            
            setStocks(uniqueStocks.slice(0, 50)); // Limit to 50 for performance
            setIsLoading(false);
            return;
        }

        if (response.success && response.data) {
          setStocks(response.data);
        } else {
          setError('Failed to load data');
        }
      } catch (err) {
        console.error('[ChartAnalysisWrapper] Error fetching stocks:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStocks();
  }, [activeTab]);

  const getTitle = () => {
    switch (activeTab) {
      case 'gainers':
        return 'Top Gainers';
      case 'losers':
        return 'Top Losers';
      case 'trending':
        return 'Trending Stocks';
      case 'all':
      default:
        return 'Market Overview';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500 dark:text-pearto-gray transition-colors duration-300">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error || stocks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-pearto-gray transition-colors duration-300">{error || 'No data available'}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ChartAnalysis 
        stocks={stocks} 
        title={getTitle()} 
        type={activeTab === 'all' ? 'trending' : activeTab}
      />
    </motion.div>
  );
}
