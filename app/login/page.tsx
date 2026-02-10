'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const authRedirectBase = process.env.NEXT_PUBLIC_AUTH_REDIRECT || 'http://pearto.com';
        const redirectParam = searchParams.get('redirect');

        let redirectUrl = `${authRedirectBase}/login?redirect=true`;
        if (redirectParam) {
            redirectUrl += `&redirectTo=${encodeURIComponent(redirectParam)}`;
        }

        // Short delay to ensure the user sees the "Secure" branding before jumping
        const timer = setTimeout(() => {
            window.location.href = redirectUrl;
        }, 500);

        return () => clearTimeout(timer);
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fcfdfd] dark:bg-slate-900">
            {/* Subtle background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-emerald-50/50 dark:bg-emerald-900/20 blur-3xl" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-teal-50/50 dark:bg-teal-900/20 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-sm px-6 text-center">
                {/* Logo Animation */}
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/20 animate-bounce">
                            <span className="text-white font-bold text-2xl">P</span>
                        </div>
                        <div className="absolute -right-2 -bottom-2 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm border border-gray-50 dark:border-slate-700">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                        </div>
                    </div>
                </div>

                {/* Text Content */}
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Connecting to Pearto Auth
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                    Please wait while we securely redirect you to the login portal.
                </p>

                {/* Progress Indicator */}
                <div className="flex flex-col items-center gap-4">
                    <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full w-2/3 animate-[loading_1.5s_ease-in-out_infinite] rounded-full" />
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Secure Session Initializing
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
            `}</style>
        </div>
    );
}