'use client';

import React, { useEffect, useRef } from 'react';
import { 
  createChart, 
  ColorType, 
  AreaSeries, 
  CandlestickSeries, 
  LineSeries, 
  IChartApi 
} from 'lightweight-charts';
import { HistoricalData } from '../types';

// 'mountain' is technically an Area chart with a specific gradient, 
// so we treat it as an Area series with different options.
type ChartType = 'area' | 'candlestick' | 'line' | 'mountain';

interface StockChartProps {
  data: HistoricalData[];
  isPositive: boolean;
  height?: number;
  chartType?: ChartType;
}

export default function StockChart({ data, isPositive, height = 400, chartType = 'area' }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    // Initialize Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#6b7280',
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
    });

    chartRef.current = chart;

    // Define colors based on isPositive
    // standard: Green (#10b981) for UP, Red (#ef4444) for DOWN
    const mainColor = isPositive ? '#10b981' : '#ef4444';
    const topGradient = isPositive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)';
    const bottomGradient = isPositive ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)';

    // Handle different series types using the modern addSeries method
    if (chartType === 'candlestick') {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });
      series.setData(data.map(item => ({
        time: item.date,
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
      series.setData(data.map(item => ({ time: item.date, value: item.close })));
    } 
    else {
      // Handles both 'area' and 'mountain'
      const isMountain = chartType === 'mountain';
      const series = chart.addSeries(AreaSeries, {
        lineColor: mainColor,
        topColor: topGradient,
        bottomColor: isMountain ? 'rgba(255, 255, 255, 0)' : bottomGradient,
        lineWidth: isMountain ? 3 : 2,
      });
      series.setData(data.map(item => ({ time: item.date, value: item.close })));
    }

    chart.timeScale().fitContent();

    // Resize handling
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
  }, [data, isPositive, height, chartType]);

  return <div ref={chartContainerRef} className="w-full" />;
}