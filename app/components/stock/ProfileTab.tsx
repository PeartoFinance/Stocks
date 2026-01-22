import React from 'react';
import { Building2, Globe, Users, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { Stock } from '../../types';

interface ProfileTabProps {
  stock: Stock;
}

export default function ProfileTab({ stock }: ProfileTabProps) {
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const formatLargeNumber = (num: number | undefined | null): string => {
    if (num == null) return 'N/A';
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Company Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-500" />
          Company Overview
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">About {stock.name}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              {stock.description || `${stock.name} is a leading company in the ${stock.sector || 'technology'} sector, operating in the ${stock.industry || 'consumer electronics'} industry.`}
            </p>
            
            <div className="space-y-2">
              {stock.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <a 
                    href={stock.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500 flex items-center gap-1"
                  >
                    {stock.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {stock.sharesOutstanding && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Users className="h-4 w-4 text-slate-400" />
                  {formatLargeNumber(stock.sharesOutstanding)} shares outstanding
                </div>
              )}
              {stock.floatShares && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Users className="h-4 w-4 text-slate-400" />
                  {formatLargeNumber(stock.floatShares)} float shares
                </div>
              )}
              {stock.lastUpdated && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  Last updated: {new Date(stock.lastUpdated).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Company Details</h4>
            <div className="space-y-3">
              {[
                { label: 'Symbol', value: stock.symbol },
                { label: 'Sector', value: stock.sector },
                { label: 'Industry', value: stock.industry },
                { label: 'Exchange', value: stock.exchange },
                { label: 'Currency', value: stock.currency },
                { label: 'Asset Type', value: stock.assetType },
                { label: 'Country', value: stock.countryCode },
                { label: '52W High', value: stock.high52w ? `$${stock.high52w.toFixed(2)}` : 'N/A' },
                { label: '52W Low', value: stock.low52w ? `$${stock.low52w.toFixed(2)}` : 'N/A' },
              ].filter(item => item.value).map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trading Information */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Trading Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Price Data</h4>
            <div className="space-y-2">
              {[
                { label: 'Current Price', value: `$${stock.price.toFixed(2)}` },
                { label: 'Open', value: stock.open ? `$${stock.open.toFixed(2)}` : 'N/A' },
                { label: 'Previous Close', value: stock.previousClose ? `$${stock.previousClose.toFixed(2)}` : 'N/A' },
                { label: 'Day High', value: stock.dayHigh ? `$${stock.dayHigh.toFixed(2)}` : 'N/A' },
                { label: 'Day Low', value: stock.dayLow ? `$${stock.dayLow.toFixed(2)}` : 'N/A' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-1">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Volume & Shares</h4>
            <div className="space-y-2">
              {[
                { label: 'Volume', value: formatLargeNumber(stock.volume) },
                { label: 'Avg Volume', value: formatLargeNumber(stock.avgVolume) },
                { label: 'Shares Outstanding', value: formatLargeNumber(stock.sharesOutstanding) },
                { label: 'Float Shares', value: formatLargeNumber(stock.floatShares) },
                { label: 'Short Ratio', value: stock.shortRatio ? stock.shortRatio.toFixed(2) : 'N/A' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-1">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Risk Metrics</h4>
            <div className="space-y-2">
              {[
                { label: 'Beta', value: stock.beta ? stock.beta.toFixed(3) : 'N/A' },
                { label: '52W High', value: stock.high52w ? `$${stock.high52w.toFixed(2)}` : 'N/A' },
                { label: '52W Low', value: stock.low52w ? `$${stock.low52w.toFixed(2)}` : 'N/A' },
                { label: 'Change', value: `$${stock.change.toFixed(2)} (${stock.changePercent.toFixed(2)}%)` },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-1">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Additional Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Company Links</h4>
            {stock.website ? (
              <div className="space-y-2">
                <a href={stock.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Company Website
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No website information available</p>
            )}
          </div>
          
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Data Information</h4>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>Asset Type: {stock.assetType || 'Stock'}</p>
              <p>Country: {stock.countryCode || 'N/A'}</p>
              {stock.lastUpdated && (
                <p>Last Updated: {new Date(stock.lastUpdated).toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}