'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Download, Eye, TrendingUp, TrendingDown,
  ArrowUpDown, Star, MoreVertical, RefreshCw, X, ChevronRight
} from 'lucide-react';
import { stockAPI } from '../utils/api';
import Link from 'next/link';
import AIAnalysisPanel from '../components/ai/AIAnalysisPanel';

interface StockData {
  symbol: string;
  company: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  pe: number;
  dividend: number;
  sector: string;
  exchange: string;
}

export default function StockScreener() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<StockData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'marketCap', direction: 'desc' });
  const [filters, setFilters] = useState({
    sector: 'all',
    exchange: 'all',
    minPrice: '',
    maxPrice: '',
    minVolume: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setIsLoading(true);
        const response = await stockAPI.getAllStocks();
        if (response.success && response.data) {
          const stockData: StockData[] = response.data.map((stock: any) => ({
            symbol: stock.symbol || '',
            company: stock.name || '',
            price: stock.price || 0,
            change: stock.change || 0,
            changePercent: stock.changePercent || 0,
            volume: stock.volume || 0,
            marketCap: formatMarketCap(stock.marketCap),
            pe: stock.peRatio || 0,
            dividend: stock.dividendYield || 0,
            sector: stock.sector || 'Unknown',
            exchange: stock.exchange || 'NYSE'
          }));
          setStocks(stockData);
          setFilteredStocks(stockData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStocks();
  }, []);

  function formatMarketCap(value: number | undefined): string {
    if (!value) return '—';
    if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    return value.toLocaleString();
  }

  useEffect(() => {
    let filtered = stocks.filter(stock => {
      const matchesSearch = stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = filters.sector === 'all' || stock.sector === filters.sector;
      const matchesExchange = filters.exchange === 'all' || stock.exchange === filters.exchange;
      const matchesMinPrice = !filters.minPrice || stock.price >= parseFloat(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || stock.price <= parseFloat(filters.maxPrice);
      return matchesSearch && matchesSector && matchesExchange && matchesMinPrice && matchesMaxPrice;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key as keyof StockData];
        let bValue = b[sortConfig.key as keyof StockData];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    setFilteredStocks(filtered);
  }, [stocks, searchTerm, filters, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-6">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Stock Screener</h1>
            <p className="text-slate-500 text-sm md:text-base">Real-time market analysis and filtering</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="md:hidden flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm"
            >
              <Filter className="h-4 w-4" /> Filters
            </button>
            <button className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all">
              <Download className="h-4 w-4" /> Export
            </button>
            <button onClick={() => window.location.reload()} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-indigo-700 transition-all">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <main className="flex-1 min-w-0">
            
            <div className={`
              ${isFilterOpen ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden'} 
              md:relative md:block md:bg-white md:p-6 md:rounded-2xl md:shadow-sm md:border md:border-slate-200 md:mb-8
            `}>
              <div className="flex items-center justify-between mb-6 md:hidden">
                <h2 className="text-xl font-bold">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)}><X className="h-6 w-6" /></button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Search Asset</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Ticker or Company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Sector</label>
                  <select 
                    value={filters.sector}
                    onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="all">All Sectors</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Price Range</label>
                  <div className="flex gap-2">
                    <input 
                      placeholder="Min" 
                      type="number" 
                      value={filters.minPrice}
                      onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                      className="w-1/2 px-3 py-2.5 bg-slate-50 border-none rounded-xl text-sm" 
                    />
                    <input 
                      placeholder="Max" 
                      type="number" 
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                      className="w-1/2 px-3 py-2.5 bg-slate-50 border-none rounded-xl text-sm" 
                    />
                  </div>
                </div>
              </div>
              {isFilterOpen && (
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full mt-8 py-3 bg-indigo-600 text-white rounded-xl font-bold md:hidden"
                >
                  Apply Filters
                </button>
              )}
            </div>

            <div className="md:bg-white md:rounded-2xl md:shadow-sm md:border md:border-slate-200 overflow-hidden">
              <div className="hidden md:flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-600">{filteredStocks.length} Assets Found</span>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Market Open</span>
                </div>
              </div>

              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-400 text-sm font-medium">Analyzing markets...</p>
                </div>
              ) : (
                <>
                  <div className="md:hidden space-y-4">
                    {filteredStocks.map((stock) => (
                      <Link key={stock.symbol} href={`/stock/${stock.symbol.toLowerCase()}`}>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm active:scale-[0.98] transition-transform mb-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-lg text-slate-900">{stock.symbol}</h4>
                              <p className="text-xs text-slate-500 truncate max-w-[150px]">{stock.company}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-slate-900">${stock.price.toFixed(2)}</div>
                              <div className={`text-xs font-bold ${stock.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{stock.sector}</span>
                            <ChevronRight className="h-4 w-4 text-slate-300" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50/50">
                        <tr>
                          <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Ticker</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase cursor-pointer hover:text-indigo-600" onClick={() => handleSort('price')}>Price</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase cursor-pointer hover:text-indigo-600" onClick={() => handleSort('changePercent')}>24h Change</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Market Cap</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Sector</th>
                          <th className="px-6 py-4 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStocks.map((stock) => (
                          <tr key={stock.symbol} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-bold text-slate-900">{stock.symbol}</div>
                              <div className="text-xs text-slate-400">{stock.company}</div>
                            </td>
                            <td className="px-6 py-4 font-semibold">${stock.price.toFixed(2)}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${stock.change >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 font-medium">{stock.marketCap}</td>
                            <td className="px-6 py-4">
                              <span className="text-[10px] font-extrabold px-2 py-1 bg-slate-100 text-slate-500 rounded uppercase tracking-tighter">{stock.sector}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1 text-slate-400 hover:text-indigo-600"><Eye className="h-4 w-4" /></button>
                                <button className="p-1 text-slate-400 hover:text-yellow-500"><Star className="h-4 w-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </main>

          <aside className="w-full lg:w-[320px] xl:w-[380px] shrink-0">
            <div className="lg:sticky lg:top-6">
              <AIAnalysisPanel
                title="Screener Intelligence"
                pageType="stock-screener"
                pageData={{
                  count: filteredStocks.length,
                  topStocks: filteredStocks.slice(0, 3).map(s => ({ symbol: s.symbol, change: s.changePercent }))
                }}
                autoAnalyze={!isLoading && filteredStocks.length > 0}
                quickPrompts={['Identify breakouts', 'Low PE gems', 'Volume spikes']}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}