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
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-slate-200 dark:border-gray-700 p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center transition-colors duration-300">
          <span className="w-2 h-5 bg-purple-600 dark:bg-purple-500 rounded-lg mr-2"></span>
          Private Companies
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-slate-200 dark:border-gray-700 transition-colors duration-300">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase transition-colors duration-300">Symbol</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase transition-colors duration-300">Name</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase transition-colors duration-300">Price</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase transition-colors duration-300">52-Wk %</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase transition-colors duration-300">Last Funding</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase transition-colors duration-300">Valuation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-pearto-border transition-colors duration-300">
            {companies.map((company) => (
              <tr key={company.symbol} className="hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-600">
                        {company.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white text-sm transition-colors duration-300">{company.symbol}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-sm text-slate-900 dark:text-white max-w-[150px] truncate transition-colors duration-300">
                  {company.name}
                </td>
                <td className="px-3 py-2 text-sm text-slate-900 dark:text-white text-right transition-colors duration-300">
                  {formatPrice(company.price)}
                </td>
                <td className={`px-3 py-2 text-sm text-right font-medium ${company.changePercent >= 0 ? 'text-green-600 dark:text-pearto-green' : 'text-red-600 dark:text-pearto-pink'
                  }`}>
                  <div className="flex items-center justify-end gap-1">
                    {company.changePercent >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>
                      {company.changePercent >= 0 ? '+' : ''}{company.changePercent.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 text-sm text-slate-900 dark:text-white text-right transition-colors duration-300">
                  {formatFunding(company.lastFunding)}
                </td>
                <td className="px-3 py-2 text-sm text-slate-900 dark:text-white text-right transition-colors duration-300">
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