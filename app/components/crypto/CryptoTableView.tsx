'use client';

import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CryptoData } from '@/app/crypto/page';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CryptoTableViewProps {
  cryptoData: CryptoData[];
  loading?: boolean;
  viewMode: 'table' | 'heatmap';
}

export default function CryptoTableView({ cryptoData, loading = false, viewMode }: CryptoTableViewProps) {
  const router = useRouter();

  const handleRowClick = (symbol: string) => {
    // router.push uses client-side routing (no full reload)
    router.push(`/crypto/${symbol}`);
  };

  const formatPrice = (price: number | undefined | null) => {
    if (!price || isNaN(price)) return '$0.00';
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
    }
  };

  const formatMarketCap = (marketCap: number | undefined | null) => {
    if (!marketCap || isNaN(marketCap)) return '$0';
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  const getChangeColor = (change: number) => {
    if (change >= 5) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (change >= 2) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 border-emerald-200';
    if (change > 0) return 'text-emerald-500 dark:text-emerald-400 bg-emerald-50 border-emerald-200';
    if (change === 0) return 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-gray-200 dark:border-gray-600';
    if (change > -2) return 'text-rose-500 dark:text-rose-400 bg-rose-50 border-rose-200';
    if (change >= -5) return 'text-rose-600 dark:text-rose-400 bg-rose-50 border-rose-200';
    return 'text-rose-700 dark:text-rose-400 bg-rose-50 border-rose-200';
  };

  const getHeatmapColor = (change: number) => {
    if (change >= 10) return 'bg-emerald-600 text-white';
    if (change >= 5) return 'bg-emerald-500 text-white';
    if (change >= 2) return 'bg-emerald-400 text-white';
    if (change >= 0) return 'bg-emerald-300 text-white';
    if (change >= -2) return 'bg-rose-300 text-white';
    if (change >= -5) return 'bg-rose-400 text-white';
    if (change >= -10) return 'bg-rose-500 text-white';
    return 'bg-rose-600 text-white';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900/95 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 transition-colors duration-300">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="ml-3 text-slate-600 dark:text-slate-400 transition-colors duration-300">Loading crypto data...</span>
        </div>
      </div>
    );
  }

 if (viewMode === 'heatmap') {
  return (
    <div className="bg-[#0a0a0b] rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
      {/* Industry Standard: We use a 12-column grid to allow for proportional 
          scaling (e.g., BTC takes more space than smaller alts).
      */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-12 auto-rows-[120px] md:auto-rows-[160px] gap-[1px] bg-gray-800">
        {cryptoData.map((crypto, index) => {
          const change = crypto?.changePercent ?? 0;
          
          // Market Standard Scaling Logic:
          // Top 1 and 2 get massive blocks, Top 3-6 get medium, rest are small.
          const gridSize = 
            index === 0 ? "col-span-2 row-span-2 sm:col-span-3 sm:row-span-2 lg:col-span-4 lg:row-span-2" : 
            index === 1 ? "col-span-2 row-span-1 sm:col-span-3 sm:row-span-2 lg:col-span-3 lg:row-span-2" :
            index < 6  ? "col-span-2 row-span-1 sm:col-span-2 sm:row-span-1 lg:col-span-2 lg:row-span-1" :
            "col-span-1 row-span-1";

          return (
            <Link
              key={crypto?.id || crypto?.symbol || index}
              href={`/crypto/${crypto?.symbol || ''}`}
              className={`
                ${gridSize}
                ${getHeatmapColor(change)}
                relative flex flex-col group transition-all duration-200 
                hover:z-10 hover:outline hover:outline-2 hover:outline-white/50
                p-3 md:p-4 overflow-hidden
              `}
            >
              {/* Top Row: Symbol & Icon */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {crypto?.logoUrl ? (
                    <img 
                      src={crypto.logoUrl} 
                      alt="" 
                      className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-white dark:bg-slate-800 p-0.5 transition-colors duration-300" 
                    />
                  ) : (
                    <div className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-[8px] font-medium uppercase transition-colors duration-300">
                      {crypto?.symbol?.substring(0, 2)}
                    </div>
                  )}
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-70">
                    {crypto?.symbol}
                  </span>
                </div>
                {/* Visual Indicator of trend */}
                <div className="opacity-40">
                  {change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                </div>
              </div>

              {/* Middle: Percentage Change (The Primary Data Point) */}
              <div className="flex-grow flex flex-col justify-center items-center">
                <div className={`font-black leading-none tracking-tighter ${index < 2 ? 'text-2xl md:text-5xl' : 'text-lg md:text-2xl'}`}>
                  {change > 0 ? '+' : ''}{change.toFixed(2)}%
                </div>
                <div className="text-[10px] md:text-xs font-mono font-medium mt-1 opacity-80">
                  {formatPrice(crypto?.price)}
                </div>
              </div>

              {/* Bottom: Name & Market Cap (Secondary Data) */}
              <div className="flex justify-between items-end mt-auto">
                <span className="text-[9px] md:text-[10px] font-medium uppercase truncate max-w-[60%] opacity-60 group-hover:opacity-100 transition-colors duration-300">
                  {crypto?.name}
                </span>
                <span className="text-[8px] md:text-[10px] font-mono opacity-50 hidden sm:block">
                  {formatMarketCap(crypto?.marketCap)}
                </span>
              </div>

              {/* Background Glow Effect */}
              <div className="absolute inset-0 bg-white dark:bg-slate-800 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <tr>
              <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-300">Cryptocurrency</th>
              <th className="px-3 sm:px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-300">Price</th>
              <th className="px-3 sm:px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-300">24h Change</th>
              <th className="px-3 sm:px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-300">Market Cap</th>
              <th className="px-3 sm:px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-300">Volume (24h)</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900/95 divide-y divide-slate-100 dark:divide-slate-800 transition-colors duration-300">
            {cryptoData.map((crypto, index) => (
              <tr 
                key={crypto.id || crypto.symbol || index} 
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200 cursor-pointer group"
                onClick={() => handleRowClick(crypto.symbol)}                 >
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {crypto.logoUrl ? (
                      <img src={crypto.logoUrl} alt={crypto.symbol} className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl shadow-sm mr-3 sm:mr-4 ring-2 ring-white dark:ring-gray-700" />
                    ) : (
                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-md ring-2 ring-white dark:ring-gray-700">
                        <span className="text-[10px] md:text-xs font-medium text-white">{(crypto.symbol || '??').substring(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                      <Link href={`/crypto/${crypto.symbol}`} className="hover:underline transition-colors duration-300">
                        <span className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[80px] sm:max-w-[120px] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">{crypto.name || 'Unknown'}</span>
                      </Link>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide transition-colors duration-300">{crypto.symbol || '??'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">{formatPrice(crypto.price)}</div>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                  <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm">
                    {crypto.changePercent === 0 ? (
                      <span className="text-gray-600 dark:text-slate-400 transition-colors duration-300">0.00%</span>
                    ) : (
                      <>
                        {(crypto.changePercent || 0) > 0 ? (
                          <ArrowUpRight className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5 mr-1 text-rose-600 dark:text-rose-400" />
                        )}
                        <span className={(crypto.changePercent || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {(crypto.changePercent || 0) >= 0 ? '+' : ''}{(crypto.changePercent || 0).toFixed(2)}%
                        </span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">{formatMarketCap(crypto.marketCap)}</div>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">
                    {crypto.volume ? `$${(crypto.volume / 1e6).toFixed(1)}M` : '$0M'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}