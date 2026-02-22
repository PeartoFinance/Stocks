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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

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
      case 'bullish': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10';
      case 'bearish': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700';
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
          color: isDark ? '#ffffff' : '#374151',
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
      <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-slate-600 dark:text-slate-400 transition-colors duration-300">Loading market summary...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-slate-900 dark:text-white flex items-center transition-colors duration-300">
          <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full mr-3"></span>
          Market Summary
        </h2>
        <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors duration-300 ${getSentimentColor(marketStats.marketSentiment)}`}>
          {getSentimentIcon(marketStats.marketSentiment)}
          <span className="capitalize">{marketStats.marketSentiment}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {/* Donut Chart */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-52 h-52 relative">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Market Stats */}
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-750 rounded-xl p-4 transition-colors duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors duration-300">Total Volume</span>
              <Volume className="h-4 w-4 text-slate-500 dark:text-slate-400 transition-colors duration-300" />
            </div>
            <div className="text-2xl font-medium text-slate-900 dark:text-white transition-colors duration-300">
              {formatVolume(marketStats.totalVolume)}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-500/10 dark:to-green-500/5 rounded-xl p-3 text-center transition-colors duration-300">
              <div className="text-lg font-medium text-green-600 dark:text-green-400 transition-colors duration-300">{marketStats.advancers}</div>
              <div className="text-xs font-medium text-green-600 dark:text-green-400 mt-1 transition-colors duration-300">Advancers</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-500/10 dark:to-red-500/5 rounded-xl p-3 text-center transition-colors duration-300">
              <div className="text-lg font-medium text-red-600 dark:text-red-400 transition-colors duration-300">{marketStats.decliners}</div>
              <div className="text-xs font-medium text-red-600 dark:text-red-400 mt-1 transition-colors duration-300">Decliners</div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-750 rounded-xl p-3 text-center transition-colors duration-300 col-span-2 sm:col-span-1">
              <div className="text-lg font-medium text-slate-700 dark:text-slate-300 transition-colors duration-300">{marketStats.unchanged}</div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1 transition-colors duration-300">Unchanged</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-500/5 rounded-xl p-4 transition-colors duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400 transition-colors duration-300">Market Participation</span>
              <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
            </div>
            <div className="text-base font-medium text-blue-800 dark:text-blue-300 transition-colors duration-300">
              {marketStats.advancers + marketStats.decliners + marketStats.unchanged > 0 
                ? `${Math.round(((marketStats.advancers + marketStats.decliners) / (marketStats.advancers + marketStats.decliners + marketStats.unchanged)) * 100)}% Active`
                : 'Loading...'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
