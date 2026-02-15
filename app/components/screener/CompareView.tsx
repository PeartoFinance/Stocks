'use client';

import React from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { Stock } from '@/app/types';
import { formatChange, formatNumber, formatVolume } from '@/lib/utils';
import { useCurrency } from '@/app/context/CurrencyContext';
import Link from 'next/link';

interface Props {
  stocks: Stock[];
  onRemove: (symbol: string) => void;
  onClose: () => void;
}

export default function CompareView({ stocks, onRemove, onClose }: Props) {
  const { formatPrice } = useCurrency();

  if (stocks.length === 0) return null;

  const metrics: Array<{ label: string; key: string; format: (v: any) => string }> = [
    { label: 'Price', key: 'price', format: (v: any) => formatPrice(v) },
    { label: 'Change %', key: 'changePercent', format: (v: any) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` },
    { label: 'Market Cap', key: 'marketCap', format: (v: any) => formatNumber(v) },
    { label: 'P/E Ratio', key: 'peRatio', format: (v: any) => v ? v.toFixed(2) : 'N/A' },
    { label: 'Volume', key: 'volume', format: (v: any) => formatVolume(v) },
    { label: 'Dividend Yield', key: 'dividendYield', format: (v: any) => v ? `${v.toFixed(2)}%` : 'N/A' },
    { label: '52W High', key: 'week52High', format: (v: any) => v ? formatPrice(v) : 'N/A' },
    { label: '52W Low', key: 'week52Low', format: (v: any) => v ? formatPrice(v) : 'N/A' },
    { label: 'Beta', key: 'beta', format: (v: any) => v ? v.toFixed(2) : 'N/A' },
    { label: 'Sector', key: 'sector', format: (v: any) => v || 'N/A' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Compare Stocks ({stocks.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-auto max-h-[calc(90vh-80px)]">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Metric
                </th>
                {stocks.map((stock) => (
                  <th key={stock.symbol} className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Link
                        href={`/stock/${stock.symbol}`}
                        className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {stock.symbol}
                      </Link>
                      <button
                        onClick={() => onRemove(stock.symbol)}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {metrics.map((metric) => (
                <tr key={metric.label} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                    {metric.label}
                  </td>
                  {stocks.map((stock) => {
                    const value = (stock as any)[metric.key];
                    const formatted = metric.format(value);
                    const isChange = metric.key === 'changePercent';
                    const isPositive = isChange && value >= 0;

                    return (
                      <td
                        key={stock.symbol}
                        className={`px-4 py-3 text-sm text-center ${
                          isChange
                            ? isPositive
                              ? 'text-green-600 dark:text-green-400 font-semibold'
                              : 'text-red-600 dark:text-red-400 font-semibold'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {isChange && (
                          <span className="inline-flex items-center gap-1">
                            {isPositive ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            {formatted}
                          </span>
                        )}
                        {!isChange && formatted}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
