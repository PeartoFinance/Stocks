'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, RefreshCw, TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Gauge, Target } from 'lucide-react';
import { getTechnicalAnalysis } from '@/app/utils/technicalAnalysis';
import { stockAPI } from '@/app/utils/api';
import toast from 'react-hot-toast';
import RiskAnalysisChart from '@/app/components/analysis/RiskAnalysisChart';
import { useCurrency } from '@/app/context/CurrencyContext';

interface TechnicalData {
  symbol: string;
  price: number;
  summary: {
    score: number;
    signal: string;
    oscillatorsScore: number;
    movingAveragesScore: number;
    counts: {
      oscillators: { buy: number; sell: number; neutral: number };
      movingAverages: { buy: number; sell: number; neutral: number };
    };
  };
  indicators: {
    rsi: { value: number; signal: string };
    stoch: { k: number; signal: string };
    macd: { value: number; signal: string };
    cci: { value: number; signal: string };
    movingAverages: Array<{ name: string; value: number; signal: string }>;
  };
  quote?: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume?: number;
    marketCap?: number;
    week52High?: number;
    week52Low?: number;
  };
}

export default function AnalysisPage() {
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ symbol: string; name: string }>>([]);
  const [analysis, setAnalysis] = useState<TechnicalData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stockParam = searchParams.get('stock');
    if (stockParam) {
      handleSelectStock(stockParam);
    }
  }, [searchParams]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await stockAPI.searchStocks(query);
      setSuggestions(response.data.slice(0, 8));
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSelectStock = async (symbol: string) => {
    setSearchQuery(symbol);
    setSuggestions([]);
    setLoading(true);
    try {
      const [analysisData, quoteData] = await Promise.all([
        getTechnicalAnalysis(symbol),
        stockAPI.getStockQuote(symbol)
      ]);
      setAnalysis({ ...analysisData, quote: quoteData.data });
    } catch (error) {
      toast.error('Failed to fetch analysis');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getSignalColor = (signal: string) => {
    if (signal === 'Buy' || signal === 'Strong Buy') return 'text-green-600 dark:text-green-400';
    if (signal === 'Sell' || signal === 'Strong Sell') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getSignalBg = (signal: string) => {
    if (signal === 'Buy' || signal === 'Strong Buy') return 'bg-green-100 dark:bg-green-900/30';
    if (signal === 'Sell' || signal === 'Strong Sell') return 'bg-red-100 dark:bg-red-900/30';
    return 'bg-gray-100 dark:bg-gray-800';
  };

  const CompassChart = ({ score }: { score: number }) => {
    // Clamp score between -10 and 10
    const clampedScore = Math.max(-10, Math.min(10, score));
    // Map score from -10 to +10 to rotation angle from -90deg to +90deg
    const rotation = (clampedScore / 10) * 90;

    return (
      <div className="relative w-48 h-32 md:w-64 md:h-40 mx-auto">
        <svg viewBox="0 0 240 140" className="w-full h-full drop-shadow-lg">
          <defs>
            <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f87171" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <path d="M 30 110 A 90 90 0 0 1 210 110" fill="none" stroke="url(#redGrad)" strokeWidth="24" strokeLinecap="round" />
          <path d="M 75 90 A 90 90 0 0 1 165 90" fill="none" stroke="url(#yellowGrad)" strokeWidth="24" strokeLinecap="round" />
          <path d="M 105 70 A 90 90 0 0 1 135 70" fill="none" stroke="url(#greenGrad)" strokeWidth="24" strokeLinecap="round" />
          <g transform={`rotate(${rotation}, 120, 110)`} style={{ transition: 'transform 0.7s ease-out' }}>
            <line x1="120" y1="110" x2="120" y2="40" stroke="#1f2937" strokeWidth="4" className="dark:stroke-white" strokeLinecap="round" />
          </g>
          <circle cx="120" cy="110" r="8" fill="#1f2937" className="dark:fill-white" />
          <circle cx="120" cy="110" r="4" fill="#ef4444" />
        </svg>
        <div className="absolute bottom-2 left-2 text-xs md:text-sm font-bold text-red-600 dark:text-red-400">SELL</div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400">NEUTRAL</div>
        <div className="absolute bottom-2 right-2 text-xs md:text-sm font-bold text-green-600 dark:text-green-400">BUY</div>
      </div>
    );
  };

  const RSIGauge = ({ value }: { value: number }) => {
    const getColor = () => {
      if (value < 30) return 'bg-green-500';
      if (value > 70) return 'bg-red-500';
      return 'bg-yellow-500';
    };
    const percentage = (value / 100) * 100;
    return (
      <div className="relative h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="w-[30%] bg-green-200 dark:bg-green-900/40" />
          <div className="w-[40%] bg-yellow-200 dark:bg-yellow-900/40" />
          <div className="w-[30%] bg-red-200 dark:bg-red-900/40" />
        </div>
        <div className={`absolute top-0 left-0 h-full ${getColor()} transition-all duration-500`} style={{ width: `${percentage}%` }} />
        <div className="absolute top-1/2 -translate-y-1/2 h-5 w-1 bg-gray-900 dark:bg-white rounded transition-all duration-500" style={{ left: `${percentage}%` }} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/95 pt-10 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Technical Analysis</h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-gray-400">Advanced indicators and buy/sell signals</p>
        </div>

        <div className="relative mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search stocks (e.g., AAPL, TSLA)..."
              className="w-full pl-12 pr-4 py-3 md:py-4 text-sm md:text-base rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl shadow-lg max-h-80 overflow-y-auto z-50">
              {suggestions.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => handleSelectStock(stock.symbol)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-gray-700 border-b border-slate-100 dark:border-gray-700 last:border-b-0"
                >
                  <div className="font-semibold text-slate-900 dark:text-white">{stock.symbol}</div>
                  <div className="text-sm text-slate-600 dark:text-gray-400">{stock.name}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <div className="min-h-screen bg-gray-50 dark:bg-slate-900/95 flex items-center justify-center transition-colors duration-300">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        )}

        {!loading && analysis && (
          <div className="space-y-6">
            {/* Stock Header with Details */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-4 md:p-6 border border-green-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 md:gap-3 mb-2">
                    <h2 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white">{analysis.symbol}</h2>
                    <div className={`px-2 md:px-4 py-1 md:py-1.5 rounded-lg font-bold text-xs md:text-sm ${getSignalBg(analysis.summary.signal)} ${getSignalColor(analysis.summary.signal)}`}>
                      {analysis.summary.signal}
                    </div>
                  </div>
                  {analysis.quote && <p className="text-slate-600 dark:text-gray-400 text-xs md:text-sm">{analysis.quote.name}</p>}
                  <div className="flex items-baseline gap-2 md:gap-3 mt-3 md:mt-4">
                    <span className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white">{formatPrice(analysis.price)}</span>
                    {analysis.quote && (
                      <div className="flex items-center gap-2">
                        {analysis.quote.change >= 0 ? (
                          <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                        )}
                        <span className={`text-sm md:text-xl font-semibold ${analysis.quote.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {analysis.quote.change >= 0 ? '+' : ''}{formatPrice(analysis.quote.change)} ({analysis.quote.changePercent >= 0 ? '+' : ''}{analysis.quote.changePercent.toFixed(2)}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {analysis.quote && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-3 md:p-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-gray-400 text-[10px] md:text-xs mb-1">
                        <Activity className="h-3 w-3" />
                        Volume
                      </div>
                      <div className="text-sm md:text-lg font-bold text-slate-900 dark:text-white">{((analysis.quote.volume || 0) / 1000000).toFixed(2)}M</div>
                    </div>
                    {analysis.quote.marketCap && (
                      <div className="bg-white dark:bg-gray-700 rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-gray-400 text-[10px] md:text-xs mb-1">
                          <DollarSign className="h-3 w-3" />
                          Market Cap
                        </div>
                        <div className="text-sm md:text-lg font-bold text-slate-900 dark:text-white">{formatPrice((analysis.quote.marketCap || 0) / 1000000000, 2)}B</div>
                      </div>
                    )}
                    {analysis.quote.week52High && (
                      <div className="bg-white dark:bg-gray-700 rounded-xl p-3 md:p-4">
                        <div className="text-slate-600 dark:text-gray-400 text-[10px] md:text-xs mb-1">52W High</div>
                        <div className="text-sm md:text-lg font-bold text-slate-900 dark:text-white">{formatPrice(analysis.quote.week52High)}</div>
                      </div>
                    )}
                    {analysis.quote.week52Low && (
                      <div className="bg-white dark:bg-gray-700 rounded-xl p-3 md:p-4">
                        <div className="text-slate-600 dark:text-gray-400 text-[10px] md:text-xs mb-1">52W Low</div>
                        <div className="text-sm md:text-lg font-bold text-slate-900 dark:text-white">{formatPrice(analysis.quote.week52Low)}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <RiskAnalysisChart symbol={analysis.symbol} />
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-4 md:p-8 border border-slate-200 dark:border-gray-700 shadow-xl">
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <div className="p-1.5 md:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Gauge className="h-4 w-4 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-base md:text-xl font-bold text-slate-900 dark:text-white">Overall Signal</h3>
                </div>
                <CompassChart score={analysis.summary.score} />
                <div className="text-center mt-4 md:mt-8">
                  <div className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">{analysis.summary.score.toFixed(1)}</div>
                  <div className="text-xs md:text-sm text-slate-600 dark:text-gray-400 mb-3 md:mb-4">Technical Score (-10 to +10)</div>
                  <div className={`inline-block px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-lg ${getSignalBg(analysis.summary.signal)} ${getSignalColor(analysis.summary.signal)} shadow-lg`}>
                    {analysis.summary.signal}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-gray-700 shadow-lg">
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <div className="p-1.5 md:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Signal Breakdown</h3>
                </div>
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      <span className="text-xs md:text-sm font-medium text-slate-600 dark:text-gray-400">Oscillators</span>
                      <span className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{analysis.summary.oscillatorsScore}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${(analysis.summary.counts.oscillators.buy / 4) * 100}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400 w-8">{analysis.summary.counts.oscillators.buy}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500" style={{ width: `${(analysis.summary.counts.oscillators.sell / 4) * 100}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-red-600 dark:text-red-400 w-8">{analysis.summary.counts.oscillators.sell}</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 dark:border-gray-700 pt-3 md:pt-4">
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      <span className="text-xs md:text-sm font-medium text-slate-600 dark:text-gray-400">Moving Averages</span>
                      <span className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{analysis.summary.movingAveragesScore}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${(analysis.summary.counts.movingAverages.buy / 10) * 100}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400 w-8">{analysis.summary.counts.movingAverages.buy}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500" style={{ width: `${(analysis.summary.counts.movingAverages.sell / 10) * 100}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-red-600 dark:text-red-400 w-8">{analysis.summary.counts.movingAverages.sell}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-4 md:p-6 border border-blue-200 dark:border-gray-700 shadow-lg">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <div className="p-1.5 md:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Target className="h-4 w-4 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-base md:text-xl font-bold text-slate-900 dark:text-white">Key Oscillators</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="p-3 md:p-5 rounded-xl bg-white dark:bg-gray-700 border-2 border-slate-100 dark:border-gray-600 hover:shadow-lg transition-shadow">
                  <div className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1 md:mb-2">RSI (14)</div>
                  <div className="text-xl md:text-3xl font-black text-slate-900 dark:text-white mb-1 md:mb-2">{analysis.indicators.rsi.value.toFixed(1)}</div>
                  <RSIGauge value={analysis.indicators.rsi.value} />
                  <div className={`text-xs md:text-sm font-bold mt-2 md:mt-3 ${getSignalColor(analysis.indicators.rsi.signal)}`}>{analysis.indicators.rsi.signal}</div>
                </div>
                <div className="p-3 md:p-5 rounded-xl bg-white dark:bg-gray-700 border-2 border-slate-100 dark:border-gray-600 hover:shadow-lg transition-shadow">
                  <div className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1 md:mb-2">Stochastic %K</div>
                  <div className="text-xl md:text-3xl font-black text-slate-900 dark:text-white mb-1 md:mb-2">{analysis.indicators.stoch.k.toFixed(1)}</div>
                  <RSIGauge value={analysis.indicators.stoch.k} />
                  <div className={`text-xs md:text-sm font-bold mt-2 md:mt-3 ${getSignalColor(analysis.indicators.stoch.signal)}`}>{analysis.indicators.stoch.signal}</div>
                </div>
                <div className="p-3 md:p-5 rounded-xl bg-white dark:bg-gray-700 border-2 border-slate-100 dark:border-gray-600 hover:shadow-lg transition-shadow">
                  <div className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1 md:mb-2">MACD (12,26)</div>
                  <div className="text-xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 md:mb-4">{analysis.indicators.macd.value.toFixed(2)}</div>
                  <div className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold text-center ${getSignalBg(analysis.indicators.macd.signal)} ${getSignalColor(analysis.indicators.macd.signal)}`}>{analysis.indicators.macd.signal}</div>
                </div>
                <div className="p-3 md:p-5 rounded-xl bg-white dark:bg-gray-700 border-2 border-slate-100 dark:border-gray-600 hover:shadow-lg transition-shadow">
                  <div className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1 md:mb-2">CCI (20)</div>
                  <div className="text-xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 md:mb-4">{analysis.indicators.cci.value.toFixed(0)}</div>
                  <div className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold text-center ${getSignalBg(analysis.indicators.cci.signal)} ${getSignalColor(analysis.indicators.cci.signal)}`}>{analysis.indicators.cci.signal}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-4 md:p-6 border border-purple-200 dark:border-gray-700 shadow-lg">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-1.5 md:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Activity className="h-4 w-4 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-base md:text-xl font-bold text-slate-900 dark:text-white">Moving Averages</h3>
                </div>
                <div className="text-xs md:text-sm text-slate-600 dark:text-gray-400">Price vs MA</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                {analysis.indicators.movingAverages.map((ma, idx) => {
                  const priceDiff = ((analysis.price - ma.value) / ma.value) * 100;
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 hover:shadow-md transition-all">
                      <div className="flex-1">
                        <div className="font-bold text-sm md:text-base text-slate-900 dark:text-white mb-1">{ma.name}</div>
                        <div className="text-xs md:text-sm text-slate-600 dark:text-gray-400">{formatPrice(ma.value)}</div>
                        <div className={`text-[10px] md:text-xs font-semibold mt-1 ${priceDiff >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {priceDiff >= 0 ? '+' : ''}{priceDiff.toFixed(2)}%
                        </div>
                      </div>
                      <div className={`px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold ${getSignalBg(ma.signal)} ${getSignalColor(ma.signal)}`}>
                        {ma.signal}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!loading && !analysis && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Search for a stock</h3>
            <p className="text-slate-600 dark:text-gray-400">Enter a stock symbol to view technical analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}
