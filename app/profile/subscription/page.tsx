'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useSubscription } from '@/app/context/SubscriptionContext';
import {
  Crown,
  ArrowLeft,
  Check,
  Activity,
  Calendar,
  TrendingUp,
  Zap,
  BarChart3,
  Download,
  Bell,
  Layout,
  Filter,
} from 'lucide-react';

const FEATURE_DETAILS = [
  { key: 'ai_queries_limit', label: 'AI Analysis Queries', icon: Zap, description: 'Get AI-powered stock insights' },
  { key: 'advanced_charts_limit', label: 'Advanced Charts', icon: BarChart3, description: 'Access detailed chart analysis' },
  { key: 'download_reports_limit', label: 'Download Reports', icon: Download, description: 'Export financial reports' },
  { key: 'alerts_limit', label: 'Price Alerts', icon: Bell, description: 'Set custom price notifications' },
  { key: 'chart_templates_limit', label: 'Chart Templates', icon: Layout, description: 'Save custom chart layouts' },
];

export default function SubscriptionPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const subscription = useSubscription();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || subscription.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Activity className="h-12 w-12 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 100;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <Link href="/profile" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium transition">
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className={`rounded-2xl p-8 mb-8 ${
          subscription.isPro 
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' 
            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
        }`}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Crown className={`h-8 w-8 ${subscription.isPro ? 'text-white' : 'text-slate-400'}`} />
                <h1 className={`text-3xl font-bold ${subscription.isPro ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {subscription.planName} Plan
                </h1>
              </div>
              <p className={subscription.isPro ? 'text-white/80' : 'text-slate-500'}>
                {subscription.isPro ? 'You have access to all premium features' : 'Upgrade to unlock premium features'}
              </p>
            </div>
            {!subscription.isPro && (
              <button
                onClick={() => router.push('/pro')}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition"
              >
                Upgrade to Pro
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl ${subscription.isPro ? 'bg-white/10 backdrop-blur-sm' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Activity className={`h-5 w-5 ${subscription.isPro ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
                <span className={`text-sm font-medium ${subscription.isPro ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'}`}>Status</span>
              </div>
              <p className={`text-xl font-bold ${subscription.isPro ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </p>
            </div>

            <div className={`p-4 rounded-xl ${subscription.isPro ? 'bg-white/10 backdrop-blur-sm' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className={`h-5 w-5 ${subscription.isPro ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
                <span className={`text-sm font-medium ${subscription.isPro ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'}`}>
                  {subscription.isPro ? 'Expires' : 'Member Since'}
                </span>
              </div>
              <p className={`text-xl font-bold ${subscription.isPro ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                {formatDate(subscription.expiresAt)}
              </p>
            </div>

            <div className={`p-4 rounded-xl ${subscription.isPro ? 'bg-white/10 backdrop-blur-sm' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className={`h-5 w-5 ${subscription.isPro ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
                <span className={`text-sm font-medium ${subscription.isPro ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'}`}>Features</span>
              </div>
              <p className={`text-xl font-bold ${subscription.isPro ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                {subscription.isPro ? 'Unlimited' : 'Limited'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Feature Usage</h2>
          
          <div className="space-y-6">
            {FEATURE_DETAILS.map((feature) => {
              const usage = subscription.usage[feature.key];
              const used = usage?.used || 0;
              const limit = usage?.limit || (subscription.isPro ? -1 : 3);
              const remaining = subscription.isPro ? -1 : (usage?.remaining ?? limit);
              const percentage = getUsagePercentage(used, limit);

              return (
                <div key={feature.key} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                        <feature.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{feature.label}</h3>
                        <p className="text-sm text-slate-500">{feature.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {subscription.isPro ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                          <Check className="h-4 w-4" />
                          Unlimited
                        </span>
                      ) : (
                        <div>
                          <p className="text-lg font-bold text-slate-900 dark:text-white">
                            {used} / {limit}
                          </p>
                          <p className="text-sm text-slate-500">
                            {remaining} remaining
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {!subscription.isPro && (
                    <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 ${getUsageColor(percentage)} transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {!subscription.isPro && (
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Unlock Unlimited Access</h2>
                <p className="text-white/80 mb-6">Get unlimited access to all premium features and take your trading to the next level</p>
                <ul className="space-y-2 mb-6">
                  {['Unlimited AI Analysis', 'Advanced Charts & Tools', 'Priority Support', 'Export Reports', 'Custom Alerts'].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="h-5 w-5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => router.push('/pro')}
                  className="px-8 py-3 bg-white text-emerald-600 rounded-xl font-bold hover:bg-slate-50 transition"
                >
                  Upgrade Now
                </button>
              </div>
              <Crown className="h-24 w-24 text-white/20" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
