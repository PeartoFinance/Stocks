'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Rocket } from 'lucide-react';

export default function SignupPage() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const authRedirectBase = process.env.NEXT_PUBLIC_AUTH_REDIRECT || 'http://test.pearto.com';
        const redirectParam = searchParams.get('redirect');
        
        let redirectUrl = `${authRedirectBase}/signup?redirect=true`;
        if (redirectParam) {
            redirectUrl += `&redirectTo=${encodeURIComponent(redirectParam)}`;
        }
        
        // Immediate redirect logic
        window.location.href = redirectUrl;
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fcfdfd] dark:bg-slate-900">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-emerald-50/50 dark:bg-emerald-900/20 blur-3xl" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-teal-50/50 dark:bg-teal-900/20 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-sm px-6 text-center">
                {/* Logo and Icon Section */}
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/20 animate-pulse">
                            <span className="text-white font-bold text-2xl">P</span>
                        </div>
                        <div className="absolute -right-2 -bottom-2 bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-sm border border-gray-50 dark:border-slate-700 animate-bounce">
                            <Rocket className="h-5 w-5 text-teal-600" />
                        </div>
                    </div>
                </div>

                {/* Text Content */}
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Setting up your account
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                    Please wait while we prepare your investing dashboard and redirect you to our secure signup.
                </p>

                {/* Progress UI */}
                <div className="flex flex-col items-center gap-4">
                    <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full w-1/2 animate-[loading_1.8s_ease-in-out_infinite] rounded-full" />
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Preparing Dashboard
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(250%); }
                }
            `}</style>
        </div>
    );
}