'use client';

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity, 
  DollarSign, 
  Volume2,
  Hash,
  Target,
  PieChart,
  Globe,
  Zap,
  Star,
  Clock
} from 'lucide-react';

interface CryptoDetails {
  id: number;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume: number;
  change: number;
  changePercent: number;
  dayHigh?: number;
  dayLow?: number;
  high52w?: number;
  low52w?: number;
  avgVolume?: number;
  open?: number;
  previousClose?: number;
  lastUpdated: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  currency: string;
  assetType: string;
  countryCode: string;
  isFeatured: boolean;
  isListed: boolean;
  circulatingSupply?: number;
  maxSupply?: number;
}

interface StatisticsTabProps {
  crypto: CryptoDetails;
}

export default function StatisticsTab({ crypto }: StatisticsTabProps) {
  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
    }
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    return `$${volume.toLocaleString()}`;
  };

  const formatNumber = (num: number | undefined | null, decimals = 2): string => {
    if (num == null) return '-';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const formatSupply = (supply: number | undefined | null): string => {
    if (supply == null) return '-';
    if (supply >= 1e12) return `${(supply / 1e12).toFixed(2)}T`;
    if (supply >= 1e9) return `${(supply / 1e9).toFixed(2)}B`;
    if (supply >= 1e6) return `${(supply / 1e6).toFixed(2)}M`;
    return supply.toLocaleString();
  };

  const calculateMarketCapToVolumeRatio = () => {
    if (crypto.marketCap && crypto.volume && crypto.volume > 0) {
      return (crypto.marketCap / crypto.volume).toFixed(2);
    }
    return '-';
  };

  const calculateSupplyPercentage = () => {
    if (crypto.circulatingSupply && crypto.maxSupply && crypto.maxSupply > 0) {
      return ((crypto.circulatingSupply / crypto.maxSupply) * 100).toFixed(2);
    }
    return '-';
  };

  const calculateFullyDilutedMarketCap = () => {
    if (crypto.maxSupply && crypto.price) {
      return formatMarketCap(crypto.maxSupply * crypto.price);
    }
    return '-';
  };

  const isPositive = crypto.change >= 0;

  return (
    <div className="space-y-6">
      {/* Price Statistics */}
      <div className="bg-white  dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-emerald-600 dark:text-pearto-green transition-colors duration-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white transition-colors duration-300">Price Statistics</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Current Price', value: formatPrice(crypto.price), icon: DollarSign, color: 'emerald' },
            { label: '24h Change', value: `${isPositive ? '+' : ''}${formatNumber(crypto.change)} (${isPositive ? '+' : ''}${formatNumber(crypto.changePercent)}%)`, icon: isPositive ? TrendingUp : TrendingDown, color: isPositive ? 'emerald' : 'red' },
            { label: 'Open', value: crypto.open ? formatPrice(crypto.open) : '-', icon: BarChart3, color: 'blue' },
            { label: 'Day High', value: crypto.dayHigh ? formatPrice(crypto.dayHigh) : '-', icon: TrendingUp, color: 'green' },
            { label: 'Day Low', value: crypto.dayLow ? formatPrice(crypto.dayLow) : '-', icon: TrendingDown, color: 'red' },
            { label: 'Previous Close', value: crypto.previousClose ? formatPrice(crypto.previousClose) : '-', icon: Activity, color: 'gray' },
          ].map((item, i) => (
            <div key={i} className={`bg-${item.color}-50 dark:bg-slate-800 p-4 rounded-xl border border-${item.color}-100 dark:border-slate-700`}>
              <div className="flex items-center gap-2 mb-2">
                <item.icon className={`h-4 w-4 text-${item.color}-600 dark:text-${item.color}-400`} />
                <span className={`text-sm font-medium text-${item.color}-700 dark:text-slate-300`}>{item.label}</span>
              </div>
              <p className={`text-lg font-medium text-${item.color}-900 dark:text-white`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Market Statistics */}
      <div className="bg-white  dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <PieChart className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white transition-colors duration-300">Market Statistics</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Market Cap', value: formatMarketCap(crypto.marketCap), icon: PieChart, color: 'blue' },
            { label: 'Fully Diluted Market Cap', value: calculateFullyDilutedMarketCap(), icon: Target, color: 'purple' },
            { label: 'Volume 24h', value: formatVolume(crypto.volume), icon: Volume2, color: 'emerald' },
            { label: 'Market Cap / Volume Ratio', value: calculateMarketCapToVolumeRatio(), icon: BarChart3, color: 'orange' },
            { label: 'Market Cap Rank', value: `#${crypto.id}`, icon: Hash, color: 'indigo' },
            { label: 'Trading Activity', value: crypto.avgVolume && crypto.volume ? `${((crypto.volume / crypto.avgVolume) * 100).toFixed(1)}%` : '-', icon: Activity, color: 'cyan' },
          ].map((item, i) => (
            <div key={i} className="bg-blue-50 dark:bg-slate-800 p-4 rounded-xl border border-blue-100 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <item.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{item.label}</span>
              </div>
              <p className="text-lg font-medium text-blue-900 dark:text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Supply Statistics */}
      <div className="bg-white  dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Hash className="h-4 w-4 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white transition-colors duration-300">Supply Statistics</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Circulating Supply', value: formatSupply(crypto.circulatingSupply), icon: Activity, color: 'purple' },
            { label: 'Max Supply', value: crypto.maxSupply ? formatSupply(crypto.maxSupply) : '∞', icon: Target, color: 'red' },
            { label: 'Supply Percentage', value: crypto.maxSupply ? `${calculateSupplyPercentage()}%` : '-', icon: PieChart, color: 'emerald' },
            { label: 'Total Supply', value: formatSupply(crypto.circulatingSupply), icon: Hash, color: 'blue' },
            { label: 'Price per Unit', value: formatPrice(crypto.price), icon: DollarSign, color: 'green' },
            { label: 'Market Cap per Supply', value: crypto.circulatingSupply ? formatPrice(crypto.marketCap / crypto.circulatingSupply) : '-', icon: BarChart3, color: 'orange' },
          ].map((item, i) => (
            <div key={i} className="bg-purple-50 dark:bg-slate-800 p-4 rounded-xl border border-purple-100 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <item.icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">{item.label}</span>
              </div>
              <p className="text-lg font-medium text-purple-900 dark:text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="bg-white  dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <Zap className="h-4 w-4 text-orange-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white transition-colors duration-300">Additional Metrics</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Asset Type', value: crypto.assetType, icon: Globe, color: 'blue' },
            { label: 'Currency', value: crypto.currency, icon: DollarSign, color: 'green' },
            { label: 'Country', value: crypto.countryCode, icon: Globe, color: 'purple' },
            { label: 'Featured', value: crypto.isFeatured ? 'Yes' : 'No', icon: Star, color: 'emerald' },
            { label: 'Listed', value: crypto.isListed ? 'Yes' : 'No', icon: BarChart3, color: 'blue' },
            { label: 'Last Updated', value: new Date(crypto.lastUpdated).toLocaleDateString(), icon: Clock, color: 'gray' },
          ].map((item, i) => (
            <div key={i} className="bg-orange-50 dark:bg-slate-800 p-4 rounded-xl border border-orange-100 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <item.icon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">{item.label}</span>
              </div>
              <p className="text-lg font-medium text-orange-900 dark:text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
