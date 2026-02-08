'use client';

import React, { useState, useEffect } from 'react';
import { worldIndicesService, ETFData } from '../../utils/worldIndicesService';
import { TrendingUp, TrendingDown, BarChart3, Building } from 'lucide-react';

interface ETFsMutualFundsProps {
  className?: string;
}

export default function ETFsMutualFunds({ className = '' }: ETFsMutualFundsProps) {
  const [data, setData] = useState<{
    etfs: { mostActive: ETFData[]; topGainers: ETFData[]; topLosers: ETFData[] };
    mutualFunds: { mostActive: ETFData[]; topGainers: ETFData[]; topLosers: ETFData[] };
  }>({
    etfs: { mostActive: [], topGainers: [], topLosers: [] },
    mutualFunds: { mostActive: [], topGainers: [], topLosers: [] }
  });
  const [activeTab, setActiveTab] = useState<'etfs' | 'mutual-funds'>('etfs');
  const [activeSubTab, setActiveSubTab] = useState<'most-active' | 'gainers' | 'losers'>('most-active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [etfData, fundData] = await Promise.all([
          worldIndicesService.getETFs(),
          worldIndicesService.getMutualFunds()
        ]);

        setData({
          etfs: etfData,
          mutualFunds: fundData
        });
      } catch (error) {
        console.error('Failed to fetch ETFs and mutual funds:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCurrentData = () => {
    const source = activeTab === 'etfs' ? data.etfs : data.mutualFunds;
    
    switch (activeSubTab) {
      case 'most-active': return source.mostActive;
      case 'gainers': return source.topGainers;
      case 'losers': return source.topLosers;
      default: return source.mostActive;
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toLocaleString();
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-pearto-card rounded-xl shadow-sm border border-gray-200 dark:border-pearto-border p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600 dark:text-pearto-cloud transition-colors duration-300">Loading ETFs and mutual funds...</span>
        </div>
      </div>
    );
  }

  const DataTable = ({ data, title }: { data: ETFData[]; title: string }) => (
    <div className="bg-white dark:bg-pearto-card rounded-xl shadow-sm border border-gray-200 dark:border-pearto-border overflow-hidden transition-colors duration-300">
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 dark:border-pearto-border transition-colors duration-300">
        <h3 className="font-semibold text-gray-900 dark:text-pearto-luna transition-colors duration-300">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-pearto-surface border-b border-gray-200 dark:border-pearto-border transition-colors duration-300">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-pearto-gray uppercase transition-colors duration-300">Symbol</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-pearto-gray uppercase transition-colors duration-300">Name</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-pearto-gray uppercase transition-colors duration-300">Price</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-pearto-gray uppercase transition-colors duration-300">Change</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-pearto-gray uppercase transition-colors duration-300">% Change</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-pearto-gray uppercase transition-colors duration-300">Volume</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-pearto-gray uppercase transition-colors duration-300">Expense Ratio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, i) => (
              <tr key={item.symbol} className="hover:bg-gray-50 dark:bg-pearto-surface transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-pearto-luna transition-colors duration-300">{item.symbol}</span>
                    <span className="text-xs text-gray-500 dark:text-pearto-gray bg-gray-100 dark:bg-pearto-surface px-2 py-1 rounded transition-colors duration-300">
                      {item.type === 'etf' ? 'ETF' : 'MF'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-pearto-luna max-w-[200px] truncate transition-colors duration-300">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-pearto-luna text-right transition-colors duration-300">
                  ${item.price.toFixed(2)}
                </td>
                <td className={`px-4 py-3 text-sm text-right font-medium ${
                  item.change >= 0 ? 'text-green-600 dark:text-pearto-green' : 'text-red-600 dark:text-pearto-pink'
                }`}>
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
                </td>
                <td className={`px-4 py-3 text-sm text-right font-medium ${
                  item.changePercent >= 0 ? 'text-green-600 dark:text-pearto-green' : 'text-red-600 dark:text-pearto-pink'
                }`}>
                  {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-pearto-luna text-right transition-colors duration-300">
                  {formatVolume(item.volume)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-pearto-luna text-right transition-colors duration-300">
                  {item.expenseRatio ? `${item.expenseRatio.toFixed(2)}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-pearto-luna transition-colors duration-300">ETFs and Mutual Funds</h2>
      </div>

      {/* Main Tab Navigation */}
      <div className="bg-white dark:bg-pearto-card rounded-xl shadow-sm border border-gray-200 dark:border-pearto-border overflow-hidden transition-colors duration-300">
        <div className="flex border-b border-gray-200 dark:border-pearto-border transition-colors duration-300">
          <button
            onClick={() => setActiveTab('etfs')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === 'etfs'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-600 dark:text-pearto-cloud hover:text-gray-900 dark:text-pearto-luna hover:bg-gray-50 dark:bg-pearto-surface'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>ETFs</span>
          </button>
          <button
            onClick={() => setActiveTab('mutual-funds')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === 'mutual-funds'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-600 dark:text-pearto-cloud hover:text-gray-900 dark:text-pearto-luna hover:bg-gray-50 dark:bg-pearto-surface'
            }`}
          >
            <Building className="h-4 w-4" />
            <span>Mutual Funds</span>
          </button>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-pearto-border bg-gray-50 dark:bg-pearto-surface transition-colors duration-300">
          {['most-active', 'gainers', 'losers'].map((subTab) => (
            <button
              key={subTab}
              onClick={() => setActiveSubTab(subTab as any)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeSubTab === subTab
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white dark:bg-pearto-card'
                  : 'text-gray-600 dark:text-pearto-cloud hover:text-gray-900 dark:text-pearto-luna hover:bg-white dark:bg-pearto-card'
              }`}
            >
              {subTab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>

        {/* Data Table */}
        <div className="p-4">
          {activeTab === 'etfs' && activeSubTab === 'most-active' && (
            <DataTable data={data.etfs.mostActive} title="Most Active ETFs" />
          )}
          {activeTab === 'etfs' && activeSubTab === 'gainers' && (
            <DataTable data={data.etfs.topGainers} title="Top Gaining ETFs" />
          )}
          {activeTab === 'etfs' && activeSubTab === 'losers' && (
            <DataTable data={data.etfs.topLosers} title="Top Losing ETFs" />
          )}
          
          {activeTab === 'mutual-funds' && activeSubTab === 'most-active' && (
            <DataTable data={data.mutualFunds.mostActive} title="Most Active Mutual Funds" />
          )}
          {activeTab === 'mutual-funds' && activeSubTab === 'gainers' && (
            <DataTable data={data.mutualFunds.topGainers} title="Top Gaining Mutual Funds" />
          )}
          {activeTab === 'mutual-funds' && activeSubTab === 'losers' && (
            <DataTable data={data.mutualFunds.topLosers} title="Top Losing Mutual Funds" />
          )}
        </div>
      </div>
    </div>
  );
}
