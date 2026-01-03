'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, Target, Calendar, Award, Zap, Activity } from 'lucide-react';

interface PerformanceData {
  period: string;
  etfReturn: number;
  benchmarkReturn: number;
  difference: number;
  volatility: number;
  sharpeRatio: number;
}

interface ETFPerformance {
  symbol: string;
  name: string;
  benchmark: string;
  nav: number;
  navChange: number;
  navChangePercent: number;
  aum: string;
  expenseRatio: number;
}

export default function ETFPerformancePage() {
  const [selectedETF, setSelectedETF] = useState<ETFPerformance>({
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    benchmark: 'S&P 500 Index',
    nav: 438.92,
    navChange: 2.45,
    navChangePercent: 0.56,
    aum: '$385.2B',
    expenseRatio: 0.0945
  });
  
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');
  const [isLoading, setIsLoading] = useState(true);

  const periods = ['1D', '1W', '1M', '3M', '6M', '1Y', '3Y', '5Y', 'YTD'];

  useEffect(() => {
    const generatePerformanceData = () => {
      const data = [
        { period: '1D', baseReturn: 0.56, volatility: 15.2 },
        { period: '1W', baseReturn: 2.34, volatility: 15.8 },
        { period: '1M', baseReturn: 5.67, volatility: 16.1 },
        { period: '3M', baseReturn: 8.92, volatility: 17.3 },
        { period: '6M', baseReturn: 12.45, volatility: 18.7 },
        { period: '1Y', baseReturn: 19.23, volatility: 19.8 },
        { period: '3Y', baseReturn: 11.45, volatility: 21.2 },
        { period: '5Y', baseReturn: 13.78, volatility: 22.5 },
        { period: 'YTD', baseReturn: 15.34, volatility: 18.9 }
      ];

      return data.map(item => {
        const etfReturn = item.baseReturn + (Math.random() - 0.5) * 0.5;
        const benchmarkReturn = item.baseReturn + (Math.random() - 0.5) * 0.3;
        const difference = etfReturn - benchmarkReturn;
        const sharpeRatio = (etfReturn - 2.5) / item.volatility; // assuming 2.5% risk-free rate

        return {
          period: item.period,
          etfReturn,
          benchmarkReturn,
          difference,
          volatility: item.volatility,
          sharpeRatio
        };
      });
    };

    setTimeout(() => {
      const data = generatePerformanceData();
      setPerformanceData(data);
      setIsLoading(false);
    }, 1000);
  }, [selectedETF]);

  const getCurrentPerformance = () => {
    return performanceData.find(p => p.period === selectedPeriod) || performanceData[0];
  };

  const currentPerf = getCurrentPerformance();

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getPerformanceBg = (value: number) => {
    return value >= 0 ? 'bg-green-100' : 'bg-red-100';
  };

  const getRiskLevel = (volatility: number) => {
    if (volatility < 10) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
    if (volatility < 20) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'High', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const risk = getRiskLevel(currentPerf?.volatility || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedETF.symbol} Performance</h1>
              <p className="text-gray-600 mt-2">{selectedETF.name}</p>
              <p className="text-sm text-gray-500">vs {selectedETF.benchmark}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Current NAV</p>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">${selectedETF.nav.toFixed(2)}</span>
                <span className={`flex items-center space-x-1 ${getPerformanceColor(selectedETF.navChangePercent)}`}>
                  {selectedETF.navChangePercent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span className="text-sm font-medium">
                    {selectedETF.navChangePercent >= 0 ? '+' : ''}{selectedETF.navChangePercent.toFixed(2)}%
                  </span>
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold text-gray-900">{selectedETF.aum}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expense Ratio</p>
                <p className="text-2xl font-bold text-gray-900">{selectedETF.expenseRatio}%</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Risk Level</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${risk.bg} ${risk.color}`}>
                  {risk.level}
                </span>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sharpe Ratio</p>
                <p className="text-2xl font-bold text-gray-900">{currentPerf?.sharpeRatio.toFixed(2) || '--'}</p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Table */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Performance vs Benchmark</h3>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ETF Return</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Benchmark</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difference</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volatility</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {performanceData.map((perf, index) => (
                        <motion.tr
                          key={perf.period}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`hover:bg-gray-50 transition-colors ${perf.period === selectedPeriod ? 'bg-blue-50 border-blue-200' : ''}`}
                          onClick={() => setSelectedPeriod(perf.period)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{perf.period}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`flex items-center space-x-1 ${getPerformanceColor(perf.etfReturn)}`}>
                              {perf.etfReturn >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              <span className="text-sm font-medium">
                                {perf.etfReturn >= 0 ? '+' : ''}{perf.etfReturn.toFixed(2)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${getPerformanceColor(perf.benchmarkReturn)}`}>
                              {perf.benchmarkReturn >= 0 ? '+' : ''}{perf.benchmarkReturn.toFixed(2)}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${getPerformanceColor(perf.difference)}`}>
                              {perf.difference >= 0 ? '+' : ''}{perf.difference.toFixed(2)}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{perf.volatility.toFixed(1)}%</div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

            {/* Performance Chart Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Chart</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Interactive Performance Chart</p>
                  <p className="text-sm text-gray-400">Compare ETF vs Benchmark over time</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Analysis */}
          <div className="space-y-6">
            {/* Period Selector */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Period</h3>
              <div className="grid grid-cols-3 gap-2">
                {periods.map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedPeriod === period
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Risk Metrics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Analysis</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Standard Deviation</span>
                  <span className="text-sm text-gray-900">{currentPerf?.volatility.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Beta (vs Benchmark)</span>
                  <span className="text-sm text-gray-900">0.99</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Tracking Error</span>
                  <span className="text-sm text-gray-900">0.05%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Max Drawdown</span>
                  <span className="text-sm text-red-600">-12.3%</span>
                </div>
              </div>
            </motion.div>

            {/* Performance Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${getPerformanceBg(currentPerf?.difference || 0)}`}>
                  <div className="flex items-center space-x-2">
                    {(currentPerf?.difference || 0) >= 0 ? 
                      <TrendingUp className="h-4 w-4 text-green-600" /> : 
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    }
                    <span className={`text-sm font-medium ${getPerformanceColor(currentPerf?.difference || 0)}`}>
                      {(currentPerf?.difference || 0) >= 0 ? 'Outperforming' : 'Underperforming'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    vs benchmark by {Math.abs(currentPerf?.difference || 0).toFixed(2)}%
                  </p>
                </div>
                
                <div className="text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Risk-Adjusted Return</span>
                    <span className="font-medium text-gray-900">
                      {currentPerf?.sharpeRatio.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Correlation</span>
                    <span className="font-medium text-gray-900">0.998</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Data Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Benchmark:</strong> {selectedETF.benchmark}</p>
                <p><strong>Inception Date:</strong> January 22, 1993</p>
                <p><strong>Last Updated:</strong> Today, 4:00 PM ET</p>
                <p className="text-xs text-gray-500 mt-3">
                  Performance data includes dividends and is net of fees. Past performance does not guarantee future results.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}