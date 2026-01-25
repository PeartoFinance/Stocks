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
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
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
        { icon: Briefcase, label: 'Portfolio', description: 'Track your investments and holdings', href: '/profile/portfolio', color: 'text-green-600 bg-green-100' },
        { icon: Star, label: 'Watchlist', description: 'Monitor your favorite stocks', href: '/profile/watchlist', color: 'text-amber-600 bg-amber-100' },
        { icon: Bell, label: 'Alerts', description: 'Price alerts and notifications', href: '/profile/alerts', color: 'text-violet-600 bg-violet-100' },
        { icon: Lightbulb, label: 'Insights', description: 'Personalized market insights', href: '/profile/insights', color: 'text-green-600 bg-green-100' },
        { icon: BarChart3, label: 'Analytics', description: 'Investment performance analysis', href: '/profile/analytics', color: 'text-orange-600 bg-orange-100' },
        { icon: Settings, label: 'Settings', description: 'Account preferences and security', href: '/profile/settings', color: 'text-slate-600 bg-slate-100' },
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
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 pb-24 sm:pb-28 md:pb-32">
                <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Link
                            href="/"
                            className="text-white/90 hover:text-white text-sm font-medium flex items-center gap-1 transition"
                        >
                            ← Back to Stocks
                        </Link>
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-white text-sm font-medium transition backdrop-blur-sm"
                            >
                                <Shield className="h-4 w-4" />
                                Admin Panel
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Card */}
            <div className="container mx-auto px-4 sm:px-6 -mt-16 sm:-mt-20 md:-mt-24 max-w-4xl">
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    {/* Profile Header */}
                    <div className="p-4 sm:p-6 md:p-8 border-b border-slate-100">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                                <div className="relative flex-shrink-0">
                                    {user.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.name}
                                            className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover ring-4 ring-white shadow-lg"
                                        />
                                    ) : (
                                        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center ring-4 ring-white shadow-lg">
                                            <span className="text-xl sm:text-2xl font-bold text-white">{initials}</span>
                                        </div>
                                    )}
                                    <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                                        <span className="text-white text-[10px] sm:text-xs">✓</span>
                                    </div>
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                                        Welcome back, {firstName}!
                                    </h1>
                                    <p className="text-slate-500 text-sm sm:text-base mt-0.5">{user.email}</p>
                                    <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'User'}
                                        </span>
                                        {isVendor && (
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                                                Vendor
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 lg:gap-8 lg:ml-auto border-t lg:border-t-0 pt-4 lg:pt-0">
                                <Link
                                    href="/profile/watchlist"
                                    className="flex flex-col items-center min-w-[4rem] p-3 rounded-xl bg-slate-50 hover:bg-green-50 transition"
                                >
                                    {statsLoading ? (
                                        <RefreshCw className="h-6 w-6 text-green-500 animate-spin" />
                                    ) : (
                                        <span className="text-xl sm:text-2xl font-bold text-slate-900">{watchlistCount}</span>
                                    )}
                                    <span className="text-xs text-slate-500 mt-0.5">Watchlist</span>
                                </Link>
                                <Link
                                    href="/profile/alerts"
                                    className="flex flex-col items-center min-w-[4rem] p-3 rounded-xl bg-slate-50 hover:bg-green-50 transition"
                                >
                                    {statsLoading ? (
                                        <RefreshCw className="h-6 w-6 text-green-500 animate-spin" />
                                    ) : (
                                        <span className="text-xl sm:text-2xl font-bold text-slate-900">{alertsCount}</span>
                                    )}
                                    <span className="text-xs text-slate-500 mt-0.5">Alerts</span>
                                </Link>
                                <Link
                                    href="/profile/portfolio"
                                    className="flex flex-col items-center min-w-[4rem] p-3 rounded-xl bg-green-50 hover:bg-green-100 transition"
                                >
                                    {statsLoading ? (
                                        <RefreshCw className="h-6 w-6 text-green-500 animate-spin" />
                                    ) : (
                                        <>
                                            <span className="text-xl sm:text-2xl font-bold text-green-700">
                                                ${netWorth >= 1000 ? `${(netWorth / 1000).toFixed(1)}k` : netWorth.toFixed(0)}
                                            </span>
                                            <span className={`text-xs mt-0.5 ${netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {netChange >= 0 ? '+' : ''}{netChangePct.toFixed(1)}%
                                            </span>
                                        </>
                                    )}
                                    <span className="text-xs text-slate-500 mt-0.5">Portfolio</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Menu Grid */}
                    <div className="p-4 sm:p-6 md:p-8">
                        <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">Your Account</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="group flex items-center gap-3 sm:gap-4 p-4 rounded-xl border border-slate-100 hover:border-green-200 hover:bg-green-50/50 transition"
                                >
                                    <div className={`h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                                        <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-slate-900 group-hover:text-green-700 transition truncate">
                                            {item.label}
                                        </div>
                                        <div className="text-sm text-slate-500 truncate">{item.description}</div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-green-500 transition flex-shrink-0" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Getting Started */}
                    <div className="p-4 sm:p-6 md:p-8 bg-slate-50 border-t border-slate-100">
                        <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">Getting Started</h2>
                        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-100">
                            <ul className="space-y-3 text-sm text-slate-600">
                                {[
                                    'Add stocks to your Watchlist to track prices and get updates.',
                                    'Create your Portfolio to track investments and calculate returns.',
                                    'Set up Price Alerts to get notified when stocks hit your target.',
                                    'Use the Stock Screener to discover new investment opportunities.',
                                ].map((text, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                            {i + 1}
                                        </span>
                                        <span>{text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Logout */}
                    <div className="p-4 sm:p-6 md:p-8 border-t border-slate-100">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition"
                        >
                            <LogOut className="h-5 w-5" />
                            Sign out
                        </button>
                    </div>
                </div>
            </div>

            <div className="h-12 sm:h-16" />
        </div>
    );
}
