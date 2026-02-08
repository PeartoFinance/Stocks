'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const subscribe = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Enter a valid email');
      return;
    }
    await new Promise(r => setTimeout(r, 500));
    setSubscribed(true);
    toast.success('Subscribed to Pearto Market Newsletter');
  };

  return (
    <main className="p-8 dark:bg-gray-900">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">Market Newsletter</h1>
        <p className="text-gray-600 dark:text-gray-400">Weekly insights, market movers, and curated learning—straight to your inbox.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Subscribe</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">No spam. Unsubscribe anytime.</p>

          {subscribed ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" /> You're subscribed. Check your inbox!
            </div>
          ) : (
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@domain.com" className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <button onClick={subscribe} className="px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Subscribe</button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">What you get</h3>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li>• Market summary + key charts</li>
            <li>• Top gainers/losers & sectors</li>
            <li>• Notable earnings & IPOs</li>
            <li>• One short concept to master</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
