'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, TrendingDown, BarChart3, Sliders, GitCompare, LayoutGrid, Table, Filter } from 'lucide-react';
import { stockAPI } from '../utils/api';
import { Stock } from '../types';
import { formatChange, formatNumber, formatVolume } from '@/lib/utils';
import { useCurrency } from '../context/CurrencyContext';
import toast from 'react-hot-toast';
import Link from 'next/link';
import ScreenerPresets, { PresetStrategy } from '../components/screener/ScreenerPresets';
import MultiCriteriaFilters from '../components/screener/MultiCriteriaFilters';
import TechnicalFilters from '../components/screener/TechnicalFilters';
import CompareView from '../components/screener/CompareView';
import { FilterValues, TechnicalFilterValues } from '../components/screener/types';

export default function ScreenerPage() {
  const { formatPrice } = useCurrency();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'presets' | 'fundamental' | 'technical'>('presets');
  const [activePreset, setActivePreset] = useState<string>();
  const [compareStocks, setCompareStocks] = useState<Stock[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const [fundamentalFilters, setFundamentalFilters] = useState<FilterValues>({
    sectors: [],
    industries: [],
  });

  const [technicalFilters, setTechnicalFilters] = useState<TechnicalFilterValues>({
    volumeSpike: false,
  });

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        const [allStocksRes, gainersRes, losersRes] = await Promise.all([
          stockAPI.getAllStocks(),
          stockAPI.getGainers(),
          stockAPI.getLosers(),
        ]);

        const allStocksMap = new Map<string, Stock>();
        
        [...allStocksRes.data, ...gainersRes.data, ...losersRes.data].forEach(stock => {
          if (!allStocksMap.has(stock.symbol)) {
            allStocksMap.set(stock.symbol, stock);
          }
        });

        const combinedStocks = Array.from(allStocksMap.values());
        setStocks(combinedStocks);
        setFilteredStocks(combinedStocks);
        
        if (combinedStocks.length === 0) {
          toast.error('No stock data available');
        }
      } catch (error) {
        console.error('Error fetching stocks:', error);
        toast.error('Failed to load stocks data');
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  useEffect(() => {
    let filtered = stocks.filter(stock => {
      const matchesSearch = stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPrice = !fundamentalFilters.minPrice || stock.price >= fundamentalFilters.minPrice;
      const matchesMaxPrice = !fundamentalFilters.maxPrice || stock.price <= fundamentalFilters.maxPrice;
      const matchesMarketCap = !fundamentalFilters.minMarketCap || (stock.marketCap || 0) >= fundamentalFilters.minMarketCap;
      const matchesMaxMarketCap = !fundamentalFilters.maxMarketCap || (stock.marketCap || 0) <= fundamentalFilters.maxMarketCap;
      const matchesPE = !fundamentalFilters.minPE || (stock.peRatio && stock.peRatio >= fundamentalFilters.minPE);
      const matchesMaxPE = !fundamentalFilters.maxPE || !stock.peRatio || stock.peRatio <= fundamentalFilters.maxPE;
      const matchesSector = fundamentalFilters.sectors.length === 0 || (stock.sector && fundamentalFilters.sectors.includes(stock.sector));

      return matchesSearch && matchesPrice && matchesMaxPrice && matchesMarketCap && matchesMaxMarketCap && matchesPE && matchesMaxPE && matchesSector;
    });

    setFilteredStocks(filtered);
  }, [stocks, searchTerm, fundamentalFilters, technicalFilters]);

  const handlePresetSelect = (preset: PresetStrategy) => {
    setActivePreset(preset.id);
    setFundamentalFilters({
      ...fundamentalFilters,
      minPE: preset.filters.minPE,
      maxPE: preset.filters.maxPE,
      minDividendYield: preset.filters.minDividendYield,
      minMarketCap: preset.filters.minMarketCap,
    });
    setActiveTab('fundamental');
    toast.success(`Applied ${preset.name} strategy`);
  };

  const resetFilters = () => {
    setFundamentalFilters({ sectors: [], industries: [] });
    setTechnicalFilters({ volumeSpike: false });
    setSearchTerm('');
    setActivePreset(undefined);
    toast.success('Filters reset');
  };

  const toggleCompare = (stock: Stock) => {
    if (compareStocks.find(s => s.symbol === stock.symbol)) {
      setCompareStocks(compareStocks.filter(s => s.symbol !== stock.symbol));
    } else if (compareStocks.length < 5) {
      setCompareStocks([...compareStocks, stock]);
    } else {
      toast.error('Maximum 5 stocks for comparison');
    }
  };

  const sectors = Array.from(new Set(stocks.map(stock => stock.sector).filter(Boolean))) as string[];
  const industries = Array.from(new Set(stocks.map(stock => stock.industry).filter(Boolean))) as string[];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-32 px-4">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-emerald-600 dark:text-emerald-400 animate-pulse mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Loading Stock Screener</h2>
            <p className="text-slate-600 dark:text-gray-400">Fetching market data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-32 px-4 lg:px-6 pb-8">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">Stock Screener</h1>
          <p className="text-gray-600 dark:text-gray-400">Find the best investment opportunities with advanced filtering</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-slate-700 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" placeholder="Search by symbol or company..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setViewMode('table')} className={`px-4 py-3 rounded-lg transition-all ${viewMode === 'table' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600'}`}>
                <Table className="h-5 w-5" />
              </button>
              <button onClick={() => setViewMode('grid')} className={`px-4 py-3 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600'}`}>
                <LayoutGrid className="h-5 w-5" />
              </button>
            </div>
            <button onClick={resetFilters} className="px-6 py-3 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-600 transition-all font-semibold">Reset</button>
            {compareStocks.length > 0 && (
              <button onClick={() => setShowCompare(true)} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all font-semibold flex items-center gap-2">
                <GitCompare className="h-5 w-5" />
                Compare ({compareStocks.length})
              </button>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button onClick={() => setActiveTab('presets')} className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'presets' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
              <Filter className="h-4 w-4" />
              Presets
            </button>
            <button onClick={() => setActiveTab('fundamental')} className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'fundamental' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
              <BarChart3 className="h-4 w-4" />
              Fundamental
            </button>
            <button onClick={() => setActiveTab('technical')} className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'technical' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
              <Sliders className="h-4 w-4" />
              Technical
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'presets' && (
            <motion.div key="presets" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-6">
              <ScreenerPresets onSelectPreset={handlePresetSelect} activePreset={activePreset} />
            </motion.div>
          )}
          {activeTab === 'fundamental' && (
            <motion.div key="fundamental" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-6">
              <MultiCriteriaFilters filters={fundamentalFilters} onChange={setFundamentalFilters} availableSectors={sectors} availableIndustries={industries} />
            </motion.div>
          )}
          {activeTab === 'technical' && (
            <motion.div key="technical" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-6">
              <TechnicalFilters filters={technicalFilters} onChange={setTechnicalFilters} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-slate-600 dark:text-gray-400">
            Showing <span className="font-bold text-emerald-600 dark:text-emerald-400">{filteredStocks.length}</span> of <span className="font-semibold">{stocks.length}</span> stocks
          </p>
        </div>

        {viewMode === 'table' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider">Symbol</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider">Change</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider">Volume</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider">Market Cap</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider">Compare</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredStocks.map((stock) => (
                    <tr key={stock.symbol} className="hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-4">
                        <Link href={`/stock/${stock.symbol}`} className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">{stock.symbol}</Link>
                      </td>
                      <td className="px-4 py-4 text-slate-900 dark:text-white">{stock.name}</td>
                      <td className="px-4 py-4 text-right font-semibold text-slate-900 dark:text-white">{formatPrice(stock.price)}</td>
                      <td className="px-4 py-4 text-right">
                        <span className={`flex items-center justify-end gap-1 ${stock.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {stock.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {formatChange(stock.change, stock.changePercent).value}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-slate-600 dark:text-gray-400">{formatVolume(stock.volume)}</td>
                      <td className="px-4 py-4 text-right text-slate-600 dark:text-gray-400">{stock.marketCap ? formatNumber(stock.marketCap) : 'N/A'}</td>
                      <td className="px-4 py-4 text-center">
                        <button onClick={() => toggleCompare(stock)} className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${compareStocks.find(s => s.symbol === stock.symbol) ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600'}`}>
                          {compareStocks.find(s => s.symbol === stock.symbol) ? 'Added' : 'Add'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStocks.map((stock) => (
              <motion.div key={stock.symbol} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Link href={`/stock/${stock.symbol}`} className="text-lg font-bold text-emerald-600 dark:text-emerald-400 hover:underline">{stock.symbol}</Link>
                    <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-1">{stock.name}</p>
                  </div>
                  <button onClick={() => toggleCompare(stock)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${compareStocks.find(s => s.symbol === stock.symbol) ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300'}`}>
                    {compareStocks.find(s => s.symbol === stock.symbol) ? '✓' : '+'}
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{formatPrice(stock.price)}</span>
                    <span className={`flex items-center gap-1 font-semibold ${stock.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {stock.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {formatChange(stock.change, stock.changePercent).value}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-gray-400">Volume</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatVolume(stock.volume)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-gray-400">Market Cap</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{stock.marketCap ? formatNumber(stock.marketCap) : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <AnimatePresence>
          {showCompare && compareStocks.length > 0 && (
            <CompareView stocks={compareStocks} onRemove={(symbol) => setCompareStocks(compareStocks.filter(s => s.symbol !== symbol))} onClose={() => setShowCompare(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
