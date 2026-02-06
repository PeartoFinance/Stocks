'use client';

import React, { useState, useEffect } from 'react';
import { worldIndicesService, PrivateCompany } from '../../utils/worldIndicesService';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PrivateCompaniesProps {
  className?: string;
}

export default function PrivateCompanies({ className = '' }: PrivateCompaniesProps) {
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
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatFunding = (value: number | undefined) => {
    if (!value) return '—';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading private companies...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <span className="w-2 h-5 bg-purple-600 rounded-full mr-2"></span>
          Private Companies
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">52-Wk %</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Last Funding</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Valuation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {companies.map((company) => (
              <tr key={company.symbol} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-600">
                        {company.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 text-sm">{company.symbol}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-sm text-gray-900 max-w-[150px] truncate">
                  {company.name}
                </td>
                <td className="px-3 py-2 text-sm text-gray-900 text-right">
                  ${company.price.toLocaleString()}
                </td>
                <td className={`px-3 py-2 text-sm text-right font-medium ${
                  company.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
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
                <td className="px-3 py-2 text-sm text-gray-900 text-right">
                  {formatFunding(company.lastFunding)}
                </td>
                <td className="px-3 py-2 text-sm text-gray-900 text-right">
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