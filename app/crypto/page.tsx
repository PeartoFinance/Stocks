'use client';

import { useState, useEffect } from 'react';
import cryptoService from '@/app/utils/cryptoService';
import CryptoMetrics from '@/app/components/crypto/CryptoMetrics';
import CryptoControls from '@/app/components/crypto/CryptoControls';
import CryptoTableView from '@/app/components/crypto/CryptoTableView';
import { Building, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume: number;
  change: number;
  changePercent: number;
  rank: number;
  circulatingSupply?: number;
  maxSupply?: number;
  lastUpdated: string;
  logoUrl?: string;
}

interface GlobalMetrics {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance: number;
  activeCryptos: number;
  marketCapChange24h: number;
}

export default function CryptoPage() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [globalMetrics, setGlobalMetrics] = useState<GlobalMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'gainers' | 'losers'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'heatmap'>('table');
  const [refreshing, setRefreshing] = useState(false);

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      let data;
      
      if (selectedTab === 'gainers') {
        data = await cryptoService.getTopGainers(50) as CryptoData[];
      } else if (selectedTab === 'losers') {
        data = await cryptoService.getTopLosers(50) as CryptoData[];
      } else {
        data = await cryptoService.getMarkets({ limit: 100, sort: 'market_cap' }) as CryptoData[];
      }
      
      setCryptoData(data);
      
      // Fetch global metrics
      const metrics = await cryptoService.getGlobalMetrics() as GlobalMetrics;
      setGlobalMetrics(metrics);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
  }, [selectedTab]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCryptoData();
  };

  const filteredCrypto = cryptoData.filter(crypto =>
    crypto?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crypto?.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col gap-6">
          {/* Controls */}
          <CryptoControls
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />

          {/* Crypto Data Display */}
          <CryptoTableView
            cryptoData={filteredCrypto}
            loading={loading}
            viewMode={viewMode}
          />
        </div>
      </div>
    </div>
  );
}
