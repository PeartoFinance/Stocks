'use client';

import React, { useEffect, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface RiskAnalysisChartProps {
  className?: string;
  crypto: {
    symbol: string;
    price: number;
    marketCap: number;
    volume: number;
    change: number;
    changePercent: number;
    dayHigh?: number;
    dayLow?: number;
    high52w?: number;
    low52w?: number;
  };
}

export default function RiskAnalysisChart({ className = '', crypto }: RiskAnalysisChartProps) {
  const riskData = useMemo(() => {
    // Calculate risk based on real crypto metrics
    let lowRisk = 0;
    let mediumRisk = 0;
    let highRisk = 0;
    let veryHighRisk = 0;

    // Volatility Risk (based on price change)
    const volatilityScore = Math.abs(crypto.changePercent || 0);
    if (volatilityScore < 2) lowRisk += 30;
    else if (volatilityScore < 5) mediumRisk += 30;
    else if (volatilityScore < 10) highRisk += 30;
    else veryHighRisk += 30;

    // Market Cap Risk (larger cap = lower risk)
    const marketCap = crypto.marketCap || 0;
    if (marketCap > 10000000000) lowRisk += 25; // > $10B
    else if (marketCap > 1000000000) mediumRisk += 25; // > $1B
    else if (marketCap > 100000000) highRisk += 25; // > $100M
    else veryHighRisk += 25; // < $100M

    // Volume Risk (higher volume = lower risk)
    const volume = crypto.volume || 0;
    const volumeToMarketCapRatio = volume / marketCap;
    if (volumeToMarketCapRatio > 0.1) lowRisk += 25;
    else if (volumeToMarketCapRatio > 0.05) mediumRisk += 25;
    else if (volumeToMarketCapRatio > 0.01) highRisk += 25;
    else veryHighRisk += 25;

    // Price Range Risk (based on day high/low)
    if (crypto.dayHigh && crypto.dayLow) {
      const dailyRange = ((crypto.dayHigh - crypto.dayLow) / crypto.dayLow) * 100;
      if (dailyRange < 3) lowRisk += 20;
      else if (dailyRange < 7) mediumRisk += 20;
      else if (dailyRange < 15) highRisk += 20;
      else veryHighRisk += 20;
    } else {
      mediumRisk += 20; // Default if no range data
    }

    // Normalize to 100%
    const total = lowRisk + mediumRisk + highRisk + veryHighRisk;
    const normalizedData = [
      Math.round((lowRisk / total) * 100),
      Math.round((mediumRisk / total) * 100),
      Math.round((highRisk / total) * 100),
      Math.round((veryHighRisk / total) * 100)
    ];

    return {
      labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Very High Risk'],
      datasets: [{
        data: normalizedData,
        backgroundColor: [
          '#10b981', // Green - Low Risk
          '#f59e0b', // Amber - Medium Risk
          '#ef4444', // Red - High Risk
          '#7c3aed', // Purple - Very High Risk
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 4
      }]
    };
  }, [crypto]);

  const getOverallRiskLevel = () => {
    const data = riskData.datasets[0].data;
    const maxIndex = data.indexOf(Math.max(...data));
    const levels = ['Low', 'Medium', 'High', 'Very High'];
    return levels[maxIndex];
  };

  const getRiskColor = (level: string) => {
    const colors = {
      'Low': 'text-green-600 dark:text-green-400',
      'Medium': 'text-yellow-600 dark:text-yellow-400', 
      'High': 'text-red-600 dark:text-red-400',
      'Very High': 'text-purple-600'
    };
    return colors[level as keyof typeof colors] || 'text-slate-600 dark:text-slate-400';
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 5,
        bottom: 5,
        left: 5,
        right: 5
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        bodyFont: {
          size: 10,
          weight: 500 as const
        },
        titleFont: {
          size: 11,
          weight: 600 as const
        },
        padding: 6,
        cornerRadius: 4
      }
    },
    cutout: '65%',
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  const overallRisk = getOverallRiskLevel();

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 ${className}`}>
      <div className="mb-2">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1 transition-colors duration-300">Risk Analysis</h3>
        <p className="text-xs text-gray-600 dark:text-slate-400 transition-colors duration-300">
          Based on {crypto.symbol} metrics
        </p>
      </div>
      
      <div className="h-20 relative mb-2">
        <Doughnut data={riskData} options={options} />
      </div>
      
      {/* Risk Level Text Below Chart */}
      <div className="text-center mb-3">
        <div className={`text-lg font-medium ${getRiskColor(overallRisk)}`}>
          {overallRisk} Risk
        </div>
      </div>
      
      {/* Key Metrics - 3 rows */}
      <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600  dark:text-slate-400 transition-colors duration-300">Volatility</span>
          <span className={`font-medium ${
            Math.abs(crypto.changePercent || 0) < 2 ? 'text-green-600 dark:text-green-400' :
            Math.abs(crypto.changePercent || 0) < 5 ? 'text-yellow-600 dark:text-yellow-400' :
            Math.abs(crypto.changePercent || 0) < 10 ? 'text-red-600 dark:text-red-400' : 'text-purple-600 dark:text-purple-400'
          }`}>
            {Math.abs(crypto.changePercent || 0).toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600  dark:text-slate-400 transition-colors duration-300">Market Cap</span>
          <span className={`font-medium ${
            (crypto.marketCap || 0) > 10000000000 ? 'text-green-600 dark:text-green-400' :
            (crypto.marketCap || 0) > 1000000000 ? 'text-yellow-600 dark:text-yellow-400' :
            (crypto.marketCap || 0) > 100000000 ? 'text-red-600 dark:text-red-400' : 'text-purple-600 dark:text-purple-400'
          }`}>
            {(crypto.marketCap || 0) > 1000000000 
              ? `$${((crypto.marketCap || 0) / 1000000000).toFixed(1)}B`
              : `$${((crypto.marketCap || 0) / 1000000).toFixed(1)}M`
            }
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600  dark:text-slate-400 transition-colors duration-300">Volume/Cap</span>
          <span className={`font-medium ${
            ((crypto.volume || 0) / (crypto.marketCap || 1)) > 0.1 ? 'text-green-600 dark:text-green-400' :
            ((crypto.volume || 0) / (crypto.marketCap || 1)) > 0.05 ? 'text-yellow-600 dark:text-yellow-400' :
            ((crypto.volume || 0) / (crypto.marketCap || 1)) > 0.01 ? 'text-red-600 dark:text-red-400' : 'text-purple-600 dark:text-purple-400'
          }`}>
            {(((crypto.volume || 0) / (crypto.marketCap || 1)) * 100).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}
