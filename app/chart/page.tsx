'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCw } from 'lucide-react';
import { stockAPI } from '../utils/api';
import toast from 'react-hot-toast';

interface ChartData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function TechnicalChartPage() {
  const [symbol, setSymbol] = useState('AAPL');
  const [period, setPeriod] = useState('6mo');
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [indicators, setIndicators] = useState({ rsi: 0, sma50: 0, ema20: 0 });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await stockAPI.getHistoricalData(symbol, period);
      setData(res.data);
      calculateIndicators(res.data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  const calculateIndicators = (chartData: ChartData[]) => {
    if (chartData.length === 0) return;
    
    const closes = chartData.map(d => d.close);
    const sma50 = closes.slice(-50).reduce((a, b) => a + b, 0) / Math.min(50, closes.length);
    const ema20 = closes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, closes.length);
    
    // Simple RSI calculation
    const gains = [];
    const losses = [];
    for (let i = 1; i < Math.min(15, closes.length); i++) {
      const diff = closes[closes.length - i] - closes[closes.length - i - 1];
      if (diff > 0) gains.push(diff);
      else losses.push(Math.abs(diff));
    }
    const avgGain = gains.length ? gains.reduce((a, b) => a + b, 0) / gains.length : 0;
    const avgLoss = losses.length ? losses.reduce((a, b) => a + b, 0) / losses.length : 0;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    setIndicators({ rsi, sma50, ema20 });
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
            <input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} className="w-32 px-3 py-2 border rounded-lg" placeholder="Symbol" />
            <button onClick={loadData} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"><RefreshCw className="h-4 w-4" />Load</button>
          </div>
          <div className="flex items-center gap-2">
            {['1mo', '3mo', '6mo', '1y', '2y'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-full text-sm ${period === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{p.replace('mo', 'm').replace('y', 'y')}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        {loading ? (
          <div className="h-80 flex items-center justify-center text-gray-500"><Activity className="h-6 w-6 animate-spin mr-2" />Loading chart…</div>
        ) : data.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-gray-500">No data available</div>
        ) : (
          <div>
            <div className="w-full h-96">
              <svg viewBox="0 0 1000 450" className="w-full h-full">
                <defs>
                  <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {(() => {
                  const closes = data.map(d => d.close);
                  const min = Math.min(...closes);
                  const max = Math.max(...closes);
                  const range = max - min || 1;
                  const padding = { left: 60, right: 20, top: 20, bottom: 50 };
                  const chartWidth = 1000 - padding.left - padding.right;
                  const chartHeight = 450 - padding.top - padding.bottom;
                  
                  const points = data.map((d, i) => {
                    const x = padding.left + (i / Math.max(1, data.length - 1)) * chartWidth;
                    const y = padding.top + chartHeight - ((d.close - min) / range) * chartHeight;
                    return { x, y, close: d.close, date: d.date };
                  });
                  
                  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
                  const area = `${path} L ${padding.left + chartWidth} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;
                  
                  // Y-axis labels (price)
                  const yLabels = [max, (max + min) / 2, min];
                  const yPositions = [padding.top, padding.top + chartHeight / 2, padding.top + chartHeight];
                  
                  // X-axis labels (dates)
                  const xLabelCount = 5;
                  const xLabels = Array.from({ length: xLabelCount }, (_, i) => {
                    const idx = Math.floor((i / (xLabelCount - 1)) * (data.length - 1));
                    return data[idx];
                  });
                  
                  return (
                    <g>
                      {/* Y-axis */}
                      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight} stroke="#e5e7eb" strokeWidth="2" />
                      {yLabels.map((label, i) => (
                        <g key={i}>
                          <line x1={padding.left} y1={yPositions[i]} x2={padding.left + chartWidth} y2={yPositions[i]} stroke="#f3f4f6" strokeWidth="1" />
                          <text x={padding.left - 10} y={yPositions[i] + 5} textAnchor="end" fontSize="12" fill="#6b7280">${label.toFixed(2)}</text>
                        </g>
                      ))}
                      
                      {/* X-axis */}
                      <line x1={padding.left} y1={padding.top + chartHeight} x2={padding.left + chartWidth} y2={padding.top + chartHeight} stroke="#e5e7eb" strokeWidth="2" />
                      {xLabels.map((d, i) => {
                        const x = padding.left + (i / (xLabelCount - 1)) * chartWidth;
                        return (
                          <g key={i}>
                            <line x1={x} y1={padding.top + chartHeight} x2={x} y2={padding.top + chartHeight + 5} stroke="#9ca3af" strokeWidth="1" />
                            <text x={x} y={padding.top + chartHeight + 20} textAnchor="middle" fontSize="11" fill="#6b7280">{new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</text>
                          </g>
                        );
                      })}
                      
                      {/* Chart */}
                      <path d={area} fill="url(#grad)" />
                      <path d={path} stroke="#3b82f6" strokeWidth="2.5" fill="none" />
                      {points.map((p, i) => i % Math.ceil(data.length / 10) === 0 && (
                        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#3b82f6" />
                      ))}
                    </g>
                  );
                })()}
              </svg>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100">
                <p className="text-xs text-gray-600 font-medium">RSI(14)</p>
                <p className="text-xl font-bold text-gray-900">{indicators.rsi.toFixed(1)}</p>
                <p className="text-xs text-gray-500 mt-1">{indicators.rsi > 70 ? 'Overbought' : indicators.rsi < 30 ? 'Oversold' : 'Neutral'}</p>
              </div>
              <div className="p-4 rounded-lg border bg-gradient-to-br from-purple-50 to-purple-100">
                <p className="text-xs text-gray-600 font-medium">SMA(50)</p>
                <p className="text-xl font-bold text-gray-900">${indicators.sma50.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Moving Avg</p>
              </div>
              <div className="p-4 rounded-lg border bg-gradient-to-br from-green-50 to-green-100">
                <p className="text-xs text-gray-600 font-medium">EMA(20)</p>
                <p className="text-xl font-bold text-gray-900">${indicators.ema20.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Exponential MA</p>
              </div>
              <div className="p-4 rounded-lg border bg-gradient-to-br from-orange-50 to-orange-100">
                <p className="text-xs text-gray-600 font-medium">Data Points</p>
                <p className="text-xl font-bold text-gray-900">{data.length}</p>
                <p className="text-xs text-gray-500 mt-1">{period} period</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
