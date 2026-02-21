'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { fetchProfileStats, type ProfileStats } from '@/app/utils/profileAPI';
import {
    Briefcase,
    Star,
    Settings,
    Bell,
    LogOut,
    ChevronRight,
    Shield,
    RefreshCw,
    BarChart3,
    Lightbulb,
} from 'lucide-react';

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading, logout, isAdmin, isVendor } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (!isAuthenticated) return;
        let cancelled = false;
        setStatsLoading(true);
        fetchProfileStats()
            .then((s) => { if (!cancelled) setStats(s); })
            .catch(() => { if (!cancelled) setStats(null); })
            .finally(() => { if (!cancelled) setStatsLoading(false); });
        return () => { cancelled = true; };
    }, [isAuthenticated]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900/95">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-green-500 border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    const firstName = user.firstName || user.name?.split(' ')[0] || 'User';
    const initials = (user.name || user.email || 'U')
        .split(/[\s@._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join('') || 'U';

    const menuItems = [
        { icon: Briefcase, label: 'Portfolio', description: 'Track your investments and holdings', href: '/profile/portfolio', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
        { icon: Star, label: 'Watchlist', description: 'Monitor your favorite stocks', href: '/profile/watchlist', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
        { icon: Bell, label: 'Alerts', description: 'Price alerts and notifications', href: '/profile/alerts', color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30' },
        { icon: Lightbulb, label: 'Insights', description: 'Personalized market insights', href: '/profile/insights', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
        { icon: BarChart3, label: 'Analytics', description: 'Investment performance analysis', href: '/profile/analytics', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
        { icon: Settings, label: 'Settings', description: 'Account preferences and security', href: '/profile/settings', color: 'text-slate-600 bg-slate-100 dark:bg-slate-800' },
    ];

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const watchlistCount = stats?.watchlistCount ?? 0;
    const alertsCount = stats?.alertsCount ?? 0;
    const netWorth = stats?.netWorth ?? 0;
    const netChange = stats?.netWorthChange ?? 0;
    const netChangePct = stats?.netWorthChangePercent ?? 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900/95">
            {/* Slim Top Bar */}
            <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="container mx-auto px-6 py-4 max-w-7xl">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium transition">
                            ← Back
                        </Link>
                        {isAdmin && (
                            <Link href="/admin" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium transition">
                                <Shield className="h-4 w-4" />
                                Admin
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-6 md:py-20 max-w-7xl">
                {/* User Profile Header */}
                <div className="flex items-center gap-4 mb-8 md:mb-12 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-6">
                    <div className="relative">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="h-16 w-16 rounded-2xl object-cover" />
                        ) : (
                            <div className="h-16 w-16 rounded-2xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center">
                                <span className="text-xl font-bold text-white">{initials}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{user.name || 'User'}</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors whitespace-nowrap">
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                    </button>
                </div>

                {/* Bento Grid Layout */}
                <div className="space-y-3 md:space-y-4">
                    {/* Large Portfolio Card - Full Width */}
                    <Link href="/profile/portfolio" className="block bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all group">
                        <div className="flex items-start justify-between mb-6 md:mb-8">
                            <div>
                                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                                    <div className="p-2 md:p-3 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition">
                                        <Briefcase className="h-5 w-5 md:h-6 md:w-6 text-slate-900 dark:text-white" />
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">Total Portfolio</h3>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 md:mb-3">
                                    {statsLoading ? (
                                        <RefreshCw className="h-10 w-10 animate-spin" />
                                    ) : (
                                        `$${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                    )}
                                </h2>
                                {!statsLoading && (
                                    <p className={`text-base font-semibold ${netChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {netChange >= 0 ? '+' : ''}${netChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({netChange >= 0 ? '+' : ''}{netChangePct.toFixed(2)}%)
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="h-24 md:h-32 flex items-end justify-between gap-1">
                            {[
                                { h: 65, color: 'bg-green-500' },
                                { h: 45, color: 'bg-red-500' },
                                { h: 70, color: 'bg-green-500' },
                                { h: 55, color: 'bg-red-500' },
                                { h: 80, color: 'bg-green-500' },
                                { h: 60, color: 'bg-green-500' },
                                { h: 75, color: 'bg-red-500' },
                                { h: 85, color: 'bg-green-500' },
                                { h: 70, color: 'bg-green-500' },
                                { h: 90, color: 'bg-green-500' },
                                { h: 75, color: 'bg-red-500' },
                                { h: 95, color: 'bg-green-500' },
                            ].map((bar, i) => (
                                <div key={i} className={`flex-1 ${bar.color} rounded-t hover:opacity-80 transition`} style={{ height: `${bar.h}%` }} />
                            ))}
                        </div>
                    </Link>

                    {/* Two Column Grid for Other Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {/* Watchlist Card */}
                    <Link href="/profile/watchlist" className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-6 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all group">
                        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                            <div className="p-2 md:p-3 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition">
                                <Star className="h-5 w-5 md:h-6 md:w-6 text-slate-900 dark:text-white" />
                            </div>
                            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Watchlist</h3>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                            {statsLoading ? <RefreshCw className="h-8 w-8 animate-spin" /> : watchlistCount}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Tracked stocks</p>
                    </Link>

                    {/* Alerts Card */}
                    <Link href="/profile/alerts" className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-6 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all group">
                        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                            <div className="p-2 md:p-3 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition">
                                <Bell className="h-5 w-5 md:h-6 md:w-6 text-slate-900 dark:text-white" />
                            </div>
                            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Alerts</h3>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                            {statsLoading ? <RefreshCw className="h-8 w-8 animate-spin" /> : alertsCount}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Active alerts</p>
                    </Link>

                    {/* Insights Card */}
                    <Link href="/profile/insights" className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-6 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all group">
                        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                            <div className="p-2 md:p-3 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition">
                                <Lightbulb className="h-5 w-5 md:h-6 md:w-6 text-slate-900 dark:text-white" />
                            </div>
                            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Insights</h3>
                        </div>
                        <p className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">Market analysis</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Personalized recommendations</p>
                    </Link>

                    {/* Analytics Card */}
                    <Link href="/profile/analytics" className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-6 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all group">
                        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                            <div className="p-2 md:p-3 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition">
                                <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-slate-900 dark:text-white" />
                            </div>
                            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Analytics</h3>
                        </div>
                        <p className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">Performance</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Track your investments</p>
                    </Link>

                    {/* Settings Card */}
                    <Link href="/profile/settings" className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-6 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all group">
                        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                            <div className="p-2 md:p-3 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition">
                                <Settings className="h-5 w-5 md:h-6 md:w-6 text-slate-900 dark:text-white" />
                            </div>
                            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Settings</h3>
                        </div>
                        <p className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">Preferences</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Account & security</p>
                    </Link>
                    </div>
                </div>
            </div>

            <div className="h-16" />
        </div>
    );
}
