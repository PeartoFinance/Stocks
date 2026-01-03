'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Crown } from 'lucide-react';

export default function StockAnalysisProPage() {
  return (
    <main className="p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 flex items-center gap-3"><Crown className="h-8 w-8 text-yellow-500"/>Stock Analysis Pro</h1>
        <p className="text-gray-600">Unlock advanced tools, premium data, and pro workflows in Pearto.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Advanced screener with custom formulas',
            'Unlimited watchlists & alerts',
            'Institutional-grade fundamentals',
            'Backtests & strategies',
            'Export to CSV/Google Sheets',
            'Priority support'
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">{f}</h3>
                <p className="text-sm text-gray-600">Included in Pro</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pro Plan</h3>
          <p className="text-4xl font-bold text-gray-900 mb-1">$19<span className="text-lg text-gray-500">/mo</span></p>
          <p className="text-sm text-gray-600 mb-4">Billed monthly. Cancel anytime.</p>
          <button className="w-full py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Start 7‑day Trial</button>
          <p className="text-xs text-gray-500 mt-3">No credit card charged until trial ends.</p>
        </div>
      </div>
    </main>
  );
}
