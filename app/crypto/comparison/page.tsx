'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Search, Activity, Plus, BarChart3, User, LineChart, Brain } from 'lucide-react';
import toast from 'react-hot-toast';
import { cryptoService } from '../../utils/cryptoService';
import PriceDisplay from '../../components/common/PriceDisplay';
import OverviewTab from './components/OverviewTab';
import StatisticsTab from './components/StatisticsTab';
import ChartTab from './components/ChartTab';
import ProfileTab from './components/ProfileTab';
import { ComparisonCrypto } from './components/types';
import AIAnalysisPanel from '../../components/ai/AIAnalysisPanel';

const CRYPTO_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export default function CryptoComparison() {
  const [comparedCryptos, setComparedCryptos] = useState<ComparisonCrypto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'chart', label: 'Chart', icon: LineChart },
    { key: 'statistics', label: 'Statistics', icon: Activity },
    { key: 'profile', label: 'Profile', icon: User }
  ];

  const formatLargeNumber = (num: number | undefined | null): string => {
    if (num == null) return '-';
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toLocaleString()}`;
  };

  const searchParams = useSearchParams();
  useEffect(() => {
    const loadCryptosFromQuery = async () => {
      const cryptoParam = searchParams.get('crypto');
      if (cryptoParam) {
        const cryptoSymbols = cryptoParam.split('.').filter(symbol => symbol.trim());
        if (cryptoSymbols.length > 0 && cryptoSymbols.length <= 5) {
          try {
            setLoading(true);
            const cryptoPromises = cryptoSymbols.map(async (symbol) => {
              const details: any = await cryptoService.getCoinDetails(symbol.trim().toUpperCase());
              if (details) {
                return {
                  symbol: details.symbol || symbol.trim().toUpperCase(),
                  name: details.name || symbol.trim().toUpperCase(),
                  price: details.price || 0,
                  change: details.change || 0,
                  changePercent: details.changePercent || 0,
                  volume: details.volume || 0,
                  marketCap: details.marketCap || 0,
                  rank: details.rank,
                  circulatingSupply: details.circulatingSupply,
                  totalSupply: details.totalSupply,
                  maxSupply: details.maxSupply,
                  high24h: details.high24h,
                  low24h: details.low24h,
                  ath: details.ath,
                  atl: details.atl,
                  color: CRYPTO_COLORS[0],
                };
              }
              return null;
            });

            const validCryptos = (await Promise.all(cryptoPromises)).filter(crypto => crypto !== null);
            if (validCryptos.length > 0) {
              const cryptosWithColors = validCryptos.map((crypto, index) => ({ ...crypto, color: CRYPTO_COLORS[index] }));
              setComparedCryptos(cryptosWithColors);
              toast.success(`Loaded ${cryptosWithColors.length} cryptocurrencies`);
            }
          } catch (error) {
            toast.error('Failed to load cryptocurrencies');
          } finally {
            setLoading(false);
          }
        }
      }
    };
    loadCryptosFromQuery();
  }, [searchParams]);

  useEffect(() => {
    const searchCryptos = async () => {
      if (searchTerm.length >= 2) {
        try {
          setLoading(true);
          const response = await cryptoService.getMarkets({ limit: 50 });
          if (response && Array.isArray(response)) {
            const filtered = response.filter((crypto: any) =>
              crypto.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              crypto.name?.toLowerCase().includes(searchTerm.toLowerCase())
            ).slice(0, 10);
            setSearchResults(filtered);
          }
        } catch (error) {
          toast.error('Failed to search cryptocurrencies');
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    };
    const debounceTimer = setTimeout(searchCryptos, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const addToComparison = async (crypto: any) => {
    if (comparedCryptos.length >= 5) {
      toast.error('Maximum 5 cryptocurrencies');
      return;
    }
    if (comparedCryptos.find(c => c.symbol === crypto.symbol)) {
      toast.error('Cryptocurrency already added');
      return;
    }
    try {
      setLoading(true);
      const details: any = await cryptoService.getCoinDetails(crypto.symbol);
      if (details) {
        const fullCrypto: ComparisonCrypto = {
          symbol: details.symbol || crypto.symbol,
          name: details.name || crypto.name,
          price: details.price || crypto.price || 0,
          change: details.change || crypto.change || 0,
          changePercent: details.changePercent || crypto.changePercent || 0,
          volume: details.volume || crypto.volume || 0,
          marketCap: details.marketCap || crypto.marketCap || 0,
          rank: details.rank || crypto.rank,
          circulatingSupply: details.circulatingSupply,
          totalSupply: details.totalSupply,
          maxSupply: details.maxSupply,
          high24h: details.high24h,
          low24h: details.low24h,
          ath: details.ath,
          atl: details.atl,
          color: CRYPTO_COLORS[comparedCryptos.length],
        };
        setComparedCryptos([...comparedCryptos, fullCrypto]);
        setSearchTerm('');
        setSearchResults([]);
        toast.success(`${crypto.symbol} added`);
      }
    } catch (error) {
      toast.error('Failed to add cryptocurrency');
    } finally {
      setLoading(false);
    }
  };

  const removeFromComparison = (symbol: string) => {
    const newCryptos = comparedCryptos.filter(c => c.symbol !== symbol);
    const updatedCryptos = newCryptos.map((crypto, index) => ({ ...crypto, color: CRYPTO_COLORS[index] }));
    setComparedCryptos(updatedCryptos);
    toast.success(`${symbol} removed`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/95">
      <main className="p-4 lg:p-6">
        <div className="max-w-[1600px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-3 sm:mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">Crypto Comparison</h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">Compare up to 5 cryptocurrencies side by side</p>
              </div>
              <button
                onClick={() => setIsAIPanelOpen(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 dark:bg-emerald-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-emerald-700 transition-colors"
              >
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">AI Analysis</span>
              </button>
            </div>
          </motion.div>

          {/* Search Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-slate-200 dark:border-gray-700 mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h2 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">Add Cryptocurrencies</h2>
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{comparedCryptos.length}/5</span>
            </div>
            <div className="relative mb-2 sm:mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search cryptocurrencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500"
              />
              {loading && <Activity className="absolute right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-emerald-500 animate-spin" />}
            </div>

            {searchResults.length > 0 && (
              <div className="border border-slate-200 dark:border-gray-700 rounded-lg max-h-48 sm:max-h-64 overflow-y-auto">
                {searchResults.map((crypto) => (
                  <div key={crypto.symbol} className="flex items-center justify-between p-2 sm:p-3 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">{crypto.symbol}</h4>
                      <p className="text-[10px] sm:text-xs text-slate-600 dark:text-gray-400 truncate">{crypto.name}</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">${crypto.price?.toFixed(2) || '0.00'}</p>
                        <p className={`text-[10px] sm:text-xs font-medium ${(crypto.changePercent || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {(crypto.changePercent || 0) >= 0 ? '+' : ''}{(crypto.changePercent || 0).toFixed(2)}%
                        </p>
                      </div>
                      <button onClick={() => addToComparison(crypto)} disabled={loading} className="px-2 sm:px-3 py-1 bg-blue-600 dark:bg-emerald-600 text-white text-xs rounded-md hover:bg-blue-700 dark:hover:bg-emerald-700 disabled:opacity-50">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchTerm === '' && comparedCryptos.length < 5 && (
              <div>
                <h4 className="text-[10px] sm:text-xs font-medium text-slate-700 dark:text-gray-400 mb-2">Popular Cryptocurrencies</h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA'].map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => setSearchTerm(symbol)}
                      disabled={comparedCryptos.some(c => c.symbol === symbol)}
                      className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium bg-slate-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-[#262626] disabled:opacity-50 text-slate-700 dark:text-white rounded-md"
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Tabs */}
          {comparedCryptos.length > 0 && (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-1 border border-slate-200 dark:border-gray-700 mb-4 sm:mb-6">
                <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex-shrink-0 ${
                          isActive
                            ? 'bg-blue-600 dark:bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-700 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-[#1a1a1a]'
                        }`}
                      >
                        <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                {activeTab === 'overview' && <OverviewTab comparedCryptos={comparedCryptos} formatLargeNumber={formatLargeNumber} />}
                {activeTab === 'chart' && <ChartTab comparedCryptos={comparedCryptos} formatLargeNumber={formatLargeNumber} removeFromComparison={removeFromComparison} />}
                {activeTab === 'statistics' && <StatisticsTab comparedCryptos={comparedCryptos} formatLargeNumber={formatLargeNumber} />}
                {activeTab === 'profile' && <ProfileTab comparedCryptos={comparedCryptos} formatLargeNumber={formatLargeNumber} />}
              </motion.div>
            </>
          )}
        </div>
      </main>

      {/* AI Analysis Panel */}
      {isAIPanelOpen && (
        <>
          <div className={`fixed bottom-0 md:top-0 md:right-0 left-0 md:left-auto h-[85vh] md:h-full w-full md:w-96 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 rounded-t-2xl md:rounded-none ${
            isAIPanelOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'
          }`}>
            <div className="h-full flex flex-col">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900/95">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600 dark:text-emerald-500" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">AI Analysis</h3>
                  </div>
                  <button
                    onClick={() => setIsAIPanelOpen(false)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <AIAnalysisPanel
                  title=""
                  pageType="crypto-comparison"
                  pageData={{
                    cryptos: comparedCryptos.map(c => ({ symbol: c.symbol, name: c.name, price: c.price })),
                    count: comparedCryptos.length
                  }}
                  quickPrompts={[
                    "Compare all cryptos",
                    "Best performer",
                    "Risk analysis",
                    "Investment recommendation",
                    "Market trends"
                  ]}
                  compact={false}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-40" onClick={() => setIsAIPanelOpen(false)} />
        </>
      )}
    </div>
  );
}
