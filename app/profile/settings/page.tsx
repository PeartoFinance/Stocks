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
    Globe,
    Save,
    Loader2,
    Lock,
    Shield,
    Bell,
    ChevronRight,
    AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { user, isAuthenticated, isLoading: authLoading, updateProfile, refreshUser } = useAuth();
    const { country, countries, setCountry } = useCountry();
    const router = useRouter();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push('/login');
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user) {
            // Split name into firstName and lastName if they're not available
            const nameParts = user.name?.split(' ') || [];
            setFirstName(user.firstName || nameParts[0] || '');
            setLastName(user.lastName || nameParts.slice(1).join(' ') || '');
            setAvatarUrl(user.avatarUrl || '');
        }
    }, [user]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
        );
    }

    if (!isAuthenticated || !user) return null;

    const handleSave = async () => {
        if (!firstName.trim()) {
            toast.error('First name is required');
            return;
        }

        setSaving(true);
        try {
            await updateProfile({
                firstName,
                lastName,
                name: `${firstName} ${lastName}`.trim(),
                avatarUrl: avatarUrl || undefined,
            });
            await refreshUser();
            toast.success('Profile updated successfully!');
        } catch (e) {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/profile"
                        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-800 transition"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-700 dark:text-gray-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
                        <p className="text-sm text-slate-500 dark:text-gray-400">Manage your profile and preferences</p>
                    </div>
                </div>

                {/* Profile Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Information
                    </h2>

                    {/* Avatar */}
                    <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-200 dark:border-gray-700">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="h-20 w-20 rounded-full object-cover ring-4 ring-green-500/20" />
                        ) : (
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center ring-4 ring-green-500/20">
                                <span className="text-2xl font-bold text-white">
                                    {firstName.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                        )}
                        <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white">{user.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-gray-400">{user.email}</p>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-gray-600 bg-slate-50 dark:bg-gray-700/50">
                                <Mail className="h-5 w-5 text-slate-400" />
                                <span className="text-slate-600 dark:text-gray-400">{user.email}</span>
                                <span className="ml-auto px-2 py-0.5 rounded text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 font-medium">
                                    Verified
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                                Avatar URL (optional)
                            </label>
                            <input
                                type="url"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                                placeholder="https://example.com/avatar.jpg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                                Country
                            </label>
                            <div className="flex items-center gap-3">
                                <Globe className="h-5 w-5 text-slate-400" />
                                <select
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                                >
                                    {countries.length > 0 ? (
                                        countries.map((c) => (
                                            <option key={c.code} value={c.code}>
                                                {c.flagEmoji} {c.name}
                                            </option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="US">🇺🇸 United States</option>
                                            <option value="NP">🇳🇵 Nepal</option>
                                            <option value="IN">🇮🇳 India</option>
                                            <option value="GB">🇬🇧 United Kingdom</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-gray-700">
                        <button
                            onClick={() => router.push('/profile')}
                            className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !firstName.trim()}
                            className="flex-1 px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-slate-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium transition flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Security Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 mb-6 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Security
                        </h2>
                    </div>
                    <Link
                        href="/forgot-password"
                        className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-gray-700 transition"
                    >
                        <div className="flex items-center gap-4">
                            <Lock className="h-5 w-5 text-slate-400" />
                            <div>
                                <div className="font-medium text-slate-900 dark:text-white">Change Password</div>
                                <div className="text-sm text-slate-500 dark:text-gray-400">Update your password</div>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300 dark:text-gray-600" />
                    </Link>
                </div>

                {/* Notifications Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notifications
                    </h2>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-slate-700 dark:text-gray-300">Email notifications</span>
                            <input type="checkbox" defaultChecked className="h-5 w-5 rounded text-green-500 focus:ring-green-500" />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-slate-700 dark:text-gray-300">Price alerts</span>
                            <input type="checkbox" defaultChecked className="h-5 w-5 rounded text-green-500 focus:ring-green-500" />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-slate-700 dark:text-gray-300">Market news</span>
                            <input type="checkbox" className="h-5 w-5 rounded text-green-500 focus:ring-green-500" />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-slate-700 dark:text-gray-300">Weekly portfolio summary</span>
                            <input type="checkbox" defaultChecked className="h-5 w-5 rounded text-green-500 focus:ring-green-500" />
                        </label>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-900 overflow-hidden">
                    <div className="px-6 py-4 border-b border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20">
                        <h2 className="text-lg font-semibold text-red-900 dark:text-red-400 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Danger Zone
                        </h2>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">
                            Deleting your account is permanent and cannot be undone. All your data will be lost.
                        </p>
                        <button className="px-4 py-2.5 rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 font-medium transition">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
