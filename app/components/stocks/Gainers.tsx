'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { stockAPI } from '../../utils/api';
import { Stock } from '../../types';
import Link from 'next/link';
import PriceDisplay from '../common/PriceDisplay';

interface GainersProps {
  className?: string;
}

export default function Gainers({ className = '' }: GainersProps) {
  const [gainers, setGainers] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGainers = async () => {
      try {
        setIsLoading(true);
        const response = await stockAPI.getGainers();

        if (response.success && response.data) {
          setGainers(response.data);
        }
      } catch (error) {
        console.error('[Gainers] Error fetching gainers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGainers();
  }, []);

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

  const refreshData = () => {
    window.location.reload();
  };

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-pearto-green/10 rounded-lg transition-colors duration-300">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-pearto-green transition-colors duration-300" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-medium text-slate-900 dark:text-white transition-colors duration-300">Top Gainers</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 transition-colors duration-300">Stocks with the highest gains today</p>
            </div>
          </div>
          <button
            onClick={refreshData}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Gainers List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 sm:py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : gainers.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-slate-500 dark:text-slate-400 transition-colors duration-300">No gainers data available at the moment.</p>
          </div>
        ) : (
          <>
            {/* Mobile View - Horizontal Scroll Table */}
            <div className="block lg:hidden overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700 border-b-2 border-green-200 dark:border-gray-600">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-green-700 dark:text-green-400 uppercase">Stock</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-green-700 dark:text-green-400 uppercase">Price</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-green-700 dark:text-green-400 uppercase">Change</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-green-700 dark:text-green-400 uppercase">Volume</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-green-700 dark:text-green-400 uppercase">MCap</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {gainers.map((stock) => (
                    <tr key={stock.symbol} className="hover:bg-green-50/50 dark:hover:bg-gray-700/50">
                      <td className="px-3 py-3 whitespace-nowrap">
                        <Link href={`/stock/${stock.symbol.toLowerCase()}`}>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">{stock.symbol}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[100px]">{stock.name}</div>
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-right text-sm font-medium text-slate-900 dark:text-white">
                        <PriceDisplay amount={stock.price} />
                      </td>
                      <td className="px-3 py-3 text-right text-sm font-medium text-green-600 dark:text-pearto-green">
                        +{stock.changePercent.toFixed(2)}%
                      </td>
                      <td className="px-3 py-3 text-right text-sm text-slate-900 dark:text-white">{formatNumber(stock.volume || 0)}</td>
                      <td className="px-3 py-3 text-right text-sm text-slate-900 dark:text-white">{formatMarketCap(stock.marketCap)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block">
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white transition-colors duration-300">
                  {gainers.length} Top Performing Stocks
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-pearto-border text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800 transition-colors duration-300">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase transition-colors duration-300">Rank</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase transition-colors duration-300">Stock</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase transition-colors duration-300">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase transition-colors duration-300">Change</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase transition-colors duration-300">Volume</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase transition-colors duration-300">Market Cap</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase transition-colors duration-300">Sector</th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-50 dark:bg-slate-800 divide-y divide-gray-200 dark:divide-pearto-border transition-colors duration-300">
                    {gainers.map((stock, index) => (
                      <motion.tr
                        key={stock.symbol}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">#{index + 1}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <Link href={`/stock/${stock.symbol.toLowerCase()}`} className="block">
                            <div className="text-center">
                              <div className="text-sm font-medium text-slate-900 dark:text-white mb-1 transition-colors duration-300">{stock.symbol}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px] mx-auto transition-colors duration-300">{stock.name}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <PriceDisplay amount={stock.price} className="text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300" />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-green-600 dark:text-pearto-green font-medium transition-colors duration-300">
                              +{stock.changePercent.toFixed(2)}%
                            </div>
                            <div className="text-green-600 dark:text-pearto-green text-sm ml-2 transition-colors duration-300">
                              <PriceDisplay amount={stock.change} showSign />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900 dark:text-white transition-colors duration-300">
                          {formatNumber(stock.volume || 0)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900 dark:text-white transition-colors duration-300">
                          {formatMarketCap(stock.marketCap)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center">
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                            {stock.sector || 'Unknown'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
