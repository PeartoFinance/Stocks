"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { HistoricalData } from '../../types';
import {
  ChevronUp,
  ChevronDown,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ChevronDown as DropdownIcon,
  Activity
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import PriceDisplay from '../common/PriceDisplay';

interface HistoricalDataTableProps {
  data: HistoricalData[];
  symbol: string;
  onDataUpdate?: (data: HistoricalData[]) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export default function HistoricalDataTable({ data, symbol, onDataUpdate, onLoadingChange }: HistoricalDataTableProps) {
  const [timeframe, setTimeframe] = useState('Daily');
  const [period, setPeriod] = useState('6M');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const { currency } = useCurrency();

  const timeframes = ['Daily', 'Weekly', 'Monthly'];
  const periods = ['1M', '3M', '6M', '1Y', '2Y', '5Y'];

  // API call function
  const fetchHistoricalData = async (selectedPeriod: string, selectedTimeframe: string) => {
    try {
      setLoading(true);
      onLoadingChange?.(true);

      // Map period to API format
      const periodMap: Record<string, string> = {
        "1M": "1mo", "3M": "3mo", "6M": "6mo", "1Y": "1y", "2Y": "2y", "5Y": "5y",
      };

      // Map timeframe to interval
      const intervalMap: Record<string, string> = {
        "Daily": "1d",
        "Weekly": "1wk",
        "Monthly": "1mo"
      };

      const mappedPeriod = periodMap[selectedPeriod] || "6mo";
      const interval = intervalMap[selectedTimeframe] || "1d";

      // Import and use marketService
      const { marketService } = await import('../../utils/marketService');
      const response = await marketService.getStockHistory(symbol, mappedPeriod, interval);

      if ((response as any)?.data) {
        const transformedData: HistoricalData[] = (response as any).data.map((item: any) => ({
          date: item.date,
          open: item.open || item.close,
          high: item.high || item.close,
          low: item.low || item.close,
          close: item.close,
          volume: item.volume || 0,
        }));
        onDataUpdate?.(transformedData);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    fetchHistoricalData(period, newTimeframe);
    setShowTimeframeDropdown(false);
  };

  // Handle period change
  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    fetchHistoricalData(newPeriod, timeframe);
    setShowPeriodDropdown(false);
  };

  const filteredData = useMemo(() => {
    if (!data.length) return [];

    // Sort data by date
    const sorted = [...data].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    // Filter by period
    const periodDays = {
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
      '2Y': 730,
      '5Y': 1825
    };

    const daysToInclude = periodDays[period as keyof typeof periodDays] || 180;
    let filtered = sorted.slice(0, daysToInclude);

    // Apply timeframe filtering
    if (timeframe === 'Weekly') {
      // Group by week - take one entry per week (Friday or last day of week)
      const weeklyData: HistoricalData[] = [];
      const seenWeeks = new Set<string>();

      filtered.forEach(item => {
        const date = new Date(item.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!seenWeeks.has(weekKey)) {
          seenWeeks.add(weekKey);
          weeklyData.push(item);
        }
      });

      filtered = weeklyData;
    } else if (timeframe === 'Monthly') {
      // Group by month - take one entry per month (last day of month)
      const monthlyData: HistoricalData[] = [];
      const seenMonths = new Set<string>();

      filtered.forEach(item => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth().toString().padStart(2, '0')}`;

        if (!seenMonths.has(monthKey)) {
          seenMonths.add(monthKey);
          monthlyData.push(item);
        }
      });

      filtered = monthlyData;
    }

    return filtered;
  }, [data, period, sortOrder, timeframe]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatChange = (current: number, previous: number) => {
    const change = current - previous;
    const changePercent = (change / previous) * 100;
    return {
      value: change,
      percent: changePercent,
      formatted: `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`
    };
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
    return volume.toLocaleString();
  };

  const exportData = () => {
    const csv = [
      'Date,Open,High,Low,Close,Adj. Close,Change,Volume',
      ...filteredData.map(row => {
        const change = row.close && row.open ? formatChange(row.close, row.open) : { value: 0, percent: 0 };
        return `${row.date},${row.open || ''},${row.high || ''},${row.low || ''},${row.close || ''},${row.close || ''},${change.value.toFixed(2)},${row.volume || ''}`;
      })
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${symbol}_historical_data.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setShowTimeframeDropdown(false);
        setShowPeriodDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        {/* Header */}
        <div className="p-3 lg:p-5 border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
          <div className="flex flex-col gap-3 lg:gap-4">
            <div>
              <h2 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                Historical Data
                {loading && <Activity className="h-4 w-4 text-blue-600 animate-spin" />}
              </h2>
              <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-300">
                {symbol} historical price data
              </p>
            </div>

            <div className="flex flex-wrap gap-2 lg:gap-3">
              {/* Timeframe Dropdown */}
              <div className="relative dropdown-container">
                <button
                  onClick={() => setShowTimeframeDropdown(!showTimeframeDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 lg:px-4 lg:py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-xs lg:text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {timeframe}
                  <DropdownIcon className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                </button>

                {showTimeframeDropdown && (
                  <div className="absolute top-full left-0 mt-1 z-10 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg min-w-[70px] lg:min-w-[80px] transition-colors duration-300">
                    {timeframes.map((tf) => (
                      <button
                        key={tf}
                        onClick={() => handleTimeframeChange(tf)}
                        className={`w-full px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors first:rounded-t-md last:rounded-b-md ${timeframe === tf ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-300'
                          }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Period Dropdown */}
              <div className="relative dropdown-container">
                <button
                  onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 lg:px-4 lg:py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-xs lg:text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {period}
                  <DropdownIcon className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                </button>

                {showPeriodDropdown && (
                  <div className="absolute top-full left-0 mt-1 z-10 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg min-w-[70px] lg:min-w-[80px] transition-colors duration-300">
                    {periods.map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePeriodChange(p)}
                        className={`w-full px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors first:rounded-t-md last:rounded-b-md ${period === p ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-300'
                          }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Export Button */}
              <button
                onClick={exportData}
                className="flex items-center gap-1.5 px-3 py-1.5 lg:px-4 lg:py-2 bg-blue-600 dark:bg-pearto-blue text-white rounded-md text-xs lg:text-sm font-medium hover:bg-blue-700 dark:hover:bg-pearto-blue-hover transition-colors"
              >
                <Download className="h-2.5 w-2.5 lg:h-3.5 lg:w-3.5" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
              <tr>
                <th className="px-2 lg:px-4 lg:px-5 py-2 lg:py-3 text-left">
                  <button
                    onClick={toggleSort}
                    className="flex items-center gap-1 text-[10px] lg:text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                  >
                    Date
                    {sortOrder === 'desc' ? <ChevronDown className="h-3 w-3 lg:h-3.5 lg:w-3.5" /> : <ChevronUp className="h-3 w-3 lg:h-3.5 lg:w-3.5" />}
                  </button>
                </th>
                <th className="px-2 lg:px-4 lg:px-5 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide hidden sm:table-cell transition-colors duration-300">
                  Open
                </th>
                <th className="px-2 lg:px-4 lg:px-5 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide hidden sm:table-cell transition-colors duration-300">
                  High
                </th>
                <th className="px-2 lg:px-4 lg:px-5 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide hidden sm:table-cell transition-colors duration-300">
                  Low
                </th>
                <th className="px-2 lg:px-4 lg:px-5 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide transition-colors duration-300">
                  Close
                </th>
                <th className="px-2 lg:px-4 lg:px-5 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide hidden lg:table-cell transition-colors duration-300">
                  Adj. Close
                </th>
                <th className="px-2 lg:px-4 lg:px-5 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide transition-colors duration-300">
                  Change
                </th>
                <th className="px-2 lg:px-4 lg:px-5 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide hidden md:table-cell transition-colors duration-300">
                  Volume
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 transition-colors duration-300">
              {filteredData.map((row, index) => {
                const change = row.close && row.open ? formatChange(row.close, row.open) : null;
                const isPositive = change && change.value >= 0;

                return (
                  <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-2 lg:px-4 lg:px-5 py-2 lg:py-3 text-xs lg:text-sm text-slate-900 dark:text-white font-medium transition-colors duration-300">
                      {formatDate(row.date)}
                    </td>
                    <td className="px-2 lg:px-4 lg:px-5 py-2 lg:py-3 text-xs lg:text-sm text-slate-900 dark:text-white hidden sm:table-cell transition-colors duration-300">
                      {row.open ? <PriceDisplay amount={row.open} /> : '-'}
                    </td>
                    <td className="px-2 lg:px-4 lg:px-5 py-2 lg:py-3 text-xs lg:text-sm text-slate-900 dark:text-white hidden sm:table-cell transition-colors duration-300">
                      {row.high ? <PriceDisplay amount={row.high} /> : '-'}
                    </td>
                    <td className="px-2 lg:px-4 lg:px-5 py-2 lg:py-3 text-xs lg:text-sm text-slate-900 dark:text-white hidden sm:table-cell transition-colors duration-300">
                      {row.low ? <PriceDisplay amount={row.low} /> : '-'}
                    </td>
                    <td className="px-2 lg:px-4 lg:px-5 py-2 lg:py-3 text-xs lg:text-sm text-slate-900 dark:text-white font-medium transition-colors duration-300">
                      {row.close ? <PriceDisplay amount={row.close} /> : '-'}
                    </td>
                    <td className="px-2 lg:px-4 lg:px-5 py-2 lg:py-3 text-xs lg:text-sm text-slate-900 dark:text-white hidden lg:table-cell transition-colors duration-300">
                      {row.close ? <PriceDisplay amount={row.close} /> : '-'}
                    </td>
                    <td className="px-2 lg:px-4 lg:px-5 py-2 lg:py-3 text-xs lg:text-sm">
                      {change ? (
                        <div className={`flex items-center gap-0.5 lg:gap-1 font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                          {isPositive ? <TrendingUp className="h-2.5 w-2.5 lg:h-3 lg:w-3" /> : <TrendingDown className="h-2.5 w-2.5 lg:h-3 lg:w-3" />}
                          <span className="hidden sm:inline">
                            <PriceDisplay amount={change.value} showSign /> ({change.percent >= 0 ? '+' : ''}{change.percent.toFixed(2)}%)
                          </span>
                          <span className="sm:hidden">{isPositive ? '+' : ''}{change.value.toFixed(2)}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-2 lg:px-4 lg:px-5 py-2 lg:py-3 text-xs lg:text-sm text-slate-900 dark:text-white hidden md:table-cell transition-colors duration-300">
                      {row.volume ? formatVolume(row.volume) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="text-center py-6 lg:py-10">
              <BarChart3 className="h-8 w-8 lg:h-10 lg:w-10 text-slate-300 dark:text-slate-600 dark:text-gray-400 mx-auto mb-3 lg:mb-4 transition-colors duration-300" />
              <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">No historical data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
