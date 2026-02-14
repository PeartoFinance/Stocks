import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Loader2 } from 'lucide-react';
import { Stock } from '../../types';
import { marketService } from '../../utils/marketService';
import { useCurrency } from '../../context/CurrencyContext';

interface StatisticsData {
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

interface StatisticsTabProps {
  stock: Stock;
}

export default function StatisticsTab({ stock }: StatisticsTabProps) {
  const { formatPrice } = useCurrency();
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await marketService.getStockStatistics(stock.symbol);
        setStatistics(data as StatisticsData);
      } catch (err) {
        console.error('Failed to load statistics:', err);
        setError('Failed to load statistics data');
        // Fallback to stock data if API fails
        setStatistics({
          symbol: stock.symbol,
          marketCap: stock.marketCap || null,
          peRatio: stock.peRatio || null,
          forwardPe: stock.forwardPe || null,
          eps: stock.eps || null,
          beta: stock.beta || null,
          dividendYield: stock.dividendYield || null,
          dividendRate: stock.dividendRate || null,
          sharesOutstanding: stock.sharesOutstanding || null,
          floatShares: stock.floatShares || null,
          bookValue: stock.bookValue || null,
          priceToBook: stock.priceToBook || null,
          shortRatio: stock.shortRatio || null,
          high52w: stock.week52High || null,
          low52w: stock.week52Low || null,
          avgVolume: stock.avgVolume || null,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [stock]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-slate-500 dark:text-gray-400 transition-colors duration-300">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading statistics...</span>
        </div>
      </div>
    );
  }

  if (error && !statistics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-slate-500 dark:text-gray-400 transition-colors duration-300">
          <p className="mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-500 text-sm transition-colors duration-300"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Use statistics data if available, otherwise fallback to stock data
  const data = statistics || stock;

  const valuationMetrics = [
    { label: 'Market Cap', value: data.marketCap ? formatPrice(data.marketCap, 2, 2, { notation: 'compact' }) : '-', icon: PieChart, color: 'blue' },
    { label: 'P/E Ratio (TTM)', value: formatNumber(data.peRatio), icon: BarChart3, color: 'green' },
    { label: 'EPS (TTM)', value: data.eps ? formatPrice(data.eps) : '-', icon: TrendingUp, color: 'purple' },
    { label: 'Beta', value: formatNumber(data.beta), icon: Activity, color: 'orange' },
  ];

  const tradingMetrics = [
    { label: 'Volume', value: formatLargeNumber(stock.volume), icon: BarChart3, color: 'blue' },
    { label: '52W High', value: data.high52w ? formatPrice(data.high52w) : '-', icon: TrendingUp, color: 'green' },
    { label: '52W Low', value: data.low52w ? formatPrice(data.low52w) : '-', icon: TrendingDown, color: 'red' },
    { label: 'Dividend Yield', value: data.dividendYield ? formatPercent(data.dividendYield) : '-', icon: PieChart, color: 'purple' },
  ];

  const performanceMetrics = [
    {
      label: '1 Day Change',
      value: `${stock.change >= 0 ? '+' : ''}${formatPrice(stock.change)} (${stock.changePercent >= 0 ? '+' : ''}${formatNumber(stock.changePercent)}%)`,
      icon: stock.change >= 0 ? TrendingUp : TrendingDown,
      color: stock.change >= 0 ? 'green' : 'red'
    },
    {
      label: 'Distance from 52W High',
      value: data.high52w && stock.price ? `${(((stock.price - data.high52w) / data.high52w) * 100).toFixed(1)}%` : '-',
      icon: TrendingDown,
      color: 'orange'
    },
    {
      label: 'Distance from 52W Low',
      value: data.low52w && stock.price ? `${(((stock.price - data.low52w) / data.low52w) * 100).toFixed(1)}%` : '-',
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
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
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
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
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
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
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
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 transition-colors duration-300">
          Additional Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-slate-700 dark:text-slate-300 transition-colors duration-300">Company Information</h4>
            {[
              { label: 'Sector', value: stock.sector || '-' },
              { label: 'Industry', value: stock.industry || '-' },
              { label: 'Symbol', value: data.symbol },
              { label: 'Current Price', value: formatPrice(stock.price) },
            ].map((item, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
                <span className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">{item.label}</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-slate-700 dark:text-slate-300 transition-colors duration-300">Risk Metrics</h4>
            {[
              { label: 'Beta (5Y Monthly)', value: formatNumber(data.beta) },
              { label: 'Volatility', value: data.beta ? `${(data.beta * 15).toFixed(1)}%` : '-' },
              { label: 'Risk Level', value: data.beta ? (data.beta > 1.5 ? 'High' : data.beta > 1 ? 'Medium' : 'Low') : '-' },
              { label: 'Market Correlation', value: data.beta ? (data.beta > 1 ? 'High' : 'Moderate') : '-' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
                <span className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">{item.label}</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}