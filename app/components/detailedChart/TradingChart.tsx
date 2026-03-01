'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, ColorType, CandlestickSeries, LineSeries, AreaSeries, BarSeries, BaselineSeries, HistogramSeries } from 'lightweight-charts';
import { useCurrency } from '@/app/context/CurrencyContext';

interface Indicator {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  settings?: Record<string, any>;
}

interface TradingChartProps {
  data: any[];
  chartType: 'candlestick' | 'line' | 'area' | 'bar' | 'baseline' | 'histogram';
  indicators?: Indicator[];
  selectedDrawingTool?: string | null;
}

export default function TradingChart({ data, chartType, indicators = [], selectedDrawingTool = null }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);
  const [drawings, setDrawings] = useState<any[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ time: number; price: number } | null>(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isDark = document.documentElement.classList.contains('dark');

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#0F172A' : '#FFFFFF' },
        textColor: isDark ? '#94A3B8' : '#64748B',
      },
      grid: {
        vertLines: { color: isDark ? '#1E293B' : '#E2E8F0' },
        horzLines: { color: isDark ? '#1E293B' : '#E2E8F0' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        borderColor: isDark ? '#334155' : '#CBD5E1',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: isDark ? '#334155' : '#CBD5E1',
      },
      localization: {
        priceFormatter: (price: number) => formatPrice(price, 2, 2),
      },
    });

    let series: ISeriesApi<any>;

    if (chartType === 'candlestick') {
      series = chart.addSeries(CandlestickSeries, {
        upColor: '#10B981',
        downColor: '#EF4444',
        borderUpColor: '#10B981',
        borderDownColor: '#EF4444',
        wickUpColor: '#10B981',
        wickDownColor: '#EF4444',
      });
    } else if (chartType === 'bar') {
      series = chart.addSeries(BarSeries, {
        upColor: '#10B981',
        downColor: '#EF4444',
      });
    } else if (chartType === 'line') {
      series = chart.addSeries(LineSeries, {
        color: '#3B82F6',
        lineWidth: 2,
      });
    } else if (chartType === 'baseline') {
      series = chart.addSeries(BaselineSeries, {
        topLineColor: '#10B981',
        bottomLineColor: '#EF4444',
        topFillColor1: 'rgba(16, 185, 129, 0.28)',
        topFillColor2: 'rgba(16, 185, 129, 0.05)',
        bottomFillColor1: 'rgba(239, 68, 68, 0.05)',
        bottomFillColor2: 'rgba(239, 68, 68, 0.28)',
      });
    } else if (chartType === 'histogram') {
      series = chart.addSeries(HistogramSeries, {
        color: '#3B82F6',
      });
    } else {
      series = chart.addSeries(AreaSeries, {
        lineColor: '#3B82F6',
        topColor: 'rgba(59, 130, 246, 0.4)',
        bottomColor: 'rgba(59, 130, 246, 0.05)',
        lineWidth: 2,
      });
    }

    if (data && data.length > 0) {
      const validData = data.filter(item => {
        if (chartType === 'candlestick' || chartType === 'bar') {
          return item.time && item.close != null && !isNaN(item.close);
        }
        return item.time && item.value != null && !isNaN(item.value);
      });
      
      if (validData.length > 0) {
        series.setData(validData);
      }
    }

    // Add indicators
    const indicatorSeries: ISeriesApi<any>[] = [];
    if (indicators && indicators.length > 0) {
      indicators.forEach((indicator) => {
        if (indicator.type === 'sma' || indicator.type === 'ema') {
          const period = 20;
          const maData = calculateMA(data, period);
          const maSeries = chart.addSeries(LineSeries, {
            color: indicator.type === 'sma' ? '#F59E0B' : '#8B5CF6',
            lineWidth: 2,
            priceLineVisible: false,
          });
          maSeries.setData(maData);
          indicatorSeries.push(maSeries);
        }
      });
    }

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !chartRef.current) return;
      const { width, height } = entries[0].contentRect;
      chartRef.current.applyOptions({ width, height });
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [chartType, indicators]);

  useEffect(() => {
    if (seriesRef.current && data && data.length > 0) {
      const validData = data.filter(item => {
        if (chartType === 'candlestick' || chartType === 'bar') {
          return item.time && item.close != null && !isNaN(item.close);
        }
        return item.time && item.value != null && !isNaN(item.value);
      });
      
      if (validData.length > 0) {
        seriesRef.current.setData(validData);
      }
    }
  }, [data, chartType]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
}

// Helper function to calculate Moving Average
function calculateMA(data: any[], period: number) {
  const result = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      const value = data[i - j].close || data[i - j].value;
      sum += value;
    }
    result.push({
      time: data[i].time,
      value: sum / period,
    });
  }
  return result;
}
