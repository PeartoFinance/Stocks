'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import {
    User,
    Briefcase,
    Star,
    Settings,
    Bell,
    TrendingUp,
    PieChart,
    LogOut,
    ChevronRight,
    Shield
} from 'lucide-react';

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading, logout, isAdmin, isVendor } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
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
        .map(s => s[0]?.toUpperCase())
        .join('') || 'U';

    const menuItems = [
        {
            icon: Briefcase,
            label: 'Portfolio',
            description: 'Track your investments and holdings',
            href: '/profile/portfolio',
            color: 'text-blue-500 bg-blue-100',
        },
        {
            icon: Star,
            label: 'Watchlist',
            description: 'Monitor your favorite stocks',
            href: '/profile/watchlist',
            color: 'text-yellow-500 bg-yellow-100',
        },
        {
            icon: TrendingUp,
            label: 'Insights',
            description: 'Personalized market insights',
            href: '/profile/insights',
            color: 'text-emerald-500 bg-emerald-100',
        },
        {
            icon: Bell,
            label: 'Alerts',
            description: 'Price alerts and notifications',
            href: '/profile/alerts',
            color: 'text-purple-500 bg-purple-100',
        },
        {
            icon: PieChart,
            label: 'Analytics',
            description: 'Investment performance analysis',
            href: '/profile/analytics',
            color: 'text-orange-500 bg-orange-100',
        },
        {
            icon: Settings,
            label: 'Settings',
            description: 'Account preferences and security',
            href: '/profile/settings',
            color: 'text-gray-500 bg-gray-100',
        },
    ];

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 pb-32">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="text-white/80 hover:text-white text-sm flex items-center gap-1">
                            ← Back to Stocks
                        </Link>
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition"
                            >
                                <Shield className="h-4 w-4" />
                                Admin Panel
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Card */}
            <div className="container mx-auto px-4 -mt-24">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Profile Header */}
                    <div className="p-6 md:p-8 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            {/* Avatar */}
                            <div className="relative">
                                {user.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.name}
                                        className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-lg"
                                    />
                                ) : (
                                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center ring-4 ring-white shadow-lg">
                                        <span className="text-2xl font-bold text-white">{initials}</span>
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}!</h1>
                                <p className="text-gray-500">{user.email}</p>
                                <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'User'}
                                    </span>
                                    {isVendor && (
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                            Vendor Account
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex gap-6 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">--</div>
                                    <div className="text-xs text-gray-500">Watchlist</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">--</div>
                                    <div className="text-xs text-gray-500">Alerts</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-emerald-600">--</div>
                                    <div className="text-xs text-gray-500">Portfolio</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Menu Grid */}
                    <div className="p-6 md:p-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Account</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition"
                                >
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${item.color}`}>
                                        <item.icon className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 group-hover:text-emerald-600 transition">
                                            {item.label}
                                        </div>
                                        <div className="text-sm text-gray-500">{item.description}</div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-emerald-500 transition" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Getting Started */}
                    <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h2>
                        <div className="bg-white rounded-xl p-5 border border-gray-100">
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex items-start gap-3">
                                    <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                                    <span>Add stocks to your <strong>Watchlist</strong> to track prices and get updates</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                                    <span>Create your <strong>Portfolio</strong> to track investments and calculate returns</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                                    <span>Set up <strong>Price Alerts</strong> to get notified when stocks hit your target price</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                                    <span>Use the <strong>Stock Screener</strong> to discover new investment opportunities</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Logout */}
                    <div className="p-6 md:p-8 border-t border-gray-100">
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

            {/* Spacer */}
            <div className="h-16"></div>
        </div>
    );
}
