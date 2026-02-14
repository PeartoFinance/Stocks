import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, Percent, TrendingUp, Loader2 } from 'lucide-react';
import { marketService } from '../../utils/marketService';
import { useCurrency } from '../../context/CurrencyContext';

interface DividendRecord {
  id: number;
  symbol: string;
  companyName: string;
  dividendType: 'cash' | 'bonus' | 'both';
  cashPercent: number;
  bonusPercent: number;
  totalPercent: number;
  dividendAmount: number | null;
  exDividendDate: string | null;
  recordDate: string | null;
  paymentDate: string | null;
  fiscalYear: string;
  status: 'proposed' | 'approved' | 'paid';
}

interface DividendsTabProps {
  symbol: string;
}

export default function DividendsTab({ symbol }: DividendsTabProps) {
  const { formatPrice } = useCurrency();
  const [dividends, setDividends] = useState<DividendRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDividendData = async () => {
      try {
        setLoading(true);
        // Cast the response to the expected type to satisfy the compiler
        const data = await marketService.getStockDividends(symbol) as DividendRecord[];

        // Safety check: Ensure data is an array before setting state
        setDividends(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load dividend data:', error);
        setDividends([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDividendData();
  }, [symbol]);

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-300';
      case 'approved': return 'text-blue-700 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300';
      case 'proposed': return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300';
      default: return 'text-slate-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8 transition-colors duration-300">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!dividends || dividends.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8 transition-colors duration-300">
        <div className="text-center">
          <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 transition-colors duration-300">
            No Dividend Information
          </h3>
          <p className="text-slate-500 dark:text-slate-400 transition-colors duration-300">
            This stock does not currently have dividend records or dividend data is not available.
          </p>
        </div>
      </div>
    );
  }

  // Calculate stats from dividend data safely
  const totalDividendAmount = dividends.reduce((sum, div) => sum + (div.dividendAmount || 0), 0);
  const avgCashPercent = dividends.length > 0
    ? dividends.reduce((sum, div) => sum + (div.cashPercent || 0), 0) / dividends.length
    : 0;
  const avgBonusPercent = dividends.length > 0
    ? dividends.reduce((sum, div) => sum + (div.bonusPercent || 0), 0) / dividends.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Dividend Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
          <DollarSign className="h-5 w-5 text-green-500" />
          Dividend Overview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 transition-colors duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700 dark:text-green-300 transition-colors duration-300">Total Amount</span>
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400 transition-colors duration-300" />
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100 transition-colors duration-300">
              {formatPrice(totalDividendAmount)}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 transition-colors duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300 transition-colors duration-300">Avg Cash %</span>
              <Percent className="h-4 w-4 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 transition-colors duration-300">
              {avgCashPercent.toFixed(1)}%
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 transition-colors duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300 transition-colors duration-300">Avg Bonus %</span>
              <Percent className="h-4 w-4 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 transition-colors duration-300">
              {avgBonusPercent.toFixed(1)}%
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 transition-colors duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300 transition-colors duration-300">Records</span>
              <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400 transition-colors duration-300" />
            </div>
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100 transition-colors duration-300">
              {dividends.length}
            </p>
          </div>
        </div>
      </div>

      {/* Dividend History */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
          <Calendar className="h-5 w-5 text-blue-500" />
          Dividend History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors duration-300">Fiscal Year</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors duration-300">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors duration-300">Cash %</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors duration-300">Bonus %</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors duration-300">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors duration-300">Ex-Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors duration-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {dividends.map((dividend, index) => (
                <tr key={`${dividend.id}-${index}`} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-300">
                  <td className="py-3 px-4 text-sm text-slate-900 dark:text-white transition-colors duration-300">
                    {dividend.fiscalYear}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${dividend.dividendType === 'cash'
                        ? 'bg-green-100 dark:bg-pearto-green/10 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                        : dividend.dividendType === 'bonus'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                      }`}>
                      {dividend.dividendType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">
                    {dividend.cashPercent}%
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">
                    {dividend.bonusPercent}%
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">
                    {dividend.dividendAmount ? formatPrice(dividend.dividendAmount) : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                    {formatDate(dividend.exDividendDate)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dividend.status)}`}>
                      {dividend.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dividend Analysis */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 transition-colors duration-300">
          Dividend Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3 transition-colors duration-300">Distribution Summary</h4>
            <div className="space-y-3">
              {[
                {
                  label: 'Cash Dividends',
                  value: `${avgCashPercent.toFixed(1)}%`,
                  description: 'Average cash dividend percentage'
                },
                {
                  label: 'Bonus Shares',
                  value: `${avgBonusPercent.toFixed(1)}%`,
                  description: 'Average bonus share percentage'
                },
                {
                  label: 'Total Records',
                  value: dividends.length.toString(),
                  description: 'Number of dividend records'
                },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2">
                  <div>
                    <span className="text-sm text-slate-900 dark:text-white font-medium transition-colors duration-300">{item.label}</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">{item.description}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white transition-colors duration-300">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3 transition-colors duration-300">Recent Activity</h4>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
              <p>
                • Latest dividend record from fiscal year {dividends[0]?.fiscalYear || 'N/A'}
              </p>
              <p>
                • {dividends.filter(d => d.status === 'paid').length} dividends have been paid
              </p>
              <p>
                • {dividends.filter(d => d.dividendType === 'cash').length} cash dividends and {dividends.filter(d => d.dividendType === 'bonus').length} bonus distributions
              </p>
              <p>
                • Total dividend amount distributed: {formatPrice(totalDividendAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}