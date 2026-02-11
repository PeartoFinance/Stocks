import React from "react";
import { TrendingUp, TrendingDown, Plus, BarChart3 } from "lucide-react";
import { Stock } from "../types";
import { useCurrency } from "../context/CurrencyContext";
import PriceDisplay from "./common/PriceDisplay";

interface StockHeaderProps {
  stock: Stock;
  isWatchlisted: boolean;
  toggleWatchlist: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function StockHeader({
  stock,
  isWatchlisted,
  toggleWatchlist,
  activeTab,
  setActiveTab
}: StockHeaderProps) {
  const { formatPrice, currency } = useCurrency();
  const isPositive = stock.change >= 0;



  const tabs = ["Overview", "Financials", "Forecast", "Statistics", "Metrics", "Dividends", "History", "Profile", "Chart"];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-pearto-luna transition-colors duration-300">{stock.name} ({stock.symbol})</h1>
          <p className="text-gray-600 dark:text-pearto-cloud transition-colors duration-300">NASDAQ: {stock.symbol} · Real-Time Price · <span className="font-semibold">{currency}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleWatchlist}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${isWatchlisted ? "bg-blue-600 dark:bg-pearto-blue text-white" : "bg-white dark:bg-pearto-card border border-gray-300 dark:border-pearto-border text-gray-700 dark:text-pearto-cloud hover:bg-gray-50 dark:hover:bg-pearto-surface"
              }`}
          >
            <Plus className="h-4 w-4" />
            Watchlist
          </button>
          <button
            onClick={() => window.location.href = `/stock/${stock.symbol}/compare`}
            className="px-4 py-2 bg-blue-600 dark:bg-pearto-pink text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 dark:hover:bg-pearto-pink-hover transition-all duration-300"
          >
            <BarChart3 className="h-4 w-4" />
            Compare
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-4">
          <PriceDisplay amount={stock.price} className="text-4xl font-bold text-gray-900 dark:text-pearto-luna transition-colors duration-300" />
          <div className={`flex items-center gap-1 ${isPositive ? "text-green-600 dark:text-pearto-green" : "text-red-600 dark:text-pearto-pink"} transition-colors duration-300`}>
            {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            <span className="font-medium flex items-center gap-1">
              <PriceDisplay amount={stock.change} showSign />
              <span>({stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%)</span>
            </span>
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-pearto-cloud hidden md:block transition-colors duration-300">
          <div>At close: Jan 16, 2026, 4:00 PM EST</div>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-pearto-border transition-colors duration-300">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-300 ${activeTab === tab ? "border-blue-500 dark:border-pearto-green text-blue-600 dark:text-pearto-green" : "border-transparent text-gray-500 dark:text-pearto-gray hover:text-gray-700 dark:hover:text-pearto-cloud hover:border-gray-300 dark:hover:border-pearto-border"
                }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}