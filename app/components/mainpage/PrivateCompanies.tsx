'use client';

import React, { useState, useEffect } from 'react';
import { worldIndicesService, PrivateCompany } from '../../utils/worldIndicesService';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

interface PrivateCompaniesProps {
  className?: string;
}

export default function PrivateCompanies({ className = '' }: PrivateCompaniesProps) {
  const { formatPrice } = useCurrency();
  const [companies, setCompanies] = useState<PrivateCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const data = await worldIndicesService.getPrivateCompanies();
        setCompanies(data);
      } catch (error) {
        console.error('Failed to fetch private companies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const formatValuation = (value: number | undefined) => {
    if (!value) return '—';
    return formatPrice(value, 2, 2, { notation: 'compact' });
  };

  const formatFunding = (value: number | undefined) => {
    if (!value) return '—';
    return formatPrice(value, 2, 2, { notation: 'compact' });
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-slate-600 dark:text-gray-400 transition-colors duration-300">Loading private companies...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-slate-200 dark:border-gray-700 p-6 transition-colors duration-300 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center transition-colors duration-300">
          <span className="w-1.5 h-6 bg-gradient-to-b from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 rounded-full mr-3"></span>
          Private Companies
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 transition-colors duration-300">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300 first:rounded-tl-lg last:rounded-tr-lg">Symbol</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Name</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Price</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">52-Wk %</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Last Funding</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300 first:rounded-tl-lg last:rounded-tr-lg">Valuation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
            {companies.map((company) => (
              <tr key={company.symbol} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-500/20 dark:to-purple-600/20 rounded-full flex items-center justify-center transition-colors duration-300">
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 transition-colors duration-300">
                        {company.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white text-sm transition-colors duration-300">{company.symbol}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-gray-300 max-w-[150px] truncate transition-colors duration-300">
                  {company.name}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white text-right transition-colors duration-300">
                  {formatPrice(company.price)}
                </td>
                <td className={`px-4 py-3 text-sm text-right font-semibold transition-colors duration-300 ${company.changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                  <div className="flex items-center justify-end gap-1">
                    {company.changePercent >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {company.changePercent >= 0 ? '+' : ''}{company.changePercent.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-gray-300 text-right transition-colors duration-300">
                  {formatFunding(company.lastFunding)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-gray-300 text-right transition-colors duration-300">
                  {formatValuation(company.valuation)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}