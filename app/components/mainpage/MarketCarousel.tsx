'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Building, Globe, Users } from 'lucide-react';

interface MarketCarouselProps {
  className?: string;
}

interface MarketItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: string;
}

export default function MarketCarousel({ className = '' }: MarketCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for trending markets
    const mockData: MarketItem[] = [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 195.89, change: 2.45, changePercent: 1.27, volume: '52.3M' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 139.62, change: -1.23, changePercent: -0.87, volume: '28.1M' },
      { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change: 5.67, changePercent: 1.52, volume: '22.4M' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.35, change: -0.95, changePercent: -0.53, volume: '38.7M' },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 242.68, change: 8.92, changePercent: 3.81, volume: '118.5M' },
      { symbol: 'META', name: 'Meta Platforms', price: 492.18, change: 12.34, changePercent: 2.57, volume: '19.2M' },
    ];
    
    setItems(mockData);
    setLoading(false);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="ml-3 text-gray-600">Loading market data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <span className="w-2 h-6 bg-emerald-600 rounded-full mr-3"></span>
          Trending Markets
        </h2>
        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            <TrendingUp className="h-4 w-4 rotate-90" />
          </button>
          <button
            onClick={nextSlide}
            className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            <TrendingUp className="h-4 w-4 -rotate-90" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {items.map((item, index) => (
            <div key={item.symbol} className="w-full flex-shrink-0 px-2">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border border-emerald-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.symbol}</div>
                    <div className="text-xs text-gray-500">{item.name}</div>
                  </div>
                  <div className={`text-lg font-bold ${
                    item.changePercent >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    ${item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">${item.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.changePercent >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`font-medium ${
                      item.changePercent >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
                {item.volume && (
                  <div className="mt-2 pt-2 border-t border-emerald-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Users className="h-3 w-3" />
                      <span>Vol: {item.volume}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex 
                ? 'bg-emerald-600' 
                : 'bg-gray-300 hover:bg-emerald-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
