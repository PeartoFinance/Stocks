'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Search, Bitcoin, TrendingUp } from 'lucide-react';
import { marketService } from '../../utils/marketService';

interface StockSearchProps {
  onStockSelect: (stock: any) => void;
  className?: string;
}

export default function StockSearch({ onStockSelect, className = '' }: StockSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const searchStocks = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await marketService.searchStocks(query, 8);
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    }
  }, []);

  // Debounced search
  React.useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchStocks(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchStocks]);

  const handleSelectStock = (stock: any) => {
    setSearchQuery(`${stock.symbol} - ${stock.name}`);
    setShowSuggestions(false);
    onStockSelect(stock);
    searchInputRef.current?.blur();
  };

  return (
    <div className={`relative flex-1 max-w-md ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search stocks..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
        />
        {showSuggestions && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
            {searchResults.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => handleSelectStock(stock)}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    stock.assetType === 'crypto' ? 'bg-amber-500/10' : 'bg-emerald-500/10'
                  }`}>
                    {stock.assetType === 'crypto' 
                      ? <Bitcoin size={16} className="text-amber-500" />
                      : <TrendingUp size={16} className="text-emerald-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">{stock.symbol}</span>
                      {stock.exchange && (
                        <span className="text-xs text-slate-400 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                          {stock.exchange}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 truncate">{stock.name}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
