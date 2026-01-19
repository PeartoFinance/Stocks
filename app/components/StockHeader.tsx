import React from "react";
import { TrendingUp, TrendingDown, Plus, BarChart3 } from "lucide-react";
import { Stock } from "../types";

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
  const isPositive = stock.change >= 0;
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatChange = (change: number, percent: number) =>
    `${change >= 0 ? "+" : ""}${change.toFixed(2)} (${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%)`;

  const tabs = ["Overview", "Financials", "Forecast", "Statistics", "Metrics", "Dividends", "History", "Profile", "Chart"];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{stock.name} ({stock.symbol})</h1>
          <p className="text-gray-600">NASDAQ: {stock.symbol} · Real-Time Price · USD</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleWatchlist}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              isWatchlisted ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Plus className="h-4 w-4" />
            Watchlist
          </button>
          <button 
            onClick={() => window.location.href = `/stock/${stock.symbol}/compare`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            Compare
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-4xl font-bold text-gray-900">{formatPrice(stock.price)}</span>
          <div className={`flex items-center gap-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            <span className="font-medium">{formatChange(stock.change, stock.changePercent)}</span>
          </div>
        </div>
        <div className="text-sm text-gray-600 hidden md:block">
          <div>At close: Jan 16, 2026, 4:00 PM EST</div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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