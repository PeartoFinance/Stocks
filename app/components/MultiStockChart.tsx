'use client';

import React, { useEffect, useRef } from 'react';
import { 
  createChart, 
  ColorType, 
  LineSeries, 
  IChartApi,
  Time,
  SeriesMarker
} from 'lightweight-charts';
import { HistoricalData } from '../types';

interface StockChartData {
  symbol: string;
  name: string;
  color: string;
  data: HistoricalData[];
  currentPrice: number;
  change: number;
  changePercent: number;
}

interface MultiStockChartProps {
  stocks: StockChartData[];
  height?: number;
  period: string;
}

export default function MultiStockChart({ stocks, height = 400, period }: MultiStockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || stocks.length === 0) return;

    // 1. Initialize Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#6b7280',
        attributionLogo: false, 
      },
      width: chartContainerRef.current.clientWidth,
      height,
      grid: {
        vertLines: { color: 'rgba(243, 244, 246, 0.5)' },
        horzLines: { color: 'rgba(243, 244, 246, 0.5)' },
      },
      timeScale: {
        borderColor: '#e5e7eb',
        timeVisible: period === '1D',
        secondsVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
      },
      crosshair: {
        mode: 1, 
        vertLine: {
          width: 1,
          color: 'rgba(107, 114, 128, 0.5)',
          style: 2, 
        },
        horzLine: {
          width: 1,
          color: 'rgba(107, 114, 128, 0.5)',
          style: 2, 
        },
      },
    });

    chartRef.current = chart;

    // 2. Data Formatting Helpers
    const formatTime = (dateStr: string): Time => {
      if (dateStr.includes('T')) {
        const date = new Date(dateStr);
        return Math.floor(date.getTime() / 1000) as Time;
      }
      return dateStr.split('T')[0] as Time;
    };

    const normalizeToPercentage = (data: HistoricalData[]) => {
      if (data.length === 0) return [];
      const basePrice = data[0].close;
      return data.map(item => ({
        time: formatTime(item.date),
        value: ((item.close - basePrice) / basePrice) * 100
      }));
    };

    // 3. Add Series and Markers
    stocks.forEach((stock) => {
      if (stock.data && stock.data.length > 0) {
        // v5 API: Use chart.addSeries with the Series Class
        const series = chart.addSeries(LineSeries, {
          color: stock.color,
          lineWidth: 2,
          title: stock.symbol,
          priceFormat: {
            type: 'custom',
            formatter: (price: number) => `${price.toFixed(2)}%`,
          },
        });

        const normalizedData = normalizeToPercentage(stock.data);
        series.setData(normalizedData);

        // Generate markers for significant moves
        const markers: SeriesMarker<Time>[] = [];
        for (let i = 1; i < normalizedData.length; i++) {
          const current = normalizedData[i];
          const previous = normalizedData[i - 1];
          const change = Math.abs(current.value - previous.value);
          
          if (change > 5) {
            markers.push({
              time: current.time,
              position: current.value > previous.value ? 'aboveBar' : 'belowBar',
              color: current.value > previous.value ? '#16a34a' : '#dc2626',
              shape: 'circle',
              text: `${stock.symbol}: ${change.toFixed(1)}%`,
            });
          }
        }
        
        if (markers.length > 0) {
          // Casting to any to resolve the TypeScript interface limitation in v5
          (series as any).setMarkers(markers);
        }
      }
    });

    // 4. Manual Legend Construction
    const legend = document.createElement('div');
    Object.assign(legend.style, {
      position: 'absolute',
      top: '12px',
      left: '12px',
      zIndex: '10',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontFamily: 'sans-serif',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      pointerEvents: 'none'
    });
    
    const legendContent = stocks.map(stock => 
      `<div style="display: flex; align-items: center; margin-bottom: 4px;">
        <div style="width: 12px; height: 2px; background-color: ${stock.color}; margin-right: 8px;"></div>
        <span style="color: #374151; font-weight: 500;">
          ${stock.symbol}: ${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%
        </span>
      </div>`
    ).join('');
    
    legend.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 6px; color: #111827;">Performance Comparison</div>
      ${legendContent}
    `;
    
    chartContainerRef.current.appendChild(legend);

    // 5. Finalize view and Resize Handling
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    // 6. Cleanup
    return () => {
      resizeObserver.disconnect();
      if (legend.parentNode) {
        legend.parentNode.removeChild(legend);
      }
      chart.remove();
    };
  }, [stocks, height, period]);

  return (
    <div className="w-full overflow-hidden relative border border-gray-200 rounded-xl bg-white">
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}