'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, LineChart, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { stockAPI } from '../utils/api';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Point { date: string; close: number; }

export default function TechnicalChartPage() {
  const [symbol, setSymbol] = useState('AAPL');
  const [period, setPeriod] = useState('6m');
  const [data, setData] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await stockAPI.getHistoricalData(symbol, period);
      setData(res.data.map(d => ({ date: d.date, close: d.close })));
    } catch (e) {
      console.error(e);
      toast.error('Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [symbol, period]);

  return (
    <main className="p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">Technical Chart</h1>
        <p className="text-gray-600">Interactive price chart with quick indicators.</p>
      </motion.div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} className="w-28 px-3 py-2 border rounded-lg" placeholder="Symbol" />
            <button onClick={loadData} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-2"><RefreshCw className="h-4 w-4" />Refresh</button>
          </div>
          <div className="flex items-center gap-2">
            {['1m', '3m', '6m', '1y', '2y'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-full text-sm ${period === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        {loading ? (
          <div className="h-80 flex items-center justify-center text-gray-500"><Activity className="h-6 w-6 animate-spin mr-2" />Loading chart…</div>
        ) : (
          <div>
            {/* Lightweight SVG line chart to avoid external deps */}
            <div className="w-full h-80">
              <svg viewBox="0 0 1000 400" className="w-full h-full">
                <defs>
                  <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {(() => {
                  const points = data.map((d, i) => {
                    const x = (i / Math.max(1, data.length - 1)) * 980 + 10;
                    const min = Math.min(...data.map(p => p.close));
                    const max = Math.max(...data.map(p => p.close));
                    const y = 380 - ((d.close - min) / Math.max(1, max - min)) * 360;
                    return { x, y };
                  });
                  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
                  const area = `${path} L 990 390 L 10 390 Z`;
                  return (
                    <g>
                      <path d={area} fill="url(#grad)" />
                      <path d={path} stroke="#3b82f6" strokeWidth="2" fill="none" />
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Quick indicators (mock) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="p-4 rounded-lg border bg-gray-50">
                <p className="text-xs text-gray-500">RSI(14)</p>
                <p className="text-lg font-semibold text-gray-900">52.4</p>
              </div>
              <div className="p-4 rounded-lg border bg-gray-50">
                <p className="text-xs text-gray-500">SMA(50)</p>
                <p className="text-lg font-semibold text-gray-900">{formatPrice(152.35)}</p>
              </div>
              <div className="p-4 rounded-lg border bg-gray-50">
                <p className="text-xs text-gray-500">EMA(20)</p>
                <p className="text-lg font-semibold text-gray-900">{formatPrice(149.12)}</p>
              </div>
              <div className="p-4 rounded-lg border bg-gray-50">
                <p className="text-xs text-gray-500">Volatility</p>
                <p className="text-lg font-semibold text-gray-900">Low</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
