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
    type Portfolio,
    type Holding,
    type NetWorth,
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
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PortfolioPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [netWorth, setNetWorth] = useState<NetWorth | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddHolding, setShowAddHolding] = useState(false);
    const [showCreatePortfolio, setShowCreatePortfolio] = useState(false);
    const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string }>>([]);
    const [searching, setSearching] = useState(false);
    const [shares, setShares] = useState('');
    const [avgCost, setAvgCost] = useState('');
    const [newPortfolioName, setNewPortfolioName] = useState('My Portfolio');
    const [submitting, setSubmitting] = useState(false);
    const [creating, setCreating] = useState(false);

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

    useEffect(() => {
        if (!isAuthenticated) return;
        load();
    }, [isAuthenticated, load]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const res = await stockAPI.searchStocks(searchQuery);
            // If your API returns the array directly, use 'res'
            // If it returns an object with a data property, use 'res.data'
            const results = Array.isArray(res) ? res : res.data || [];
            setSearchResults(results);
            
            if (results.length === 0) {
                toast.error('No stocks found');
            }
        } catch (err) {
            setSearchResults([]);
            toast.error('Search failed');
            console.error(err);
        } finally {
            setSearching(false);
        }
    };

    const [selectedSymbol, setSelectedSymbol] = useState<{ symbol: string; name: string } | null>(null);

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

    const allHoldings = portfolios.flatMap((p) =>
        p.holdings.map((h) => ({ ...h, portfolioName: p.name, portfolioId: p.id }))
    );
    const totalValue = netWorth?.netWorth ?? 0;
    const totalGain = netWorth ? netWorth.netWorthChange : 0;
    const totalGainPct = netWorth ? netWorth.netWorthChangePercent : 0;

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
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 pb-8">
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
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-green-600 font-medium hover:bg-green-50 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                            >
                                <Plus className="h-5 w-5" />
                                Add Holding
                            </button>
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
                {/* Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-green-100">
                                <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <span className="text-sm text-slate-500">Total Value</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-slate-900">
                            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-green-100">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                            </div>
                            <span className="text-sm text-slate-500">Total Gain</span>
                        </div>
                        <div
                            className={`text-xl sm:text-2xl font-bold flex flex-wrap items-baseline gap-1 ${
                                totalGain >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                        >
                            {totalGain >= 0 ? '+' : ''}${totalGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            <span className="text-sm font-medium">
                                ({totalGainPct >= 0 ? '+' : ''}{totalGainPct.toFixed(2)}%)
                            </span>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-slate-100">
                                <PieChart className="h-5 w-5 text-slate-600" />
                            </div>
                            <span className="text-sm text-slate-500">Portfolios</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-slate-900">{portfolios.length}</div>
                    </div>
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm text-slate-500">Holdings</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-slate-900">{allHoldings.length}</div>
                    </div>
                </div>

                {/* Add holding modal */}
                {showAddHolding && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-slate-900">Add holding</h2>
                                <button
                                    onClick={() => {
                                        setShowAddHolding(false);
                                        setSelectedSymbol(null);
                                        setSearchQuery('');
                                        setSearchResults([]);
                                    }}
                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Portfolio</label>
                                    <select
                                        value={selectedPortfolio?.id ?? ''}
                                        onChange={(e) => {
                                            const p = portfolios.find((x) => x.id === e.target.value);
                                            setSelectedPortfolio(p || null);
                                        }}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
                                    >
                                        {portfolios.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                        {portfolios.length === 0 && <option value="">Create a portfolio first</option>}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Stock</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                                placeholder="Symbol..."
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSearch}
                                            disabled={searching}
                                            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium disabled:opacity-50"
                                        >
                                            {searching ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Search'}
                                        </button>
                                    </div>
                                    {searchResults.length > 0 && (
                                        <div className="mt-2 border border-slate-100 rounded-xl overflow-hidden max-h-36 overflow-y-auto">
                                           {searchResults.map((r) => (
    <button
        key={r.symbol}
        type="button" 
        onClick={() => {
            setSelectedSymbol(r);
            setSearchQuery(r.symbol);
            setSearchResults([]);
        }}
        className="w-full flex justify-between px-4 py-2.5 hover:bg-green-50 text-left"
    >
        <span className="font-medium">{r.symbol}</span>
        <span className="text-slate-500 text-sm truncate ml-2">{r.name}</span>
    </button>
))}
                                        </div>
                                    )}
                                    {selectedSymbol && (
                                        <p className="mt-2 text-sm text-green-600">
                                            Selected: <strong>{selectedSymbol.symbol}</strong>
                                        </p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Shares</label>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            min="0"
                                            value={shares}
                                            onChange={(e) => setShares(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Avg cost ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={avgCost}
                                            onChange={(e) => setAvgCost(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
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
                                        className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-4 sm:p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">New portfolio</h2>
                            <input
                                type="text"
                                value={newPortfolioName}
                                onChange={(e) => setNewPortfolioName(e.target.value)}
                                placeholder="Portfolio name"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none mb-4"
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
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Holdings */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h2 className="font-semibold text-slate-900">Holdings</h2>
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
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition w-fit disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="h-4 w-4" />
                            Add Holding
                        </button>
                    </div>
                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <RefreshCw className="h-8 w-8 text-green-500 animate-spin" />
                        </div>
                    ) : allHoldings.length === 0 ? (
                        <div className="p-8 sm:p-12 text-center">
                            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                <PieChart className="h-7 w-7 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No holdings yet</h3>
                            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
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
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px]">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Stock</th>
                                        <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Portfolio</th>
                                        <th className="text-right px-4 sm:px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Shares</th>
                                        <th className="text-right px-4 sm:px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Cost</th>
                                        <th className="text-right px-4 sm:px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Value</th>
                                        <th className="text-right px-4 sm:px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Gain/Loss</th>
                                        <th className="w-10" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {allHoldings.map((h) => (
                                        <tr key={`${h.portfolioId}-${h.id}`} className="hover:bg-slate-50">
                                            <td className="px-4 sm:px-6 py-4">
                                                <Link
                                                    href={`/stock/${h.symbol}`}
                                                    className="font-medium text-slate-900 hover:text-green-600"
                                                >
                                                    {h.symbol}
                                                </Link>
                                                <div className="text-sm text-slate-500 sm:hidden">{h.portfolioName}</div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-slate-500 text-sm hidden sm:table-cell">{h.portfolioName}</td>
                                            <td className="px-4 sm:px-6 py-4 text-right text-slate-900">{h.shares}</td>
                                            <td className="px-4 sm:px-6 py-4 text-right text-slate-900">${h.avgCost.toFixed(2)}</td>
                                            <td className="px-4 sm:px-6 py-4 text-right text-slate-900 font-medium">
                                                ${h.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-right">
                                                <div className={h.gain >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                    <div className="font-medium">${h.gain.toFixed(2)}</div>
                                                    <div className="text-sm">
                                                        {h.gainPercent >= 0 ? '+' : ''}{h.gainPercent.toFixed(2)}%
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-2 sm:px-4 py-4">
                                                <button
                                                    onClick={() => handleDeleteHolding(h.portfolioId, h)}
                                                    className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
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
        </div>
    );
}
