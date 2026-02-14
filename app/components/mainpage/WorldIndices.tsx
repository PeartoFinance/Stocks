'use client';

import React, { useState, useEffect } from 'react';
import { worldIndicesService, WorldIndex } from '../../utils/worldIndicesService';
import { cryptoService } from '../../utils/cryptoService';
import { TrendingUp, TrendingDown, Globe, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '../../context/CurrencyContext';

interface WorldIndicesProps {
  className?: string;
}

export default function WorldIndices({ className = '' }: WorldIndicesProps) {
  const { formatPrice } = useCurrency();
  const [indices, setIndices] = useState<{ americas: WorldIndex[]; europe: WorldIndex[]; asiaPacific: WorldIndex[]; crypto: any[] }>({
    americas: [],
    europe: [],
    asiaPacific: [],
    crypto: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('US');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch world indices
        const worldData = await worldIndicesService.getWorldIndices();

        // Fetch crypto data
        let cryptoData: any[] = [];
        try {
          const cryptoResponse = await cryptoService.getMarkets({ limit: 10 });
          console.log('Crypto response:', cryptoResponse); // Debug log
          cryptoData = Array.isArray(cryptoResponse) ? cryptoResponse : [];
          console.log('Crypto data array:', cryptoData); // Debug log
        } catch (cryptoError) {
          console.error('Error fetching crypto data:', cryptoError);
        }

        setIndices({
          americas: worldData.americas,
          europe: worldData.europe,
          asiaPacific: worldData.asiaPacific,
          crypto: cryptoData
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTabData = () => {
    switch (activeTab) {
      case 'US':
        return indices.americas;
      case 'EU':
        return indices.europe;
      case 'ASIA':
        return indices.asiaPacific;
      case 'CRYPTO':
        return indices.crypto;
      default:
        return [];
    }
  };

  const renderTabContent = () => {
    const data = getTabData();
    console.log(`Rendering ${activeTab} tab with data:`, data); // Debug log

    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg animate-pulse transition-colors duration-300">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-32 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 transition-colors duration-300">
          <Globe className="h-5 w-5 mr-2" />
          <span>No data available for {activeTab}</span>
        </div>
      );
    }

    const displayData = data.slice(0, 5);
    console.log(`Displaying ${displayData.length} items for ${activeTab}`); // Debug log

    return (
      <div className="space-y-3">
        {activeTab === 'CRYPTO' && (
          <div className="flex justify-end mb-2">
            <Link
              href="/crypto"
              className="text-sm text-emerald-600 dark:text-pearto-green hover:text-emerald-700 font-medium flex items-center transition-colors"
            >
              View All Crypto
              <span className="ml-1">→</span>
            </Link>
          </div>
        )}
        <div className="space-y-3">
          {activeTab === 'CRYPTO'
            ? displayData.map(renderCryptoCard)
            : displayData.map(renderIndexCard)
          }
        </div>
      </div>
    );
  };

  const renderIndexCard = (index: WorldIndex) => (
    <div key={index.symbol} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-sm transition-colors duration-300">
      <div>
        <div className="text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">{index.name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{index.symbol}</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-slate-900 dark:text-white transition-colors duration-300">{(index.price || index.value || 0).toFixed(2)}</div>
        <div className={`text-xs font-medium flex items-center justify-end ${(index.change || 0) >= 0 ? 'text-emerald-600 dark:text-pearto-green' : 'text-red-600 dark:text-pearto-pink'}`}>
          {(index.change || 0) >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
          {(index.change || 0) >= 0 ? '+' : ''}{(index.change || 0).toFixed(2)} ({(index.changePercent || 0).toFixed(2)}%)
        </div>
      </div>
    </div>
  );

  const renderCryptoCard = (crypto: any) => {
    console.log('Rendering crypto card:', crypto); // Debug log
    const cryptoSymbol = crypto.symbol?.toLowerCase() || crypto.id?.toLowerCase();

    return (
      <div key={crypto.id || crypto.symbol} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="flex-1">
          {cryptoSymbol ? (
            <Link
              href={`/crypto/${cryptoSymbol}`}
              className="text-left hover:text-emerald-600 dark:text-pearto-green transition-colors group block"
            >
              <div className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-emerald-600 dark:text-pearto-green transition-colors duration-300">
                {crypto.name || 'Unknown'}
                <span className="ml-1 text-xs text-gray-400 group-hover:text-emerald-500 transition-colors duration-300">→</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-emerald-500 transition-colors duration-300">{crypto.symbol || 'N/A'}</div>
            </Link>
          ) : (
            <div className="text-left">
              <div className="text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">
                {crypto.name || 'Unknown'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{crypto.symbol || 'N/A'}</div>
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-900 dark:text-white transition-colors duration-300">
            {crypto.current_price ? formatPrice(crypto.current_price) :
              crypto.price ? formatPrice(crypto.price) : formatPrice(0)}
          </div>
          <div className={`text-xs font-medium flex items-center justify-end ${(crypto.price_change_percentage_24h || crypto.changePercent) >= 0 ? 'text-emerald-600 dark:text-pearto-green' : 'text-red-600 dark:text-pearto-pink'
            }`}>
            {(crypto.price_change_percentage_24h || crypto.changePercent) >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {(crypto.price_change_percentage_24h || crypto.changePercent) >= 0 ? '+' : ''}
            {(crypto.price_change_percentage_24h || crypto.changePercent)?.toFixed(2) || '0.00'}%
          </div>
        </div>
      </div>
    );
  };

  const renderMovers = () => {
    // This will be replaced with actual movers data later
    return (
      <div className="flex flex-col items-center justify-center h-32 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 transition-colors duration-300">
        <Globe className="h-5 w-5 mb-2" />
        <span className="text-sm">No movers data. Import stocks from admin panel.</span>
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-gray-700 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center transition-colors duration-300">
          <span className="w-2 h-6 bg-emerald-600 dark:bg-pearto-pink rounded-full mr-3 transition-colors duration-300"></span>
          Quick Markets
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:text-pearto-green hover:bg-emerald-50 rounded-lg transition-colors"
        >
          <RefreshCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {['US', 'EU', 'ASIA', 'CRYPTO'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab
                ? 'bg-emerald-600 dark:bg-pearto-pink text-white'
                : 'text-slate-600 dark:text-gray-400 hover:text-emerald-600 dark:text-pearto-green hover:bg-emerald-50'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
