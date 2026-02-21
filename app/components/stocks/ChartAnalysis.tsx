'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Stock } from '../../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartAnalysisProps {
  stocks: Stock[];
  title: string;
  type: 'gainers' | 'losers' | 'trending';
}

export default function ChartAnalysis({ stocks, title, type }: ChartAnalysisProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const formatMarketCap = (value: number | undefined): string => {
    if (!value) return '—';
    if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    return value.toLocaleString();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Deep Analysis Data
  const analysisData = useMemo(() => {
    // Sector Distribution
    const sectorData = stocks.reduce((acc, stock) => {
      const sector = stock.sector || 'Unknown';
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Performance Ranges
    const performanceRanges = {
      'Excellent (>10%)': stocks.filter(s => Math.abs(s.changePercent) > 10).length,
      'Good (5-10%)': stocks.filter(s => Math.abs(s.changePercent) >= 5 && Math.abs(s.changePercent) <= 10).length,
      'Moderate (2-5%)': stocks.filter(s => Math.abs(s.changePercent) >= 2 && Math.abs(s.changePercent) < 5).length,
      'Mild (<2%)': stocks.filter(s => Math.abs(s.changePercent) < 2).length,
    };

    // Market Cap Categories
    const marketCapCategories = {
      'Large Cap (>10B)': stocks.filter(s => (s.marketCap || 0) > 1e10).length,
      'Mid Cap (2B-10B)': stocks.filter(s => (s.marketCap || 0) >= 2e9 && (s.marketCap || 0) <= 1e10).length,
      'Small Cap (<2B)': stocks.filter(s => (s.marketCap || 0) < 2e9).length,
    };

    // Volume Categories
    const volumeCategories = {
      'High Volume (>10M)': stocks.filter(s => (s.volume || 0) > 1e7).length,
      'Medium Volume (1M-10M)': stocks.filter(s => (s.volume || 0) >= 1e6 && (s.volume || 0) <= 1e7).length,
      'Low Volume (<1M)': stocks.filter(s => (s.volume || 0) < 1e6).length,
    };

    // Price Ranges
    const priceRanges = {
      'Premium (>200)': stocks.filter(s => s.price > 200).length,
      'High (100-200)': stocks.filter(s => s.price >= 100 && s.price <= 200).length,
      'Medium (50-100)': stocks.filter(s => s.price >= 50 && s.price < 100).length,
      'Budget (<50)': stocks.filter(s => s.price < 50).length,
    };

    return {
      sectorData,
      performanceRanges,
      marketCapCategories,
      volumeCategories,
      priceRanges,
    };
  }, [stocks]);

  const chartColors = [
    'rgba(59, 130, 246, 0.8)',   // Blue
    'rgba(34, 197, 94, 0.8)',    // Green
    'rgba(239, 68, 68, 0.8)',    // Red
    'rgba(147, 51, 234, 0.8)',   // Purple
    'rgba(251, 146, 60, 0.8)',   // Orange
    'rgba(250, 204, 21, 0.8)',   // Yellow
    'rgba(236, 72, 153, 0.8)',   // Pink
    'rgba(14, 165, 233, 0.8)',   // Sky
    'rgba(168, 85, 247, 0.8)',   // Violet
    'rgba(20, 184, 166, 0.8)',   // Teal
  ];

  const borderColors = chartColors.map(color => color.replace('0.8', '1'));

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 11,
          },
          padding: 10,
          color: isDark ? '#e2e8f0' : '#374151',
        },
      },
      title: {
        display: true,
        font: {
          size: 13,
          weight: 'bold' as const,
        },
        padding: {
          bottom: 15,
        },
        color: isDark ? '#f1f5f9' : '#111827',
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#f1f5f9' : '#111827',
        bodyColor: isDark ? '#cbd5e1' : '#4b5563',
        borderColor: isDark ? '#334155' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  const pieOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            size: 10,
          },
          padding: 8,
          color: isDark ? '#e2e8f0' : '#374151',
        },
      },
    },
  };

  // Prepare chart data
  const sectorChartData = {
    labels: Object.keys(analysisData.sectorData),
    datasets: [{
      data: Object.values(analysisData.sectorData),
      backgroundColor: chartColors,
      borderColor: borderColors,
      borderWidth: 2,
    }],
  };

  const performanceChartData = {
    labels: Object.keys(analysisData.performanceRanges),
    datasets: [{
      data: Object.values(analysisData.performanceRanges),
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',  // Excellent - Green
        'rgba(59, 130, 246, 0.8)',  // Good - Blue
        'rgba(251, 146, 60, 0.8)',  // Moderate - Orange
        'rgba(156, 163, 175, 0.8)', // Mild - Gray
      ],
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(59, 130, 246)',
        'rgb(251, 146, 60)',
        'rgb(156, 163, 175)',
      ],
      borderWidth: 2,
    }],
  };

  const marketCapChartData = {
    labels: Object.keys(analysisData.marketCapCategories),
    datasets: [{
      data: Object.values(analysisData.marketCapCategories),
      backgroundColor: [
        'rgba(147, 51, 234, 0.8)',  // Large Cap - Purple
        'rgba(59, 130, 246, 0.8)',  // Mid Cap - Blue
        'rgba(34, 197, 94, 0.8)',    // Small Cap - Green
      ],
      borderColor: [
        'rgb(147, 51, 234)',
        'rgb(59, 130, 246)',
        'rgb(34, 197, 94)',
      ],
      borderWidth: 2,
    }],
  };

  // Calculate key metrics
  const avgChange = stocks.reduce((sum, stock) => sum + stock.changePercent, 0) / stocks.length;
  const totalVolume = stocks.reduce((sum, stock) => sum + (stock.volume || 0), 0);
  const maxChange = Math.max(...stocks.map(s => Math.abs(s.changePercent)));

  return (
    <div className="space-y-4">
      {/* Header with Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 transition-colors duration-300"
      >
        <h3 className="text-base font-medium text-slate-900 dark:text-white mb-2 transition-colors duration-300">{title} Analysis</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-2 border border-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-800">
            <div className="text-blue-600 dark:text-blue-400 font-medium mb-1">Total Stocks</div>
            <div className="text-blue-900 dark:text-blue-100 font-medium text-sm">{stocks.length}</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-2 border border-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 dark:border-purple-800">
            <div className="text-purple-600 dark:text-purple-400 font-medium mb-1">Avg Change</div>
            <div className={`font-medium text-sm ${avgChange >= 0 ? 'text-green-600 dark:text-pearto-green' : 'text-red-600 dark:text-pearto-pink'}`}>
              {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-2 border border-green-200 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-800">
            <div className="text-green-600 dark:text-pearto-green font-medium mb-1 transition-colors duration-300">Total Volume</div>
            <div className="text-green-900 dark:text-green-100 font-medium text-sm">{formatNumber(totalVolume)}</div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-2 border border-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 dark:border-orange-800">
            <div className="text-orange-600 dark:text-orange-400 font-medium mb-1">Max Change</div>
            <div className="text-orange-900 dark:text-orange-100 font-medium text-sm">{maxChange.toFixed(1)}%</div>
          </div>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="space-y-3">
        {/* Sector Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 transition-colors duration-300"
        >
          <div className="h-48">
            <Pie 
              data={sectorChartData} 
              options={{
                ...pieOptions,
                plugins: {
                  ...pieOptions.plugins,
                  title: {
                    ...pieOptions.plugins.title,
                    text: 'Sectors',
                    color: isDark ? '#f1f5f9' : '#111827',
                  },
                  legend: {
                    ...pieOptions.plugins.legend,
                    labels: {
                      ...pieOptions.plugins.legend.labels,
                      color: isDark ? '#e2e8f0' : '#374151',
                    }
                  }
                }
              }} 
            />
          </div>
        </motion.div>

        {/* Performance Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 transition-colors duration-300"
        >
          <div className="h-48">
            <Doughnut 
              data={performanceChartData} 
              options={{
                ...pieOptions,
                plugins: {
                  ...pieOptions.plugins,
                  title: {
                    ...pieOptions.plugins.title,
                    text: 'Performance',
                    color: isDark ? '#f1f5f9' : '#111827',
                  },
                  legend: {
                    ...pieOptions.plugins.legend,
                    labels: {
                      ...pieOptions.plugins.legend.labels,
                      color: isDark ? '#e2e8f0' : '#374151',
                    }
                  }
                }
              }} 
            />
          </div>
        </motion.div>

        {/* Market Cap Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 transition-colors duration-300"
        >
          <div className="h-48">
            <Pie 
              data={marketCapChartData} 
              options={{
                ...pieOptions,
                plugins: {
                  ...pieOptions.plugins,
                  title: {
                    ...pieOptions.plugins.title,
                    text: 'Market Cap',
                    color: isDark ? '#f1f5f9' : '#111827',
                  },
                  legend: {
                    ...pieOptions.plugins.legend,
                    labels: {
                      ...pieOptions.plugins.legend.labels,
                      color: isDark ? '#e2e8f0' : '#374151',
                    }
                  }
                }
              }} 
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}