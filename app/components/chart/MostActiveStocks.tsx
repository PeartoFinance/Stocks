'use client';

import React from 'react';
import { Activity } from 'lucide-react';

interface MostActiveStocksProps {
  stocks: any[];
  onSelectStock: (stock: any) => void;
  formatPrice: (price: number) => string;
  className?: string;
}

export default function MostActiveStocks({
  stocks,
  onSelectStock,
  formatPrice,
  className = ''
}: MostActiveStocksProps) {
  if (stocks.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No active stocks</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {stocks.slice(0, 15).map((stock) => {
        return (
          <div
            key={stock.symbol}
            onClick={() => onSelectStock(stock)}
            className="bg-slate-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-lg p-3 hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">{(stock?.symbol || 'N').charAt(0)}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {stock?.symbol || 'N/A'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                  {stock?.name ? (stock.name.length > 15 ? stock.name.substring(0, 15) + '...' : stock.name) : 'Unknown'}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-slate-400">Price</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatPrice(stock?.price || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1.5 border-t border-gray-200 dark:border-slate-700">
                <span className="text-xs text-gray-500 dark:text-slate-400">Volume</span>
                <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                  {(stock?.volume || 0) >= 1e9 
                    ? `${((stock?.volume || 0) / 1e9).toFixed(2)}B`
                    : (stock?.volume || 0) >= 1e6
                    ? `${((stock?.volume || 0) / 1e6).toFixed(2)}M`
                    : (stock?.volume || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
