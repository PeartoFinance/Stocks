'use client';

import React, { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  LineSeries,
  AreaSeries,
  CandlestickSeries,
  IChartApi,
  Time
} from 'lightweight-charts';
import { HistoricalData } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';

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
  chartType?: 'line' | 'area' | 'candle';
}

export default function MultiStockChart({ stocks, height = 300, period, chartType = 'line' }: MultiStockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { theme } = useTheme();
  const { convertPrice, formatPrice, currency } = useCurrency();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!chartContainerRef.current || stocks.length === 0) return;

    // 1. Initialize Chart with improved styling
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: isDark ? '#dadada' : '#6b7280',
        attributionLogo: false,
      },
      width: chartContainerRef.current.clientWidth,
      height,
      grid: {
        vertLines: { color: isDark ? 'rgba(44, 44, 44, 0.5)' : 'rgba(243, 244, 246, 0.3)' },
        horzLines: { color: isDark ? 'rgba(44, 44, 44, 0.5)' : 'rgba(243, 244, 246, 0.3)' },
      },
      timeScale: {
        borderColor: isDark ? '#2C2C2C' : '#e5e7eb',
        timeVisible: period === '1D', // Show time labels for 1D period (minute data)
        secondsVisible: period === '1D', // Show seconds for minute-wise data
        rightOffset: 12,
        barSpacing: period === '1D' ? 1 : 3, // Tighter spacing for minute data
        fixLeftEdge: true,
        lockVisibleTimeRangeOnResize: true,
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: isDark ? 'rgba(218, 218, 218, 0.4)' : 'rgba(107, 114, 128, 0.4)',
          style: 2,
        },
        horzLine: {
          width: 1,
          color: isDark ? 'rgba(218, 218, 218, 0.4)' : 'rgba(107, 114, 128, 0.4)',
          style: 2,
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
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

    const normalizeToActualPrice = (data: HistoricalData[]) => {
      if (data.length === 0) return [];
      return data.map(item => ({
        time: formatTime(item.date),
        value: item.close,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close
      }));
    };

    // 3. Add Series with chart type selection
    stocks.forEach((stock, index) => {
      if (stock.data && stock.data.length > 0) {
        const color = index === 0 ? '#16a34a' : stock.color; // Use green for first stock

        let series;
        const normalizedData = normalizeToActualPrice(stock.data);

        if (chartType === 'area') {
          series = chart.addSeries(AreaSeries, {
            topColor: `${color}20`,
            bottomColor: `${color}05`,
            lineColor: color,
            lineWidth: 2,
            crosshairMarkerVisible: true,
            priceFormat: {
              type: 'price',
              precision: 2,
              minMove: 0.01,
            },
          });
          series.setData(normalizedData.map(d => ({ time: d.time, value: d.value })));
        } else if (chartType === 'candle') {
          series = chart.addSeries(CandlestickSeries, {
            upColor: '#16a34a',
            downColor: '#dc2626',
            borderVisible: false,
            wickUpColor: '#16a34a',
            wickDownColor: '#dc2626',
            priceFormat: {
              type: 'price',
              precision: 2,
              minMove: 0.01,
            },
          });
          series.setData(normalizedData.map(d => ({
            time: d.time,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close
          })));
        } else {
          series = chart.addSeries(LineSeries, {
            color: color,
            lineWidth: 2,
            crosshairMarkerVisible: true,
            priceFormat: {
              type: 'price',
              precision: 2,
              minMove: 0.01,
            },
          });
          series.setData(normalizedData.map(d => ({ time: d.time, value: d.value })));
        }
      }
    });

    // 4. Compact Legend
    const legend = document.createElement('div');
    Object.assign(legend.style, {
      position: 'absolute',
      top: '6px',
      left: '6px',
      zIndex: '10',
      backgroundColor: isDark ? 'rgba(17, 17, 17, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '10px',
      fontFamily: 'Inter, system-ui, sans-serif',
      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
      pointerEvents: 'none',
      border: isDark ? '1px solid rgba(44, 44, 44, 0.5)' : '1px solid rgba(229, 231, 235, 0.5)'
    });

    const legendContent = stocks.map((stock, index) => {
      const color = index === 0 ? '#16a34a' : stock.color;
      const textColor = isDark ? '#F8E1C3' : '#374151';
      return `<div style="display: flex; align-items: center; margin-bottom: 2px; gap: 4px;">
        <div style="width: 8px; height: 2px; background-color: ${color}; border-radius: 1px;"></div>
        <span style="color: ${textColor}; font-weight: 500; font-size: 9px; line-height: 1.2;">
          ${stock.symbol}: ${formatPrice(stock.currentPrice)}
        </span>
      </div>`;
    }).join('');

    legend.innerHTML = legendContent;

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
  }, [stocks, height, period, isDark, theme, convertPrice, formatPrice]);

  return (
    <div className="w-full overflow-hidden relative border border-gray-200 dark:border-pearto-border rounded-lg bg-white dark:bg-pearto-card transition-colors duration-300">
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}