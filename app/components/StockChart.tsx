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

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

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
      },
      rightPriceScale: {
        borderVisible: false,
      },
    });

    chartRef.current = chart;

    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const mainColor = color || (isPositive ? '#10b981' : '#ef4444');
    const topGradient = color ? hexToRgba(color, 0.4) : (isPositive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)');
    const bottomGradient = color ? hexToRgba(color, 0.05) : (isPositive ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)');

    // Helper to ensure dates are in YYYY-MM-DD format
    const formatTime = (dateStr: string): Time => {
      return dateStr.split('T')[0] as Time;
    };

    if (chartType === 'candlestick') {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#2563eb',
        downColor: '#1d4ed8',
        borderVisible: false,
        wickUpColor: '#2563eb',
        wickDownColor: '#1d4ed8',
      });
      series.setData(data.map(item => ({
        time: formatTime(item.date),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      })));
      
      // Add comparison data if available
      if (showComparison && compareData && compareData.length > 0) {
        const compareSeries = chart.addSeries(CandlestickSeries, {
          upColor: '#ea580c',
          downColor: '#c2410c',
          borderVisible: false,
          wickUpColor: '#ea580c',
          wickDownColor: '#c2410c',
        });
        compareSeries.setData(compareData.map(item => ({
          time: formatTime(item.date),
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        })));
      }
    } 
    else if (chartType === 'line') {
      const series = chart.addSeries(LineSeries, {
        color: showComparison ? '#2563eb' : mainColor,
        lineWidth: showComparison ? 3 : 2,
      });
      series.setData(data.map(item => ({ 
        time: formatTime(item.date), 
        value: item.close 
      })));
      
      // Add comparison line if available
      if (showComparison && compareData && compareData.length > 0) {
        const compareSeries = chart.addSeries(LineSeries, {
          color: '#ea580c',
          lineWidth: 3,
        });
        compareSeries.setData(compareData.map(item => ({ 
          time: formatTime(item.date), 
          value: item.close 
        })));
      }
    } 
    else {
      const isMountain = chartType === 'mountain';
      const primaryColor = showComparison ? '#2563eb' : mainColor;
      const primaryTopColor = showComparison ? 'rgba(37, 99, 235, 0.4)' : topGradient;
      const primaryBottomColor = showComparison ? 'rgba(37, 99, 235, 0.05)' : bottomGradient;
      
      const series = chart.addSeries(AreaSeries, {
        lineColor: primaryColor,
        topColor: isMountain ? `rgba(37, 99, 235, 0.6)` : primaryTopColor,
        bottomColor: isMountain ? 'rgba(37, 99, 235, 0)' : primaryBottomColor,
        lineWidth: isMountain ? 3 : 2,
      });
      series.setData(data.map(item => ({ 
        time: formatTime(item.date), 
        value: item.close 
      })));
      
      // Add comparison area if available
      if (showComparison && compareData && compareData.length > 0) {
        const compareSeries = chart.addSeries(AreaSeries, {
          lineColor: '#ea580c',
          topColor: isMountain ? 'rgba(234, 88, 12, 0.6)' : 'rgba(234, 88, 12, 0.4)',
          bottomColor: isMountain ? 'rgba(234, 88, 12, 0)' : 'rgba(234, 88, 12, 0.05)',
          lineWidth: isMountain ? 3 : 2,
        });
        compareSeries.setData(compareData.map(item => ({ 
          time: formatTime(item.date), 
          value: item.close 
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
  }, [data, compareData, isPositive, height, chartType, color, showComparison]);

  return (
    <div className="w-full overflow-hidden relative">
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}