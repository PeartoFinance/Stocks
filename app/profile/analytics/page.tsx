'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { BarChart3, ArrowLeft, PieChart } from 'lucide-react';

export default function AnalyticsPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.push('/login');
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-green-500 border-t-transparent" />
            </div>
        );
    }
    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 pb-8">
                <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex items-center gap-3">
                        <Link href="/profile" className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                            <h1 className="text-xl sm:text-2xl font-bold text-white">Analytics</h1>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 sm:px-6 py-12 max-w-2xl">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm p-8 sm:p-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                        <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Performance analytics</h2>
                    <p className="text-slate-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                        Portfolio analytics, allocation, and performance metrics are coming soon.
                    </p>
                    <Link
                        href="/profile/portfolio"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition"
                    >
                        <PieChart className="h-5 w-5" />
                        View Portfolio
                    </Link>
                </div>
            </div>
        </div>
    );
}
