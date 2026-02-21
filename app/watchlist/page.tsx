'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Star,
  TrendingUp,
  TrendingDown,
  Grid,
  List,
  LogIn,
} from 'lucide-react';
import { formatNumber, formatPercent, formatVolume } from '@/lib/utils';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../utils/portfolioWatchlistAPI';
import { marketService } from '../utils/marketService';
import { Stock } from '../types';
import toast from 'react-hot-toast';

interface WatchlistStock extends Stock {
  addedAt?: string;
}

export default function WatchlistPage() {
  const { formatPrice } = useCurrency();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  
  const [stocks, setStocks] = useState<WatchlistStock[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [newSymbol, setNewSymbol] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingSymbols, setSearchingSymbols] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadWatchlist();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      const data = await getWatchlist();
      if (data && data.length > 0) {
        const watchlistStocks = data.map(item => ({
          symbol: item.symbol,
          name: item.name || item.symbol,
          price: item.price || 0,
          change: item.change || 0,
          changePercent: item.changePercent || 0,
          volume: 0,
          marketCap: 0,
          addedAt: item.addedAt
        } as WatchlistStock));
        setStocks(watchlistStocks);
      } else {
        setStocks([]);
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const searchSymbols = async (query: string) => {
    if (!query.trim() || query.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setSearchingSymbols(true);
      const results = await marketService.searchStocks(query, 10);
      if (Array.isArray(results) && results.length > 0) {
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error searching symbols:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setSearchingSymbols(false);
    }
  };

  const addStock = async (symbol?: string) => {
    const symbolToAdd = symbol || newSymbol;
    if (!symbolToAdd.trim()) return;
    try {
      await addToWatchlist(symbolToAdd.toUpperCase());
      setNewSymbol('');
      setSuggestions([]);
      setShowSuggestions(false);
      await loadWatchlist();
      toast.success(`Added ${symbolToAdd.toUpperCase()} to watchlist`);
    } catch (error) {
      toast.error('Failed to add stock');
    }
  };

  const removeStock = async (symbol: string) => {
    try {
      await removeFromWatchlist(symbol);
      await loadWatchlist();
      toast.success(`Removed ${symbol} from watchlist`);
    } catch (error) {
      toast.error('Failed to remove stock');
    }
  };

  const filteredStocks = stocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Not logged in view
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900/95 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Sign in to view your watchlist
          </h2>
          <p className="text-slate-600 dark:text-gray-400 mb-6">
            Track your favorite stocks and get real-time updates
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
          >
            <LogIn className="h-5 w-5" />
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900/95 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-green-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/95 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Watchlist</h1>
          </div>
          <p className="text-slate-600 dark:text-gray-400">Track stocks you're interested in</p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter watchlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => document.getElementById('add-symbol-input')?.focus()}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
              >
                <Plus className="h-5 w-5" />
                Add Symbol
              </button>
            </div>
          </div>

          {/* Add Symbol Input */}
          <div className="mt-4 relative">
            <div className="flex gap-2">
              <input
                id="add-symbol-input"
                type="text"
                placeholder="Search stock symbol or name (e.g., AAPL or Apple)"
                value={newSymbol}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewSymbol(value);
                  searchSymbols(value);
                }}
                onKeyPress={(e) => e.key === 'Enter' && !showSuggestions && addStock()}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              />
              <button
                onClick={() => addStock()}
                disabled={!newSymbol.trim()}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 dark:disabled:bg-gray-700 text-white rounded-lg font-medium transition"
              >
                Add
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {suggestions.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => addStock(item.symbol)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-gray-700 border-b border-slate-100 dark:border-gray-700 last:border-b-0 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-white">{item.symbol}</div>
                        <div className="text-sm text-slate-600 dark:text-gray-400 truncate">{item.name}</div>
                      </div>
                      {item.price && (
                        <div className="text-right ml-4">
                          <div className="font-medium text-slate-900 dark:text-white">{formatPrice(item.price)}</div>
                          {item.changePercent !== undefined && item.changePercent !== null && (
                            <div className={`text-sm ${item.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {item.changePercent >= 0 ? '+' : ''}{Number(item.changePercent).toFixed(2)}%
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchingSymbols && (
              <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-lg p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent mx-auto" />
              </div>
            )}
          </div>
        </div>

        {/* Stocks Grid/List */}
        {filteredStocks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-12 text-center">
            <Star className="h-16 w-16 text-slate-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {searchTerm ? 'No stocks found' : 'Your watchlist is empty'}
            </h3>
            <p className="text-slate-600 dark:text-gray-400">
              {searchTerm ? 'Try a different search term' : 'Add stocks to start tracking'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStocks.map((stock) => (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-4 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <Link
                    href={`/stock/${stock.symbol.toLowerCase()}`}
                    className="flex-1"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                          {stock.symbol.substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{stock.symbol}</h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400">{stock.name}</p>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => removeStock(stock.symbol)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatPrice(stock.price)}
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stock.changePercent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span>{stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-gray-700 border-b border-slate-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Change</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                {filteredStocks.map((stock) => (
                  <tr key={stock.symbol} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4">
                      <Link href={`/stock/${stock.symbol.toLowerCase()}`} className="font-semibold text-green-600 hover:text-green-700">
                        {stock.symbol}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {formatPrice(stock.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => removeStock(stock.symbol)}
                        className="text-yellow-500 hover:text-yellow-600"
                      >
                        <Star className="h-5 w-5 fill-yellow-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
