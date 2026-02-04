'use client';

import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import cryptoService from '../../utils/cryptoService';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface RiskAnalysisChartProps {
  className?: string;
  symbol?: string;
}

interface CryptoDetails {
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
}

export default function RiskAnalysisChart({ className = '', symbol }: RiskAnalysisChartProps) {
  const [cryptoData, setCryptoData] = useState<CryptoDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [riskData, setRiskData] = useState({
    labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Very High Risk'],
    datasets: [{
      data: [25, 35, 30, 10],
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
  });

  useEffect(() => {
    const fetchCryptoData = async () => {
      if (!symbol) return;

      try {
        setLoading(true);
        const data = await cryptoService.getCoinDetails(symbol);
        if (data) {
          const cryptoDetails: CryptoDetails = {
            symbol: (data as any).symbol || symbol,
            price: (data as any).price || 0,
            marketCap: (data as any).marketCap || 0,
            volume: (data as any).volume || 0,
            change: (data as any).change || 0,
            changePercent: (data as any).changePercent || 0,
            dayHigh: (data as any).dayHigh,
            dayLow: (data as any).dayLow,
            high52w: (data as any).high52w,
            low52w: (data as any).low52w
          };
          setCryptoData(cryptoDetails);
          calculateRiskAnalysis(cryptoDetails);
        }
      } catch (error) {
        console.error('Error fetching crypto data for risk analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, [symbol]);

  const calculateRiskAnalysis = (crypto: CryptoDetails) => {
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

    setRiskData({
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
    });
  };

  const getOverallRiskLevel = () => {
    const data = riskData.datasets[0].data;
    const maxIndex = data.indexOf(Math.max(...data));
    const levels = ['Low', 'Medium', 'High', 'Very High'];
    return levels[maxIndex];
  };

  const getRiskColor = (level: string) => {
    const colors = {
      'Low': 'text-green-600',
      'Medium': 'text-yellow-600', 
      'High': 'text-red-600',
      'Very High': 'text-purple-600'
    };
    return colors[level as keyof typeof colors] || 'text-gray-600';
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: {
            size: 10,
            weight: 500 as const
          },
          color: '#374151',
          boxWidth: 12,
          boxHeight: 12
        }
      },
      tooltip: {
        bodyFont: {
          size: 11,
          weight: 500 as const
        },
        titleFont: {
          size: 12,
          weight: 600 as const
        },
        padding: 10,
        cornerRadius: 6
      }
    },
    cutout: '70%',
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 ${className}`}>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Risk Analysis</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Analyzing risk factors...
          </p>
        </div>
        <div className="h-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const overallRisk = getOverallRiskLevel();

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 ${className}`}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Risk Analysis</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Based on {symbol} market metrics
        </p>
      </div>
      
      <div className="h-40 relative mb-4">
        <Doughnut data={riskData} options={options} />
        
        {/* Center text - positioned absolutely but with better z-index */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center bg-white/90 dark:bg-slate-900/90 px-3 py-2 rounded-lg shadow-sm">
            <div className={`text-lg font-bold ${getRiskColor(overallRisk)}`}>
              {overallRisk}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Risk</div>
          </div>
        </div>
      </div>
      
      {/* Risk Factors */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Volatility</span>
          <span className={`font-medium ${
            Math.abs(cryptoData?.changePercent || 0) < 2 ? 'text-green-600' :
            Math.abs(cryptoData?.changePercent || 0) < 5 ? 'text-yellow-600' :
            Math.abs(cryptoData?.changePercent || 0) < 10 ? 'text-red-600' : 'text-purple-600'
          }`}>
            {Math.abs(cryptoData?.changePercent || 0).toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Market Cap</span>
          <span className={`font-medium ${
            (cryptoData?.marketCap || 0) > 10000000000 ? 'text-green-600' :
            (cryptoData?.marketCap || 0) > 1000000000 ? 'text-yellow-600' :
            (cryptoData?.marketCap || 0) > 100000000 ? 'text-red-600' : 'text-purple-600'
          }`}>
            ${(cryptoData?.marketCap || 0) > 1000000000 
              ? `$${((cryptoData?.marketCap || 0) / 1000000000).toFixed(1)}B`
              : `$${((cryptoData?.marketCap || 0) / 1000000).toFixed(1)}M`
            }
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Volume/Cap</span>
          <span className={`font-medium ${
            ((cryptoData?.volume || 0) / (cryptoData?.marketCap || 1)) > 0.1 ? 'text-green-600' :
            ((cryptoData?.volume || 0) / (cryptoData?.marketCap || 1)) > 0.05 ? 'text-yellow-600' :
            ((cryptoData?.volume || 0) / (cryptoData?.marketCap || 1)) > 0.01 ? 'text-red-600' : 'text-purple-600'
          }`}>
            {(((cryptoData?.volume || 0) / (cryptoData?.marketCap || 1)) * 100).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}
