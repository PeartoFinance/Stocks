'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { marketService } from '../../utils/marketService';
import { stockAPI } from '../../utils/api';

interface MarketMoversProps {
  onSelectStock: (stock: any) => void;
  formatPrice: (price: number) => string;
  className?: string;
}

export default function MarketMovers({
  onSelectStock,
  formatPrice,
  className = ''
}: MarketMoversProps) {
  const [topGainers, setTopGainers] = useState<any[]>([]);
  const [topLosers, setTopLosers] = useState<any[]>([]);
  const [marketLoading, setMarketLoading] = useState(false);
  const [sparklineData, setSparklineData] = useState<{ [key: string]: number[] }>({});
  
  const sparklineRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  // Draw sparkline using Canvas API
  const drawSparkline = useCallback((canvas: HTMLCanvasElement, data: number[], isPositive: boolean) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || data.length === 0) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const color = isPositive ? '#008016' : '#d0021b';
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '00');
    
    // Draw filled area
    ctx.beginPath();
    ctx.moveTo(0, height);
    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, []);

  // Draw sparklines when data changes
  useEffect(() => {
    Object.entries(sparklineData).forEach(([symbol, data]) => {
      const canvas = sparklineRefs.current[symbol];
      if (canvas && data.length > 0) {
        const stock = [...topGainers, ...topLosers].find(s => s.symbol === symbol);
        if (stock) {
          drawSparkline(canvas, data, stock.changePercent >= 0);
        }
      }
    });
  }, [sparklineData, topGainers, topLosers, drawSparkline]);

  const loadMarketMovers = useCallback(async () => {
    try {
      setMarketLoading(true);
      const [gainersResponse, losersResponse] = await Promise.all([
        stockAPI.getMarketMovers('gainers'),
        stockAPI.getMarketMovers('losers')
      ]);

      if (gainersResponse.success && Array.isArray(gainersResponse.data)) {
        setTopGainers(gainersResponse.data);
        // Load sparkline data for gainers
        gainersResponse.data.forEach(async (stock: any) => {
          try {
            const historyResponse = await marketService.getStockHistory(stock.symbol, '5d', '1d');
            if (Array.isArray(historyResponse)) {
              const prices = historyResponse.slice(-7).map((item: any) => item.close);
              setSparklineData(prev => ({ ...prev, [stock.symbol]: prices }));
            }
          } catch (error) {
            console.error(`Failed to load sparkline for ${stock.symbol}:`, error);
          }
        });
      }

      if (losersResponse.success && Array.isArray(losersResponse.data)) {
        setTopLosers(losersResponse.data);
        // Load sparkline data for losers
        losersResponse.data.forEach(async (stock: any) => {
          try {
            const historyResponse = await marketService.getStockHistory(stock.symbol, '5d', '1d');
            if (Array.isArray(historyResponse)) {
              const prices = historyResponse.slice(-7).map((item: any) => item.close);
              setSparklineData(prev => ({ ...prev, [stock.symbol]: prices }));
            }
          } catch (error) {
            console.error(`Failed to load sparkline for ${stock.symbol}:`, error);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load market movers:', error);
    } finally {
      setMarketLoading(false);
    }
  }, []);

  // Load market movers on mount
  useEffect(() => {
    loadMarketMovers();
    const interval = setInterval(loadMarketMovers, 30000);
    return () => clearInterval(interval);
  }, [loadMarketMovers]);

  const MarketMoverItem = ({ stock, isGainer }: { stock: any; isGainer: boolean }) => (
    <div
      onClick={() => onSelectStock(stock)}
      className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer rounded-lg transition-colors border border-gray-100 dark:border-slate-700"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate">{stock.symbol}</span>
          <Activity className="h-3 w-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{stock.name}</div>
      </div>
      
      <div className="w-12 h-6 flex-shrink-0">
        <canvas
          ref={(el) => {
            sparklineRefs.current[stock.symbol] = el;
          }}
          width={48}
          height={24}
          className="w-full h-full"
        />
      </div>
      
      <div className="text-right flex-shrink-0">
        <div className={`text-xs font-medium tabular-nums ${
          isGainer ? 'text-[#008016]' : 'text-[#d0021b]'
        }`}>
          {formatPrice(stock.price || 0)}
        </div>
        <div className={`text-xs font-medium tabular-nums ${
          isGainer ? 'text-[#008016]' : 'text-[#d0021b]'
        }`}>
          {isGainer ? '+' : ''}{(stock.changePercent || 0).toFixed(2)}%
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Market Movers</h3>
        {marketLoading && (
          <RefreshCw className="h-3 w-3 text-slate-400 animate-spin" />
        )}
      </div>
      
      {/* 2-Column Layout */}
      <div className="grid grid-cols-2 gap-3">
        {/* Top Gainers Column */}
        <div>
          <div className="flex items-center gap-1 mb-2 p-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
            <TrendingUp className="h-3 w-3 text-[#008016]" />
            <span className="text-xs font-medium text-[#008016]">Gainers</span>
          </div>
          <div className="space-y-1">
            {topGainers.slice(0, 5).map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock)}
                className="p-2 border border-green-200 dark:border-green-700 rounded-lg hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate">{stock.symbol}</span>
                  <Activity className="h-2.5 w-2.5 text-green-500 flex-shrink-0" />
                </div>
                <div className="text-xs text-gray-600 dark:text-slate-400 truncate mb-1">
                  {stock.name ? (stock.name.split(' ')[0].length > 6 ? stock.name.split(' ')[0].substring(0, 6) : stock.name.split(' ')[0]) : ''}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{formatPrice(stock.price || 0)}</span>
                  <span className="text-xs font-medium text-[#008016]">
                    +{(stock.changePercent || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Top Losers Column */}
        <div>
          <div className="flex items-center gap-1 mb-2 p-2 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg">
            <TrendingDown className="h-3 w-3 text-[#d0021b]" />
            <span className="text-xs font-medium text-[#d0021b]">Losers</span>
          </div>
          <div className="space-y-1">
            {topLosers.slice(0, 5).map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock)}
                className="p-2 border border-red-200 dark:border-red-700 rounded-lg hover:border-red-400 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate">{stock.symbol}</span>
                  <Activity className="h-2.5 w-2.5 text-red-500 flex-shrink-0" />
                </div>
                <div className="text-xs text-gray-600 dark:text-slate-400 truncate mb-1">
                  {stock.name ? (stock.name.split(' ')[0].length > 6 ? stock.name.split(' ')[0].substring(0, 6) : stock.name.split(' ')[0]) : ''}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{formatPrice(stock.price || 0)}</span>
                  <span className="text-xs font-medium text-[#d0021b]">
                    {(stock.changePercent || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
