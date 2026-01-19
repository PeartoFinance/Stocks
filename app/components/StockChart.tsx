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
  isPositive: boolean;
  height?: number;
  chartType?: ChartType;
  color?: string;
}

export default function StockChart({ data, isPositive, height = 400, chartType = 'area', color }: StockChartProps) {
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
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });
      series.setData(data.map(item => ({
        time: formatTime(item.date),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      })));
    } 
    else if (chartType === 'line') {
      const series = chart.addSeries(LineSeries, {
        color: mainColor,
        lineWidth: 2,
      });
      series.setData(data.map(item => ({ 
        time: formatTime(item.date), 
        value: item.close 
      })));
    } 
    else {
      const isMountain = chartType === 'mountain';
      const series = chart.addSeries(AreaSeries, {
        lineColor: mainColor,
        topColor: topGradient,
        bottomColor: isMountain ? 'rgba(255, 255, 255, 0)' : bottomGradient,
        lineWidth: isMountain ? 3 : 2,
      });
      series.setData(data.map(item => ({ 
        time: formatTime(item.date), 
        value: item.close 
      })));
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
  }, [data, isPositive, height, chartType, color]);

  return (
    <div className="w-full overflow-hidden relative">
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}