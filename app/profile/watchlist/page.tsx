'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { stockAPI } from '@/app/utils/api';
import {
    ArrowLeft,
    Star,
    Plus,
    Trash2,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    Search
} from 'lucide-react';

interface WatchlistItem {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
}

export default function WatchlistPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string }>>([]);
    const [showSearch, setShowSearch] = useState(false);

    // Mock watchlist - would be fetched from API in real implementation
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        try {
            const result = await stockAPI.searchStocks(searchQuery);
            setSearchResults(result.data || []);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToWatchlist = async (symbol: string, name: string) => {
        // Check if already in watchlist
        if (watchlist.some(item => item.symbol === symbol)) {
            return;
        }

        try {
            const quote = await stockAPI.getStockQuote(symbol);
            if (quote.success && quote.data) {
                setWatchlist(prev => [...prev, {
                    symbol: quote.data.symbol,
                    name: quote.data.name || name,
                    price: quote.data.price,
                    change: quote.data.change,
                    changePercent: quote.data.changePercent,
                }]);
            }
        } catch (error) {
            console.error('Failed to add to watchlist:', error);
        }

        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const removeFromWatchlist = (symbol: string) => {
        setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/profile"
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </Link>
                            <h1 className="text-xl font-bold text-gray-900">Watchlist</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition"
                            >
                                <Plus className="h-4 w-4" />
                                Add Stock
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Search Panel */}
                {showSearch && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Search Stocks</h3>
                        <div className="flex gap-2 mb-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search by symbol or name..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
                            >
                                {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Search'}
                            </button>
                        </div>

                        {searchResults.length > 0 && (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {searchResults.map((result) => (
                                    <div
                                        key={result.symbol}
                                        onClick={() => addToWatchlist(result.symbol, result.name)}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                                    >
                                        <div>
                                            <div className="font-medium text-gray-900">{result.symbol}</div>
                                            <div className="text-sm text-gray-500">{result.name}</div>
                                        </div>
                                        <Plus className="h-5 w-5 text-emerald-500" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Watchlist */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900">
                            Your Watchlist ({watchlist.length})
                        </h2>
                    </div>

                    {watchlist.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                                <Star className="h-8 w-8 text-yellow-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No stocks in your watchlist</h3>
                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                Add stocks to your watchlist to track their prices and performance.
                            </p>
                            <button
                                onClick={() => setShowSearch(true)}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition"
                            >
                                <Plus className="h-5 w-5" />
                                Add Your First Stock
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {watchlist.map((item) => (
                                <div
                                    key={item.symbol}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
                                >
                                    <Link href={`/stock/${item.symbol}`} className="flex-1">
                                        <div className="font-medium text-gray-900">{item.symbol}</div>
                                        <div className="text-sm text-gray-500">{item.name}</div>
                                    </Link>
                                    <div className="text-right mr-4">
                                        <div className="font-medium text-gray-900">${item.price.toFixed(2)}</div>
                                        <div className={`text-sm flex items-center gap-1 ${item.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {item.change >= 0 ? (
                                                <TrendingUp className="h-3 w-3" />
                                            ) : (
                                                <TrendingDown className="h-3 w-3" />
                                            )}
                                            {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFromWatchlist(item.symbol)}
                                        className="p-2 hover:bg-red-100 rounded-lg text-gray-400 hover:text-red-600 transition"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
