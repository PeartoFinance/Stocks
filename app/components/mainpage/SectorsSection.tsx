'use client';

import React, { useState, useEffect } from 'react';
import { worldIndicesService, SectorData } from '../../utils/worldIndicesService';
import { Building, PieChart as PieChartIcon, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface SectorsSectionProps {
  className?: string;
}

type ChartTabType = 'weight' | 'volume' | 'ytd';

export default function SectorsSection({ className = '' }: SectorsSectionProps) {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ChartTabType>('weight');
  const router = useRouter();

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

  // Professional Financial Colors
  const colors = {
    gainStrong: 'bg-[#008d41] text-white border-[#00a34c]',
    gainMed: 'bg-[#00c55a] text-white border-[#00d662]',
    gainLight: 'bg-[#e6f9ed] text-[#008d41] border-[#b3eccd]',
    lossLight: 'bg-[#fff5f5] text-[#c1272d] border-[#feb2b2]',
    lossMed: 'bg-[#fc8181] text-white border-[#f56565]',
    lossStrong: 'bg-[#c1272d] text-white border-[#a51d22]',
    neutral: 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
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

  const getWeightClass = (weight: number) => {
    if (weight >= 18) return 'col-span-3 row-span-2';
    if (weight >= 10) return 'col-span-2 row-span-1';
    return 'col-span-1 row-span-1';
  };

  const chartPalette = [
    '#008d41', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', 
    '#06b6d4', '#f97316', '#84cc16', '#a855f7', '#c1272d', '#6366f1'
  ];

  const getChartData = () => {
    const labels = sectors.map(s => s.sector);
    const data = sectors.map(s => {
      if (activeTab === 'ytd') return Math.abs(s.avgYtdReturn) || 0.1;
      if (activeTab === 'volume') return s.volumePercent;
      return s.weight;
    });

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: chartPalette,
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 10
      }]
    };
  };

  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        cornerRadius: 8
      }
    },
    cutout: '50%',
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700-subtle shadow-sm transition-colors duration-300">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg">
            <Building className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors duration-300">Sector Performance</h2>
        </div>
        <button
          onClick={() => router.push('/sectors')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          View Full Analysis
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* LEFT: HEATMAP GRID */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-widest flex items-center gap-2">
              Market Heatmap <Info size={14} className="opacity-50" />
            </h3>
            <div className="flex gap-4 text-[10px] font-medium uppercase text-gray-400">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#008d41]" /> Gain</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#c1272d]" /> Loss</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2 auto-rows-[minmax(85px,auto)]">
            {sectors.map((sector) => (
              <div
                key={sector.sector}
                className={`
                  ${getIntensity(sector.avgChangePercent)}
                  group flex flex-col justify-between p-3 rounded-xl border-2 transition-all duration-300 
                  hover:scale-[1.02] hover:shadow-xl cursor-pointer overflow-hidden
                `}
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium text-[10px] md:text-xs uppercase tracking-tighter leading-none truncate pr-1">
                    {sector.sector}
                  </span>
                  <div className="shrink-0 opacity-40">
                    {sector.avgChangePercent > 0 ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-xl font-black font-mono leading-none tracking-tighter">
                    {sector.avgChangePercent > 0 ? '+' : ''}{sector.avgChangePercent.toFixed(2)}%
                  </div>
                  <div className="text-[9px] font-medium opacity-70 mt-1 uppercase">
                    {sector.weight.toFixed(1)}% Weight
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: DISTRIBUTION & DUAL-COLUMN PROGRESS BARS */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium text-slate-900 dark:text-white text-lg transition-colors duration-300">Distribution</h3>
            <PieChartIcon className="h-5 w-5 text-indigo-500" />
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl mb-8 transition-colors duration-300">
            {(['weight', 'volume', 'ytd'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-[10px] font-medium uppercase tracking-wider rounded-lg transition-all ${
                  activeTab === tab ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Chart with Center Label */}
          <div className="h-44 relative mb-10">
            <Doughnut data={getChartData()} options={chartOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] font-medium text-gray-400 uppercase tracking-widest">Selected</span>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors duration-300">100%</span>
            </div>
          </div>

          {/* TWO COLUMN PROGRESS BARS */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {sectors.map((sector, index) => {
              const color = chartPalette[index % chartPalette.length];
              const val = activeTab === 'weight' ? sector.weight : 
                          activeTab === 'volume' ? sector.volumePercent : 
                          Math.abs(sector.avgYtdReturn);
              
              return (
                <div key={sector.sector} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px] font-medium uppercase tracking-tighter">
                    <span className="text-slate-500 dark:text-slate-400 truncate max-w-[80px] transition-colors duration-300">{sector.sector}</span>
                    <span className="text-slate-900 dark:text-white font-mono transition-colors duration-300">{val.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden transition-colors duration-300">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${Math.min(val * 2.5, 100)}%`, // Multiplied for better visual feedback on small %
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}30` 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}