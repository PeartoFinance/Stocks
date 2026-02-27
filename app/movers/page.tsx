'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Activity, Search } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { useCurrency } from '../context/CurrencyContext';
import { stockAPI } from '../utils/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import AIAnalysisPanel from '../components/ai/AIAnalysisPanel';

interface Mover {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export default function MarketMoversPage() {
  const { formatPrice } = useCurrency();
  const [tab, setTab] = useState<'gainers' | 'losers' | 'volume'>('gainers');
  const [search, setSearch] = useState('');
  const [data, setData] = useState<Mover[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [gainersRes, losersRes] = await Promise.all([
          stockAPI.getMarketMovers('gainers'),
          stockAPI.getMarketMovers('losers')
        ]);

        const movers: Mover[] = [];

        if (gainersRes.success && gainersRes.data) {
          gainersRes.data.forEach((stock: any, i: number) => {
            movers.push({
              id: `g-${i}`,
              symbol: stock.symbol || '',
              name: stock.name || '',
              price: stock.price || 0,
              change: stock.change || 0,
              changePercent: stock.changePercent || 0,
              volume: stock.volume || 0,
            });
          });
        }

        if (losersRes.success && losersRes.data) {
          losersRes.data.forEach((stock: any, i: number) => {
            movers.push({
              id: `l-${i}`,
              symbol: stock.symbol || '',
              name: stock.name || '',
              price: stock.price || 0,
              change: stock.change || 0,
              changePercent: stock.changePercent || 0,
              volume: stock.volume || 0,
            });
          });
        }

        setData(movers);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load movers');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = data.filter(d =>
      d.symbol.toLowerCase().includes(search.toLowerCase()) ||
      d.name.toLowerCase().includes(search.toLowerCase())
    );

    switch (tab) {
      case 'gainers': list = list.sort((a, b) => b.changePercent - a.changePercent); break;
      case 'losers': list = list.sort((a, b) => a.changePercent - b.changePercent); break;
      case 'volume': list = list.sort((a, b) => b.volume - a.volume); break;
    }

    return list;
  }, [data, tab, search]);

  // Prepare AI data
  const gainers = filtered.filter(m => m.changePercent > 0).slice(0, 5);
  const losers = filtered.filter(m => m.changePercent < 0).slice(0, 5);

  return (
    <main className="p-3 sm:p-4 md:p-6 lg:p-8 dark:bg-slate-900/95">
      <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-3">Market Movers</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Top gainers, losers, and highest volume across the market.</p>
          </motion.div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {(['gainers', 'losers', 'volume'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-full text-xs sm:text-sm whitespace-nowrap ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>{t}</button>
                ))}
              </div>
              <div className="relative w-full sm:w-auto sm:min-w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search symbol or name…" className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="h-60 sm:h-80 flex items-center justify-center text-gray-500 dark:text-gray-400"><Activity className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mr-2" />Loading movers…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filtered.slice(0, 8).map((m, i) => (
                <Link key={m.id} href={`/stock/${m.symbol.toLowerCase()}`}>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl cursor-pointer transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">{m.symbol}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{m.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">{formatPrice(m.price)}</p>
                        <p className={`text-xs sm:text-sm font-medium flex items-center justify-end gap-1 ${m.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {m.change >= 0 ? <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" /> : <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4" />}
                          <span className="hidden sm:inline">{m.change.toFixed(2)} ({m.changePercent.toFixed(2)}%)</span>
                          <span className="sm:hidden">{m.changePercent.toFixed(1)}%</span>
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                      <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Volume</p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">{formatNumber(m.volume)}</p>
                      </div>
                      <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Intraday Range</p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">High bias</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* AI Analysis Sidebar */}
        <div className="w-full xl:w-80 flex-shrink-0 mt-6 xl:mt-0">
          <div className="xl:sticky xl:top-4">
            <AIAnalysisPanel
              title="Movers Analysis"
              pageType="market-movers"
              pageData={{
                gainers: gainers.map(g => ({
                  symbol: g.symbol,
                  price: g.price,
                  changePercent: g.changePercent
                })),
                losers: losers.map(l => ({
                  symbol: l.symbol,
                  price: l.price,
                  changePercent: l.changePercent
                })),
                currentTab: tab,
                totalCount: data.length
              }}
              quickPrompts={[
                'Why are these stocks moving?',
                'Market sentiment analysis',
                'Trading opportunities'
              ]}
              maxHeight="500px"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
