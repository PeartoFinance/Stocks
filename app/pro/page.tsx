'use client';

import { ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';

export default function StockAnalysisProPage() {
  const mainAppUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:5173';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-32 px-4 lg:px-6 pb-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-500 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium rounded-full mb-4">
            <Zap size={14} /> Upgrade Your Experience
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
            Unlock premium features, advanced tools, and exclusive insights with our subscription plans.
          </p>
        </div>

        {/* Redirect Message */}
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              View All Plans & Pricing
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Click below to see all available subscription plans and choose the one that's right for you.
            </p>
          </div>

          <a
            href={`${mainAppUrl}/pricing`}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg shadow-emerald-500/25 text-lg"
          >
            <Zap size={20} />
            View Pricing Plans
          </a>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Start your 7-day free trial • No credit card required
          </p>
        </div>

        {/* Quick Features Preview */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { title: 'Advanced Tools', desc: 'Access premium screeners and analysis' },
            { title: 'Real-time Data', desc: 'Get instant market updates and alerts' },
            { title: 'Priority Support', desc: '24/7 dedicated customer support' },
          ].map((feature, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 text-center">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
