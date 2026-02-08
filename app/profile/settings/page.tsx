'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useCountry } from '@/app/context/CountryContext';
import {
    ArrowLeft,
    User,
    Mail,
    Lock,
    Globe,
    Bell,
    Shield,
    Loader2,
    CheckCircle,
    ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { user, isAuthenticated, isLoading: authLoading, updateProfile } = useAuth();
    const { country, countries, setCountry, source } = useCountry();
    const router = useRouter();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push('/login');
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || user.name?.split(' ')[0] || '');
            setLastName(user.lastName || user.name?.split(' ').slice(1).join(' ') || '');
        }
    }, [user]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-green-500 border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated || !user) return null;

    const handleSaveProfile = async () => {
        setSaving(true);
        setSaved(false);
        try {
            await updateProfile({
                firstName,
                lastName,
                name: `${firstName} ${lastName}`.trim(),
            });
            setSaved(true);
            toast.success('Profile updated');
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            console.error('Failed to save profile', e);
            toast.error('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 pb-8">
                <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/profile"
                            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-xl sm:text-2xl font-bold text-white">Settings</h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-2xl">
                <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden mb-6">
                    <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-slate-400 dark:text-gray-500" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Profile</h2>
                        </div>
                    </div>
                    <div className="p-4 sm:p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">First name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Last name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Email</label>
                            <div className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-slate-400 dark:text-gray-500" />
                                <span className="text-slate-600 dark:text-gray-400">{user.email}</span>
                                <span className="px-2 py-0.5 rounded-lg text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 font-medium">
                                    Verified
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving…
                                </>
                            ) : saved ? (
                                <>
                                    <CheckCircle className="h-4 w-4" />
                                    Saved!
                                </>
                            ) : (
                                'Save changes'
                            )}
                        </button>
                    </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden mb-6">
                    <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <Globe className="h-5 w-5 text-slate-400 dark:text-gray-500" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Country & Region</h2>
                        </div>
                    </div>
                    <div className="p-4 sm:p-6">
                        <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">
                            Your country is used for market data and localization.
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                            >
                                {countries.length > 0 ? (
                                    countries.map((c) => (
                                        <option key={c.code} value={c.code}>
                                            {c.flagEmoji} {c.name} ({c.code})
                                        </option>
                                    ))
                                ) : (
                                    <>
                                        <option value="US">🇺🇸 United States (US)</option>
                                        <option value="NP">🇳🇵 Nepal (NP)</option>
                                        <option value="IN">🇮🇳 India (IN)</option>
                                        <option value="GB">🇬🇧 United Kingdom (GB)</option>
                                    </>
                                )}
                            </select>
                            <span className="text-xs text-slate-400 dark:text-gray-500 sm:flex-shrink-0">
                                {source === 'auto' ? 'Auto-detected' : 'Manual'}
                            </span>
                        </div>
                    </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden mb-6">
                    <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-slate-400 dark:text-gray-500" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Security</h2>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-gray-700">
                        <Link
                            href="/forgot-password"
                            className="flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-gray-700 transition"
                        >
                            <div className="flex items-center gap-4">
                                <Lock className="h-5 w-5 text-slate-400 dark:text-gray-500 flex-shrink-0" />
                                <div>
                                    <div className="font-medium text-slate-900 dark:text-white">Change password</div>
                                    <div className="text-sm text-slate-500 dark:text-gray-400">Update your password</div>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-300 dark:text-gray-600 flex-shrink-0" />
                        </Link>
                    </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden mb-6">
                    <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-slate-400 dark:text-gray-500" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Notifications</h2>
                        </div>
                    </div>
                    <div className="p-4 sm:p-6 space-y-4">
                        <label className="flex items-center justify-between gap-4 cursor-pointer">
                            <span className="text-slate-700 dark:text-gray-300">Email notifications</span>
                            <input type="checkbox" defaultChecked className="h-5 w-5 rounded text-green-500 focus:ring-green-500" />
                        </label>
                        <label className="flex items-center justify-between gap-4 cursor-pointer">
                            <span className="text-slate-700 dark:text-gray-300">Price alerts</span>
                            <input type="checkbox" defaultChecked className="h-5 w-5 rounded text-green-500 focus:ring-green-500" />
                        </label>
                        <label className="flex items-center justify-between gap-4 cursor-pointer">
                            <span className="text-slate-700 dark:text-gray-300">Market news</span>
                            <input type="checkbox" className="h-5 w-5 rounded text-green-500 focus:ring-green-500" />
                        </label>
                        <label className="flex items-center justify-between gap-4 cursor-pointer">
                            <span className="text-slate-700 dark:text-gray-300">Weekly portfolio summary</span>
                            <input type="checkbox" defaultChecked className="h-5 w-5 rounded text-green-500 focus:ring-green-500" />
                        </label>
                    </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-red-200 dark:border-red-900 overflow-hidden">
                    <div className="px-4 sm:px-6 py-4 border-b border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20">
                        <h2 className="font-semibold text-red-900 dark:text-red-400">Danger zone</h2>
                    </div>
                    <div className="p-4 sm:p-6">
                        <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">
                            Deleting your account is permanent. This cannot be undone.
                        </p>
                        <button className="px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 font-medium transition">
                            Delete account
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
