'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { getWatchlist, addToWatchlist, removeFromWatchlist, type WatchlistItem } from '@/app/utils/portfolioWatchlistAPI';
import { stockAPI } from '@/app/utils/api';
import cryptoService from '@/app/utils/cryptoService';
import {
    ArrowLeft,
    Star,
    Plus,
    Trash2,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    Search,
    Bitcoin,
    BarChart3,
    Grid,
    List,
} from 'lucide-react';
import toast from 'react-hot-toast';

type TabType = 'stocks' | 'crypto';

export default function WatchlistPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('stocks');
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [availableStocks, setAvailableStocks] = useState<any[]>([]);
    const [availableCrypto, setAvailableCrypto] = useState<any[]>([]);
    const [filteredStocks, setFilteredStocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stocksLoading, setStocksLoading] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [adding, setAdding] = useState<string | null>(null);
    const [removing, setRemoving] = useState<string | null>(null);
    const [symbolToAdd, setSymbolToAdd] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
            if (activeTab === 'stocks') {
                const response = await stockAPI.getAllStocks();
                if (response.success && response.data) {
                    setAvailableStocks(response.data);
                }
            } else {
                const response: any = await cryptoService.getMarkets({ limit: 100 });
                console.log('Crypto response:', response);
                // Handle different response structures
                if (response && Array.isArray(response)) {
                    setAvailableCrypto(response);
                } else if (response?.data && Array.isArray(response.data)) {
                    setAvailableCrypto(response.data);
                } else if (response?.items && Array.isArray(response.items)) {
                    setAvailableCrypto(response.items);
                }
            }
        } catch (e) {
            console.error(e);
            toast.error(`Failed to load available ${activeTab}`);
        } finally {
            setStocksLoading(false);
        }
    }, [activeTab]);

    // Filter stocks/crypto based on search input
    useEffect(() => {
        if (!symbolToAdd.trim()) {
            setFilteredStocks([]);
            setShowSuggestions(false);
            return;
        }

        const dataSource = activeTab === 'stocks' ? availableStocks : availableCrypto;
        const filtered = dataSource.filter(item => 
            item.symbol.toLowerCase().includes(symbolToAdd.toLowerCase()) ||
            item.name.toLowerCase().includes(symbolToAdd.toLowerCase())
        ).slice(0, 8);

        setFilteredStocks(filtered);
        setShowSuggestions(filtered.length > 0);
    }, [symbolToAdd, availableStocks, availableCrypto, activeTab]);

    useEffect(() => {
        if (!isAuthenticated) return;
        load();
        loadAvailableStocks();
    }, [isAuthenticated, load, loadAvailableStocks, activeTab]);

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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900/95">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 dark:from-slate-900/95 dark:to-slate-900/95 pb-8 pt-16">
                <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 border-b border-emerald-600/20 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/profile"
                                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 dark:bg-slate-800 dark:hover:bg-slate-700 text-white dark:text-white transition"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div className="flex items-center gap-2">
                                <Star className="h-6 w-6 sm:h-7 sm:w-7 text-white dark:text-white" />
                                <h1 className="text-xl sm:text-2xl font-bold text-white dark:text-white">Watchlist</h1>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setShowSearch(!showSearch);
                                setSymbolToAdd('');
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium transition"
                        >
                            <Plus className="h-5 w-5" />
                            Add {activeTab === 'stocks' ? 'Stock' : 'Crypto'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => {
                            setActiveTab('stocks');
                            setSymbolToAdd('');
                            setShowSearch(false);
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition ${
                            activeTab === 'stocks'
                                ? 'bg-emerald-500 text-white shadow-lg'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                    >
                        <BarChart3 className="h-5 w-5" />
                        Stocks
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('crypto');
                            setSymbolToAdd('');
                            setShowSearch(false);
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition ${
                            activeTab === 'crypto'
                                ? 'bg-emerald-500 text-white shadow-lg'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                    >
                        <Bitcoin className="h-5 w-5" />
                        Crypto
                    </button>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
                        >
                            <Grid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {showSearch && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Add {activeTab === 'stocks' ? 'stock' : 'crypto'} to watchlist
                        </h3>
                        <div className="relative">
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-gray-400" />
                                    <input
                                        type="text"
                                        value={symbolToAdd}
                                        onChange={(e) => setSymbolToAdd(e.target.value)}
                                        onFocus={() => setShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                        placeholder={`Enter ${activeTab === 'stocks' ? 'stock' : 'crypto'} symbol or name...`}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                                    />
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleAdd();
                                    }}
                                    disabled={adding !== null}
                                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                >
                                    {adding ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Add'}
                                </button>
                            </div>
                            
                            {/* Stock Suggestions Dropdown */}
                            {showSuggestions && filteredStocks.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                                    {filteredStocks.map((stock, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestionClick(stock)}
                                            className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium text-slate-900 dark:text-white">
                                                        {stock.symbol}
                                                    </div>
                                                    <div className="text-sm text-slate-500 truncate">
                                                        {stock.name}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium text-slate-900 dark:text-white">
                                                        ${typeof stock.price === 'number' ? stock.price.toFixed(2) : '0.00'}
                                                    </div>
                                                    <div className={`text-sm font-medium ${
                                                        (stock.change || stock.changePercent || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
                                                    }`}>
                                                        {(stock.change || stock.changePercent || 0) >= 0 ? '+' : ''}
                                                        {typeof stock.changePercent === 'number' ? stock.changePercent.toFixed(2) : '0.00'}%
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

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Your {activeTab} watchlist ({watchlist.filter(item => {
                                const isCrypto = item.symbol.includes('-') || item.symbol.match(/^(BTC|ETH|USDT|BNB|XRP|ADA|DOGE|SOL|DOT|MATIC|LINK|UNI|AVAX|ATOM|LTC|BCH|XLM|ALGO|VET|FIL|TRX|ETC|THETA|XMR|EOS|AAVE|MKR|COMP|SNX|YFI|SUSHI|CRV|BAL|UMA|REN|KNC|ZRX|BAT|ENJ|MANA|SAND|AXS|CHZ|GALA)/i);
                                return activeTab === 'crypto' ? isCrypto : !isCrypto;
                            }).length})
                        </h2>
                    </div>
                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <RefreshCw className="h-8 w-8 text-green-500 animate-spin" />
                        </div>
                    ) : watchlist.filter(item => {
                        const isCrypto = item.symbol.includes('-') || item.symbol.match(/^(BTC|ETH|USDT|BNB|XRP|ADA|DOGE|SOL|DOT|MATIC|LINK|UNI|AVAX|ATOM|LTC|BCH|XLM|ALGO|VET|FIL|TRX|ETC|THETA|XMR|EOS|AAVE|MKR|COMP|SNX|YFI|SUSHI|CRV|BAL|UMA|REN|KNC|ZRX|BAT|ENJ|MANA|SAND|AXS|CHZ|GALA)/i);
                        return activeTab === 'crypto' ? isCrypto : !isCrypto;
                    }).length === 0 ? (
                        <div className="p-4 lg:p-6 sm:p-12 text-center">
                            <div className="h-14 w-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                                <Star className="h-7 w-7 text-amber-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No {activeTab} yet</h3>
                            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                                Add {activeTab} to track prices and performance.
                            </p>
                            <button
                                onClick={() => setShowSearch(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition text-sm"
                            >
                                <Plus className="h-5 w-5" />
                                Add your first {activeTab === 'stocks' ? 'stock' : 'crypto'}
                            </button>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                            {watchlist.filter(item => {
                                const isCrypto = item.symbol.includes('-') || item.symbol.match(/^(BTC|ETH|USDT|BNB|XRP|ADA|DOGE|SOL|DOT|MATIC|LINK|UNI|AVAX|ATOM|LTC|BCH|XLM|ALGO|VET|FIL|TRX|ETC|THETA|XMR|EOS|AAVE|MKR|COMP|SNX|YFI|SUSHI|CRV|BAL|UMA|REN|KNC|ZRX|BAT|ENJ|MANA|SAND|AXS|CHZ|GALA)/i);
                                return activeTab === 'crypto' ? isCrypto : !isCrypto;
                            }).map((item) => (
                                <div
                                    key={item.symbol}
                                    className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <Link href={activeTab === 'stocks' ? `/stock/${item.symbol}` : `/crypto/${item.symbol}`} className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                                        {item.symbol.substring(0, 2)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 dark:text-white">{item.symbol}</h3>
                                                    <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{item.name || '—'}</p>
                                                </div>
                                            </div>
                                        </Link>
                                        <button
                                            onClick={() => handleRemove(item.symbol)}
                                            disabled={removing === item.symbol}
                                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition"
                                        >
                                            {removing === item.symbol ? (
                                                <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
                                            ) : (
                                                <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                            ${typeof item.price === 'number' && !isNaN(item.price) ? item.price.toFixed(2) : '—'}
                                        </div>
                                        <div className={`flex items-center gap-1 text-sm font-medium ${
                                            (item.changePercent ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
                                        }`}>
                                            {(item.changePercent ?? 0) >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                            <span>{(item.changePercent ?? 0) >= 0 ? '+' : ''}{typeof item.changePercent === 'number' && !isNaN(item.changePercent) ? item.changePercent.toFixed(2) : '0.00'}%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                            {watchlist.filter(item => {
                                const isCrypto = item.symbol.includes('-') || item.symbol.match(/^(BTC|ETH|USDT|BNB|XRP|ADA|DOGE|SOL|DOT|MATIC|LINK|UNI|AVAX|ATOM|LTC|BCH|XLM|ALGO|VET|FIL|TRX|ETC|THETA|XMR|EOS|AAVE|MKR|COMP|SNX|YFI|SUSHI|CRV|BAL|UMA|REN|KNC|ZRX|BAT|ENJ|MANA|SAND|AXS|CHZ|GALA)/i);
                                return activeTab === 'crypto' ? isCrypto : !isCrypto;
                            }).map((item) => (
                                <div
                                    key={item.symbol}
                                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition cursor-pointer"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <Link href={activeTab === 'stocks' ? `/stock/${item.symbol}` : `/crypto/${item.symbol}`} className="flex-1 min-w-0">
                                            <div className="font-medium text-slate-900 dark:text-white">{item.symbol}</div>
                                            <div className="text-sm text-slate-500 truncate">{item.name || '—'}</div>
                                        </Link>
                                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                                            <div className="text-right">
                                                <div className="font-medium text-slate-900 dark:text-white">
                                                    ${typeof item.price === 'number' && !isNaN(item.price) ? item.price.toFixed(2) : '—'}
                                                </div>
                                                <div
                                                    className={`text-sm flex items-center justify-end gap-1 font-medium ${
                                                        (item.changePercent ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
                                                    }`}
                                                >
                                                    {(item.changePercent ?? 0) >= 0 ? (
                                                        <TrendingUp className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <TrendingDown className="h-3.5 w-3.5" />
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
                                                className="p-2 rounded-lg text-slate-400 hover:text-red-500 transition disabled:opacity-50"
                                            >
                                                {removing === item.symbol ? (
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
