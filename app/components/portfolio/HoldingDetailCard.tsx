'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Calendar, Activity, ChevronUp, ChevronDown, Info } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    RadialLinearScale
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { useCurrency } from '../../context/CurrencyContext';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    RadialLinearScale
);

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

    // Generate mock historical data for charts
    const generateHistoricalData = () => {
        const days = 30;
        const data = [];
        const basePrice = holding.currentPrice || holding.avgCost;

        for (let i = days; i >= 0; i--) {
            const randomChange = (Math.random() - 0.5) * 0.1;
            const price = basePrice * (1 + randomChange * (days - i) / days);
            data.push({
                date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
                price: price
            });
        }
        return data;
    };

    const historicalData = generateHistoricalData();

    // Chart data for price history
    const priceChartData = {
        labels: historicalData.map(d => d.date),
        datasets: [
            {
                label: 'Price',
                data: historicalData.map(d => d.price),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.1
            }
        ]
    };

    // Chart data for portfolio allocation
    const allocationData = {
        labels: [holding.symbol, 'Other Holdings'],
        datasets: [
            {
                data: [totalValue, 100000 - totalValue], // Assuming total portfolio value
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(156, 163, 175, 0.8)'
                ],
                borderColor: [
                    'rgb(34, 197, 94)',
                    'rgb(156, 163, 175)'
                ],
                borderWidth: 1
            }
        ]
    };

    // Chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                ticks: {
                    callback: function (value: any) {
                        return formatPrice(value);
                    }
                }
            }
        }
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
            }
        }
    };

    return (
        <div className={`bg-white dark:bg-pearto-card rounded-2xl shadow-lg border border-slate-200 dark:border-pearto-border overflow-hidden hover:shadow-xl transition-shadow duration-300 ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-xl">{holding.symbol.slice(0, 2)}</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-pearto-luna transition-colors duration-300">{holding.symbol}</h3>
                                <p className="text-base text-slate-600 dark:text-pearto-cloud font-medium transition-colors duration-300">{holding.name || 'Company Name'}</p>
                                <p className="text-sm text-slate-500 dark:text-pearto-gray mt-1 transition-colors duration-300">{portfolioName}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="p-3 rounded-xl bg-white dark:bg-pearto-card hover:bg-slate-50 dark:bg-pearto-surface border border-slate-200 dark:border-pearto-border transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        {showDetails ? <ChevronUp className="h-5 w-5 text-slate-600 dark:text-pearto-cloud transition-colors duration-300" /> : <ChevronDown className="h-5 w-5 text-slate-600 dark:text-pearto-cloud transition-colors duration-300" />}
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-5 w-5 text-blue-600" />
                            <span className="text-sm text-blue-600 font-semibold">Current Price</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-pearto-luna transition-colors duration-300">
                            {formatPrice(holding.currentPrice || 0)}
                        </div>
                        <div className={`text-sm font-semibold mt-1 ${dayChange >= 0 ? 'text-green-600 dark:text-pearto-green' : 'text-red-600 dark:text-pearto-pink'
                            }`}>
                            {dayChange >= 0 ? '+' : ''}{dayChange.toFixed(2)} ({dayChangePercent >= 0 ? '+' : ''}{dayChangePercent.toFixed(2)}%)
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="h-5 w-5 text-purple-600" />
                            <span className="text-sm text-purple-600 font-semibold">Shares</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-pearto-luna transition-colors duration-300">
                            {holding.shares.toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-pearto-cloud mt-1 transition-colors duration-300">
                            Avg Cost: {formatPrice(holding.avgCost || 0)}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-pearto-green transition-colors duration-300" />
                            <span className="text-sm text-emerald-600 dark:text-pearto-green font-semibold transition-colors duration-300">Total Value</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-pearto-luna transition-colors duration-300">
                            {formatPrice(totalValue)}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-pearto-cloud mt-1 transition-colors duration-300">
                            Cost: {formatPrice(totalCost)}
                        </div>
                    </div>

                    <div className={`rounded-xl p-4 border ${totalGain >= 0
                            ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                            : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                        }`}>
                        <div className="flex items-center gap-2 mb-2">
                            {totalGain >= 0 ? <TrendingUp className="h-5 w-5 text-green-600 dark:text-pearto-green transition-colors duration-300" /> : <TrendingDown className="h-5 w-5 text-red-600 dark:text-pearto-pink transition-colors duration-300" />}
                            <span className={`text-sm font-semibold ${totalGain >= 0 ? 'text-green-600 dark:text-pearto-green' : 'text-red-600 dark:text-pearto-pink'
                                }`}>Total Gain</span>
                        </div>
                        <div className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-600 dark:text-pearto-green' : 'text-red-600 dark:text-pearto-pink'
                            }`}>
                            {totalGain >= 0 ? '+' : ''}{formatPrice(Math.abs(totalGain))}
                        </div>
                        <div className={`text-sm font-semibold mt-1 ${totalGain >= 0 ? 'text-green-600 dark:text-pearto-green' : 'text-red-600 dark:text-pearto-pink'
                            }`}>
                            ({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Information */}
            {showDetails && (
                <div className="border-t border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100">
                    {/* Charts Section */}
                    <div className="p-6">
                        <h4 className="text-xl font-bold text-slate-900 dark:text-pearto-luna mb-6 flex items-center gap-2 transition-colors duration-300">
                            <BarChart3 className="h-6 w-6 text-slate-600 dark:text-pearto-cloud transition-colors duration-300" />
                            Performance & Analytics
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Price History Chart */}
                            <div className="bg-white dark:bg-pearto-card rounded-xl p-6 shadow-sm border border-slate-200 dark:border-pearto-border transition-colors duration-300">
                                <h5 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-blue-600" />
                                    Price History (30 Days)
                                </h5>
                                <div className="h-80">
                                    <Line data={priceChartData} options={chartOptions} />
                                </div>
                            </div>

                            {/* Portfolio Allocation */}
                            <div className="bg-white dark:bg-pearto-card rounded-xl p-6 shadow-sm border border-slate-200 dark:border-pearto-border transition-colors duration-300">
                                <h5 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <PieChart className="h-4 w-4 text-purple-600" />
                                    Portfolio Allocation
                                </h5>
                                <div className="h-80">
                                    <Pie data={allocationData} options={pieOptions} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div className="p-6 border-t border-slate-200 dark:border-pearto-border bg-white dark:bg-pearto-card transition-colors duration-300">
                        <h4 className="text-xl font-bold text-slate-900 dark:text-pearto-luna mb-6 flex items-center gap-2 transition-colors duration-300">
                            <Info className="h-6 w-6 text-slate-600 dark:text-pearto-cloud transition-colors duration-300" />
                            Detailed Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Market Data */}
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                                <h5 className="text-base font-semibold text-blue-800 mb-4 flex items-center gap-2">
                                    <Activity className="h-4 w-4" />
                                    Market Data
                                </h5>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-white dark:bg-pearto-card rounded-lg transition-colors duration-300">
                                        <span className="text-sm font-medium text-slate-600 dark:text-pearto-cloud transition-colors duration-300">52W High:</span>
                                        <span className="font-bold text-slate-900 dark:text-pearto-luna transition-colors duration-300">
                                            {marketData?.high52w ? formatPrice(marketData.high52w) : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white dark:bg-pearto-card rounded-lg transition-colors duration-300">
                                        <span className="text-sm font-medium text-slate-600 dark:text-pearto-cloud transition-colors duration-300">52W Low:</span>
                                        <span className="font-bold text-slate-900 dark:text-pearto-luna transition-colors duration-300">
                                            {marketData?.low52w ? formatPrice(marketData.low52w) : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white dark:bg-pearto-card rounded-lg transition-colors duration-300">
                                        <span className="text-sm font-medium text-slate-600 dark:text-pearto-cloud transition-colors duration-300">P/E Ratio:</span>
                                        <span className="font-bold text-slate-900 dark:text-pearto-luna transition-colors duration-300">
                                            {marketData?.peRatio?.toFixed(2) || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white dark:bg-pearto-card rounded-lg transition-colors duration-300">
                                        <span className="text-sm font-medium text-slate-600 dark:text-pearto-cloud transition-colors duration-300">Market Cap:</span>
                                        <span className="font-bold text-slate-900 dark:text-pearto-luna transition-colors duration-300">
                                            {marketData?.marketCap ?
                                                formatPrice(marketData.marketCap / 1000000000) + 'B' :
                                                'N/A'
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white dark:bg-pearto-card rounded-lg transition-colors duration-300">
                                        <span className="text-sm font-medium text-slate-600 dark:text-pearto-cloud transition-colors duration-300">Sector:</span>
                                        <span className="font-bold text-slate-900 dark:text-pearto-luna transition-colors duration-300">
                                            {marketData?.sector || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Investment Metrics */}
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                                <h5 className="text-base font-semibold text-purple-800 mb-4 flex items-center gap-2">
                                    <Info className="h-4 w-4" />
                                    Investment Metrics
                                </h5>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-white dark:bg-pearto-card rounded-lg transition-colors duration-300">
                                        <span className="text-sm font-medium text-slate-600 dark:text-pearto-cloud transition-colors duration-300">Portfolio Weight:</span>
                                        <span className="font-bold text-slate-900 dark:text-pearto-luna transition-colors duration-300">
                                            {((totalValue / 100000) * 100).toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white dark:bg-pearto-card rounded-lg transition-colors duration-300">
                                        <span className="text-sm font-medium text-slate-600 dark:text-pearto-cloud transition-colors duration-300">Daily Return:</span>
                                        <span className={`font-bold ${dayChange >= 0 ? 'text-green-600 dark:text-pearto-green' : 'text-red-600 dark:text-pearto-pink'
                                            }`}>
                                            {dayChange >= 0 ? '+' : ''}{dayChange.toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white dark:bg-pearto-card rounded-lg transition-colors duration-300">
                                        <span className="text-sm font-medium text-slate-600 dark:text-pearto-cloud transition-colors duration-300">YTD Return:</span>
                                        <span className="font-bold text-slate-900 dark:text-pearto-luna transition-colors duration-300">
                                            +{gainPercent.toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white dark:bg-pearto-card rounded-lg transition-colors duration-300">
                                        <span className="text-sm font-medium text-slate-600 dark:text-pearto-cloud transition-colors duration-300">Volatility:</span>
                                        <span className="font-bold text-slate-900 dark:text-pearto-luna transition-colors duration-300">
                                            {(Math.random() * 30 + 10).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction Summary */}
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                                <h5 className="text-base font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Transaction Summary
                                </h5>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-white dark:bg-pearto-card rounded-lg transition-colors duration-300">
                                        <span className="text-sm font-medium text-slate-600 dark:text-pearto-cloud transition-colors duration-300">Total Transactions:</span>
                                        <span className="font-bold text-slate-900 dark:text-pearto-luna transition-colors duration-300">
                                            {transactions.length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white dark:bg-pearto-card rounded-lg transition-colors duration-300">
                                        <span className="text-sm font-medium text-slate-600 dark:text-pearto-cloud transition-colors duration-300">First Purchase:</span>
                                        <span className="font-bold text-slate-900 dark:text-pearto-luna transition-colors duration-300">
                                            {transactions.length > 0 ?
                                                new Date(transactions[0].date).toLocaleDateString() :
                                                'N/A'
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white dark:bg-pearto-card rounded-lg transition-colors duration-300">
                                        <span className="text-sm font-medium text-slate-600 dark:text-pearto-cloud transition-colors duration-300">Last Transaction:</span>
                                        <span className="font-bold text-slate-900 dark:text-pearto-luna transition-colors duration-300">
                                            {transactions.length > 0 ?
                                                new Date(transactions[transactions.length - 1].date).toLocaleDateString() :
                                                'N/A'
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white dark:bg-pearto-card rounded-lg transition-colors duration-300">
                                        <span className="text-sm font-medium text-slate-600 dark:text-pearto-cloud transition-colors duration-300">Avg Hold Time:</span>
                                        <span className="font-bold text-slate-900 dark:text-pearto-luna transition-colors duration-300">
                                            {Math.floor(Math.random() * 365 + 30)} days
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
