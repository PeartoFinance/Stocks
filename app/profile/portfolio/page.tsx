'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import {
    ArrowLeft,
    Plus,
    TrendingUp,
    TrendingDown,
    DollarSign,
    PieChart,
    RefreshCw
} from 'lucide-react';

export default function PortfolioPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

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

    // Mock portfolio data - will be replaced with real API data
    const portfolioSummary = {
        totalValue: 0,
        totalGain: 0,
        totalGainPercent: 0,
        dayChange: 0,
        dayChangePercent: 0,
    };

    const holdings: Array<{
        symbol: string;
        name: string;
        shares: number;
        avgCost: number;
        currentPrice: number;
        value: number;
        gain: number;
        gainPercent: number;
    }> = [];

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
                            <h1 className="text-xl font-bold text-gray-900">Portfolio</h1>
                        </div>
                        <button
                            onClick={() => setLoading(true)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            disabled={loading}
                        >
                            <RefreshCw className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <DollarSign className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="text-sm text-gray-500">Total Value</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            ${portfolioSummary.totalValue.toLocaleString()}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-emerald-100">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                            </div>
                            <span className="text-sm text-gray-500">Total Gain</span>
                        </div>
                        <div className={`text-2xl font-bold ${portfolioSummary.totalGain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            ${portfolioSummary.totalGain.toLocaleString()}
                            <span className="text-sm ml-1">
                                ({portfolioSummary.totalGainPercent >= 0 ? '+' : ''}{portfolioSummary.totalGainPercent.toFixed(2)}%)
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-purple-100">
                                <PieChart className="h-5 w-5 text-purple-600" />
                            </div>
                            <span className="text-sm text-gray-500">Day Change</span>
                        </div>
                        <div className={`text-2xl font-bold ${portfolioSummary.dayChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            ${portfolioSummary.dayChange.toLocaleString()}
                            <span className="text-sm ml-1">
                                ({portfolioSummary.dayChangePercent >= 0 ? '+' : ''}{portfolioSummary.dayChangePercent.toFixed(2)}%)
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm text-gray-500">Holdings</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{holdings.length}</div>
                    </div>
                </div>

                {/* Holdings Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900">Holdings</h2>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition">
                            <Plus className="h-4 w-4" />
                            Add Stock
                        </button>
                    </div>

                    {holdings.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <PieChart className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No holdings yet</h3>
                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                Start building your portfolio by adding your first stock or investment.
                            </p>
                            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition">
                                <Plus className="h-5 w-5" />
                                Add Your First Stock
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Cost</th>
                                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Gain/Loss</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {holdings.map((holding) => (
                                        <tr key={holding.symbol} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <Link href={`/stock/${holding.symbol}`} className="hover:text-emerald-600">
                                                    <div className="font-medium text-gray-900">{holding.symbol}</div>
                                                    <div className="text-sm text-gray-500">{holding.name}</div>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-900">{holding.shares}</td>
                                            <td className="px-6 py-4 text-right text-gray-900">${holding.avgCost.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right text-gray-900">${holding.currentPrice.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right text-gray-900">${holding.value.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className={holding.gain >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                                    <div className="font-medium">${holding.gain.toLocaleString()}</div>
                                                    <div className="text-sm">
                                                        {holding.gainPercent >= 0 ? '+' : ''}{holding.gainPercent.toFixed(2)}%
                                                    </div>
                                                </div>
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
