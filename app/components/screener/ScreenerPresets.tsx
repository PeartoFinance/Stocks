'use client';

import React from 'react';
import { Target, Rocket, Shield, Zap } from 'lucide-react';

export interface PresetStrategy {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  filters: {
    minPE?: number;
    maxPE?: number;
    minDividendYield?: number;
    minMarketCap?: number;
    maxBeta?: number;
    minRevenueGrowth?: number;
  };
}

const PRESETS: PresetStrategy[] = [
  {
    id: 'value_hunter',
    name: 'Value Hunter',
    description: 'Low P/E + High Dividend + Large Cap',
    icon: Target,
    color: 'blue',
    filters: {
      maxPE: 15,
      minDividendYield: 2,
      minMarketCap: 10000000000, // $10B+
    },
  },
  {
    id: 'growth_rocket',
    name: 'Growth Rocket',
    description: 'High Revenue Growth + Momentum',
    icon: Rocket,
    color: 'purple',
    filters: {
      minRevenueGrowth: 20,
      minMarketCap: 1000000000, // $1B+
    },
  },
  {
    id: 'safe_havens',
    name: 'Safe Havens',
    description: 'Low Beta + Large Cap + Dividends',
    icon: Shield,
    color: 'green',
    filters: {
      maxBeta: 0.8,
      minMarketCap: 10000000000, // $10B+
      minDividendYield: 1.5,
    },
  },
  {
    id: 'momentum_play',
    name: 'Momentum Play',
    description: 'Strong Price Action + Volume',
    icon: Zap,
    color: 'orange',
    filters: {
      minMarketCap: 2000000000, // $2B+
    },
  },
];

interface Props {
  onSelectPreset: (preset: PresetStrategy) => void;
  activePreset?: string;
}

export default function ScreenerPresets({ onSelectPreset, activePreset }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {PRESETS.map((preset) => {
        const Icon = preset.icon;
        const isActive = activePreset === preset.id;
        
        const colorClasses = {
          blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
          purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
          green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
          orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
        };

        return (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(preset)}
            className={`relative p-4 rounded-xl text-left transition-all ${
              isActive
                ? `bg-gradient-to-br ${colorClasses[preset.color as keyof typeof colorClasses]} text-white shadow-lg scale-105`
                : 'bg-white dark:bg-gray-800 hover:shadow-lg border border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${
                  isActive
                    ? 'bg-white/20'
                    : 'bg-gradient-to-br ' + colorClasses[preset.color as keyof typeof colorClasses]
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-white'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-bold text-sm mb-1 ${
                    isActive ? 'text-white' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {preset.name}
                </h3>
                <p
                  className={`text-xs ${
                    isActive ? 'text-white/90' : 'text-slate-600 dark:text-gray-400'
                  }`}
                >
                  {preset.description}
                </p>
              </div>
            </div>
            {isActive && (
              <div className="absolute top-2 right-2">
                <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
