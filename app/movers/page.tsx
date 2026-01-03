'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Activity, Search } from 'lucide-react';
import { formatNumber, formatPrice } from '@/lib/utils';
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
    <main className="p-8">
      <div className="flex flex-col xl:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">Market Movers</h1>
            <p className="text-gray-600">Top gainers, losers, and highest volume across the market.</p>
          </motion.div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                {(['gainers', 'losers', 'volume'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-full text-sm ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t}</button>
                ))}
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search symbol or name…" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="h-80 flex items-center justify-center text-gray-500"><Activity className="h-6 w-6 animate-spin mr-2" />Loading movers…</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filtered.slice(0, 8).map((m, i) => (
                <Link key={m.id} href={`/stock/${m.symbol.toLowerCase()}`}>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{m.symbol}</h3>
                        <p className="text-sm text-gray-600">{m.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{formatPrice(m.price)}</p>
                        <p className={`text-sm font-medium flex items-center justify-end gap-1 ${m.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {m.change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                          {m.change.toFixed(2)} ({m.changePercent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Volume</p>
                        <p className="font-semibold text-gray-900">{formatNumber(m.volume)}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Intraday Range</p>
                        <p className="font-semibold text-gray-900">High bias</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* AI Analysis Sidebar */}
        <div className="w-full xl:w-80 flex-shrink-0">
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
              autoAnalyze={!loading && data.length > 0}
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
