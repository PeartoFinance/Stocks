import React, { useState, useEffect } from 'react';
import { Building2, Globe, Users, MapPin, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { Stock } from '../../types';
import { marketService } from '../../utils/marketService';
import PriceDisplay from '../common/PriceDisplay';

interface ProfileData {
  symbol: string;
  name: string;
  description: string;
  website: string;
  sector: string;
  industry: string;
  exchange: string;
  currency: string;
  assetType: string;
  countryCode: string;
  high52w: number | null;
  low52w: number | null;
  price: number | null;
  open: number | null;
  previousClose: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number | null;
  avgVolume: number | null;
  sharesOutstanding: number | null;
  floatShares: number | null;
  shortRatio: number | null;
  beta: number | null;
  change: number | null;
  changePercent: number | null;
  lastUpdated: string;
}

interface ProfileTabProps {
  stock: Stock;
}

export default function ProfileTab({ stock }: ProfileTabProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await marketService.getStockProfile(stock.symbol);
        setProfile(data as ProfileData);
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Failed to load profile data');
        // Fallback to stock data if API fails
        setProfile({
          symbol: stock.symbol,
          name: stock.name,
          description: stock.description || '',
          website: stock.website || '',
          sector: stock.sector || '',
          industry: stock.industry || '',
          exchange: stock.exchange || '',
          currency: stock.currency || '',
          assetType: stock.assetType || 'Stock',
          countryCode: stock.countryCode || '',
          high52w: stock.week52High || null,
          low52w: stock.week52Low || null,
          price: stock.price || null,
          open: stock.open || null,
          previousClose: stock.previousClose || null,
          dayHigh: stock.dayHigh || null,
          dayLow: stock.dayLow || null,
          volume: stock.volume || null,
          avgVolume: stock.avgVolume || null,
          sharesOutstanding: stock.sharesOutstanding || null,
          floatShares: stock.floatShares || null,
          shortRatio: stock.shortRatio || null,
          beta: stock.beta || null,
          change: stock.change || null,
          changePercent: stock.changePercent || null,
          lastUpdated: stock.lastUpdated || new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [stock]);

  const formatNumber = (num: number | null | undefined): string => {
    if (num == null) return 'N/A';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-slate-500 dark:text-gray-400 transition-colors duration-300">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-slate-500 dark:text-gray-400 transition-colors duration-300">
          <p className="mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-500 text-sm transition-colors duration-300"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Use profile data if available, otherwise fallback to stock data
  const data = profile || stock;

  return (
    <div className="space-y-6">
      {/* Company Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
          <Building2 className="h-5 w-5 text-blue-500" />
          Company Overview
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3 transition-colors duration-300">About {data.name}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 transition-colors duration-300">
              {data.description || `${data.name} is a leading company in the ${data.sector || 'technology'} sector, operating in the ${data.industry || 'consumer electronics'} industry.`}
            </p>

            <div className="space-y-2">
              {data.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <a
                    href={data.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500 flex items-center gap-1 transition-colors duration-300"
                  >
                    {data.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {data.sharesOutstanding && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                  <Users className="h-4 w-4 text-slate-400" />
                  {formatLargeNumber(data.sharesOutstanding)} shares outstanding
                </div>
              )}
              {data.floatShares && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                  <Users className="h-4 w-4 text-slate-400" />
                  {formatLargeNumber(data.floatShares)} float shares
                </div>
              )}
              {data.lastUpdated && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  Last updated: {new Date(data.lastUpdated).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3 transition-colors duration-300">Company Details</h4>
            <div className="space-y-3">
              {[
                { label: 'Symbol', value: data.symbol },
                { label: 'Sector', value: data.sector },
                { label: 'Industry', value: data.industry },
                { label: 'Exchange', value: data.exchange },
                { label: 'Currency', value: data.currency },
                { label: 'Asset Type', value: data.assetType },
                { label: 'Country', value: data.countryCode },
                { label: '52W High', value: data.high52w ? <PriceDisplay amount={data.high52w} /> : 'N/A' },
                { label: '52W Low', value: data.low52w ? <PriceDisplay amount={data.low52w} /> : 'N/A' },
              ].filter(item => item.value).map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
                  <span className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">{item.label}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trading Information */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 transition-colors duration-300">
          Trading Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3 transition-colors duration-300">Price Data</h4>
            <div className="space-y-2">
              {[
                { label: 'Current Price', value: data.price ? <PriceDisplay amount={data.price} /> : 'N/A' },
                { label: 'Open', value: data.open ? <PriceDisplay amount={data.open} /> : 'N/A' },
                { label: 'Previous Close', value: data.previousClose ? <PriceDisplay amount={data.previousClose} /> : 'N/A' },
                { label: 'Day High', value: data.dayHigh ? <PriceDisplay amount={data.dayHigh} /> : 'N/A' },
                { label: 'Day Low', value: data.dayLow ? <PriceDisplay amount={data.dayLow} /> : 'N/A' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-1">
                  <span className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">{item.label}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3 transition-colors duration-300">Volume & Shares</h4>
            <div className="space-y-2">
              {[
                { label: 'Volume', value: formatLargeNumber(data.volume) },
                { label: 'Avg Volume', value: formatLargeNumber(data.avgVolume) },
                { label: 'Shares Outstanding', value: formatLargeNumber(data.sharesOutstanding) },
                { label: 'Float Shares', value: formatLargeNumber(data.floatShares) },
                { label: 'Short Ratio', value: data.shortRatio ? data.shortRatio.toFixed(2) : 'N/A' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-1">
                  <span className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">{item.label}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3 transition-colors duration-300">Risk Metrics</h4>
            <div className="space-y-2">
              {[
                { label: 'Beta', value: data.beta ? data.beta.toFixed(3) : 'N/A' },
                { label: '52W High', value: data.high52w ? <PriceDisplay amount={data.high52w} /> : 'N/A' },
                { label: '52W Low', value: data.low52w ? <PriceDisplay amount={data.low52w} /> : 'N/A' },
                {
                  label: 'Change', value: data.change != null && data.changePercent != null ?
                    <span className="flex items-center gap-1">
                      <PriceDisplay amount={data.change} showSign />
                      <span>({data.changePercent.toFixed(2)}%)</span>
                    </span> : 'N/A'
                },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-1">
                  <span className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">{item.label}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 transition-colors duration-300">
          Additional Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3 transition-colors duration-300">Company Links</h4>
            {data.website ? (
              <div className="space-y-2">
                <a href={data.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 flex items-center gap-2 transition-colors duration-300">
                  <Globe className="h-4 w-4" />
                  Company Website
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-gray-400 transition-colors duration-300">No website information available</p>
            )}
          </div>

          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3 transition-colors duration-300">Data Information</h4>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
              <p>Asset Type: {data.assetType || 'Stock'}</p>
              <p>Country: {data.countryCode || 'N/A'}</p>
              {data.lastUpdated && (
                <p>Last Updated: {new Date(data.lastUpdated).toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}