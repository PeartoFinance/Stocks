import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Users, Calendar, Loader2 } from 'lucide-react';
import { marketService } from '../../utils/marketService';
import toast from 'react-hot-toast';

interface AnalystRecommendation {
  firm: string;
  toGrade: string;
  fromGrade?: string;
  action: string;
  date: string;
}

interface AnalystForecast {
  symbol: string;
  targetHigh: number | null;
  targetLow: number | null;
  targetMean: number | null;
  targetMedian: number | null;
  currentPrice: number | null;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
  recommendations?: AnalystRecommendation[];
}

interface ForecastTabProps {
  symbol: string;
  currentPrice: number;
}

export default function ForecastTab({ symbol, currentPrice }: ForecastTabProps) {
  const [forecast, setForecast] = useState<AnalystForecast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecastData = async () => {
      try {
        setLoading(true);
        const data = await marketService.getStockForecast(symbol);
        setForecast(data as AnalystForecast);
      } catch (error) {
        console.error('Failed to load forecast data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForecastData();
  }, [symbol]);

  const getRatingColor = (rating: string) => {
    const normalizedRating = rating.toLowerCase();
    if (normalizedRating.includes('strong buy') || normalizedRating.includes('strongbuy')) return 'text-green-700 bg-green-100 dark:bg-pearto-green/10';
    if (normalizedRating.includes('buy')) return 'text-green-600 dark:text-pearto-green bg-green-50 dark:bg-pearto-green/10';
    if (normalizedRating.includes('hold')) return 'text-yellow-600 bg-yellow-50';
    if (normalizedRating.includes('sell')) return 'text-red-600 dark:text-pearto-pink bg-red-50 dark:bg-pearto-pink/10';
    return 'text-gray-600 dark:text-pearto-cloud bg-gray-50 dark:bg-pearto-surface';
  };

  const calculateUpside = (targetPrice: number | null, currentPrice: number) => {
    if (!targetPrice) return 0;
    return ((targetPrice - currentPrice) / currentPrice) * 100;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8 transition-colors duration-300">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8 transition-colors duration-300">
        <p className="text-center text-slate-500 dark:text-slate-400 transition-colors duration-300">No forecast data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Price Target Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
          <Target className="h-5 w-5 text-blue-500" />
          Analyst Price Targets
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors duration-300">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 transition-colors duration-300">Current Price</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white transition-colors duration-300">
              ${(forecast.currentPrice || currentPrice).toFixed(2)}
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg transition-colors duration-300">
            <p className="text-sm text-green-600 dark:text-green-400 mb-1 transition-colors duration-300">Average Target</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300 transition-colors duration-300">
              ${(forecast.targetMean || 0).toFixed(2)}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 transition-colors duration-300">
              {forecast.targetMean ? `${calculateUpside(forecast.targetMean, currentPrice) > 0 ? '+' : ''}${calculateUpside(forecast.targetMean, currentPrice).toFixed(1)}%` : '-'}
            </p>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors duration-300">
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-1 transition-colors duration-300">High Target</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 transition-colors duration-300">
              ${(forecast.targetHigh || 0).toFixed(2)}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 transition-colors duration-300">
              {forecast.targetHigh ? `+${calculateUpside(forecast.targetHigh, currentPrice).toFixed(1)}%` : '-'}
            </p>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors duration-300">
            <p className="text-sm text-red-600 dark:text-red-400 mb-1 transition-colors duration-300">Low Target</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300 transition-colors duration-300">
              ${(forecast.targetLow || 0).toFixed(2)}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 transition-colors duration-300">
              {forecast.targetLow ? `${calculateUpside(forecast.targetLow, currentPrice).toFixed(1)}%` : '-'}
            </p>
          </div>
        </div>

        {/* Price Target Visualization */}
        {forecast.targetLow && forecast.targetHigh && (
          <div className="relative">
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden transition-colors duration-300">
              <div 
                className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400"
                style={{ width: '100%' }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
              <span>${forecast.targetLow.toFixed(0)}</span>
              <span className="font-medium">Current: ${currentPrice.toFixed(0)}</span>
              <span>${forecast.targetHigh.toFixed(0)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Analyst Recommendations */}
      {forecast.recommendations && forecast.recommendations.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
            <Users className="h-5 w-5 text-purple-500" />
            Recent Analyst Recommendations
          </h3>
          
          <div className="space-y-4">
            {forecast.recommendations.slice(0, 5).map((rec, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors duration-300">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white transition-colors duration-300">{rec.firm}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <span className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
                        {new Date(rec.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRatingColor(rec.toGrade)}`}>
                    {rec.toGrade}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-pearto-gray transition-colors duration-300">{rec.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 transition-colors duration-300">
          Recommendation Summary
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Strong Buy', count: forecast.strongBuy, color: 'green' },
            { label: 'Buy', count: forecast.buy, color: 'blue' },
            { label: 'Hold', count: forecast.hold, color: 'yellow' },
            { label: 'Sell', count: forecast.sell, color: 'orange' },
            { label: 'Strong Sell', count: forecast.strongSell, color: 'red' },
          ].map((item) => {
            const total = forecast.strongBuy + forecast.buy + forecast.hold + forecast.sell + forecast.strongSell;
            const percentage = total > 0 ? (item.count / total) * 100 : 0;
            
            return (
              <div key={item.label} className="text-center">
                <div className={`w-full h-2 rounded-full mb-2 bg-${item.color}-100`}>
                  <div 
                    className={`h-full rounded-full bg-${item.color}-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 transition-colors duration-300">{item.label}</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white transition-colors duration-300">{item.count}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}