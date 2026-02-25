'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { getPortfolioInsights, getWealthHistory, type PortfolioInsights, type WealthHistoryPoint } from '@/app/utils/portfolioAPI';
import {
    ArrowLeft,
    Loader2,
    TrendingUp,
    TrendingDown,
    PieChart,
    BarChart3,
    Wallet,
    Target,
    RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'];

export default function InsightsPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState<PortfolioInsights | null>(null);
    const [wealthHistory, setWealthHistory] = useState<WealthHistoryPoint[]>([]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push('/login');
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (!isAuthenticated) return;
        loadInsights();
    }, [isAuthenticated]);

    const loadInsights = async () => {
        try {
            setLoading(true);
            const [insightsData, historyData] = await Promise.all([
                getPortfolioInsights(),
                getWealthHistory(30)
            ]);
            setInsights(insightsData);
            setWealthHistory(historyData);
        } catch (error) {
            console.error('Failed to load insights:', error);
            toast.error('Failed to load portfolio insights');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (num: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    const formatPercent = (num: number) => {
        return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900/95">
                <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!insights) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900/95">
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 dark:from-slate-900/95 dark:to-slate-900/95 pb-8">
                    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 border-b border-emerald-600/20 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                            <Link href="/profile" className="p-2 rounded-lg bg-white/20 hover:bg-white/30 dark:bg-slate-800 dark:hover:bg-slate-700 text-white transition">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                                <BarChart3 className="h-6 w-6" />
                                Portfolio Insights
                            </h1>
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600">
                        <PieChart className="w-16 h-16 text-slate-400 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Portfolio Data</h3>
                        <p className="text-slate-500 text-sm">Add holdings to your portfolio to see insights.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900/95">
            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 dark:from-slate-900/95 dark:to-slate-900/95 pb-8">
                <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 border-b border-emerald-600/20 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/profile" className="p-2 rounded-lg bg-white/20 hover:bg-white/30 dark:bg-slate-800 dark:hover:bg-slate-700 text-white transition">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                                    <BarChart3 className="h-6 w-6" />
                                    Portfolio Insights
                                </h1>
                                <p className="text-sm text-white/80 mt-1">Analyze your investment performance</p>
                            </div>
                        </div>
                        <button onClick={loadInsights} className="p-2 rounded-lg bg-white/20 hover:bg-white/30 dark:bg-slate-800 dark:hover:bg-slate-700 text-white transition">
                            <RefreshCw className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-6xl">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <SummaryCard
                        title="Total Value"
                        value={formatCurrency(insights.totalValue)}
                        icon={<Wallet className="text-emerald-500" size={20} />}
                    />
                    <SummaryCard
                        title="Total Gain/Loss"
                        value={formatCurrency(insights.totalGain)}
                        subValue={formatPercent(insights.totalGainPercent)}
                        isPositive={insights.totalGain >= 0}
                        icon={insights.totalGain >= 0 ? <TrendingUp className="text-emerald-500" size={20} /> : <TrendingDown className="text-red-500" size={20} />}
                    />
                    <SummaryCard
                        title="Holdings"
                        value={String(insights.holdingsCount)}
                        icon={<BarChart3 className="text-blue-500" size={20} />}
                    />
                    <SummaryCard
                        title="Sectors"
                        value={String(insights.sectorBreakdown?.length || 0)}
                        icon={<PieChart className="text-purple-500" size={20} />}
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Portfolio Allocation */}
                    <ChartCard title="Portfolio Allocation" icon={<PieChart size={18} />}>
                        {insights.allocation && insights.allocation.length > 0 ? (
                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                                <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0">
                                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                        {renderPieSlices(insights.allocation.slice(0, 6))}
                                    </svg>
                                </div>
                                <div className="flex-1 space-y-2 w-full">
                                    {insights.allocation.slice(0, 6).map((item, i) => (
                                        <div key={item.symbol} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                <span className="text-xs sm:text-sm text-slate-900 dark:text-white font-medium">{item.symbol}</span>
                                            </div>
                                            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{item.weight.toFixed(1)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <EmptyChart message="No holdings to display" />
                        )}
                    </ChartCard>

                    {/* Sector Breakdown */}
                    <ChartCard title="Sector Breakdown" icon={<Target size={18} />}>
                        {insights.sectorBreakdown && insights.sectorBreakdown.length > 0 ? (
                            <div className="space-y-3">
                                {insights.sectorBreakdown.slice(0, 6).map((sector, i) => (
                                    <div key={sector.sector}>
                                        <div className="flex justify-between text-xs sm:text-sm mb-1">
                                            <span className="text-slate-900 dark:text-white">{sector.sector}</span>
                                            <span className="text-slate-500 dark:text-slate-400">{sector.weight.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${sector.weight}%`,
                                                    backgroundColor: COLORS[i % COLORS.length]
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyChart message="No sector data available" />
                        )}
                    </ChartCard>

                    {/* Top Performers */}
                    <ChartCard title="Top Performers" icon={<TrendingUp size={18} className="text-emerald-500" />}>
                        {insights.topPerformers && insights.topPerformers.length > 0 ? (
                            <div className="space-y-2 sm:space-y-3">
                                {insights.topPerformers.slice(0, 5).map((item) => (
                                    <div key={item.symbol} className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700/50 last:border-0">
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{item.symbol}</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-500 ml-2 hidden sm:inline">{item.name}</span>
                                        </div>
                                        <span className={`text-sm font-bold ${item.gainPercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {formatPercent(item.gainPercent)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyChart message="No performance data" />
                        )}
                    </ChartCard>

                    {/* Worst Performers */}
                    <ChartCard title="Underperformers" icon={<TrendingDown size={18} className="text-red-500" />}>
                        {insights.worstPerformers && insights.worstPerformers.length > 0 ? (
                            <div className="space-y-2 sm:space-y-3">
                                {insights.worstPerformers.slice(0, 5).map((item) => (
                                    <div key={item.symbol} className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700/50 last:border-0">
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{item.symbol}</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-500 ml-2 hidden sm:inline">{item.name}</span>
                                        </div>
                                        <span className={`text-sm font-bold ${item.gainPercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {formatPercent(item.gainPercent)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyChart message="No performance data" />
                        )}
                    </ChartCard>
                </div>

                {/* Net Worth History */}
                {wealthHistory.length > 0 && (
                    <ChartCard title="Net Worth History (30 Days)" icon={<BarChart3 size={18} />}>
                        <div className="h-40 sm:h-48">
                            <NetWorthChart data={wealthHistory} />
                        </div>
                    </ChartCard>
                )}
            </div>
        </div>
    );
}

function SummaryCard({ title, value, subValue, isPositive, icon }: {
    title: string;
    value: string;
    subValue?: string;
    isPositive?: boolean;
    icon: React.ReactNode;
}) {
    return (
        <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">{title}</span>
                {icon}
            </div>
            <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{value}</div>
            {subValue && (
                <div className={`text-xs sm:text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {subValue}
                </div>
            )}
        </div>
    );
}

function ChartCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="text-slate-500 dark:text-slate-400">{icon}</div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
            </div>
            {children}
        </div>
    );
}

function EmptyChart({ message }: { message: string }) {
    return (
        <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-500 text-xs sm:text-sm">
            {message}
        </div>
    );
}

function renderPieSlices(data: { weight: number }[]) {
    let cumulativePercent = 0;

    return data.map((item, i) => {
        const startAngle = cumulativePercent * 3.6;
        cumulativePercent += item.weight;
        const endAngle = cumulativePercent * 3.6;

        const largeArcFlag = item.weight > 50 ? 1 : 0;

        const startX = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
        const startY = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
        const endX = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
        const endY = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

        return (
            <path
                key={i}
                d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                fill={COLORS[i % COLORS.length]}
                stroke="#1e293b"
                strokeWidth="1"
            />
        );
    });
}

function NetWorthChart({ data }: { data: WealthHistoryPoint[] }) {
    if (data.length < 2) return <EmptyChart message="Not enough data points" />;

    const values = data.map(d => d.totalValue);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((d.totalValue - minValue) / range) * 80 - 10;
        return `${x},${y}`;
    }).join(' ');

    const isPositive = data[data.length - 1]?.totalValue >= data[0]?.totalValue;

    return (
        <div className="relative w-full h-full">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                <line x1="0" y1="50" x2="100" y2="50" stroke="#334155" strokeWidth="0.5" strokeDasharray="2" />
                <polygon
                    points={`0,100 ${points} 100,100`}
                    fill={isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}
                />
                <polyline
                    points={points}
                    fill="none"
                    stroke={isPositive ? '#10b981' : '#ef4444'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-slate-500 dark:text-slate-500">
                <span>{data[0]?.date?.split('T')[0]}</span>
                <span>{data[data.length - 1]?.date?.split('T')[0]}</span>
            </div>
        </div>
    );
}
