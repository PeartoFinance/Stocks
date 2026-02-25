'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { getPortfolioHealthScore, getInvestmentGoals, updateInvestmentGoals, type PortfolioHealthScore, type InvestmentGoals } from '@/app/utils/portfolioAnalyticsAPI';
import {
    ArrowLeft,
    BarChart3,
    TrendingUp,
    Shield,
    Target,
    Activity,
    RefreshCw,
    Award,
    AlertCircle,
    Save,
    Edit,
    X,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [healthScore, setHealthScore] = useState<PortfolioHealthScore | null>(null);
    const [goals, setGoals] = useState<InvestmentGoals | null>(null);
    const [saving, setSaving] = useState(false);
    const [showGoalsModal, setShowGoalsModal] = useState(false);
    const [editedGoals, setEditedGoals] = useState<InvestmentGoals | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push('/login');
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (!isAuthenticated) return;
        loadAnalytics();
    }, [isAuthenticated]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const [healthData, goalsData] = await Promise.all([
                getPortfolioHealthScore(),
                getInvestmentGoals()
            ]);
            setHealthScore(healthData);
            setGoals(goalsData);
        } catch (error) {
            console.error('Failed to load analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const handleEditGoals = () => {
        setEditedGoals(goals);
        setShowGoalsModal(true);
    };

    const handleSaveGoals = async () => {
        if (!editedGoals) return;

        const total = editedGoals.target_stocks_percent + editedGoals.target_bonds_percent +
            editedGoals.target_cash_percent + editedGoals.target_crypto_percent +
            editedGoals.target_commodities_percent;

        if (total !== 100) {
            toast.error(`Total allocation must equal 100%. Current: ${total}%`);
            return;
        }

        setSaving(true);
        try {
            await updateInvestmentGoals(editedGoals);
            setGoals(editedGoals);
            setShowGoalsModal(false);
            toast.success('Investment goals updated successfully');
        } catch (error) {
            console.error('Failed to save goals:', error);
            toast.error('Failed to save goals');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900/95">
                <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

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
                                    Portfolio Analytics
                                </h1>
                                <p className="text-sm text-white/80 mt-1">Track your investment performance</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-6xl">
                {healthScore && (
                    <>
                        {/* Main Score Card */}
                        <div className="bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 mb-4 sm:mb-6 shadow-2xl relative overflow-hidden">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />
                            
                            <div className="relative z-10">
                                <div className="text-center mb-4 sm:mb-6">
                                    <p className="text-white/90 dark:text-slate-400 text-xs sm:text-sm font-semibold mb-2 uppercase tracking-wider">Portfolio Health Score</p>
                                    <div className="flex items-center justify-center gap-3 sm:gap-4">
                                        <div className="relative">
                                            <div className="text-5xl sm:text-7xl md:text-8xl font-black text-white drop-shadow-lg">{healthScore.overall_score}</div>
                                            <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3">
                                                <Award className="h-8 w-8 sm:h-12 sm:w-12 text-yellow-300 drop-shadow-lg animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-white/90 dark:text-slate-300 text-sm sm:text-lg font-bold mt-2 sm:mt-3">
                                        {healthScore.overall_score >= 80 ? '🎉 Excellent Performance' : healthScore.overall_score >= 60 ? '👍 Good Standing' : '⚠️ Needs Attention'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto">
                                    <div className="text-center bg-white/10 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-white/20">
                                        <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white dark:text-emerald-400 mx-auto mb-1 sm:mb-2" />
                                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{healthScore.diversification_score}</div>
                                        <p className="text-[10px] sm:text-xs text-white/90 dark:text-slate-300 mt-0.5 sm:mt-1 font-medium">Diversification</p>
                                    </div>
                                    <div className="text-center bg-white/10 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-white/20">
                                        <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white dark:text-emerald-400 mx-auto mb-1 sm:mb-2" />
                                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{healthScore.risk_score}</div>
                                        <p className="text-[10px] sm:text-xs text-white/90 dark:text-slate-300 mt-0.5 sm:mt-1 font-medium">Risk</p>
                                    </div>
                                    <div className="text-center bg-white/10 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-white/20">
                                        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white dark:text-emerald-400 mx-auto mb-1 sm:mb-2" />
                                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{healthScore.performance_score}</div>
                                        <p className="text-[10px] sm:text-xs text-white/90 dark:text-slate-300 mt-0.5 sm:mt-1 font-medium">Performance</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Scores */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                            {[
                                { score: healthScore.diversification_score, label: 'Diversification', icon: Target, color: 'blue', desc: 'Investment spread' },
                                { score: healthScore.risk_score, label: 'Risk Management', icon: Shield, color: 'purple', desc: 'Risk control' },
                                { score: healthScore.performance_score, label: 'Performance', icon: TrendingUp, color: 'green', desc: 'Portfolio returns' },
                            ].map((item, i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-3 sm:p-6 hover:shadow-xl hover:scale-105 transition-all">
                                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                                        <div className={`p-2 sm:p-3 rounded-xl bg-${item.color}-100 dark:bg-${item.color}-900/30`}>
                                            <item.icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${item.color}-600 dark:text-${item.color}-400`} />
                                        </div>
                                        <div className={`text-2xl sm:text-3xl font-black ${getScoreColor(item.score)}`}>{item.score}</div>
                                    </div>
                                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1">{item.label}</h3>
                                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3 sm:mb-4">{item.desc}</p>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className={`h-full ${getScoreBg(item.score)} transition-all duration-500`} style={{ width: `${item.score}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recommendations */}
                        {healthScore.recommendations && healthScore.recommendations.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
                                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                                    <div className="p-2 sm:p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                                        <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">Recommendations</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    {healthScore.recommendations.map((rec, index) => (
                                        <div key={index} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform">
                                            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{rec}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Investment Goals */}
                {goals && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-4 sm:p-6 md:p-8">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-2 sm:p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                                    <Target className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">Investment Strategy</h2>
                                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hidden sm:block">Your target allocation and risk profile</p>
                                </div>
                            </div>
                            <button onClick={handleEditGoals} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 font-semibold transition text-xs sm:text-base">
                                <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Edit</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 mb-6">
                            {[
                                { value: goals.target_stocks_percent, label: 'Stocks', color: 'blue', icon: '📈' },
                                { value: goals.target_bonds_percent, label: 'Bonds', color: 'purple', icon: '📊' },
                                { value: goals.target_cash_percent, label: 'Cash', color: 'green', icon: '💵' },
                                { value: goals.target_crypto_percent, label: 'Crypto', color: 'amber', icon: '₿' },
                                { value: goals.target_commodities_percent, label: 'Commodities', color: 'red', icon: '🥇' },
                            ].map((item, i) => (
                                <div key={i} className={`text-center p-3 sm:p-4 bg-${item.color}-50 dark:bg-${item.color}-900/20 rounded-xl border-2 border-${item.color}-200 dark:border-${item.color}-800 hover:scale-105 transition-transform`}>
                                    <div className="text-xl sm:text-2xl mb-1">{item.icon}</div>
                                    <div className={`text-2xl sm:text-3xl font-bold text-${item.color}-600 dark:text-${item.color}-400 mb-1`}>{item.value}%</div>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">{item.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">Risk Tolerance</p>
                                <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white capitalize flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-emerald-600" />
                                    {goals.risk_tolerance}
                                </p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">Benchmark</p>
                                <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                                    {goals.benchmark_symbol}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Goals Edit Modal */}
                {showGoalsModal && editedGoals && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50" onClick={() => setShowGoalsModal(false)}>
                        <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
                                        <Target className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Investment Goals</h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Set your target allocation</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowGoalsModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
                                    <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                </button>
                            </div>

                            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
                                {/* Total Allocation Badge */}
                                <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Allocation</span>
                                    <span className={`text-xl sm:text-2xl font-black ${
                                        (editedGoals.target_stocks_percent + editedGoals.target_bonds_percent +
                                        editedGoals.target_cash_percent + editedGoals.target_crypto_percent +
                                        editedGoals.target_commodities_percent) === 100
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-red-600 dark:text-red-400'
                                    }`}>
                                        {editedGoals.target_stocks_percent + editedGoals.target_bonds_percent +
                                        editedGoals.target_cash_percent + editedGoals.target_crypto_percent +
                                        editedGoals.target_commodities_percent}%
                                    </span>
                                </div>

                                {/* Allocation Sliders */}
                                <div className="space-y-3">
                                    {[
                                        { key: 'target_stocks_percent', label: 'Stocks', color: 'bg-blue-500', icon: '📈' },
                                        { key: 'target_bonds_percent', label: 'Bonds', color: 'bg-purple-500', icon: '📊' },
                                        { key: 'target_cash_percent', label: 'Cash', color: 'bg-green-500', icon: '💵' },
                                        { key: 'target_crypto_percent', label: 'Crypto', color: 'bg-amber-500', icon: '₿' },
                                        { key: 'target_commodities_percent', label: 'Commodities', color: 'bg-red-500', icon: '🥇' },
                                    ].map(({ key, label, color, icon }) => (
                                        <div key={key} className="group bg-white dark:bg-slate-900/50 p-3 sm:p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{icon}</span>
                                                    <span className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">{label}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={editedGoals[key as keyof InvestmentGoals]}
                                                        onChange={(e) => setEditedGoals({ ...editedGoals, [key]: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                                                        className="w-14 sm:w-16 px-2 py-1 text-center text-base sm:text-lg font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                    />
                                                    <span className="text-base sm:text-lg font-bold text-slate-500 dark:text-slate-400">%</span>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                    value={editedGoals[key as keyof InvestmentGoals] as number}
                                                    onChange={(e) => setEditedGoals({ ...editedGoals, [key]: parseInt(e.target.value) })}
                                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer"
                                                    style={{
                                                        background: `linear-gradient(to right, ${color.replace('bg-', '#')} 0%, ${color.replace('bg-', '#')} ${editedGoals[key as keyof InvestmentGoals]}%, rgb(226 232 240) ${editedGoals[key as keyof InvestmentGoals]}%, rgb(226 232 240) 100%)`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Risk & Benchmark */}
                                <div className="grid grid-cols-1 gap-4 pt-2">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Risk Tolerance</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(['conservative', 'moderate', 'aggressive'] as const).map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => setEditedGoals({ ...editedGoals, risk_tolerance: level })}
                                                    className={`py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold border-2 capitalize transition-all ${
                                                        editedGoals.risk_tolerance === level
                                                            ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white border-emerald-500 shadow-lg scale-105'
                                                            : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                                                    }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Benchmark Index</label>
                                        <select
                                            value={editedGoals.benchmark_symbol}
                                            onChange={(e) => setEditedGoals({ ...editedGoals, benchmark_symbol: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                                        >
                                            <option value="^GSPC">📊 S&P 500</option>
                                            <option value="^IXIC">💻 Nasdaq</option>
                                            <option value="^DJI">📈 Dow Jones</option>
                                            <option value="^RUT">🏢 Russell 2000</option>
                                            <option value="BTC-USD">₿ Bitcoin</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-2 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
                                    <button onClick={() => setShowGoalsModal(false)} className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition font-semibold text-sm sm:text-base">
                                        Cancel
                                    </button>
                                    <button onClick={handleSaveGoals} disabled={saving} className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base">
                                        {saving ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 sm:h-5 sm:w-5" />
                                                <span>Save Goals</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
