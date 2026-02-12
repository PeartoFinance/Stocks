'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { stockAPI } from '@/app/utils/api';
import {
    getPortfolios,
    getNetWorth,
    createPortfolio,
    addHolding,
    deleteHolding,
    getTransactions,
    addTransaction,
    getHoldingDetail,
    getWealthHistory,
    getPortfolioAnalytics,
    type Portfolio,
    type Holding,
    type NetWorth,
    type PortfolioAnalytics,
    type WealthHistoryPoint,
} from '@/app/utils/portfolioProfileAPI';
import {
    ArrowLeft,
    Plus,
    TrendingUp,
    TrendingDown,
    DollarSign,
    PieChart,
    RefreshCw,
    Search,
    Trash2,
    X,
    BarChart3,
} from 'lucide-react';
import { TableExportButton } from '@/app/components/common/TableExportButton';
import HoldingDetailCard from '@/app/components/portfolio/HoldingDetailCard';
import toast from 'react-hot-toast';

export default function PortfolioPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [netWorth, setNetWorth] = useState<NetWorth | null>(null);
    const [availableStocks, setAvailableStocks] = useState<any[]>([]);
    const [filteredStocks, setFilteredStocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stocksLoading, setStocksLoading] = useState(false);
    const [showAddHolding, setShowAddHolding] = useState(false);
    const [showCreatePortfolio, setShowCreatePortfolio] = useState(false);
    const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
    const [currentPortfolioId, setCurrentPortfolioId] = useState<string>('all'); // 'all' or specific portfolio id
    const [selectedSymbol, setSelectedSymbol] = useState<{ symbol: string; name: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string }>>([]);
    const [searching, setSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [shares, setShares] = useState('');
    const [avgCost, setAvgCost] = useState('');
    const [newPortfolioName, setNewPortfolioName] = useState('My Portfolio');
    const [submitting, setSubmitting] = useState(false);
    const [creating, setCreating] = useState(false);
    const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push('/login');
    }, [authLoading, isAuthenticated, router]);

    const load = useCallback(async () => {
        try {
            const [list, nw] = await Promise.all([getPortfolios(), getNetWorth()]);
            setPortfolios(list);
            setNetWorth(nw);
        } catch (e) {
            console.error(e);
            toast.error('Failed to load portfolio');
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

    const loadAnalytics = useCallback(async (portfolioId: string) => {
        if (portfolioId === 'all') return;
        
        try {
            setAnalyticsLoading(true);
            const data = await getPortfolioAnalytics(portfolioId);
            setAnalytics(data);
        } catch (e) {
            console.error(e);
            toast.error('Failed to load portfolio analytics');
        } finally {
            setAnalyticsLoading(false);
        }
    }, []);

    // Filter stocks based on search input
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredStocks([]);
            setShowSuggestions(false);
            return;
        }

        const filtered = availableStocks.filter(stock => 
            stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stock.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 8); // Limit to 8 suggestions

        setFilteredStocks(filtered);
        setShowSuggestions(filtered.length > 0);
    }, [searchQuery, availableStocks]);

    useEffect(() => {
        if (!isAuthenticated) return;
        load();
        loadAvailableStocks();
    }, [isAuthenticated, load, loadAvailableStocks]);

    useEffect(() => {
        if (currentPortfolioId && currentPortfolioId !== 'all') {
            loadAnalytics(currentPortfolioId);
        } else {
            setAnalytics(null);
        }
    }, [currentPortfolioId, loadAnalytics]);

    const handleSuggestionClick = (stock: any) => {
        setSelectedSymbol({ symbol: stock.symbol, name: stock.name });
        setSearchQuery(stock.symbol);
        setShowSuggestions(false);
        setFilteredStocks([]);
    };

    // Filter holdings based on selected portfolio
    const filteredHoldings = currentPortfolioId === 'all' 
        ? portfolios.flatMap((p) => p.holdings.map((h) => ({ ...h, portfolioName: p.name, portfolioId: p.id })))
        : portfolios.find(p => p.id === currentPortfolioId)?.holdings.map((h) => ({ ...h, portfolioName: portfolios.find(p => p.id === currentPortfolioId)?.name || '', portfolioId: currentPortfolioId })) || [];

    const totalValue = currentPortfolioId === 'all' 
        ? (netWorth?.netWorth ?? 0)
        : filteredHoldings.reduce((sum, h) => sum + (h.shares * h.currentPrice), 0);
    
    const totalGain = currentPortfolioId === 'all'
        ? (netWorth ? netWorth.netWorthChange : 0)
        : filteredHoldings.reduce((sum, h) => sum + ((h.currentPrice - h.avgCost) * h.shares), 0);
    
    const totalCost = filteredHoldings.reduce((sum, h) => sum + (h.avgCost * h.shares), 0);
    const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

    const handleAddHolding = async () => {
        if (!selectedPortfolio || !selectedSymbol) {
            toast.error('Select a portfolio and stock');
            return;
        }
        const s = parseFloat(shares);
        const c = parseFloat(avgCost);
        if (isNaN(s) || s <= 0 || isNaN(c) || c < 0) {
            toast.error('Enter valid shares and average cost');
            return;
        }
        setSubmitting(true);
        try {
            await addHolding(selectedPortfolio.id, {
                symbol: selectedSymbol.symbol,
                shares: s,
                avgBuyPrice: c,
            });
            toast.success(`${selectedSymbol.symbol} added`);
            setShowAddHolding(false);
            setSelectedSymbol(null);
            setShares('');
            setAvgCost('');
            setSearchQuery('');
            setSearchResults([]);
            load();
        } catch (e: any) {
            toast.error(e?.message || 'Failed to add holding');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreatePortfolio = async () => {
        setCreating(true);
        try {
            await createPortfolio(newPortfolioName.trim() || 'My Portfolio');
            toast.success('Portfolio created');
            setShowCreatePortfolio(false);
            setNewPortfolioName('My Portfolio');
            load();
        } catch (e: any) {
            toast.error(e?.message || 'Failed to create portfolio');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteHolding = async (portfolioId: string, h: Holding) => {
        try {
            await deleteHolding(portfolioId, h.id);
            toast.success(`${h.symbol} removed`);
            load();
        } catch {
            toast.error('Failed to remove');
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-green-500 border-t-transparent" />
            </div>
        );
    }
    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 pb-8 mt-8">
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
                                <PieChart className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                                <h1 className="text-xl sm:text-2xl font-bold text-white">Portfolio</h1>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setShowCreatePortfolio(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium transition"
                            >
                                <Plus className="h-5 w-5" />
                                New Portfolio
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Portfolio Selector */}
                {portfolios.length > 0 && (
                    <div className="mb-6 sm:mb-8">
                        <div className="flex flex-col gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Portfolio View</h2>
                                <p className="text-sm text-slate-600 dark:text-gray-400">
                                    {currentPortfolioId === 'all' 
                                        ? 'Showing all portfolios' 
                                        : `Showing: ${portfolios.find(p => p.id === currentPortfolioId)?.name || 'Unknown'}`
                                    }
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <select
                                    value={currentPortfolioId}
                                    onChange={(e) => setCurrentPortfolioId(e.target.value)}
                                    className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none bg-white dark:bg-gray-800 text-slate-900 dark:text-white min-w-[200px]"
                                >
                                    <option value="all">All Portfolios</option>
                                    {portfolios.map((portfolio) => (
                                        <option key={portfolio.id} value={portfolio.id}>
                                            {portfolio.name} ({portfolio.holdings.length} holdings)
                                        </option>
                                    ))}
                                </select>
                            
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-sm text-slate-500 dark:text-gray-400">Total Value</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-sm text-slate-500 dark:text-gray-400">Total Gain</span>
                        </div>
                        <div
                            className={`text-xl sm:text-2xl font-bold flex flex-wrap items-baseline gap-1 ${
                                totalGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}
                        >
                            {totalGain >= 0 ? '+' : ''}${totalGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            <span className="text-sm font-medium">
                                ({totalGainPct >= 0 ? '+' : ''}{totalGainPct.toFixed(2)}%)
                            </span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-gray-700">
                                <PieChart className="h-5 w-5 text-slate-600 dark:text-gray-400" />
                            </div>
                            <span className="text-sm text-slate-500 dark:text-gray-400">Portfolios</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{portfolios.length}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-gray-700">
                                <PieChart className="h-5 w-5 text-slate-600 dark:text-gray-400" />
                            </div>
                            <span className="text-sm text-slate-500 dark:text-gray-400">Holdings</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{filteredHoldings.length}</div>
                    </div>
                </div>

                {/* Add holding modal */}
                {showAddHolding && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add holding</h2>
                                <button
                                    onClick={() => {
                                        setShowAddHolding(false);
                                        setSelectedSymbol(null);
                                        setSearchQuery('');
                                        setSearchResults([]);
                                    }}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-500 dark:text-gray-400"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Portfolio</label>
                                    <select
                                        value={selectedPortfolio?.id ?? ''}
                                        onChange={(e) => {
                                            const p = portfolios.find((x) => x.id === e.target.value);
                                            setSelectedPortfolio(p || null);
                                        }}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                                    >
                                        {portfolios.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                        {portfolios.length === 0 && <option value="">Create a portfolio first</option>}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Stock</label>
                                    <div className="relative">
                                        <div className="flex-1 relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-gray-400" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onFocus={() => setShowSuggestions(true)}
                                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                                placeholder="Search stocks by symbol or name..."
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        
                                        {/* Stock Suggestions Dropdown */}
                                        {showSuggestions && filteredStocks.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                                                {filteredStocks.map((stock, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleSuggestionClick(stock)}
                                                        className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-gray-600 transition-colors border-b border-slate-100 dark:border-gray-600 last:border-b-0"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="font-semibold text-slate-900 dark:text-white">
                                                                    {stock.symbol}
                                                                </div>
                                                                <div className="text-sm text-slate-600 dark:text-gray-400 truncate">
                                                                    {stock.name}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="font-semibold text-slate-900 dark:text-white">
                                                                    ${stock.price?.toFixed(2) || '0.00'}
                                                                </div>
                                                                <div className={`text-sm font-medium ${
                                                                    stock.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
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
                                    {selectedSymbol && (
                                        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                                            Selected: <strong>{selectedSymbol.symbol}</strong>
                                        </p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Shares</label>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            min="0"
                                            value={shares}
                                            onChange={(e) => setShares(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Avg cost ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={avgCost}
                                            onChange={(e) => setAvgCost(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAddHolding}
                                        disabled={submitting || !selectedPortfolio || !selectedSymbol || !shares || !avgCost}
                                        className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium disabled:opacity-50"
                                    >
                                        {submitting ? 'Adding…' : 'Add'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowAddHolding(false);
                                            setSelectedSymbol(null);
                                            setSearchQuery('');
                                            setSearchResults([]);
                                        }}
                                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create portfolio modal */}
                {showCreatePortfolio && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-4 sm:p-6">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">New portfolio</h2>
                            <input
                                type="text"
                                value={newPortfolioName}
                                onChange={(e) => setNewPortfolioName(e.target.value)}
                                placeholder="Portfolio name"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none bg-white dark:bg-gray-700 text-slate-900 dark:text-white mb-4"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCreatePortfolio}
                                    disabled={creating}
                                    className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium disabled:opacity-50"
                                >
                                    {creating ? 'Creating…' : 'Create'}
                                </button>
                                <button
                                    onClick={() => setShowCreatePortfolio(false)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Holdings */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-gray-700">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="font-semibold text-slate-900 dark:text-white text-lg">Holdings</h2>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <TableExportButton
                                    data={filteredHoldings}
                                    columns={[
                                        { key: 'symbol', label: 'Symbol', format: 'text' },
                                        { key: 'portfolioName', label: 'Portfolio', format: 'text' },
                                        { key: 'shares', label: 'Shares', format: 'number' },
                                        { key: 'avgCost', label: 'Avg Cost', format: 'currency' },
                                        { key: 'totalValue', label: 'Total Value', format: 'currency' },
                                        { key: 'gain', label: 'Gain/Loss', format: 'currency' },
                                        { key: 'gainPercent', label: 'Gain %', format: 'percent' },
                                    ]}
                                    filename={`portfolio-holdings-${currentPortfolioId === 'all' ? 'all' : currentPortfolioId}`}
                                    title={`${currentPortfolioId === 'all' ? 'All Portfolios' : portfolios.find(p => p.id === currentPortfolioId)?.name || 'Portfolio'} Holdings`}
                                    variant="compact"
                                />
                                <button
                                    onClick={() => {
                                        setSelectedPortfolio(portfolios[0] || null);
                                        setShowAddHolding(true);
                                        setSelectedSymbol(null);
                                        setShares('');
                                        setAvgCost('');
                                        setSearchQuery('');
                                        setSearchResults([]);
                                    }}
                                    disabled={portfolios.length === 0}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden sm:inline">Add Holding</span>
                                    <span className="sm:hidden">Add</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <RefreshCw className="h-8 w-8 text-green-500 animate-spin" />
                        </div>
                    ) : filteredHoldings.length === 0 ? (
                        <div className="p-8 sm:p-12 text-center">
                            <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                                <PieChart className="h-7 w-7 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No holdings yet</h3>
                            <p className="text-slate-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                                Create a portfolio and add your first stock.
                            </p>
                            <div className="flex flex-wrap justify-center gap-2">
                                <button
                                    onClick={() => setShowCreatePortfolio(true)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition"
                                >
                                    <Plus className="h-5 w-5" />
                                    Create portfolio
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 sm:p-6">
                            <div className="space-y-6">
                                {filteredHoldings.map((h) => (
                                    <HoldingDetailCard
                                        key={`${h.portfolioId}-${h.id}`}
                                        holding={h}
                                        portfolioName={h.portfolioName || 'Unknown Portfolio'}
                                        marketData={{
                                            dayChange: h.change || 0,
                                            dayChangePercent: h.changePercent || 0,
                                            high52w: h.high52w || (h.currentPrice * 1.2),
                                            low52w: h.low52w || (h.currentPrice * 0.8),
                                            peRatio: h.peRatio || 15.5,
                                            marketCap: h.marketCap || 1000000000,
                                            sector: h.sector || 'Technology'
                                        }}
                                        transactions={[]}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
