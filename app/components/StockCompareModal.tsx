import React, { useState, useEffect } from 'react';
import { X, Search, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Stock } from '../types';
import { marketService } from '../utils/marketService';
import { useCurrency } from '../context/CurrencyContext';

interface StockCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSymbol?: string;
  initialStock?: Stock | null;
}

export default function StockCompareModal({
  isOpen,
  onClose,
  initialSymbol = '',
  initialStock = null
}: StockCompareModalProps) {
  const { formatPrice } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 1) {
      searchStocks();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const searchStocks = async () => {
    try {
      setLoading(true);
      const results = await marketService.searchStocks(searchTerm, 10);
      // Transform search results to Stock format
      const stocks: Stock[] = Array.isArray(results) ? results.map((item: any) => ({
        symbol: item.symbol,
        name: item.name,
        price: item.price || 0,
        change: item.change || 0,
        changePercent: item.changePercent || 0,
        marketCap: item.marketCap,
        peRatio: item.peRatio,
        sector: item.sector,
        volume: item.volume,
        eps: item.eps,
        beta: item.beta,
        dividendYield: item.dividendYield,
        week52High: item.high52w,
        week52Low: item.low52w,
      })) : [];
      setSearchResults(stocks);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | undefined | null, decimals = 2): string => {
    if (num == null) return '-';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const formatLargeNumber = (num: number | undefined | null): string => {
    if (num == null) return '-';
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    return num.toLocaleString();
  };

  const ComparisonRow = ({ label, value1, value2, format = 'number' }: {
    label: string;
    value1: any;
    value2: any;
    format?: 'number' | 'currency' | 'percent' | 'large';
  }) => {
    const formatValue = (val: any) => {
      if (val == null) return '-';
      switch (format) {
        case 'currency': return formatPrice(val);
        case 'percent': return `${formatNumber(val)}%`;
        case 'large': return formatLargeNumber(val);
        default: return formatNumber(val);
      }
    };

    return (
      <div className="grid grid-cols-3 gap-4 py-3 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <span className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">{label}</span>
        <span className="text-sm font-medium text-slate-900 dark:text-white text-center transition-colors duration-300">
          {formatValue(value1)}
        </span>
        <span className="text-sm font-medium text-slate-900 dark:text-white text-center transition-colors duration-300">
          {formatValue(value2)}
        </span>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
          <h2 className="text-xl font-medium text-slate-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Compare Stocks
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500 dark:text-pearto-gray transition-colors duration-300" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Search Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">
              Search for a stock to compare with {initialSymbol}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Enter symbol or company name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
              />
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 transition-colors duration-300">Search Results</h3>
              <div className="space-y-2">
                {searchResults.map((stock) => {
                  const isPositive = stock.change >= 0;
                  return (
                    <button
                      key={stock.symbol}
                      onClick={() => setSelectedStock(stock)}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white transition-colors duration-300">
                            {stock.name} ({stock.symbol})
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">{stock.sector}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-slate-900 dark:text-white transition-colors duration-300">
                            {formatPrice(stock.price)}
                          </p>
                          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600 dark:text-pearto-green' : 'text-red-600 dark:text-pearto-pink'
                            }`}>
                            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            <span>{isPositive ? '+' : ''}{formatNumber(stock.changePercent)}%</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comparison Table */}
          {selectedStock && initialStock && (
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 transition-colors duration-300">Comparison</h3>

              {/* Stock Headers */}
              <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors duration-300">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors duration-300">Metric</div>
                <div className="text-center">
                  <h4 className="font-medium text-slate-900 dark:text-white transition-colors duration-300">{initialStock.symbol}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">{initialStock.name}</p>
                </div>
                <div className="text-center">
                  <h4 className="font-medium text-slate-900 dark:text-white transition-colors duration-300">{selectedStock.symbol}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">{selectedStock.name}</p>
                </div>
              </div>

              {/* Comparison Rows */}
              <div className="space-y-1">
                <ComparisonRow
                  label="Current Price"
                  value1={initialStock.price}
                  value2={selectedStock.price}
                  format="currency"
                />
                <ComparisonRow
                  label="Change (%)"
                  value1={initialStock.changePercent}
                  value2={selectedStock.changePercent}
                  format="percent"
                />
                <ComparisonRow
                  label="Market Cap"
                  value1={initialStock.marketCap}
                  value2={selectedStock.marketCap}
                  format="large"
                />
                <ComparisonRow
                  label="P/E Ratio"
                  value1={initialStock.peRatio}
                  value2={selectedStock.peRatio}
                />
                <ComparisonRow
                  label="Volume"
                  value1={initialStock.volume}
                  value2={selectedStock.volume}
                  format="large"
                />
                <ComparisonRow
                  label="EPS"
                  value1={initialStock.eps}
                  value2={selectedStock.eps}
                  format="currency"
                />
                <ComparisonRow
                  label="Beta"
                  value1={initialStock.beta}
                  value2={selectedStock.beta}
                />
                <ComparisonRow
                  label="Dividend Yield (%)"
                  value1={initialStock.dividendYield ? initialStock.dividendYield * 100 : null}
                  value2={selectedStock.dividendYield ? selectedStock.dividendYield * 100 : null}
                  format="percent"
                />
                <ComparisonRow
                  label="52W High"
                  value1={initialStock.week52High}
                  value2={selectedStock.week52High}
                  format="currency"
                />
                <ComparisonRow
                  label="52W Low"
                  value1={initialStock.week52Low}
                  value2={selectedStock.week52Low}
                  format="currency"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 transition-colors duration-300">
                <button
                  onClick={() => window.open(`/stock/${selectedStock.symbol}`, '_blank')}
                  className="flex-1 px-4 py-2 bg-blue-600 dark:bg-pearto-blue hover:bg-blue-700 dark:hover:bg-pearto-blue-hover text-white rounded-lg font-medium transition-colors"
                >
                  View {selectedStock.symbol} Details
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {searchTerm.length > 1 && searchResults.length === 0 && !loading && (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2 transition-colors duration-300">
                No Results Found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 transition-colors duration-300">
                Try searching with a different symbol or company name.
              </p>
            </div>
          )}

          {/* Initial State */}
          {searchTerm.length <= 1 && (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2 transition-colors duration-300">
                Compare {initialSymbol} with Another Stock
              </h3>
              <p className="text-slate-500 dark:text-slate-400 transition-colors duration-300">
                Search for a stock symbol or company name to start comparing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}