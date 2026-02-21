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
  if (stocks.length === 0) return null;

  return (
    <div className={`border-t border-gray-200 dark:border-slate-700 ${className}`}>
      <div className="flex items-center justify-between mb-1 px-4 pt-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-600" />
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Most Active Stocks</h4>
          <span className="text-xs text-slate-500 dark:text-slate-400">({stocks.length} stocks)</span>
        </div>
      </div>
      
      <div className="px-4 pb-4">
        <div className="overflow-x-auto">
          <div className="flex gap-2 pb-1">
            {stocks.slice(0, 10).map((stock) => {
              const isPositive = (stock.changePercent || 0) >= 0;
              const bgColor = isPositive 
                ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20' 
                : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20';
              const borderColor = isPositive 
                ? 'border-green-300 dark:border-green-700 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-100 dark:hover:bg-green-900/30' 
                : 'border-red-300 dark:border-red-700 hover:border-red-400 dark:hover:border-red-500 hover:bg-red-100 dark:hover:bg-red-900/30';
              
              return (
                <div
                  key={stock.symbol}
                  onClick={() => onSelectStock(stock)}
                  className={`flex-shrink-0 p-2 border rounded-lg cursor-pointer transition-all min-w-[160px] ${bgColor} ${borderColor}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{stock.symbol}</span>
                    <Activity className="h-3 w-3 text-blue-500 flex-shrink-0" />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-slate-400 truncate mb-1">{stock.name}</div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatPrice(stock.price || 0)}
                    </div>
                    <div className={`text-xs font-medium ${
                      isPositive ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                    }`}>
                      {stock.changePercent !== undefined && stock.changePercent !== null 
                        ? `${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%`
                        : stock.change !== undefined && stock.change !== null
                          ? `${stock.change >= 0 ? '+' : ''}${((stock.change / (stock.price - stock.change)) * 100).toFixed(2)}%`
                          : '0.00%'
                      }
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Vol: {((stock.volume || 0) / 1e6).toFixed(1)}M
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
