'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { getWatchlist, addToWatchlist, removeFromWatchlist, type WatchlistItem } from '@/app/utils/portfolioWatchlistAPI';
import { stockAPI } from '@/app/utils/api';
import {
    ArrowLeft,
    Star,
    Plus,
    Trash2,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    Search,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function WatchlistPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [availableStocks, setAvailableStocks] = useState<any[]>([]);
    const [filteredStocks, setFilteredStocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stocksLoading, setStocksLoading] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [adding, setAdding] = useState<string | null>(null);
    const [removing, setRemoving] = useState<string | null>(null);
    const [symbolToAdd, setSymbolToAdd] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push('/login');
    }, [authLoading, isAuthenticated, router]);

    const load = useCallback(async () => {
        try {
            const list = await getWatchlist();
            setWatchlist(list);
        } catch (e) {
            console.error(e);
            toast.error('Failed to load watchlist');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadAvailableStocks = useCallback(async () => {
        try {
            setStocksLoading(true);
            const response = await stockAPI.getAllStocks();
            if (response.success && response.data) {
                setAvailableStocks(response.data);
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to load available stocks');
        } finally {
            setStocksLoading(false);
        }
    }, []);

    // Filter stocks based on search input
    useEffect(() => {
        if (!symbolToAdd.trim()) {
            setFilteredStocks([]);
            setShowSuggestions(false);
            return;
        }

        const filtered = availableStocks.filter(stock => 
            stock.symbol.toLowerCase().includes(symbolToAdd.toLowerCase()) ||
            stock.name.toLowerCase().includes(symbolToAdd.toLowerCase())
        ).slice(0, 8); // Limit to 8 suggestions

        setFilteredStocks(filtered);
        setShowSuggestions(filtered.length > 0);
    }, [symbolToAdd, availableStocks]);

    useEffect(() => {
        if (!isAuthenticated) return;
        load();
        loadAvailableStocks();
    }, [isAuthenticated, load, loadAvailableStocks]);

    const handleAdd = async (symbol?: string) => {
        const stockSymbol = (symbol || symbolToAdd.trim()).toUpperCase();
        if (!stockSymbol) return;

        if (watchlist.some((w) => w.symbol === stockSymbol)) {
            toast.error('Stock already in watchlist');
            return;
        }

        try {
            setAdding(stockSymbol);
            await addToWatchlist(stockSymbol);
            await load();
            toast.success(`${stockSymbol} added to watchlist`);
            setSymbolToAdd('');
            setShowSuggestions(false);
            setFilteredStocks([]);
        } catch (e) {
            console.error(e);
            toast.error('Failed to add stock');
        } finally {
            setAdding(null);
        }
    };

    const handleSuggestionClick = (stock: any) => {
        setSymbolToAdd(stock.symbol);
        setShowSuggestions(false);
        setFilteredStocks([]);
        handleAdd(stock.symbol);
    };

    const handleRemove = async (symbol: string) => {
        setRemoving(symbol);
        try {
            await removeFromWatchlist(symbol);
            setWatchlist((prev: any[]) => prev.filter((w: any) => w.symbol !== symbol));
            toast.success(`${symbol} removed`);
        } catch {
            toast.error('Failed to remove');
        } finally {
            setRemoving(null);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-green-500 border-t-transparent" />
            </div>
        );
    }
    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 mt-8">
                <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/profile"
                                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div className="flex items-center gap-2">
                                <Star className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                                <h1 className="text-xl sm:text-2xl font-bold text-white">Watchlist</h1>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setShowSearch(!showSearch);
                                setSymbolToAdd('');
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-green-600 font-medium hover:bg-green-50 transition shadow-sm"
                        >
                            <Plus className="h-5 w-5" />
                            Add Stock
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
                {showSearch && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-6">
                        <h3 className="font-semibold text-slate-900 mb-4">Add stock to watchlist</h3>
                        <div className="relative">
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={symbolToAdd}
                                        onChange={(e) => setSymbolToAdd(e.target.value)}
                                        onFocus={() => setShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                        placeholder="Enter stock symbol or name..."
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
                                    />
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleAdd();
                                    }}
                                    disabled={adding !== null}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {adding ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Add'}
                                </button>
                            </div>
                            
                            {/* Stock Suggestions Dropdown */}
                            {showSuggestions && filteredStocks.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                                    {filteredStocks.map((stock, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestionClick(stock)}
                                            className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-semibold text-slate-900">
                                                        {stock.symbol}
                                                    </div>
                                                    <div className="text-sm text-slate-500 truncate">
                                                        {stock.name}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-slate-900">
                                                        ${stock.price?.toFixed(2) || '0.00'}
                                                    </div>
                                                    <div className={`text-sm font-medium ${
                                                        stock.change >= 0 ? 'text-emerald-600' : 'text-red-600'
                                                    }`}>
                                                        {stock.change >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2) || '0.00'}%
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
                        <h2 className="font-semibold text-slate-900">Your watchlist ({watchlist.length})</h2>
                    </div>
                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <RefreshCw className="h-8 w-8 text-green-500 animate-spin" />
                        </div>
                    ) : watchlist.length === 0 ? (
                        <div className="p-8 sm:p-12 text-center">
                            <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                                <Star className="h-7 w-7 text-amber-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No stocks yet</h3>
                            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                                Add stocks to track prices and performance.
                            </p>
                            <button
                                onClick={() => setShowSearch(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition"
                            >
                                <Plus className="h-5 w-5" />
                                Add your first stock
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {watchlist.map((item) => (
                                <div
                                    key={item.symbol}
                                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:px-6 hover:bg-slate-50 transition"
                                >
                                    <Link href={`/stock/${item.symbol}`} className="flex-1 min-w-0">
                                        <div className="font-medium text-slate-900">{item.symbol}</div>
                                        <div className="text-sm text-slate-500 truncate">{item.name || '—'}</div>
                                    </Link>
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <div className="text-right">
                                            <div className="font-medium text-slate-900">
                                                ${typeof item.price === 'number' && !isNaN(item.price) ? item.price.toFixed(2) : '—'}
                                            </div>
                                            <div
                                                className={`text-sm flex items-center justify-end gap-1 ${
                                                    (item.changePercent ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}
                                            >
                                                {(item.changePercent ?? 0) >= 0 ? (
                                                    <TrendingUp className="h-3 w-3" />
                                                ) : (
                                                    <TrendingDown className="h-3 w-3" />
                                                )}
                                                {(item.changePercent ?? 0) >= 0 ? '+' : ''}
                                                {typeof item.changePercent === 'number' && !isNaN(item.changePercent)
                                                    ? item.changePercent.toFixed(2)
                                                    : '—'}
                                                %
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(item.symbol)}
                                            disabled={removing === item.symbol}
                                            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition disabled:opacity-50"
                                        >
                                            {removing === item.symbol ? (
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </button>
.                                   </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
