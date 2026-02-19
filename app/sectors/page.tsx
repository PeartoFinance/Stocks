'use client';

import React, { useState, useEffect } from 'react';
import { worldIndicesService, SectorData } from '../utils/worldIndicesService';
import { Building, TrendingUp, TrendingDown, BarChart3, PieChart, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function SectorsPage() {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'change' | 'weight' | 'volume'>('change');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        setLoading(true);
        const data = await worldIndicesService.getSectors();
        setSectors(data);
      } catch (error) {
        console.error('Failed to fetch sectors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSectors();
  }, []);

  const sortedSectors = [...sectors].sort((a, b) => {
    if (sortBy === 'change') return b.avgChangePercent - a.avgChangePercent;
    if (sortBy === 'weight') return b.weight - a.weight;
    return b.volumePercent - a.volumePercent;
  });

  const gainers = sectors.filter(s => s.avgChangePercent > 0).length;
  const losers = sectors.filter(s => s.avgChangePercent < 0).length;
  const avgChange = sectors.reduce((sum, s) => sum + s.avgChangePercent, 0) / sectors.length;

  const colors = {
    gainStrong: 'bg-[#008d41] text-white border-[#00a34c]',
    gainMed: 'bg-[#00c55a] text-white border-[#00d662]',
    gainLight: 'bg-[#e6f9ed] text-[#008d41] border-[#b3eccd]',
    lossLight: 'bg-[#fff5f5] text-[#c1272d] border-[#feb2b2]',
    lossMed: 'bg-[#fc8181] text-white border-[#f56565]',
    lossStrong: 'bg-[#c1272d] text-white border-[#a51d22]',
    neutral: 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-slate-200 dark:border-gray-700'
  };

  const getIntensity = (val: number) => {
    if (val >= 2.5) return colors.gainStrong;
    if (val >= 1.2) return colors.gainMed;
    if (val > 0) return colors.gainLight;
    if (val === 0) return colors.neutral;
    if (val > -1.2) return colors.lossLight;
    if (val > -2.5) return colors.lossMed;
    return colors.lossStrong;
  };

  const chartPalette = [
    '#008d41', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
    '#06b6d4', '#f97316', '#84cc16', '#a855f7', '#c1272d', '#6366f1'
  ];

  const performanceChartData = {
    labels: sortedSectors.map(s => s.sector),
    datasets: [{
      label: 'Change %',
      data: sortedSectors.map(s => s.avgChangePercent),
      backgroundColor: sortedSectors.map(s => s.avgChangePercent >= 0 ? '#10b98166' : '#ef444466'),
      borderColor: sortedSectors.map(s => s.avgChangePercent >= 0 ? '#10b981' : '#ef4444'),
      borderWidth: 2,
    }]
  };

  const weightChartData = {
    labels: sectors.map(s => s.sector),
    datasets: [{
      data: sectors.map(s => s.weight),
      backgroundColor: chartPalette,
      borderColor: '#ffffff',
      borderWidth: 2,
    }]
  };

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        titleColor: isDark ? '#ffffff' : '#1f2937',
        bodyColor: isDark ? '#d1d5db' : '#374151',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        grid: { color: isDark ? '#374151' : '#e5e7eb' },
        ticks: { color: isDark ? '#d1d5db' : '#374151' }
      },
      x: {
        grid: { display: false },
        ticks: { color: isDark ? '#d1d5db' : '#374151' }
      }
    }
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: isDark ? '#d1d5db' : '#374151',
          padding: 15,
          font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        titleColor: isDark ? '#ffffff' : '#1f2937',
        bodyColor: isDark ? '#d1d5db' : '#374151',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
      }
    },
    cutout: '60%',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
              <Building className="h-5 w-5 md:h-7 md:w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors duration-300">
                Sector Analysis
              </h1>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                Comprehensive market sector performance and insights
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400 transition-colors duration-300">Total Sectors</span>
              <Activity className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
            </div>
            <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white transition-colors duration-300">{sectors.length}</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 rounded-xl p-4 md:p-6 border border-green-200 dark:border-green-500/20 transition-colors duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs md:text-sm font-semibold text-green-700 dark:text-green-400 transition-colors duration-300">Gainers</span>
              <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl md:text-3xl font-black text-green-700 dark:text-green-400 transition-colors duration-300">{gainers}</div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-500/10 dark:to-pink-500/10 rounded-xl p-4 md:p-6 border border-red-200 dark:border-red-500/20 transition-colors duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs md:text-sm font-semibold text-red-700 dark:text-red-400 transition-colors duration-300">Losers</span>
              <ArrowDownRight className="h-4 w-4 md:h-5 md:w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-2xl md:text-3xl font-black text-red-700 dark:text-red-400 transition-colors duration-300">{losers}</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400 transition-colors duration-300">Avg Change</span>
              <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
            </div>
            <div className={`text-2xl md:text-3xl font-black transition-colors duration-300 ${avgChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Performance Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white transition-colors duration-300">Performance by Sector</h3>
              <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
            </div>
            <div className="h-64 md:h-80">
              <Bar data={performanceChartData} options={barOptions} />
            </div>
          </div>

          {/* Weight Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white transition-colors duration-300">Market Weight Distribution</h3>
              <PieChart className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
            </div>
            <div className="h-64 md:h-80">
              <Doughnut data={weightChartData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white transition-colors duration-300">Sector Details</h3>
              <div className="flex gap-2">
                {(['change', 'weight', 'volume'] as const).map(sort => (
                  <button
                    key={sort}
                    onClick={() => setSortBy(sort)}
                    className={`px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold rounded-lg transition-colors duration-200 ${
                      sortBy === sort
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 transition-colors duration-300">
                <tr>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300 first:rounded-tl-xl">Sector</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Change %</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Weight %</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Volume %</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">YTD %</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-center text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300 last:rounded-tr-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
                {sortedSectors.map((sector, index) => (
                  <tr key={sector.sector} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div 
                          className="w-2 h-2 md:w-3 md:h-3 rounded-full"
                          style={{ backgroundColor: chartPalette[index % chartPalette.length] }}
                        />
                        <span className="text-xs md:text-sm font-semibold text-slate-900 dark:text-white transition-colors duration-300">{sector.sector}</span>
                      </div>
                    </td>
                    <td className={`px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold transition-colors duration-300 ${
                      sector.avgChangePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      <div className="flex items-center justify-end gap-1">
                        {sector.avgChangePercent >= 0 ? <TrendingUp className="h-3 w-3 md:h-4 md:w-4" /> : <TrendingDown className="h-3 w-3 md:h-4 md:w-4" />}
                        {sector.avgChangePercent >= 0 ? '+' : ''}{sector.avgChangePercent.toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-semibold text-slate-700 dark:text-gray-300 transition-colors duration-300">
                      {sector.weight.toFixed(2)}%
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-semibold text-slate-700 dark:text-gray-300 transition-colors duration-300">
                      {sector.volumePercent.toFixed(2)}%
                    </td>
                    <td className={`px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-semibold transition-colors duration-300 ${
                      sector.avgYtdReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {sector.avgYtdReturn >= 0 ? '+' : ''}{sector.avgYtdReturn.toFixed(2)}%
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="flex justify-center">
                        <span className={`px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-bold rounded-full ${
                          sector.avgChangePercent >= 1 ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                          sector.avgChangePercent <= -1 ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        } transition-colors duration-300`}>
                          {sector.avgChangePercent >= 1 ? 'Strong' : sector.avgChangePercent <= -1 ? 'Weak' : 'Neutral'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
