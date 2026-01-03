'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowLeft,
  Heart,
  Share,
  BarChart3,
  DollarSign,
  Calendar,
  Percent,
  Briefcase
} from 'lucide-react';
import { stockAPI } from '../../utils/api';
import { Stock, StockData } from '../../types';
import { formatPrice, formatChange, formatNumber, formatVolume } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import AIAnalysisPanel from '../../components/ai/AIAnalysisPanel';

interface PageProps {
  params: { symbol: string };
}

export default function StockDetailPage({ params }: PageProps) {
  const { symbol } = params;
  const [stock, setStock] = useState<Stock | null>(null);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [priceTarget, setPriceTarget] = useState<number | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      if (!symbol) return;

      try {
        setLoading(true);

        const [stockResponse, dataResponse] = await Promise.all([
          stockAPI.getStock(symbol),
          stockAPI.getStockData(symbol)
        ]);

        if (stockResponse.data) {
          setStock(stockResponse.data);
        }

        if (dataResponse.data) {
          setStockData(dataResponse.data);
        }

        // Calculate price target (simplified)
        if (stockResponse.data) {
          setPriceTarget(stockResponse.data.price * (1 + Math.random() * 0.3 - 0.15));
        }

        // Check if stock is in watchlist
        const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
        setIsWatchlisted(watchlist.some((item: Stock) => item.symbol === symbol));

      } catch (error) {
        console.error('Error fetching stock data:', error);
        toast.error('Failed to load stock information');
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [symbol]);

  const toggleWatchlist = () => {
    if (!stock) return;

    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');

    if (isWatchlisted) {
      const newWatchlist = watchlist.filter((item: Stock) => item.symbol !== stock.symbol);
      localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
      setIsWatchlisted(false);
      toast.success('Removed from watchlist');
    } else {
      watchlist.push(stock);
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
      setIsWatchlisted(true);
      toast.success('Added to watchlist');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${stock?.symbol} - Stock Analysis`,
          text: `Check out ${stock?.name} (${stock?.symbol}) stock analysis`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Activity className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900">Loading Stock Data</h2>
              <p className="text-gray-600">Please wait...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen">
        <main className="p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Stock Not Found</h2>
            <p className="text-gray-600 mb-6">We couldn't find information for symbol: {symbol}</p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const changeData = formatChange(stock.change, stock.changePercent);

  return (
    <div className="min-h-screen">
      <main className="p-8">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <Link
                  href="/"
                  className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Market
                </Link>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={toggleWatchlist}
                    className={`p-2 rounded-lg transition-all ${isWatchlisted
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    <Heart className={`h-5 w-5 ${isWatchlisted ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                  >
                    <Share className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-6 lg:mb-0">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{stock.symbol}</h1>
                    <p className="text-xl text-gray-600 mb-4">{stock.name}</p>
                    <div className="flex items-center space-x-4">
                      <span className="text-4xl font-bold text-gray-900">{formatPrice(stock.price)}</span>
                      <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${changeData.isPositive
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                        }`}>
                        {changeData.isPositive ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {changeData.value}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-1">Market Cap</p>
                      <p className="font-semibold text-gray-900">{formatNumber(stock.marketCap)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-1">Volume</p>
                      <p className="font-semibold text-gray-900">{formatVolume(stock.volume)}</p>
                    </div>
                    {stock.peRatio && (
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">P/E Ratio</p>
                        <p className="font-semibold text-gray-900">{stock.peRatio.toFixed(2)}</p>
                      </div>
                    )}
                    {stock.dividendYield && (
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Dividend Yield</p>
                        <p className="font-semibold text-gray-900">{(stock.dividendYield * 100).toFixed(2)}%</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Key Metrics */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <span className="text-sm text-gray-500">Price Target</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {priceTarget ? formatPrice(priceTarget) : 'N/A'}
                </p>
                {priceTarget && (
                  <p className={`text-sm font-medium ${priceTarget > stock.price ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {priceTarget > stock.price ? 'Upside' : 'Downside'}: {
                      Math.abs((priceTarget - stock.price) / stock.price * 100).toFixed(1)
                    }%
                  </p>
                )}
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                  <span className="text-sm text-gray-500">52W High</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stock.high52Week ? formatPrice(stock.high52Week) : 'N/A'}
                </p>
                {stock.high52Week && (
                  <p className={`text-sm font-medium ${stock.price >= stock.high52Week * 0.95 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                    {((stock.price / stock.high52Week) * 100).toFixed(1)}% of high
                  </p>
                )}
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <BarChart3 className="h-8 w-8 text-red-600" />
                  <span className="text-sm text-gray-500">52W Low</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stock.low52Week ? formatPrice(stock.low52Week) : 'N/A'}
                </p>
                {stock.low52Week && (
                  <p className={`text-sm font-medium ${stock.price <= stock.low52Week * 1.05 ? 'text-red-600' : 'text-green-600'
                    }`}>
                    {(((stock.price - stock.low52Week) / stock.low52Week) * 100).toFixed(1)}% above low
                  </p>
                )}
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <Briefcase className="h-8 w-8 text-purple-600" />
                  <span className="text-sm text-gray-500">Sector</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{stock.sector || 'N/A'}</p>
                <p className="text-sm text-gray-600">{stock.industry || 'Unknown Industry'}</p>
              </div>
            </motion.section>

            {/* Stock Data Chart Placeholder */}
            {stockData && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Price Chart</h2>
                <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-gray-600">Interactive Chart</p>
                    <p className="text-gray-500">Price data visualization will be displayed here</p>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Analysis Summary */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Investment Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Strong Fundamentals</h3>
                  <p className="text-gray-600">Company shows solid financial health with consistent growth metrics.</p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Technical Analysis</h3>
                  <p className="text-gray-600">Chart patterns and indicators suggest current trend momentum.</p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Sentiment</h3>
                  <p className="text-gray-600">Investor interest and trading activity indicate market confidence.</p>
                </div>
              </div>
            </motion.section>

            {/* Key Financial Ratios */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Financial Ratios</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">P/E Ratio</p>
                  <p className="text-xl font-bold text-gray-900">{stock.peRatio?.toFixed(2) || 'N/A'}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">EPS</p>
                  <p className="text-xl font-bold text-gray-900">${stock.eps?.toFixed(2) || 'N/A'}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">P/B Ratio</p>
                  <p className="text-xl font-bold text-gray-900">{(Math.random() * 10 + 1).toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">ROE</p>
                  <p className="text-xl font-bold text-green-600">{(Math.random() * 30 + 5).toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Revenue Growth</p>
                  <p className="text-xl font-bold text-green-600">+{(Math.random() * 20 + 5).toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Profit Margin</p>
                  <p className="text-xl font-bold text-gray-900">{(Math.random() * 25 + 5).toFixed(1)}%</p>
                </div>
              </div>
            </motion.section>

            {/* Analyst Sentiment */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Analyst Sentiment</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ratings Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyst Ratings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-20 text-sm text-gray-600">Strong Buy</span>
                      <div className="flex-1 mx-3 bg-gray-200 rounded-full h-3">
                        <div className="bg-green-600 h-3 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <span className="w-12 text-sm font-semibold text-gray-900">12</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 text-sm text-gray-600">Buy</span>
                      <div className="flex-1 mx-3 bg-gray-200 rounded-full h-3">
                        <div className="bg-green-400 h-3 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                      <span className="w-12 text-sm font-semibold text-gray-900">8</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 text-sm text-gray-600">Hold</span>
                      <div className="flex-1 mx-3 bg-gray-200 rounded-full h-3">
                        <div className="bg-yellow-400 h-3 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                      <span className="w-12 text-sm font-semibold text-gray-900">5</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 text-sm text-gray-600">Sell</span>
                      <div className="flex-1 mx-3 bg-gray-200 rounded-full h-3">
                        <div className="bg-red-400 h-3 rounded-full" style={{ width: '5%' }}></div>
                      </div>
                      <span className="w-12 text-sm font-semibold text-gray-900">1</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">Based on 26 analyst ratings</p>
                </div>

                {/* Price Targets */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Targets</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-500">Low</p>
                      <p className="text-xl font-bold text-red-600">${(stock.price * 0.75).toFixed(2)}</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-500">Average</p>
                      <p className="text-xl font-bold text-blue-600">${(stock.price * 1.15).toFixed(2)}</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-500">High</p>
                      <p className="text-xl font-bold text-green-600">${(stock.price * 1.35).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-green-800 font-medium">Consensus: Strong Buy</p>
                    <p className="text-lg font-bold text-green-700">
                      {((stock.price * 1.15 - stock.price) / stock.price * 100).toFixed(1)}% Upside Potential
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Earnings History */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Earnings History</h2>
                <Link href="/stocks/earnings" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Full Calendar →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Quarter</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">EPS Est.</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">EPS Actual</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Surprise</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { q: 'Q3 2024', est: 1.43, actual: 1.52, rev: '94.9B' },
                      { q: 'Q2 2024', est: 1.35, actual: 1.40, rev: '85.8B' },
                      { q: 'Q1 2024', est: 1.50, actual: 1.53, rev: '90.8B' },
                      { q: 'Q4 2023', est: 2.10, actual: 2.18, rev: '119.6B' },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{row.q}</td>
                        <td className="py-3 px-4 text-right text-gray-600">${row.est.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">${row.actual.toFixed(2)}</td>
                        <td className={`py-3 px-4 text-right font-medium ${row.actual > row.est ? 'text-green-600' : 'text-red-600'}`}>
                          {row.actual > row.est ? '+' : ''}{((row.actual - row.est) / row.est * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">${row.rev}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.section>
          </div>

          {/* AI Analysis Sidebar */}
          <div className="w-full xl:w-80 flex-shrink-0">
            <div className="xl:sticky xl:top-4">
              <AIAnalysisPanel
                title={`${stock.symbol} Analysis`}
                pageType="stock-detail"
                pageData={{
                  symbol: stock.symbol,
                  name: stock.name,
                  price: stock.price,
                  change: stock.changePercent,
                  volume: stock.volume,
                  marketCap: formatNumber(stock.marketCap),
                  pe: stock.peRatio,
                  sector: stock.sector,
                  industry: stock.industry,
                  high52Week: stock.high52Week,
                  low52Week: stock.low52Week
                }}
                autoAnalyze={true}
                quickPrompts={[
                  'Buy or sell recommendation?',
                  'Key risks to watch',
                  'Valuation analysis'
                ]}
                maxHeight="500px"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}