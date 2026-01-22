import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity } from 'lucide-react';
import { Stock } from '../../types';

interface StatisticsTabProps {
  stock: Stock;
}

export default function StatisticsTab({ stock }: StatisticsTabProps) {
  const formatNumber = (num: number | undefined | null, decimals = 2): string => {
    if (num == null) return '-';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const formatLargeNumber = (num: number | undefined | null): string => {
    if (num == null) return '-';
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toLocaleString();
  };

  const formatPercent = (num: number | undefined | null): string => {
    if (num == null) return '-';
    return `${(num * 100).toFixed(2)}%`;
  };

  const valuationMetrics = [
    { label: 'Market Cap', value: formatLargeNumber(stock.marketCap), icon: PieChart, color: 'blue' },
    { label: 'P/E Ratio (TTM)', value: formatNumber(stock.peRatio), icon: BarChart3, color: 'green' },
    { label: 'EPS (TTM)', value: stock.eps ? `$${formatNumber(stock.eps)}` : '-', icon: TrendingUp, color: 'purple' },
    { label: 'Beta', value: formatNumber(stock.beta), icon: Activity, color: 'orange' },
  ];

  const tradingMetrics = [
    { label: 'Volume', value: formatLargeNumber(stock.volume), icon: BarChart3, color: 'blue' },
    { label: '52W High', value: stock.week52High ? `$${formatNumber(stock.week52High)}` : '-', icon: TrendingUp, color: 'green' },
    { label: '52W Low', value: stock.week52Low ? `$${formatNumber(stock.week52Low)}` : '-', icon: TrendingDown, color: 'red' },
    { label: 'Dividend Yield', value: stock.dividendYield ? formatPercent(stock.dividendYield) : '-', icon: PieChart, color: 'purple' },
  ];

  const performanceMetrics = [
    { 
      label: '1 Day Change', 
      value: `${stock.change >= 0 ? '+' : ''}${formatNumber(stock.change)} (${stock.changePercent >= 0 ? '+' : ''}${formatNumber(stock.changePercent)}%)`,
      icon: stock.change >= 0 ? TrendingUp : TrendingDown,
      color: stock.change >= 0 ? 'green' : 'red'
    },
    { 
      label: 'Distance from 52W High', 
      value: stock.week52High ? `${(((stock.price - stock.week52High) / stock.week52High) * 100).toFixed(1)}%` : '-',
      icon: TrendingDown,
      color: 'orange'
    },
    { 
      label: 'Distance from 52W Low', 
      value: stock.week52Low ? `${(((stock.price - stock.week52Low) / stock.week52Low) * 100).toFixed(1)}%` : '-',
      icon: TrendingUp,
      color: 'green'
    },
  ];

  const StatCard = ({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) => (
    <div className={`bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 dark:border-${color}-800 rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium text-${color}-700 dark:text-${color}-300`}>{label}</span>
        <Icon className={`h-4 w-4 text-${color}-600 dark:text-${color}-400`} />
      </div>
      <p className={`text-xl font-bold text-${color}-900 dark:text-${color}-100`}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Valuation Metrics */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-blue-500" />
          Valuation Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {valuationMetrics.map((metric, index) => (
            <StatCard key={index} {...metric} />
          ))}
        </div>
      </div>

      {/* Trading Metrics */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-500" />
          Trading Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tradingMetrics.map((metric, index) => (
            <StatCard key={index} {...metric} />
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-500" />
          Performance Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {performanceMetrics.map((metric, index) => (
            <StatCard key={index} {...metric} />
          ))}
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Additional Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-slate-700 dark:text-slate-300">Company Information</h4>
            {[
              { label: 'Sector', value: stock.sector || '-' },
              { label: 'Industry', value: stock.industry || '-' },
              { label: 'Symbol', value: stock.symbol },
              { label: 'Current Price', value: `$${formatNumber(stock.price)}` },
            ].map((item, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-slate-700 dark:text-slate-300">Risk Metrics</h4>
            {[
              { label: 'Beta (5Y Monthly)', value: formatNumber(stock.beta) },
              { label: 'Volatility', value: stock.beta ? `${(stock.beta * 15).toFixed(1)}%` : '-' },
              { label: 'Risk Level', value: stock.beta ? (stock.beta > 1.5 ? 'High' : stock.beta > 1 ? 'Medium' : 'Low') : '-' },
              { label: 'Market Correlation', value: stock.beta ? (stock.beta > 1 ? 'High' : 'Moderate') : '-' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}