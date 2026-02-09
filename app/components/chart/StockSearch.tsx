'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';
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

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  return (
    <div className={`relative flex-1 max-w-md ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search stocks..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        {showSuggestions && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {searchResults.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => handleSelectStock(stock)}
                className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{stock.symbol}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{stock.name}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatPrice(stock.price || 0)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
