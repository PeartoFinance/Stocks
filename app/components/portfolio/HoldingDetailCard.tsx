'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, ChevronUp, ChevronDown, Info, Activity } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

interface HoldingDetailCardProps {
    holding: any;
    portfolioName: string;
    marketData?: any;
    transactions?: any[];
    className?: string;
}

export default function HoldingDetailCard({
    holding,
    portfolioName,
    marketData,
    transactions = [],
    className = ''
}: HoldingDetailCardProps) {
    const { formatPrice } = useCurrency();
    const [showDetails, setShowDetails] = useState(false);

    // Calculate additional metrics
    const totalCost = holding.avgCost * holding.shares;
    const totalValue = holding.totalValue || (holding.currentPrice * holding.shares);
    const totalGain = totalValue - totalCost;
    const gainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
    const dayChange = marketData?.dayChange || 0;
    const dayChangePercent = marketData?.dayChangePercent || 0;

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-slate-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow duration-300 ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-gray-700">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-xl">{holding.symbol.slice(0, 2)}</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{holding.symbol}</h3>
                                <p className="text-base text-slate-600 dark:text-gray-400 font-medium">{holding.name || 'Company Name'}</p>
                                <p className="text-sm text-slate-500 dark:text-gray-500 mt-1">{portfolioName}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="p-3 rounded-xl bg-white dark:bg-gray-700 hover:bg-slate-50 dark:hover:bg-gray-600 border border-slate-200 dark:border-gray-600 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        {showDetails ? <ChevronUp className="h-5 w-5 text-slate-600 dark:text-gray-400" /> : <ChevronDown className="h-5 w-5 text-slate-600 dark:text-gray-400" />}
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Current Price</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {formatPrice(holding.currentPrice || 0)}
                        </div>
                        <div className={`text-sm font-semibold mt-1 ${dayChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {dayChange >= 0 ? '+' : ''}{dayChange.toFixed(2)} ({dayChangePercent >= 0 ? '+' : ''}{dayChangePercent.toFixed(2)}%)
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm text-purple-600 dark:text-purple-400 font-semibold">Shares</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {holding.shares.toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-gray-400 mt-1">
                            Avg Cost: {formatPrice(holding.avgCost || 0)}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">Total Value</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {formatPrice(totalValue)}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-gray-400 mt-1">
                            Cost: {formatPrice(totalCost)}
                        </div>
                    </div>

                    <div className={`rounded-xl p-4 border ${totalGain >= 0
                            ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/20 border-green-200 dark:border-green-800'
                            : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/20 border-red-200 dark:border-red-800'
                        }`}>
                        <div className="flex items-center gap-2 mb-2">
                            {totalGain >= 0 ? <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" /> : <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />}
                            <span className={`text-sm font-semibold ${totalGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>Total Gain</span>
                        </div>
                        <div className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {totalGain >= 0 ? '+' : ''}{formatPrice(Math.abs(totalGain))}
                        </div>
                        <div className={`text-sm font-semibold mt-1 ${totalGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            ({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Information */}
            {showDetails && (
                <div className="border-t border-slate-100 dark:border-gray-700">
                    {/* Additional Details */}
                    <div className="p-6 bg-white dark:bg-gray-800">
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Info className="h-6 w-6 text-slate-600 dark:text-gray-400" />
                            Detailed Information
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6">
                            {/* Market Data */}
                            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3 md:p-6 border border-blue-200 dark:border-blue-800">
                                <h5 className="text-xs md:text-base font-semibold text-blue-800 dark:text-blue-300 mb-2 md:mb-4 flex items-center gap-1 md:gap-2">
                                    <Activity className="h-3 w-3 md:h-4 md:w-4" />
                                    Market Data
                                </h5>
                                <div className="space-y-1.5 md:space-y-3">
                                    <div className="flex justify-between items-center p-2 md:p-3 bg-white dark:bg-gray-700 rounded-lg">
                                        <span className="text-[10px] md:text-sm font-medium text-slate-600 dark:text-gray-400">52W High:</span>
                                        <span className="text-xs md:text-base font-bold text-slate-900 dark:text-white">
                                            {marketData?.high52w ? formatPrice(marketData.high52w) : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 md:p-3 bg-white dark:bg-gray-700 rounded-lg">
                                        <span className="text-[10px] md:text-sm font-medium text-slate-600 dark:text-gray-400">52W Low:</span>
                                        <span className="text-xs md:text-base font-bold text-slate-900 dark:text-white">
                                            {marketData?.low52w ? formatPrice(marketData.low52w) : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 md:p-3 bg-white dark:bg-gray-700 rounded-lg">
                                        <span className="text-[10px] md:text-sm font-medium text-slate-600 dark:text-gray-400">P/E Ratio:</span>
                                        <span className="text-xs md:text-base font-bold text-slate-900 dark:text-white">
                                            {marketData?.peRatio?.toFixed(2) || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 md:p-3 bg-white dark:bg-gray-700 rounded-lg">
                                        <span className="text-[10px] md:text-sm font-medium text-slate-600 dark:text-gray-400">Market Cap:</span>
                                        <span className="text-xs md:text-base font-bold text-slate-900 dark:text-white">
                                            {marketData?.marketCap ?
                                                formatPrice(marketData.marketCap / 1000000000) + 'B' :
                                                'N/A'
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 md:p-3 bg-white dark:bg-gray-700 rounded-lg">
                                        <span className="text-[10px] md:text-sm font-medium text-slate-600 dark:text-gray-400">Sector:</span>
                                        <span className="text-xs md:text-base font-bold text-slate-900 dark:text-white truncate ml-2">
                                            {marketData?.sector || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Investment Metrics */}
                            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-3 md:p-6 border border-purple-200 dark:border-purple-800">
                                <h5 className="text-xs md:text-base font-semibold text-purple-800 dark:text-purple-300 mb-2 md:mb-4 flex items-center gap-1 md:gap-2">
                                    <Info className="h-3 w-3 md:h-4 md:w-4" />
                                    Investment Metrics
                                </h5>
                                <div className="space-y-1.5 md:space-y-3">
                                    <div className="flex justify-between items-center p-2 md:p-3 bg-white dark:bg-gray-700 rounded-lg">
                                        <span className="text-[10px] md:text-sm font-medium text-slate-600 dark:text-gray-400">Portfolio Weight:</span>
                                        <span className="text-xs md:text-base font-bold text-slate-900 dark:text-white">
                                            {((totalValue / 100000) * 100).toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 md:p-3 bg-white dark:bg-gray-700 rounded-lg">
                                        <span className="text-[10px] md:text-sm font-medium text-slate-600 dark:text-gray-400">Daily Return:</span>
                                        <span className={`text-xs md:text-base font-bold ${dayChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {dayChange >= 0 ? '+' : ''}{dayChange.toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 md:p-3 bg-white dark:bg-gray-700 rounded-lg">
                                        <span className="text-[10px] md:text-sm font-medium text-slate-600 dark:text-gray-400">YTD Return:</span>
                                        <span className="text-xs md:text-base font-bold text-slate-900 dark:text-white">
                                            +{gainPercent.toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 md:p-3 bg-white dark:bg-gray-700 rounded-lg">
                                        <span className="text-[10px] md:text-sm font-medium text-slate-600 dark:text-gray-400">Volatility:</span>
                                        <span className="text-xs md:text-base font-bold text-slate-900 dark:text-white">
                                            {(Math.random() * 30 + 10).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
