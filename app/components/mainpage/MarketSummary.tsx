'use client';

import React, { useState, useEffect } from 'react';
import { marketService } from '../../utils/marketService';
import { BarChart3, TrendingUp, TrendingDown, Activity, Volume } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface MarketSummaryProps {
  className?: string;
}

export default function MarketSummary({ className = '' }: MarketSummaryProps) {
  const [marketStats, setMarketStats] = useState<{
    totalVolume: number;
    advancers: number;
    decliners: number;
    unchanged: number;
    marketSentiment: 'bullish' | 'bearish' | 'neutral';
  }>({
    totalVolume: 0,
    advancers: 0,
    decliners: 0,
    unchanged: 0,
    marketSentiment: 'neutral'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketStats = async () => {
      try {
        setLoading(true);
        const data = await marketService.getMarketOverview();
        
        if (data) {
          const total = (data.advancers || 0) + (data.decliners || 0) + (data.unchanged || 0);
          const sentiment = (data.advancers || 0) > (data.decliners || 0) ? 'bullish' :
                          (data.advancers || 0) < (data.decliners || 0) ? 'bearish' : 'neutral';
          
          setMarketStats({
            totalVolume: data.totalVolume || 0,
            advancers: data.advancers || 0,
            decliners: data.decliners || 0,
            unchanged: data.unchanged || 0,
            marketSentiment: sentiment
          });
        }
      } catch (error) {
        console.error('Failed to fetch market stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketStats();
  }, []);

  const formatVolume = (volume: number) => {
    if (volume >= 1e12) return `${(volume / 1e12).toFixed(1)}T`;
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toLocaleString();
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-600 dark:text-pearto-green bg-green-50 dark:bg-pearto-green/10';
      case 'bearish': return 'text-red-600 dark:text-pearto-pink bg-red-50 dark:bg-pearto-pink/10';
      default: return 'text-gray-600 dark:text-pearto-cloud bg-gray-50 dark:bg-pearto-surface';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="h-4 w-4" />;
      case 'bearish': return <TrendingDown className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  // Donut chart data
  const chartData = {
    labels: ['Advancers', 'Decliners', 'Unchanged'],
    datasets: [
      {
        data: [marketStats.advancers, marketStats.decliners, marketStats.unchanged],
        backgroundColor: [
          '#10b981', // emerald-500
          '#ef4444', // red-500  
          '#6b7280', // gray-500
        ],
        borderColor: [
          '#ffffff',
          '#ffffff',
          '#ffffff',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed as number) / total * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%',
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-pearto-card rounded-xl shadow-sm p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-pearto-cloud transition-colors duration-300">Loading market summary...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-pearto-card rounded-xl shadow-lg border border-gray-200 dark:border-pearto-border p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-pearto-luna flex items-center transition-colors duration-300">
          <span className="w-2 h-5 bg-emerald-600 dark:bg-pearto-pink rounded-full mr-2 transition-colors duration-300"></span>
          Market Summary
        </h2>
        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getSentimentColor(marketStats.marketSentiment)}`}>
          {getSentimentIcon(marketStats.marketSentiment)}
          <span className="ml-1 capitalize">{marketStats.marketSentiment}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Donut Chart - Smaller */}
        <div className="flex flex-col items-center">
          <div className="w-48 h-48 relative">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Market Stats - More Compact */}
        <div className="space-y-3">
          <div className="bg-gray-50 dark:bg-pearto-surface rounded-lg p-3 transition-colors duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-pearto-cloud transition-colors duration-300">Total Volume</span>
              <Volume className="h-3 w-3 text-gray-400" />
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-pearto-luna transition-colors duration-300">
              {formatVolume(marketStats.totalVolume)}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-50 dark:bg-pearto-green/10 rounded-lg p-2 text-center transition-colors duration-300">
              <div className="text-sm font-bold text-green-600 dark:text-pearto-green transition-colors duration-300">{marketStats.advancers}</div>
              <div className="text-xs text-green-600 dark:text-pearto-green transition-colors duration-300">Advancers</div>
            </div>
            <div className="bg-red-50 dark:bg-pearto-pink/10 rounded-lg p-2 text-center transition-colors duration-300">
              <div className="text-sm font-bold text-red-600 dark:text-pearto-pink transition-colors duration-300">{marketStats.decliners}</div>
              <div className="text-xs text-red-600 dark:text-pearto-pink transition-colors duration-300">Decliners</div>
            </div>
            <div className="bg-gray-50 dark:bg-pearto-surface rounded-lg p-2 text-center transition-colors duration-300">
              <div className="text-sm font-bold text-gray-600 dark:text-pearto-cloud transition-colors duration-300">{marketStats.unchanged}</div>
              <div className="text-xs text-gray-600 dark:text-pearto-cloud transition-colors duration-300">Unchanged</div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-700">Market Participation</span>
              <BarChart3 className="h-3 w-3 text-emerald-600 dark:text-pearto-green transition-colors duration-300" />
            </div>
            <div className="text-sm font-semibold text-emerald-800 mt-1">
              {marketStats.advancers + marketStats.decliners + marketStats.unchanged > 0 
                ? `${Math.round((marketStats.unchanged / (marketStats.advancers + marketStats.decliners + marketStats.unchanged)) * 100)}% of all stocks`
                : 'Loading...'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
