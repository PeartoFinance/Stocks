import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Loader2 } from 'lucide-react';
import { marketService } from '../../utils/marketService';

interface FinancialData {
  id: number;
  symbol: string;
  period: 'annual' | 'quarterly';
  fiscalDateEnding: string;
  revenue: number | null;
  netIncome: number | null;
  grossProfit: number | null;
  ebitda: number | null;
  totalAssets: number | null;
  totalLiabilities: number | null;
  epsActual: number | null;
  currency: string;
}

interface FinancialsTabProps {
  symbol: string;
}

export default function FinancialsTab({ symbol }: FinancialsTabProps) {
  const [financials, setFinancials] = useState<FinancialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFinancials = async () => {
      try {
        setLoading(true);
        const data = await marketService.getStockFinancials(symbol, 'annual');
        setFinancials(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load financial data');
        console.error('Financials fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancials();
  }, [symbol]);

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const calculateGrowth = (current: number | null, previous: number | null) => {
    if (!current || !previous) return 0;
    return ((current - previous) / previous) * 100;
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

  if (error || financials.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8">
        <p className="text-red-500 text-center">{error || 'No financial data available'}</p>
      </div>
    );
  }

  const currentYear = financials[0];
  const previousYear = financials[1];

  return (
    <div className="space-y-6">
      {/* Income Statement */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          Income Statement
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Revenue', current: currentYear?.revenue, previous: previousYear?.revenue },
            { label: 'Gross Profit', current: currentYear?.grossProfit, previous: previousYear?.grossProfit },
            { label: 'EBITDA', current: currentYear?.ebitda, previous: previousYear?.ebitda },
            { label: 'Net Income', current: currentYear?.netIncome, previous: previousYear?.netIncome },
          ].map((item, index) => {
            const growth = calculateGrowth(item.current, item.previous);
            const isPositive = growth >= 0;
            
            return (
              <div key={index} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{item.label}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {formatNumber(item.current || 0)}
                </p>
                {item.previous && (
                  <div className={`flex items-center gap-1 mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span className="text-xs font-medium">
                      {isPositive ? '+' : ''}{growth.toFixed(1)}% YoY
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Balance Sheet */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          Balance Sheet
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Total Assets', current: currentYear?.totalAssets, previous: previousYear?.totalAssets },
            { label: 'Total Liabilities', current: currentYear?.totalLiabilities, previous: previousYear?.totalLiabilities },
            { label: 'EPS (Actual)', current: currentYear?.epsActual, previous: previousYear?.epsActual },
          ].map((item, index) => {
            const growth = calculateGrowth(item.current, item.previous);
            const isPositive = growth >= 0;
            
            return (
              <div key={index} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{item.label}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {item.label === 'EPS (Actual)' ? `$${(item.current || 0).toFixed(2)}` : formatNumber(item.current || 0)}
                </p>
                {item.previous && (
                  <div className={`flex items-center gap-1 mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span className="text-xs font-medium">
                      {isPositive ? '+' : ''}{growth.toFixed(1)}% YoY
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Financial Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Latest Period</h4>
            <div className="space-y-2 text-sm">
              <p><span className="text-slate-500">Period:</span> {currentYear?.period}</p>
              <p><span className="text-slate-500">Fiscal Date:</span> {new Date(currentYear?.fiscalDateEnding || '').toLocaleDateString()}</p>
              <p><span className="text-slate-500">Currency:</span> {currentYear?.currency}</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Key Metrics</h4>
            <div className="space-y-2 text-sm">
              <p><span className="text-slate-500">Revenue Growth:</span> {calculateGrowth(currentYear?.revenue, previousYear?.revenue).toFixed(1)}%</p>
              <p><span className="text-slate-500">Net Income Growth:</span> {calculateGrowth(currentYear?.netIncome, previousYear?.netIncome).toFixed(1)}%</p>
              <p><span className="text-slate-500">Asset Growth:</span> {calculateGrowth(currentYear?.totalAssets, previousYear?.totalAssets).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}