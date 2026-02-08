'use client';

import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface StockRiskAnalysisChartProps {
  className?: string;
  stock: {
    symbol: string;
    price: number;
    marketCap?: number;
    volume?: number;
    change: number;
    changePercent: number;
    dayHigh?: number;
    dayLow?: number;
    high52w?: number;
    low52w?: number;
    pe?: number;
    dividend?: number;
    sector?: string;
  };
}

export default function StockRiskAnalysisChart({ className = '', stock }: StockRiskAnalysisChartProps) {
  const riskData = useMemo(() => {
    // Calculate risk based on real stock metrics
    let lowRisk = 0;
    let mediumRisk = 0;
    let highRisk = 0;
    let veryHighRisk = 0;

    // Price Volatility Risk (based on price change)
    const volatilityScore = Math.abs(stock.changePercent || 0);
    if (volatilityScore < 2) lowRisk += 30;
    else if (volatilityScore < 5) mediumRisk += 30;
    else if (volatilityScore < 7) highRisk += 30;
    else veryHighRisk += 30;

    // Market Cap Risk (larger cap = lower risk)
    const stockMarketCap = stock.marketCap || 0;
    if (stockMarketCap > 100000000000) lowRisk += 25;
    else if (stockMarketCap > 10000000000) mediumRisk += 25;
    else if (stockMarketCap > 1000000000) highRisk += 25;
    else veryHighRisk += 25;

    // Volume Risk (higher volume = lower risk)
    const volume = stock.volume || 0;
    const volumeToMarketCapRatio = stockMarketCap > 0 ? volume / stockMarketCap : 0;
    if (volumeToMarketCapRatio > 0.1) lowRisk += 25;
    else if (volumeToMarketCapRatio > 0.05) mediumRisk += 25;
    else if (volumeToMarketCapRatio > 0.01) highRisk += 25;
    else veryHighRisk += 25;

    // P/E Ratio Risk (lower P/E = lower risk for value stocks)
    const peRatio = stock.pe || 0;
    if (peRatio > 0 && peRatio < 15) lowRisk += 25;
    else if (peRatio >= 15 && peRatio < 25) mediumRisk += 25;
    else if (peRatio >= 25 && peRatio < 35) highRisk += 25;
    else veryHighRisk += 25;

    // Price Range Risk (smaller range = lower risk)
    if (stock.dayHigh && stock.dayLow) {
      const dailyRange = ((stock.dayHigh - stock.dayLow) / stock.dayLow) * 100;
      if (dailyRange < 2) lowRisk += 20;
      else if (dailyRange < 5) mediumRisk += 20;
      else if (dailyRange < 10) highRisk += 20;
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
  }, [stock]);

  const getOverallRiskLevel = () => {
    const data = riskData.datasets[0].data;
    const maxIndex = data.indexOf(Math.max(...data));
    const levels = ['Low', 'Medium', 'High', 'Very High'];
    return levels[maxIndex];
  };

  const getRiskColor = (level: string) => {
    const colors = {
      'Low': 'text-green-600 dark:text-pearto-green',
      'Medium': 'text-yellow-600', 
      'High': 'text-red-600 dark:text-pearto-pink',
      'Very High': 'text-purple-600'
    };
    return colors[level as keyof typeof colors] || 'text-gray-600 dark:text-pearto-cloud';
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
        display: false // Hide legend to save space
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
  const stockMarketCap = stock.marketCap || 0;

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 ${className}`}>
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 transition-colors duration-300">Risk Analysis</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
          Based on {stock.symbol} metrics
        </p>
      </div>
      
      <div className="h-20 relative mb-2">
        <Doughnut data={riskData} options={options} />
      </div>
      
      {/* Risk Level Text Below Chart */}
      <div className="text-center mb-3">
        <div className={`text-lg font-bold ${getRiskColor(overallRisk)}`}>
          {overallRisk} Risk
        </div>
      </div>
      
      {/* Key Metrics - 3 rows */}
      <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Volatility</span>
          <span className={`font-semibold ${
            Math.abs(stock.changePercent || 0) < 2 ? 'text-green-600 dark:text-pearto-green' :
            Math.abs(stock.changePercent || 0) < 5 ? 'text-yellow-600' :
            Math.abs(stock.changePercent || 0) < 10 ? 'text-red-600 dark:text-pearto-pink' : 'text-purple-600'
          }`}>
            {Math.abs(stock.changePercent || 0).toFixed(2)}%
          </span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">P/E Ratio</span>
          <span className={`font-semibold ${
            (stock.pe || 0) > 0 && (stock.pe || 0) < 15 ? 'text-green-600 dark:text-pearto-green' :
            (stock.pe || 0) >= 15 && (stock.pe || 0) < 25 ? 'text-yellow-600' :
            (stock.pe || 0) >= 25 && (stock.pe || 0) < 35 ? 'text-red-600 dark:text-pearto-pink' : 'text-purple-600'
          }`}>
            {stock.pe ? stock.pe.toFixed(1) : 'N/A'}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Market Cap</span>
          <span className={`font-semibold ${
            stockMarketCap > 100000000000 ? 'text-green-600 dark:text-pearto-green' :
            stockMarketCap > 10000000000 ? 'text-yellow-600' :
            stockMarketCap > 1000000000 ? 'text-red-600 dark:text-pearto-pink' : 'text-purple-600'
          }`}>
            {stockMarketCap > 1000000000 
              ? `$${(stockMarketCap / 1000000000).toFixed(1)}B` 
              : stockMarketCap > 1000000
              ? `$${(stockMarketCap / 1000000).toFixed(1)}M`
              : `$${(stockMarketCap / 1000).toFixed(1)}K`
            }
          </span>
        </div>
      </div>
    </div>
  );
}