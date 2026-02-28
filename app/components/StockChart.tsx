'use client';

import React, { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  AreaSeries,
  CandlestickSeries,
  LineSeries,
  IChartApi,
  Time
} from 'lightweight-charts';
import { HistoricalData } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';

type ChartType = 'area' | 'candlestick' | 'line' | 'mountain';

interface StockChartProps {
  data: HistoricalData[];
  compareData?: HistoricalData[];
  isPositive: boolean;
  height?: number;
  chartType?: ChartType;
  color?: string;
  showComparison?: boolean;
}

export default function StockChart({ data, compareData, isPositive, height = 400, chartType = 'area', color, showComparison = false }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { theme } = useTheme();
  const { convertPrice, currency } = useCurrency();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: isDark ? '#dadada' : '#6b7280',
        attributionLogo: false,
      },
      width: chartContainerRef.current.clientWidth,
      height,
      grid: {
        vertLines: { color: isDark ? 'rgba(44, 44, 44, 0.5)' : 'rgba(243, 244, 246, 0.5)' },
        horzLines: { color: isDark ? 'rgba(44, 44, 44, 0.5)' : 'rgba(243, 244, 246, 0.5)' },
      },
      timeScale: {
        borderColor: isDark ? '#2C2C2C' : '#e5e7eb',
        timeVisible: data.length > 0 && data[0].date.includes('T'),
        secondsVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
        // Optional: add currency formatting to axis
        // localization: { priceFormatter: ... }
      },
    });

    chartRef.current = chart;

    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const mainColor = color || (isDark ? (isPositive ? '#0aff8d' : '#e02d75') : (isPositive ? '#10b981' : '#ef4444'));
    const topGradient = color ? hexToRgba(color, 0.4) : (isDark ? (isPositive ? 'rgba(10, 255, 141, 0.4)' : 'rgba(224, 45, 117, 0.4)') : (isPositive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'));
    const bottomGradient = color ? hexToRgba(color, 0.05) : (isDark ? (isPositive ? 'rgba(10, 255, 141, 0.05)' : 'rgba(224, 45, 117, 0.05)') : (isPositive ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'));

    const formatTime = (dateStr: string): Time => {
      if (dateStr.includes('T')) {
        const date = new Date(dateStr);
        return Math.floor(date.getTime() / 1000) as Time;
      } else {
        return dateStr.split('T')[0] as Time;
      }
    };

    if (chartType === 'candlestick') {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });
      series.setData(data.map(item => ({
        time: formatTime(item.date),
        open: convertPrice(item.open),
        high: convertPrice(item.high),
        low: convertPrice(item.low),
        close: convertPrice(item.close),
      })));

      if (showComparison && compareData && compareData.length > 0) {
        const compareSeries = chart.addSeries(CandlestickSeries, {
          upColor: isDark ? '#00c2ff' : '#ea580c',
          downColor: isDark ? '#92b2e5' : '#c2410c',
          borderVisible: false,
          wickUpColor: isDark ? '#00c2ff' : '#ea580c',
          wickDownColor: isDark ? '#92b2e5' : '#c2410c',
        });
        compareSeries.setData(compareData.map(item => ({
          time: formatTime(item.date),
          open: convertPrice(item.open),
          high: convertPrice(item.high),
          low: convertPrice(item.low),
          close: convertPrice(item.close),
        })));
      }
    }
    else if (chartType === 'line') {
      const series = chart.addSeries(LineSeries, {
        color: showComparison ? (isDark ? '#00c2ff' : '#2563eb') : mainColor,
        lineWidth: showComparison ? 3 : 2,
      });
      series.setData(data.map(item => ({
        time: formatTime(item.date),
        value: convertPrice(item.close)
      })));

      if (showComparison && compareData && compareData.length > 0) {
        const compareSeries = chart.addSeries(LineSeries, {
          color: isDark ? '#ffc857' : '#ea580c',
          lineWidth: 3,
        });
        compareSeries.setData(compareData.map(item => ({
          time: formatTime(item.date),
          value: convertPrice(item.close)
        })));
      }
    }
    else {
      const isMountain = chartType === 'mountain';
      const primaryColor = showComparison ? (isDark ? '#00c2ff' : '#2563eb') : mainColor;
      const primaryTopColor = showComparison ? (isDark ? 'rgba(0, 194, 255, 0.4)' : 'rgba(37, 99, 235, 0.4)') : topGradient;
      const primaryBottomColor = showComparison ? (isDark ? 'rgba(0, 194, 255, 0.05)' : 'rgba(37, 99, 235, 0.05)') : bottomGradient;

      const series = chart.addSeries(AreaSeries, {
        lineColor: primaryColor,
        topColor: isMountain ? (isDark ? 'rgba(0, 194, 255, 0.6)' : 'rgba(37, 99, 235, 0.6)') : primaryTopColor,
        bottomColor: isMountain ? (isDark ? 'rgba(0, 194, 255, 0)' : 'rgba(37, 99, 235, 0)') : primaryBottomColor,
        lineWidth: isMountain ? 3 : 2,
      });
      series.setData(data.map(item => ({
        time: formatTime(item.date),
        value: convertPrice(item.close)
      })));

      if (showComparison && compareData && compareData.length > 0) {
        const compareSeries = chart.addSeries(AreaSeries, {
          lineColor: isDark ? '#ffc857' : '#ea580c',
          topColor: isMountain ? (isDark ? 'rgba(255, 200, 87, 0.6)' : 'rgba(234, 88, 12, 0.6)') : (isDark ? 'rgba(255, 200, 87, 0.4)' : 'rgba(234, 88, 12, 0.4)'),
          bottomColor: isMountain ? (isDark ? 'rgba(255, 200, 87, 0)' : 'rgba(234, 88, 12, 0)') : (isDark ? 'rgba(255, 200, 87, 0.05)' : 'rgba(234, 88, 12, 0.05)'),
          lineWidth: isMountain ? 3 : 2,
        });
        compareSeries.setData(compareData.map(item => ({
          time: formatTime(item.date),
          value: convertPrice(item.close)
        })));
      }
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [data, compareData, isPositive, height, chartType, color, showComparison, isDark, theme, convertPrice, currency]);

  return (
    <div className="w-full overflow-hidden relative">
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}