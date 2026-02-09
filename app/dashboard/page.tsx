'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import {
    BarChart3,
    Users,
    Settings,
    Package,
    DollarSign,
    TrendingUp,
    AlertCircle,
    ArrowLeft,
    Shield
} from 'lucide-react';

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading, isVendor, isAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (!isVendor && !isAdmin) {
                // Regular users should go to profile instead of dashboard
                router.push('/profile');
            }
        }
    }, [isLoading, isAuthenticated, isVendor, isAdmin, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!isAuthenticated || (!isVendor && !isAdmin)) {
        return null;
    }

    const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Partner';

    // Dashboard stats - would be fetched from API
    const stats = [
        { label: 'Total Revenue', value: '$0', change: '+0%', icon: DollarSign, color: 'text-emerald-600 bg-emerald-100' },
        { label: 'Active Users', value: '0', change: '+0', icon: Users, color: 'text-blue-600 bg-blue-100' },
        { label: 'Products', value: '0', change: '0 new', icon: Package, color: 'text-purple-600 bg-purple-100' },
        { label: 'Growth', value: '0%', change: '--', icon: TrendingUp, color: 'text-orange-600 bg-orange-100' },
    ];

    const quickActions = [
        { label: 'Manage Products', href: '/dashboard/products', icon: Package },
        { label: 'View Analytics', href: '/dashboard/analytics', icon: BarChart3 },
        { label: 'User Management', href: '/dashboard/users', icon: Users },
        { label: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950">
                <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <Link
                                href="/"
                                className="text-white/60 hover:text-white text-xs sm:text-sm flex items-center gap-1"
                            >
                                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Back to App</span>
                                <span className="sm:hidden">Back</span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs sm:text-sm transition"
                                >
                                    <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">Admin Panel</span>
                                    <span className="sm:hidden">Admin</span>
                                </Link>
                            )}
                            <Link
                                href="/profile"
                                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs sm:text-sm transition"
                            >
                                Profile
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Welcome */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 pb-20 sm:pb-24 lg:pb-32">
                <div className="container mx-auto px-3 sm:px-4 md:px-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back, {firstName}!</h1>
                    <p className="text-sm sm:text-base text-white/60">Here's what's happening with your business today.</p>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-3 sm:px-4 md:px-6 -mt-16 sm:-mt-20 lg:-mt-24">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${stat.color}`}>
                                    <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                </div>
                                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{stat.change}</span>
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden mb-6 sm:mb-8">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-slate-700">
                        <h2 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Quick Actions</h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100 dark:divide-slate-700">
                        {quickActions.map((action) => (
                            <Link
                                key={action.href}
                                href={action.href}
                                className="flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 hover:bg-gray-50 dark:hover:bg-slate-700 transition min-h-[120px]"
                            >
                                <action.icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-gray-400 dark:text-gray-500 mb-2 sm:mb-3" />
                                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{action.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Notice */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-sm sm:text-base text-amber-800 dark:text-amber-200 mb-1">Dashboard Setup Required</h3>
                            <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">
                                Complete your vendor profile and add your first product to start receiving orders.
                                Visit the Settings page to complete your setup.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-slate-700">
                        <h2 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Recent Activity</h2>
                    </div>
                    <div className="p-8 sm:p-12 text-center">
                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">No activity yet</h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto px-4">
                            Once you start receiving orders and user interactions, they'll appear here.
                        </p>
                    </div>
                </div>
            </div>

            {/* Spacer */}
            <div className="h-16"></div>
        </div>
    );
}
