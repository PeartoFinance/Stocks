'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useCountry } from '@/app/context/CountryContext';
import { changePassword, deactivateAccount, deleteAccount } from '@/app/utils/auth';
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
    Sun,
    Moon,
    Monitor,
    Palette,
    Eye,
    EyeOff,
    XCircle,
    Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

function ChangePasswordSection() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('All fields are required');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            await changePassword(currentPassword, newPassword);
            toast.success('Password changed successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast.error(error.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                    Current Password
                </label>
                <div className="relative">
                    <input
                        type={showCurrent ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2.5 pr-10 rounded-lg border border-slate-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                        placeholder="Enter current password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                    New Password
                </label>
                <div className="relative">
                    <input
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 pr-10 rounded-lg border border-slate-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                        placeholder="Enter new password (min 8 characters)"
                    />
                    <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                </label>
                <div className="relative">
                    <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 pr-10 rounded-lg border border-slate-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                        placeholder="Confirm new password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>
            <button
                onClick={handleChangePassword}
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-slate-300 dark:disabled:bg-gray-700 text-white font-medium transition flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Changing...
                    </>
                ) : (
                    <>
                        <Lock className="h-4 w-4" />
                        Change Password
                    </>
                )}
            </button>
        </div>
    );
}

function DangerZoneSection() {
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deactivateReason, setDeactivateReason] = useState('');
    const [deactivatePassword, setDeactivatePassword] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDeactivate = async () => {
        if (!deactivatePassword) {
            toast.error('Password is required');
            return;
        }
        setLoading(true);
        try {
            await deactivateAccount(deactivatePassword, deactivateReason);
            toast.success('Account deactivated');
        } catch (error: any) {
            toast.error(error.message || 'Failed to deactivate account');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deletePassword) {
            toast.error('Password is required');
            return;
        }
        setLoading(true);
        try {
            await deleteAccount(deletePassword);
            toast.success('Account deleted');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-4">
            {/* Deactivate Account */}
            <div className="flex items-start justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/10">
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Deactivate Account</h3>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Temporarily disable your account. You can reactivate it later.</p>
                </div>
                <button
                    onClick={() => setShowDeactivateModal(true)}
                    className="ml-4 px-4 py-2 rounded-lg border border-orange-300 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 font-medium transition flex items-center gap-2"
                >
                    <XCircle size={16} />
                    Deactivate
                </button>
            </div>

            {/* Delete Account */}
            <div className="flex items-start justify-between p-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10">
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Delete Account Permanently</h3>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Permanently delete your account and all data. 30-day recovery window.</p>
                </div>
                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="ml-4 px-4 py-2 rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 font-medium transition flex items-center gap-2"
                >
                    <Trash2 size={16} />
                    Delete
                </button>
            </div>

            {/* Deactivate Modal */}
            {showDeactivateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Deactivate Account</h3>
                        <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">Your account will be temporarily disabled. You can reactivate it anytime by logging in.</p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Enter your password to confirm</label>
                            <input
                                type="password"
                                value={deactivatePassword}
                                onChange={(e) => setDeactivatePassword(e.target.value)}
                                placeholder="Password"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white mb-3"
                            />
                        </div>
                        <textarea
                            value={deactivateReason}
                            onChange={(e) => setDeactivateReason(e.target.value)}
                            placeholder="Reason for deactivation (optional)"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white mb-4"
                            rows={3}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeactivateModal(false)}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 font-medium transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeactivate}
                                disabled={loading || !deactivatePassword}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 dark:disabled:bg-gray-700 text-white font-medium transition"
                            >
                                {loading ? 'Deactivating...' : 'Deactivate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Delete Account Permanently</h3>
                        <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">This action cannot be undone. All your data will be permanently deleted after 30 days.</p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Enter your password to confirm</label>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Password"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 font-medium transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading || !deletePassword}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-gray-700 text-white font-medium transition"
                            >
                                {loading ? 'Deleting...' : 'Delete Forever'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SettingsPage() {
    const { user, isAuthenticated, isLoading: authLoading, updateProfile, refreshUser } = useAuth();
    const { country, countries, setCountry } = useCountry();
    const router = useRouter();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [saving, setSaving] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
        setTheme(savedTheme);
    }, []);

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
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900/95">
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

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        const root = document.documentElement;
        if (newTheme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.toggle('dark', prefersDark);
        } else {
            root.classList.toggle('dark', newTheme === 'dark');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900/95 pt-6">
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
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 mb-6">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Security
                        </h2>
                    </div>
                    <ChangePasswordSection />
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

                {/* Theme Preferences */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Theme
                    </h2>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleThemeChange('light')}
                            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                                theme === 'light'
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : 'border-slate-200 dark:border-gray-700 hover:border-green-300'
                            }`}
                        >
                            <Sun className={`h-5 w-5 mx-auto mb-1 ${
                                theme === 'light' ? 'text-green-600' : 'text-slate-400'
                            }`} />
                            <div className={`text-sm font-medium ${
                                theme === 'light' ? 'text-green-700 dark:text-green-400' : 'text-slate-600 dark:text-gray-400'
                            }`}>Light</div>
                        </button>
                        <button
                            onClick={() => handleThemeChange('dark')}
                            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                                theme === 'dark'
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : 'border-slate-200 dark:border-gray-700 hover:border-green-300'
                            }`}
                        >
                            <Moon className={`h-5 w-5 mx-auto mb-1 ${
                                theme === 'dark' ? 'text-green-600 dark:text-green-400' : 'text-slate-400'
                            }`} />
                            <div className={`text-sm font-medium ${
                                theme === 'dark' ? 'text-green-700 dark:text-green-400' : 'text-slate-600 dark:text-gray-400'
                            }`}>Dark</div>
                        </button>
                        <button
                            onClick={() => handleThemeChange('system')}
                            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                                theme === 'system'
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : 'border-slate-200 dark:border-gray-700 hover:border-green-300'
                            }`}
                        >
                            <Monitor className={`h-5 w-5 mx-auto mb-1 ${
                                theme === 'system' ? 'text-green-600 dark:text-green-400' : 'text-slate-400'
                            }`} />
                            <div className={`text-sm font-medium ${
                                theme === 'system' ? 'text-green-700 dark:text-green-400' : 'text-slate-600 dark:text-gray-400'
                            }`}>System</div>
                        </button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-red-200 dark:border-red-900 overflow-hidden">
                    <div className="px-6 py-4 border-b border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20">
                        <h2 className="text-lg font-semibold text-red-900 dark:text-red-400 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Danger Zone
                        </h2>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">Irreversible account actions</p>
                    </div>
                    <DangerZoneSection />
                </div>
            </div>
        </div>
    );
}
