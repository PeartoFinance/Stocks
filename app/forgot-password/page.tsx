'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to send reset email');
            }

            setSuccess(true);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to send reset email';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
                        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-8 w-8 text-emerald-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
                        <p className="text-gray-500 mb-6">
                            We've sent a password reset link to <strong>{email}</strong>
                        </p>
                        <p className="text-sm text-gray-400 mb-6">
                            Didn't receive the email? Check your spam folder or try again.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => setSuccess(false)}
                                className="w-full py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
                            >
                                Try a different email
                            </button>
                            <Link
                                href="/login"
                                className="block w-full py-3 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition text-center"
                            >
                                Back to sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">P</span>
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                            Pearto Stocks
                        </span>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to sign in
                        </Link>

                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot password?</h1>
                        <p className="text-gray-500 mb-8">
                            No worries, we'll send you reset instructions.
                        </p>

                        {error && (
                            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:ring-2 focus:ring-emerald-500/50 transition shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Reset password'
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Back to home */}
                <p className="text-center mt-6">
                    <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                        ← Back to Stock Analysis
                    </Link>
                </p>
            </div>
        </div>
    );
}
