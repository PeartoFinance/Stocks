'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCw, AreaChart, CandlestickChart, LineChart } from 'lucide-react';
import { marketService } from '../utils/marketService';
import { HistoricalData } from '../types';
import StockChart from '../components/StockChart';
import toast from 'react-hot-toast';

export default function TechnicalChartPage() {
  const [symbol, setSymbol] = useState('AAPL');
  const [period, setPeriod] = useState('1M');
  const [data, setData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState<'area' | 'candlestick' | 'line' | 'mountain'>('area');
  const [stockInfo, setStockInfo] = useState<any>(null);

  const periods = ['1D', '5D', '1M', '3M', '6M', '1Y'];
  const chartTypes = [
    { key: 'area', label: 'Area', icon: AreaChart },
    { key: 'candlestick', label: 'Candle', icon: CandlestickChart },
    { key: 'line', label: 'Line', icon: LineChart },
    { key: 'mountain', label: 'Mountain', icon: AreaChart },
  ] as const;

  const loadData = async () => {
    try {
      setLoading(true);
      const periodMap: Record<string, string> = {
        '1D': '1d', '5D': '5d', '1M': '1mo', '3M': '3mo', '6M': '6mo', '1Y': '1y'
      };
      const mappedPeriod = periodMap[period] || '1mo';
      const interval = period === '1D' ? '1m' : '1d';
      
      const [profileResponse, historyResponse] = await Promise.all([
        marketService.getStockProfile(symbol),
        marketService.getStockHistory(symbol, mappedPeriod, interval)
      ]);
      
      if (profileResponse) {
        setStockInfo(profileResponse);
      }
      
      if ((historyResponse as any)?.data) {
        const transformedData: HistoricalData[] = (historyResponse as any).data.map((item: any) => ({
          date: item.date,
          open: item.open || item.close,
          high: item.high || item.close,
          low: item.low || item.close,
          close: item.close,
          volume: item.volume || 0,
        }));
        setData(transformedData);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  // Remove automatic loading on mount and period change

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const isPositive = stockInfo ? (stockInfo.change || 0) >= 0 : true;

  return (
    <main className="p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          Technical Chart
        </h1>
        <p className="text-gray-600">Interactive price chart with real-time data from backend API.</p>
      </motion.div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <input 
              value={symbol} 
              onChange={(e) => setSymbol(e.target.value.toUpperCase())} 
              className="w-32 px-3 py-2 border rounded-lg font-medium" 
              placeholder="Symbol" 
            />
            <button 
              onClick={loadData} 
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />Load
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Period Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {periods.map(p => (
                <button 
                  key={p} 
                  onClick={() => setPeriod(p)} 
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            
            {/* Chart Type Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {chartTypes.map((type) => (
                <button
                  key={type.key}
                  onClick={() => setChartType(type.key)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    chartType === type.key ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <type.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Stock Info */}
        {stockInfo && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {stockInfo.name} ({stockInfo.symbol})
                </h2>
                <p className="text-sm text-gray-500">{stockInfo.sector} • {stockInfo.exchange}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(stockInfo.price || 0)}
                </div>
                <div className={`text-sm font-medium ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositive ? '+' : ''}{(stockInfo.changePercent || 0).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        {loading ? (
          <div className="h-96 flex items-center justify-center text-gray-500">
            <Activity className="h-8 w-8 animate-spin mr-3" />
            Loading chart data...
          </div>
        ) : data.length === 0 ? (
          <div className="h-96 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Load Chart</h3>
              <p className="text-gray-600">Enter a stock symbol and click Load to view the chart</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {symbol} - {period} Chart
              </h3>
              <p className="text-sm text-gray-600">
                Showing {data.length} data points • {period === '1D' ? '1-minute' : 'Daily'} intervals
              </p>
            </div>
            
            <div className="h-96">
              <StockChart
                data={data}
                isPositive={isPositive}
                height={384}
                chartType={chartType}
              />
            </div>
            
            {/* Chart Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {(() => {
                if (data.length === 0) return null;
                const latest = data[data.length - 1];
                const first = data[0];
                const high = Math.max(...data.map(d => d.high));
                const low = Math.min(...data.map(d => d.low));
                const totalVolume = data.reduce((sum, d) => sum + (d.volume || 0), 0);
                
                return [
                  { label: 'Current Price', value: formatPrice(latest.close), color: 'blue' },
                  { label: 'Period High', value: formatPrice(high), color: 'green' },
                  { label: 'Period Low', value: formatPrice(low), color: 'red' },
                  { label: 'Total Volume', value: `${(totalVolume / 1e6).toFixed(1)}M`, color: 'purple' }
                ].map((stat, i) => (
                  <div key={i} className={`p-4 rounded-lg border bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100`}>
                    <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{period} period</p>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
