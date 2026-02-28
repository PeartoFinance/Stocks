'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Doughnut } from 'react-chartjs-2';
import { ArrowRight } from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { getTechnicalAnalysis } from '../../utils/technicalAnalysis';

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
    peRatio?: number;
    dividend?: number;
    sector?: string;
  };
}

export default function StockRiskAnalysisChart({ className = '', stock }: StockRiskAnalysisChartProps) {
  const router = useRouter();
  const [technicalData, setTechnicalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchTechnicalAnalysis = async () => {
      try {
        const data = await getTechnicalAnalysis(stock.symbol);
        setTechnicalData(data);
      } catch (error) {
        console.error('Failed to fetch technical analysis:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTechnicalAnalysis();
  }, [stock.symbol]);

  const riskData = React.useMemo(() => {
    let lowRisk = 0;
    let mediumRisk = 0;
    let highRisk = 0;
    let veryHighRisk = 0;

    // Technical Analysis Score (40% weight)
    if (technicalData?.summary?.score !== undefined) {
      const score = technicalData.summary.score;
      if (score >= 5) lowRisk += 40;
      else if (score >= 0) mediumRisk += 40;
      else if (score >= -5) highRisk += 40;
      else veryHighRisk += 40;
    } else {
      mediumRisk += 40;
    }

    // Price Volatility (20% weight)
    const volatilityScore = Math.abs(stock.changePercent || 0);
    if (volatilityScore < 2) lowRisk += 20;
    else if (volatilityScore < 5) mediumRisk += 20;
    else if (volatilityScore < 10) highRisk += 20;
    else veryHighRisk += 20;

    // Market Cap (20% weight)
    const stockMarketCap = stock.marketCap || 0;
    if (stockMarketCap > 100000000000) lowRisk += 20;
    else if (stockMarketCap > 10000000000) mediumRisk += 20;
    else if (stockMarketCap > 1000000000) highRisk += 20;
    else veryHighRisk += 20;

    // P/E Ratio (20% weight)
    const peRatio = stock.peRatio || 0;
    if (peRatio > 0 && peRatio < 20) lowRisk += 20;
    else if (peRatio >= 20 && peRatio < 30) mediumRisk += 20;
    else if (peRatio >= 30 && peRatio < 50) highRisk += 20;
    else veryHighRisk += 20;

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
  }, [stock, technicalData]);

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
      'Very High': 'text-purple-600 dark:text-purple-400'
    };
    return colors[level as keyof typeof colors] || 'text-slate-600 dark:text-slate-400';
  };

  const getSignalColor = (signal: string) => {
    if (signal === 'Buy') return 'text-green-600 dark:text-green-400';
    if (signal === 'Sell') return 'text-red-600 dark:text-red-400';
    return 'text-yellow-600 dark:text-yellow-400';
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

  if (loading) {
    return (
      <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 ${className}`}>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Risk Analysis</h3>
        <div className="animate-pulse space-y-2">
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 relative ${className}`}>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 transition-colors duration-300">Risk Analysis</h3>
          <p className="text-xs text-gray-600 dark:text-slate-400 transition-colors duration-300">
            {loading ? 'Loading...' : technicalData ? 'Technical + Fundamental' : 'Based on metrics'}
          </p>
        </div>
        <button
          onClick={() => router.push(`/analysis?stock=${stock.symbol}`)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
        >
          View More
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
      
      <div className="h-20 relative mb-2">
        <Doughnut data={riskData} options={options} />
      </div>
      
      {/* Risk Level Text Below Chart */}
      <div className="text-center mb-3">
        <div className={`text-xl font-semibold ${getRiskColor(overallRisk)}`}>
          {overallRisk} Risk
        </div>
      </div>
      
      {/* Key Metrics */}
      {technicalData && (
        <>
          <div className="mb-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-slate-400">Signal</span>
              <span className={`font-bold ${getSignalColor(technicalData.summary?.signal || 'Neutral')}`}>
                {technicalData.summary?.signal || 'Neutral'}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700 transition-colors duration-300">
            {technicalData.summary?.score !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">Score</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {technicalData.summary.score > 0 ? '+' : ''}{technicalData.summary.score.toFixed(1)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-slate-400">RSI</span>
              <span className={`font-medium ${getSignalColor(technicalData.indicators?.rsi?.signal || 'Neutral')}`}>
                {technicalData.indicators?.rsi?.value?.toFixed(1) || '-'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-slate-400">MACD</span>
              <span className={`font-medium ${getSignalColor(technicalData.indicators?.macd?.signal || 'Neutral')}`}>
                {technicalData.indicators?.macd?.signal || 'Neutral'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full mt-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            {showDetails ? 'Hide' : 'Show'} Details
            <svg className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDetails && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 shadow-lg z-50">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-slate-400">CCI</span>
                    <div className="text-right">
                      <span className="font-medium text-gray-900 dark:text-white">{technicalData.indicators?.cci?.value?.toFixed(2) || '-'}</span>
                      <span className={`ml-2 ${getSignalColor(technicalData.indicators?.cci?.signal || 'Neutral')}`}>
                        {technicalData.indicators?.cci?.signal || 'Neutral'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-slate-400">Stochastic</span>
                    <div className="text-right">
                      <span className="font-medium text-gray-900 dark:text-white">{technicalData.indicators?.stoch?.k?.toFixed(2) || '-'}</span>
                      <span className={`ml-2 ${getSignalColor(technicalData.indicators?.stoch?.signal || 'Neutral')}`}>
                        {technicalData.indicators?.stoch?.signal || 'Neutral'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-slate-400">Volatility</span>
                    <span className={`font-medium ${
                      Math.abs(stock.changePercent || 0) < 2 ? 'text-green-600 dark:text-green-400' :
                      Math.abs(stock.changePercent || 0) < 5 ? 'text-yellow-600 dark:text-yellow-400' :
                      Math.abs(stock.changePercent || 0) < 10 ? 'text-red-600 dark:text-red-400' : 'text-purple-600 dark:text-purple-400'
                    }`}>
                      {Math.abs(stock.changePercent || 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-slate-400">P/E Ratio</span>
                    <span className={`font-medium ${
                      (stock.peRatio || 0) > 0 && (stock.peRatio || 0) < 20 ? 'text-green-600 dark:text-green-400' :
                      (stock.peRatio || 0) >= 20 && (stock.peRatio || 0) < 30 ? 'text-yellow-600 dark:text-yellow-400' :
                      (stock.peRatio || 0) >= 30 && (stock.peRatio || 0) < 50 ? 'text-red-600 dark:text-red-400' : 'text-purple-600 dark:text-purple-400'
                    }`}>
                      {stock.peRatio ? stock.peRatio.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>

                {technicalData.indicators?.movingAverages && Array.isArray(technicalData.indicators.movingAverages) && technicalData.indicators.movingAverages.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-900 dark:text-white mb-2">Moving Averages</div>
                    <div className="space-y-1.5">
                      {technicalData.indicators.movingAverages.slice(0, 2).map((ma: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-slate-400">{ma?.name || 'MA'}</span>
                          <div className="text-right">
                            <span className="font-medium text-gray-900 dark:text-white">{ma?.value?.toFixed(2) || '-'}</span>
                            <span className={`ml-2 ${getSignalColor(ma?.signal || 'Neutral')}`}>
                              {ma?.signal || 'Neutral'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {technicalData.summary?.counts && (
                  <div>
                    <div className="text-xs font-medium text-gray-900 dark:text-white mb-2">Signal Counts</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-gray-600 dark:text-slate-400 mb-1">Oscillators</div>
                        <div className="flex gap-1">
                          <span className="text-green-600">B:{technicalData.summary.counts.oscillators?.buy || 0}</span>
                          <span className="text-red-600">S:{technicalData.summary.counts.oscillators?.sell || 0}</span>
                          <span className="text-yellow-600">N:{technicalData.summary.counts.oscillators?.neutral || 0}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-slate-400 mb-1">MAs</div>
                        <div className="flex gap-1">
                          <span className="text-green-600">B:{technicalData.summary.counts.movingAverages?.buy || 0}</span>
                          <span className="text-red-600">S:{technicalData.summary.counts.movingAverages?.sell || 0}</span>
                          <span className="text-yellow-600">N:{technicalData.summary.counts.movingAverages?.neutral || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}