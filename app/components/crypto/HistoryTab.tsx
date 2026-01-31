'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity,
  Download,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface HistoricalData {
  time: string;
  price: number;
  volume: number;
  marketCap: number;
}

interface HistoryTabProps {
  crypto: {
    symbol: string;
    name: string;
    change: number;
    changePercent: number;
  };
  historicalData: HistoricalData[];
  onDataUpdate?: (newData: HistoricalData[]) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export default function HistoryTab({ 
  crypto, 
  historicalData, 
  onDataUpdate,
  onLoadingChange 
}: HistoryTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'date' | 'price' | 'change' | 'volume' | 'marketCap'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    return `$${volume.toLocaleString()}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = historicalData.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const dateStr = formatDate(item.time).toLowerCase();
      const priceStr = formatPrice(item.price).toLowerCase();
      const volumeStr = formatVolume(item.volume).toLowerCase();
      
      return dateStr.includes(searchLower) || 
             priceStr.includes(searchLower) || 
             volumeStr.includes(searchLower);
    });

    // Add change calculation to each item
    const dataWithChange = filtered.map((item, index) => {
      const prevItem = index > 0 ? filtered[index - 1] : null;
      const change = prevItem ? item.price - prevItem.price : 0;
      return {
        ...item,
        change
      };
    });

    // Sort data
    dataWithChange.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.time).getTime();
          bValue = new Date(b.time).getTime();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'change':
          aValue = a.change;
          bValue = b.change;
          break;
        case 'volume':
          aValue = a.volume;
          bValue = b.volume;
          break;
        case 'marketCap':
          aValue = a.marketCap;
          bValue = b.marketCap;
          break;
        default:
          aValue = a.time;
          bValue = b.time;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return dataWithChange;
  }, [historicalData, searchTerm, sortField, sortDirection]);

  const handleSort = (field: 'date' | 'price' | 'change' | 'volume' | 'marketCap') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Price', 'Volume', 'Market Cap'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedData.map(item => [
        formatDate(item.time),
        formatPrice(item.price),
        formatVolume(item.volume),
        formatMarketCap(item.marketCap)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${crypto.symbol}_historical_data.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredAndSortedData.length === 0) return null;

    const prices = filteredAndSortedData.map(d => d.price);
    const volumes = filteredAndSortedData.map(d => d.volume);
    const marketCaps = filteredAndSortedData.map(d => d.marketCap);

    return {
      high: Math.max(...prices),
      low: Math.min(...prices),
      average: prices.reduce((sum, p) => sum + p, 0) / prices.length,
      totalVolume: volumes.reduce((sum, v) => sum + v, 0),
      averageVolume: volumes.reduce((sum, v) => sum + v, 0) / volumes.length,
      averageMarketCap: marketCaps.reduce((sum, m) => sum + m, 0) / marketCaps.length,
      dataPoints: filteredAndSortedData.length
    };
  }, [filteredAndSortedData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {crypto.name} Historical Data
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Complete price and volume history for {crypto.symbol}
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">High</span>
              </div>
              <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                {formatPrice(stats.high)}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-700 dark:text-red-300">Low</span>
              </div>
              <p className="text-lg font-bold text-red-900 dark:text-red-100">
                {formatPrice(stats.low)}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Average</span>
              </div>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {formatPrice(stats.average)}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Data Points</span>
              </div>
              <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                {stats.dataPoints.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by date, price, or volume..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm w-full sm:w-auto"
            >
              <option value="date">Sort by Date</option>
              <option value="price">Sort by Price</option>
              <option value="change">Sort by Change</option>
              <option value="volume">Sort by Volume</option>
              <option value="marketCap">Sort by Market Cap</option>
            </select>
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
  {/* Data Table */}
<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">
      <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <tr>
          {/* Date: Left Aligned */}
          <th className="px-6 py-4 text-left">
            <button
              onClick={() => handleSort('date')}
              className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-emerald-600 transition-colors"
            >
              Date
              {sortField === 'date' && (
                <span className="text-emerald-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          </th>
          
          {/* Price: Right Aligned */}
          <th className="px-6 py-4">
            <button
              onClick={() => handleSort('price')}
              className="flex items-center justify-end w-full gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-emerald-600 transition-colors"
            >
              Price
              {sortField === 'price' && (
                <span className="text-emerald-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          </th>

          {/* Change: Right Aligned */}
          <th className="px-6 py-4">
            <button
              onClick={() => handleSort('change')}
              className="flex items-center justify-end w-full gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-emerald-600 transition-colors"
            >
              Change
              {sortField === 'change' && (
                <span className="text-emerald-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          </th>

          {/* Volume: Right Aligned */}
          <th className="px-6 py-4">
            <button
              onClick={() => handleSort('volume')}
              className="flex items-center justify-end w-full gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-emerald-600 transition-colors"
            >
              Volume
              {sortField === 'volume' && (
                <span className="text-emerald-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          </th>

          {/* Market Cap: Right Aligned */}
          <th className="px-6 py-4">
            <button
              onClick={() => handleSort('marketCap')}
              className="flex items-center justify-end w-full gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-emerald-600 transition-colors"
            >
              Market Cap
              {sortField === 'marketCap' && (
                <span className="text-emerald-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          </th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
        {filteredAndSortedData.map((item) => {
          const priceChange = item.change || 0;
          const isPositive = priceChange >= 0;

          return (
            <tr key={item.time} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(item.time)}
              </td>
              <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900 dark:text-white">
                {formatPrice(item.price)}
              </td>
              <td className="px-6 py-4 text-sm text-right">
                <div className={`flex items-center justify-end gap-1 font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                  {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {Math.abs(priceChange) >= 0.01 ? formatPrice(Math.abs(priceChange)) : '< $0.01'}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-right font-medium text-gray-700 dark:text-gray-300">
                {formatVolume(item.volume)}
              </td>
              <td className="px-6 py-4 text-sm text-right font-medium text-gray-700 dark:text-gray-300">
                {formatMarketCap(item.marketCap)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
</div>
    </div>
  );
}
