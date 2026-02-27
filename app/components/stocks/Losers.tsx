'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, RefreshCw } from 'lucide-react';
import { stockAPI } from '../../utils/api';
import { Stock } from '../../types';
import Link from 'next/link';
import PriceDisplay from '../common/PriceDisplay';
import { TableExportButton } from '../common/TableExportButton';

interface LosersProps {
  className?: string;
}

export default function Losers({ className = '' }: LosersProps) {
  const [losers, setLosers] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLosers = async () => {
      try {
        setIsLoading(true);
        const response = await stockAPI.getLosers();

        if (response.success && response.data) {
          setLosers(response.data);
        }
      } catch (error) {
        console.error('[Losers] Error fetching losers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLosers();
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
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-medium text-slate-900 dark:text-white">Top Losers</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Stocks with the biggest declines today</p>
            </div>
          </div>
          <button
            onClick={refreshData}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Losers List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 sm:py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : losers.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-slate-500 dark:text-slate-400 transition-colors duration-300">No losers data available at the moment.</p>
          </div>
        ) : (
          <>
            {/* Mobile View - Horizontal Scroll Table */}
            <div className="block lg:hidden">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Top Losers</h3>
                <TableExportButton
                  data={losers}
                  columns={[
                    { key: 'symbol', label: 'Symbol', format: 'text' },
                    { key: 'name', label: 'Name', format: 'text' },
                    { key: 'price', label: 'Price', format: 'currency' },
                    { key: 'changePercent', label: 'Change %', format: 'percent' },
                    { key: 'volume', label: 'Volume', format: 'number' },
                    { key: 'marketCap', label: 'Market Cap', format: 'number' }
                  ]}
                  filename="top-losers"
                  variant="icon"
                />
              </div>
              <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Change</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Volume</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">MCap</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900/95 divide-y divide-slate-100 dark:divide-slate-800">
                  {losers.map((stock) => (
                    <tr key={stock.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-3 py-3 whitespace-nowrap">
                        <Link href={`/stock/${stock.symbol.toLowerCase()}`}>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">{stock.symbol}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[100px]">{stock.name}</div>
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-right text-sm font-medium text-slate-900 dark:text-white">
                        <PriceDisplay amount={stock.price} />
                      </td>
                      <td className="px-3 py-3 text-right text-sm font-medium text-red-600 dark:text-pearto-pink">
                        {stock.changePercent.toFixed(2)}%
                      </td>
                      <td className="px-3 py-3 text-right text-sm text-slate-900 dark:text-white">{formatNumber(stock.volume || 0)}</td>
                      <td className="px-3 py-3 text-right text-sm text-slate-900 dark:text-white">{formatMarketCap(stock.marketCap)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white">Top Losers</h3>
                <div className="flex items-center gap-2">
                  <TableExportButton
                    data={losers}
                    columns={[
                      { key: 'symbol', label: 'Symbol', format: 'text' },
                      { key: 'name', label: 'Name', format: 'text' },
                      { key: 'price', label: 'Price', format: 'currency' },
                      { key: 'changePercent', label: 'Change %', format: 'percent' },
                      { key: 'volume', label: 'Volume', format: 'number' },
                      { key: 'marketCap', label: 'Market Cap', format: 'number' },
                      { key: 'sector', label: 'Sector', format: 'text' }
                    ]}
                    filename="top-losers"
                    title="Top Losers"
                    variant="compact"
                    className="hidden sm:flex"
                  />
                  <TableExportButton
                    data={losers}
                    columns={[
                      { key: 'symbol', label: 'Symbol', format: 'text' },
                      { key: 'name', label: 'Name', format: 'text' },
                      { key: 'price', label: 'Price', format: 'currency' },
                      { key: 'changePercent', label: 'Change %', format: 'percent' },
                      { key: 'volume', label: 'Volume', format: 'number' },
                      { key: 'marketCap', label: 'Market Cap', format: 'number' }
                    ]}
                    filename="top-losers"
                    variant="icon"
                    className="sm:hidden"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Change</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Volume</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Market Cap</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden xl:table-cell">Sector</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {losers.map((stock, index) => (
                      <motion.tr
                        key={stock.symbol}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer group"
                      >
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">#{index + 1}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/stock/${stock.symbol.toLowerCase()}`} className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs">
                              {stock.symbol?.slice(0, 2)}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">{stock.symbol}</span>
                              <div className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1 max-w-[200px]">{stock.name}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            <PriceDisplay amount={stock.price} />
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 font-medium text-red-500">
                            <span>${Math.abs(stock.change || 0).toFixed(2)} ({(stock.changePercent || 0).toFixed(2)}%)</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400 text-sm hidden lg:table-cell">
                          {formatNumber(stock.volume || 0)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400 text-sm hidden md:table-cell">
                          {formatMarketCap(stock.marketCap)}
                        </td>
                        <td className="px-4 py-3 text-center hidden xl:table-cell">
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-blue-100  dark:bg-slate-900/95 text-blue-800 dark:text-slate-300 text-xs font-medium">
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
