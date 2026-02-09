import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, BarChart3, PieChart, Target, Loader2 } from 'lucide-react';
import { Stock } from '../../types';
import { marketService } from '../../utils/marketService';

interface AdvancedMetrics {
  symbol: string;
  marketCap: number | null;
  peRatio: number | null;
  forwardPe: number | null;
  eps: number | null;
  beta: number | null;
  dividendYield: number | null;
  dividendRate: number | null;
  sharesOutstanding: number | null;
  floatShares: number | null;
  bookValue: number | null;
  priceToBook: number | null;
  shortRatio: number | null;
  high52w: number | null;
  low52w: number | null;
  avgVolume: number | null;
}

interface MetricsTabProps {
  stock: Stock;
}

export default function MetricsTab({ stock }: MetricsTabProps) {
  const [metrics, setMetrics] = useState<AdvancedMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await marketService.getStockStatistics(stock.symbol);
        setMetrics(data as AdvancedMetrics);
      } catch (error) {
        console.error('Failed to load metrics:', error);
        // Fallback to stock data if statistics API fails
        setMetrics({
          symbol: stock.symbol,
          marketCap: stock.marketCap || null,
          peRatio: stock.peRatio || null,
          forwardPe: stock.forwardPe || null,
          eps: stock.eps || null,
          beta: stock.beta || null,
          dividendYield: stock.dividendYield || null,
          dividendRate: null,
          sharesOutstanding: null,
          floatShares: null,
          bookValue: null,
          priceToBook: null,
          shortRatio: null,
          high52w: stock.week52High || null,
          low52w: stock.week52Low || null,
          avgVolume: stock.avgVolume || null,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [stock.symbol]);

  const formatRatio = (num: number | null): string => {
    if (num === null) return '-';
    return num.toFixed(2);
  };

  const formatLargeNumber = (num: number | null): string => {
    if (num === null) return '-';
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const formatPercent = (num: number | null): string => {
    if (num === null) return '-';
    return `${(num * 100).toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8">
        <p className="text-center text-slate-500 dark:text-slate-400">Failed to load metrics data</p>
      </div>
    );
  }

  const MetricCard = ({ 
    label, 
    value, 
    icon: Icon, 
    color 
  }: { 
    label: string; 
    value: string; 
    icon: any; 
    color: string; 
  }) => (
    <div className={`bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 dark:border-${color}-800 rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium text-${color}-700 dark:text-${color}-300`}>{label}</span>
        <Icon className={`h-4 w-4 text-${color}-600 dark:text-${color}-400`} />
      </div>
      <p className={`text-xl font-bold text-${color}-900 dark:text-${color}-100`}>
        {value}
      </p>
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
          <MetricCard
            label="Market Cap"
            value={formatLargeNumber(metrics.marketCap)}
            icon={PieChart}
            color="blue"
          />
          <MetricCard
            label="P/E Ratio (TTM)"
            value={formatRatio(metrics.peRatio)}
            icon={BarChart3}
            color="green"
          />
          <MetricCard
            label="Forward P/E"
            value={formatRatio(metrics.forwardPe)}
            icon={Target}
            color="purple"
          />
          <MetricCard
            label="Price-to-Book"
            value={formatRatio(metrics.priceToBook)}
            icon={Target}
            color="orange"
          />
        </div>
      </div>

      {/* Trading Metrics */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-500" />
          Trading Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Avg Volume"
            value={formatLargeNumber(metrics.avgVolume)}
            icon={Activity}
            color="blue"
          />
          <MetricCard
            label="52W High"
            value={metrics.high52w ? `$${formatRatio(metrics.high52w)}` : '-'}
            icon={TrendingUp}
            color="green"
          />
          <MetricCard
            label="52W Low"
            value={metrics.low52w ? `$${formatRatio(metrics.low52w)}` : '-'}
            icon={TrendingUp}
            color="red"
          />
          <MetricCard
            label="Beta"
            value={formatRatio(metrics.beta)}
            icon={Activity}
            color="purple"
          />
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-500" />
          Financial Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="EPS (TTM)"
            value={metrics.eps ? `$${formatRatio(metrics.eps)}` : '-'}
            icon={Target}
            color="green"
          />
          <MetricCard
            label="Dividend Yield"
            value={formatPercent(metrics.dividendYield)}
            icon={Target}
            color="blue"
          />
          <MetricCard
            label="Book Value"
            value={metrics.bookValue ? `$${formatRatio(metrics.bookValue)}` : '-'}
            icon={Target}
            color="purple"
          />
          <MetricCard
            label="Shares Outstanding"
            value={formatLargeNumber(metrics.sharesOutstanding)}
            icon={PieChart}
            color="orange"
          />
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Additional Statistics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-slate-700 dark:text-slate-300">Share Information</h4>
            {[
              { label: 'Shares Outstanding', value: formatLargeNumber(metrics.sharesOutstanding) },
              { label: 'Float Shares', value: formatLargeNumber(metrics.floatShares) },
              { label: 'Short Ratio', value: formatRatio(metrics.shortRatio) },
              { label: 'Dividend Rate', value: metrics.dividendRate ? `$${formatRatio(metrics.dividendRate)}` : '-' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-slate-700 dark:text-slate-300">Performance Metrics</h4>
            {[
              { label: 'Current Price', value: `$${stock.price.toFixed(2)}` },
              { label: '52W High Distance', value: metrics.high52w ? `${(((stock.price - metrics.high52w) / metrics.high52w) * 100).toFixed(1)}%` : '-' },
              { label: '52W Low Distance', value: metrics.low52w ? `${(((stock.price - metrics.low52w) / metrics.low52w) * 100).toFixed(1)}%` : '-' },
              { label: 'Market Cap Rank', value: metrics.marketCap && metrics.marketCap > 100e9 ? 'Large Cap' : metrics.marketCap && metrics.marketCap > 10e9 ? 'Mid Cap' : 'Small Cap' },
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