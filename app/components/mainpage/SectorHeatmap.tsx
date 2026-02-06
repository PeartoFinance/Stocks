'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, Info } from 'lucide-react';

interface SectorData {
  sector: string;
  dayReturn: number;
  marketWeight: number;
  marketCap?: number;
  stockCount: number;
}

interface SectorHeatmapProps {
  className?: string;
  sectors: SectorData[];
}

// Map weights to actual Tailwind classes so the JIT compiler picks them up
const weightClassMap: Record<number, string> = {
  1: 'col-span-2',
  2: 'col-span-3',
  3: 'col-span-4',
  4: 'col-span-6',
};

export default function SectorHeatmap({ className = '', sectors }: SectorHeatmapProps) {
  const getIntensity = (val: number) => {
    if (val >= 2) return 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-500';
    if (val >= 0.5) return 'bg-emerald-500/20 text-emerald-700 border-emerald-200 hover:bg-emerald-500/30';
    if (val >= 0) return 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100';
    if (val > -1.5) return 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100';
    return 'bg-rose-600 text-white border-rose-700 hover:bg-rose-500';
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-50 rounded-lg">
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-slate-900 text-sm font-bold tracking-tight leading-none">Market Heatmap</h2>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">Performance by Sector Weight</p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <Info className="h-4 w-4" />
        </button>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-12 gap-2 auto-rows-[90px]">
        {sectors.map((s) => {
          // Calculate weight (1-4) based on market weight
          const weightKey = Math.max(1, Math.min(4, Math.floor(s.marketWeight / 8)));
          const mcapLabel = s.marketCap ? `${(s.marketCap / 1e12).toFixed(1)}T` : 'N/A';
          
          return (
            <div
              key={s.sector}
              className={`
                ${weightClassMap[weightKey]} 
                ${getIntensity(s.dayReturn)} 
                rounded-xl border p-3 flex flex-col justify-between 
                transition-all duration-200 cursor-pointer group
                hover:scale-[1.02] hover:shadow-md hover:z-10
              `}
            >
              <div className="flex justify-between items-start gap-1">
                <span className="text-[10px] font-bold uppercase tracking-tight truncate leading-tight overflow-hidden">
                  {s.sector}
                </span>
                <div className="shrink-0">
                  {s.dayReturn >= 0 ? 
                    <ArrowUpRight className="h-3 w-3 opacity-70" /> : 
                    <ArrowDownRight className="h-3 w-3 opacity-70" />
                  }
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-lg font-bold font-mono tracking-tighter leading-none">
                    {s.dayReturn > 0 ? '+' : ''}{s.dayReturn}%
                  </span>
                  <span className="text-[9px] font-medium opacity-70 mt-1 uppercase tracking-tighter">
                    {s.stockCount} Stocks
                  </span>
                </div>
                <span className="text-[10px] font-black opacity-40 group-hover:opacity-80 transition-opacity">
                  {mcapLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Returns</span>
          <div className="flex gap-1">
            {['bg-rose-600', 'bg-rose-50', 'bg-emerald-50', 'bg-emerald-600'].map((color, i) => (
              <div key={i} className={`w-3 h-1.5 rounded-full ${color}`} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-tight">Live Market Data</span>
        </div>
      </div>
    </div>
  );
}