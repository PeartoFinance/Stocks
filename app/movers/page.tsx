'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, TrendingUp, TrendingDown, Activity, Search, BarChart3 } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { stockAPI } from '../utils/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

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

        if (gainersRes?.success && Array.isArray(gainersRes.data)) {
          gainersRes.data.forEach((stock: any, i: number) => {
            if (stock && typeof stock === 'object') {
              movers.push({
                id: `g-${i}`,
                symbol: stock.symbol || '',
                name: stock.name || '',
                price: Number(stock.price) || 0,
                change: Number(stock.change) || 0,
                changePercent: Number(stock.changePercent) || 0,
                volume: Number(stock.volume) || 0,
              });
            }
          });
        }

        if (losersRes?.success && Array.isArray(losersRes.data)) {
          losersRes.data.forEach((stock: any, i: number) => {
            if (stock && typeof stock === 'object') {
              movers.push({
                id: `l-${i}`,
                symbol: stock.symbol || '',
                name: stock.name || '',
                price: Number(stock.price) || 0,
                change: Number(stock.change) || 0,
                changePercent: Number(stock.changePercent) || 0,
                volume: Number(stock.volume) || 0,
              });
            }
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
    let list = data.filter(d => {
      const sym = d?.symbol?.toLowerCase() || '';
      const nm = d?.name?.toLowerCase() || '';
      const searchLower = search.toLowerCase();
      return sym.includes(searchLower) || nm.includes(searchLower);
    });

    switch (tab) {
      case 'gainers': 
        list = list.sort((a, b) => (b?.changePercent || 0) - (a?.changePercent || 0)); 
        break;
      case 'losers': 
        list = list.sort((a, b) => (a?.changePercent || 0) - (b?.changePercent || 0)); 
        break;
      case 'volume': 
        list = list.sort((a, b) => (b?.volume || 0) - (a?.volume || 0)); 
        break;
    }

    return list;
  }, [data, tab, search]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Market Movers</h1>
          <p className="text-gray-600 dark:text-slate-400">Track top gainers, losers, and most active stocks</p>
        </motion.div>

        {/* Tabs & Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setTab('gainers')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  tab === 'gainers'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Gainers</span>
              </button>
              <button
                onClick={() => setTab('losers')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  tab === 'losers'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                <TrendingDown className="h-4 w-4" />
                <span>Losers</span>
              </button>
              <button
                onClick={() => setTab('volume')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  tab === 'volume'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Volume</span>
              </button>
            </div>
            
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search stocks..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>
        </motion.div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-3" />
              <p className="text-gray-600 dark:text-slate-400">Loading market movers...</p>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden"
          >
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-slate-400">No stocks found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {filtered.map((m, i) => (
                  <Link key={m.id} href={`/stock/${m.symbol.toLowerCase()}`}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                    >
                      {/* Left: Symbol & Name */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{(m?.symbol || 'N').charAt(0)}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {m?.symbol || 'N/A'}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-slate-400 truncate">{m?.name || 'Unknown'}</p>
                        </div>
                      </div>

                      {/* Middle: Volume */}
                      <div className="hidden lg:flex flex-col items-end mr-6">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Volume</p>
                        <p className="text-base font-semibold text-slate-900 dark:text-white">
                          {(m?.volume || 0) >= 1e9 
                            ? `${((m?.volume || 0) / 1e9).toFixed(2)}B`
                            : (m?.volume || 0) >= 1e6
                            ? `${((m?.volume || 0) / 1e6).toFixed(2)}M`
                            : (m?.volume || 0).toLocaleString()}
                        </p>
                      </div>

                      {/* Right: Price & Change */}
                      <div className="flex flex-col items-end min-w-[140px]">
                        <p className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">
                          {formatPrice(m?.price || 0)}
                        </p>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                          (m?.change || 0) >= 0 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {(m?.change || 0) >= 0 ? (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDownRight className="h-3.5 w-3.5" />
                          )}
                          <span className="text-sm font-medium">
                            {Math.abs(m?.changePercent || 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}
