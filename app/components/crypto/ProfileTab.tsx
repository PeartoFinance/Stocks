'use client';

import React from 'react';
import { 
  Building2, 
  Globe, 
  ExternalLink, 
  Mail, 
  Twitter, 
  Github, 
  Linkedin,
  FileText,
  Hash,
  Target,
  Shield,
  Zap,
  Clock,
  Star,
  BarChart3,
  Activity
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

interface ProfileTabProps {
  crypto: CryptoDetails;
}

export default function ProfileTab({ crypto }: ProfileTabProps) {
  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  const formatSupply = (supply: number | undefined | null): string => {
    if (supply == null) return '-';
    if (supply >= 1e12) return `${(supply / 1e12).toFixed(2)}T`;
    if (supply >= 1e9) return `${(supply / 1e9).toFixed(2)}B`;
    if (supply >= 1e6) return `${(supply / 1e6).toFixed(2)}M`;
    return supply.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Mock additional data that would typically come from API
  const additionalInfo = {
    whitepaper: crypto.website ? `${crypto.website}/whitepaper` : null,
    explorers: [
      { name: 'Etherscan', url: `https://etherscan.io/token/${crypto.symbol.toLowerCase()}` },
      { name: 'CoinMarketCap', url: `https://coinmarketcap.com/currencies/${crypto.symbol.toLowerCase()}` }
    ],
    socialLinks: {
      twitter: `https://twitter.com/${crypto.symbol.toLowerCase()}`,
      discord: null,
      telegram: null,
      reddit: null
    },
    technology: {
      blockchain: 'Ethereum',
      consensus: 'Proof of Stake',
      launchDate: '2020-01-01',
      totalSupply: crypto.maxSupply,
      circulatingSupply: crypto.circulatingSupply
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white  dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6 transition-colors duration-300">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl font-medium text-white">{crypto.symbol.substring(0, 2).toUpperCase()}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-medium text-slate-900 dark:text-white mb-2 transition-colors duration-300">
              {crypto.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
              <span className="font-medium">{crypto.symbol}</span>
              <span>•</span>
              <span>{crypto.assetType}</span>
              <span>•</span>
              <span>Rank #{crypto.id}</span>
              {crypto.isFeatured && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-pearto-green transition-colors duration-300">
                    <Star className="h-4 w-4 fill-current" />
                    Featured
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white  dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <FileText className="h-4 w-4 text-emerald-600 dark:text-pearto-green transition-colors duration-300" />
          </div>
          <h2 className="text-lg font-medium text-slate-900 dark:text-white transition-colors duration-300">About {crypto.name}</h2>
        </div>
        
        {crypto.description ? (
          <div className="prose prose-slate dark:prose-invert max-w-none transition-colors duration-300">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed transition-colors duration-300">
              {crypto.description}
            </p>
          </div>
        ) : (
          <p className="text-slate-400 italic">
            No description available for this cryptocurrency.
          </p>
        )}
      </div>

      {/* Key Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white  dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Hash className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white transition-colors duration-300">Basic Information</h3>
          </div>
          
          <div className="space-y-3">
            {[
              { label: 'Symbol', value: crypto.symbol },
              { label: 'Asset Type', value: crypto.assetType },
              { label: 'Currency', value: crypto.currency },
              { label: 'Country', value: crypto.countryCode },
              { label: 'Market Cap Rank', value: `#${crypto.id}` },
              { label: 'Last Updated', value: formatDate(crypto.lastUpdated) },
            ].map((item, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0 transition-colors duration-300">
                <span className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">{item.label}</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Supply Information */}
        <div className="bg-white  dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white transition-colors duration-300">Supply Information</h3>
          </div>
          
          <div className="space-y-3">
            {[
              { label: 'Circulating Supply', value: formatSupply(crypto.circulatingSupply) },
              { label: 'Max Supply', value: crypto.maxSupply ? formatSupply(crypto.maxSupply) : '∞' },
              { label: 'Market Cap', value: formatMarketCap(crypto.marketCap) },
              { label: '24h Volume', value: `$${(crypto.volume / 1e6).toFixed(2)}M` },
              { label: 'Volume/Market Cap', value: crypto.marketCap ? `${((crypto.volume / crypto.marketCap) * 100).toFixed(2)}%` : '-' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0 transition-colors duration-300">
                <span className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">{item.label}</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-white  dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Zap className="h-4 w-4 text-emerald-600 dark:text-pearto-green transition-colors duration-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white transition-colors duration-300">Technology</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Blockchain', value: additionalInfo.technology.blockchain, icon: Shield },
            { label: 'Consensus', value: additionalInfo.technology.consensus, icon: Target },
            { label: 'Launch Date', value: new Date(additionalInfo.technology.launchDate).toLocaleDateString(), icon: Clock },
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg transition-colors duration-300">
              <div className="flex items-center gap-2 mb-2">
                <item.icon className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors duration-300">{item.label}</span>
              </div>
              <p className="text-slate-900 dark:text-white font-medium transition-colors duration-300">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Official Links */}
        <div className="bg-white  dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white transition-colors duration-300">Official Links</h3>
          </div>
          
          <div className="space-y-3">
            {crypto.website && (
              <a
                href={crypto.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">Official Website</span>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-400" />
              </a>
            )}
            
            {additionalInfo.whitepaper && (
              <a
                href={additionalInfo.whitepaper}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">Whitepaper</span>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-400" />
              </a>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white  dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Twitter className="h-4 w-4 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white transition-colors duration-300">Community</h3>
          </div>
          
          <div className="space-y-3">
            {additionalInfo.socialLinks.twitter && (
              <a
                href={additionalInfo.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Twitter className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">Twitter</span>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-400" />
              </a>
            )}
            
            {additionalInfo.explorers.map((explorer, i) => (
              <a
                key={i}
                href={explorer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">{explorer.name}</span>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-400" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white  dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Shield className="h-4 w-4 text-emerald-600 dark:text-pearto-green transition-colors duration-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white transition-colors duration-300">Status & Recognition</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Featured', value: crypto.isFeatured ? 'Yes' : 'No', icon: Star, color: 'emerald' },
            { label: 'Listed', value: crypto.isListed ? 'Yes' : 'No', icon: BarChart3, color: 'blue' },
            { label: 'Active', value: 'Yes', icon: Activity, color: 'green' },
            { label: 'Verified', value: 'Yes', icon: Shield, color: 'purple' },
          ].map((item, i) => (
            <div key={i} className="bg-emerald-50 dark:bg-slate-800 p-4 rounded-lg border border-emerald-100 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <item.icon className={`h-4 w-4 text-${item.color}-600 dark:text-${item.color}-400`} />
                <span className={`text-sm font-medium text-${item.color}-700 dark:text-${item.color}-300`}>{item.label}</span>
              </div>
              <p className={`text-lg font-medium text-${item.color}-900 dark:text-white`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
