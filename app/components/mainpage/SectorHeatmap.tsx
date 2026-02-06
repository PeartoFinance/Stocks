'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface SectorData {
  sector: string;
  dayReturn: number;
  marketWeight: number;
  marketCap?: number;
  stockCount: number;
}

interface HeatmapItem {
  sector: string;
  dayReturn: number;
  weight: number; // Used for col-span
  mcap: string;
}

interface SectorHeatmapProps {
  className?: string;
  sectors: SectorData[];
}

export default function SectorHeatmap({ className = '', sectors }: SectorHeatmapProps) {
  const getIntensity = (val: number) => {
    if (val >= 2) return 'bg-emerald-600 text-white border-emerald-700';
    if (val >= 0.5) return 'bg-emerald-500/20 text-emerald-700 border-emerald-200';
    if (val >= 0) return 'bg-emerald-50/50 text-emerald-600 border-emerald-100';
    return 'bg-rose-50 text-rose-600 border-rose-100';
  };

  // Transform real sectors data to match heatmap format
  const heatmapData: HeatmapItem[] = sectors.map(sector => ({
    sector: sector.sector,
    dayReturn: sector.dayReturn,
    weight: Math.max(2, Math.min(4, Math.floor(sector.marketWeight / 10))), // Convert marketWeight to col-span
    mcap: sector.marketCap ? `${(sector.marketCap / 1e12).toFixed(1)}T` : 'N/A'
  }));

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-4 shadow-sm ${className}`}>
      {/* Header - Compact */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-500" />
          <h2 className="text-slate-900 text-sm font-bold tracking-tight">Market Heatmap</h2>
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <div className="w-2 h-2 rounded-full bg-emerald-200" />
          <div className="w-2 h-2 rounded-full bg-rose-200" />
        </div>
      </div>

      {/* Heatmap Grid - High Density */}
      <div className="grid grid-cols-12 gap-1.5 auto-rows-[80px]">
        {heatmapData.map((s) => (
          <div
            key={s.sector}
            className={`col-span-${s.weight} ${getIntensity(s.dayReturn)} 
              rounded-xl border p-2.5 flex flex-col justify-between 
              transition-all hover:brightness-95 cursor-pointer group`}
          >
            <div className="flex justify-between items-start leading-none">
              <span className="text-[9px] font-black uppercase tracking-tighter opacity-80 truncate mr-1">
                {s.sector}
              </span>
              {s.dayReturn >= 0 ? 
                <ArrowUpRight className="h-3 w-3 shrink-0" /> : 
                <ArrowDownRight className="h-3 w-3 shrink-0" />
              }
            </div>
            
            <div className="flex items-baseline justify-between mt-auto">
              <span className="text-sm font-black font-mono tracking-tighter">
                {s.dayReturn > 0 ? '+' : ''}{s.dayReturn}%
              </span>
              <span className="text-[8px] font-bold opacity-60">{s.mcap}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer - Minimal */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center px-1">
        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Weight-Based Tiles</span>
        <span className="text-[9px] text-emerald-600 font-bold px-2 py-0.5 bg-emerald-50 rounded">Live Feed</span>
      </div>
    </div>
  );
}