'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, Sparkles } from 'lucide-react';

interface SignInToContinueProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function SignInToContinue({ isOpen, onClose, message }: SignInToContinueProps) {
  const pathname = usePathname();
  
  if (!isOpen) return null;

  const redirectUrl = typeof window !== 'undefined' ? window.location.href : '';
  const loginUrl = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
  const signupUrl = `/signup?redirect=${encodeURIComponent(redirectUrl)}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-emerald-500 to-teal-500 rounded-2xl animate-pulse opacity-20"></div>
            <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-blue-500 via-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
              <LogIn className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Sign In to Continue</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-7 leading-relaxed">
            {message || 'Please sign in to access this feature and unlock personalized tools.'}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href={loginUrl}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-emerald-600 to-teal-600 hover:from-blue-700 hover:via-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <LogIn className="w-5 h-5" /> Sign In
            </Link>
            <button
              onClick={onClose}
              className="w-full py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              Maybe later
            </button>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              New here? <Link href={signupUrl} className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
