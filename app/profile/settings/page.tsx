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
    ChevronRight
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function SettingsPage() {
    const { user, isAuthenticated, isLoading: authLoading, updateProfile } = useAuth();
    const { country, countries, setCountry, source } = useCountry();
    const router = useRouter();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || user.name?.split(' ')[0] || '');
            setLastName(user.lastName || user.name?.split(' ').slice(1).join(' ') || '');
        }
    }, [user]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await updateProfile({
                firstName,
                lastName,
                name: `${firstName} ${lastName}`.trim(),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Failed to save profile:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/profile"
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Profile Section */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-gray-400" />
                            <h2 className="font-semibold text-gray-900">Profile Information</h2>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                            <div className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-gray-400" />
                                <span className="text-gray-600">{user.email}</span>
                                <span className="px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-700">Verified</span>
                            </div>
                        </div>
                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
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

                {/* Country/Region */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <Globe className="h-5 w-5 text-gray-400" />
                            <h2 className="font-semibold text-gray-900">Country & Region</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-gray-500 mb-4">
                            Select your country to see country-specific market data, currencies, and localized content.
                        </p>
                        <div className="flex items-center gap-4">
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                            >
                                {countries.length > 0 ? (
                                    countries.map((c) => (
                                        <option key={c.code} value={c.code}>
                                            {c.flag_emoji} {c.name} ({c.code})
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
                            <span className="text-xs text-gray-400">
                                {source === 'auto' ? 'Auto-detected' : 'Manual'}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Security */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-gray-400" />
                            <h2 className="font-semibold text-gray-900">Security</h2>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        <Link
                            href="/forgot-password"
                            className="flex items-center justify-between p-6 hover:bg-gray-50 transition"
                        >
                            <div className="flex items-center gap-4">
                                <Lock className="h-5 w-5 text-gray-400" />
                                <div>
                                    <div className="font-medium text-gray-900">Change password</div>
                                    <div className="text-sm text-gray-500">Update your password regularly for security</div>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-300" />
                        </Link>
                    </div>
                </section>

                {/* Notifications */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-gray-400" />
                            <h2 className="font-semibold text-gray-900">Notifications</h2>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <label className="flex items-center justify-between">
                            <span className="text-gray-700">Email notifications</span>
                            <input type="checkbox" defaultChecked className="h-5 w-5 rounded text-emerald-500 focus:ring-emerald-500" />
                        </label>
                        <label className="flex items-center justify-between">
                            <span className="text-gray-700">Price alerts</span>
                            <input type="checkbox" defaultChecked className="h-5 w-5 rounded text-emerald-500 focus:ring-emerald-500" />
                        </label>
                        <label className="flex items-center justify-between">
                            <span className="text-gray-700">Market news updates</span>
                            <input type="checkbox" className="h-5 w-5 rounded text-emerald-500 focus:ring-emerald-500" />
                        </label>
                        <label className="flex items-center justify-between">
                            <span className="text-gray-700">Weekly portfolio summary</span>
                            <input type="checkbox" defaultChecked className="h-5 w-5 rounded text-emerald-500 focus:ring-emerald-500" />
                        </label>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-red-100 bg-red-50">
                        <h2 className="font-semibold text-red-900">Danger Zone</h2>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-gray-500 mb-4">
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <button className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-medium transition">
                            Delete account
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
