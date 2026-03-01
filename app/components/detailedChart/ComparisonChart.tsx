'use client';

import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ColorType, CandlestickSeries, LineSeries, AreaSeries, BarSeries, BaselineSeries, HistogramSeries } from 'lightweight-charts';
import { useCurrency } from '@/app/context/CurrencyContext';

interface ComparisonChartProps {
  data: any[][];
  chartType: 'candlestick' | 'line' | 'area' | 'bar' | 'baseline' | 'histogram';
  symbols: string[];
}

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function ComparisonChart({ data, chartType, symbols }: ComparisonChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

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

    // For candlestick/bar - show all stocks
    if (chartType === 'candlestick' || chartType === 'bar') {
      data.forEach((seriesData, index) => {
        if (seriesData && seriesData.length > 0) {
          if (chartType === 'candlestick') {
            const series = chart.addSeries(CandlestickSeries, {
              upColor: CHART_COLORS[index % CHART_COLORS.length],
              downColor: '#EF4444',
              borderUpColor: CHART_COLORS[index % CHART_COLORS.length],
              borderDownColor: '#EF4444',
              wickUpColor: CHART_COLORS[index % CHART_COLORS.length],
              wickDownColor: '#EF4444',
            });
            
            const validData = seriesData
              .filter(item => item.time && item.close != null && item.open != null && item.high != null && item.low != null)
              .map(item => ({
                time: item.time,
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
              }));
            
            if (validData.length > 0) {
              series.setData(validData);
            }
          } else {
            const series = chart.addSeries(BarSeries, {
              upColor: CHART_COLORS[index % CHART_COLORS.length],
              downColor: '#EF4444',
            });
            
            const validData = seriesData
              .filter(item => item.time && item.close != null && item.open != null && item.high != null && item.low != null)
              .map(item => ({
                time: item.time,
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
              }));
            
            if (validData.length > 0) {
              series.setData(validData);
            }
          }
        }
      });
    } else if (chartType === 'line') {
      // Show all stocks as lines
      data.forEach((seriesData, index) => {
        if (seriesData && seriesData.length > 0) {
          const lineSeries = chart.addSeries(LineSeries, {
            color: CHART_COLORS[index % CHART_COLORS.length],
            lineWidth: 2,
            title: symbols[index] || `Series ${index + 1}`,
          });
          
          const validData = seriesData.filter(item => item.time && item.value != null && !isNaN(item.value));
          if (validData.length > 0) {
            lineSeries.setData(validData);
          }
        }
      });
    } else if (chartType === 'area') {
      // Show all stocks as areas
      data.forEach((seriesData, index) => {
        if (seriesData && seriesData.length > 0) {
          const areaSeries = chart.addSeries(AreaSeries, {
            lineColor: CHART_COLORS[index % CHART_COLORS.length],
            topColor: `${CHART_COLORS[index % CHART_COLORS.length]}66`,
            bottomColor: `${CHART_COLORS[index % CHART_COLORS.length]}0D`,
            lineWidth: 2,
            title: symbols[index] || `Series ${index + 1}`,
          });
          
          const validData = seriesData.filter(item => item.time && item.value != null && !isNaN(item.value));
          if (validData.length > 0) {
            areaSeries.setData(validData);
          }
        }
      });
    } else if (chartType === 'baseline') {
      // Show all stocks as baseline
      data.forEach((seriesData, index) => {
        if (seriesData && seriesData.length > 0) {
          const series = chart.addSeries(BaselineSeries, {
            topLineColor: CHART_COLORS[index % CHART_COLORS.length],
            bottomLineColor: '#EF4444',
            topFillColor1: `${CHART_COLORS[index % CHART_COLORS.length]}44`,
            topFillColor2: `${CHART_COLORS[index % CHART_COLORS.length]}0D`,
            bottomFillColor1: 'rgba(239, 68, 68, 0.05)',
            bottomFillColor2: 'rgba(239, 68, 68, 0.28)',
          });
          
          const validData = seriesData.filter(item => item.time && item.value != null && !isNaN(item.value));
          if (validData.length > 0) {
            series.setData(validData);
          }
        }
      });
    } else if (chartType === 'histogram') {
      // Show all stocks as histogram with opacity based on value
      data.forEach((seriesData, index) => {
        if (seriesData && seriesData.length > 0) {
          const validData = seriesData.filter(item => item.time && item.value != null && !isNaN(item.value));
          
          if (validData.length > 0) {
            // Find min and max values for opacity calculation
            const values = validData.map(item => item.value);
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            const range = maxValue - minValue;
            
            const series = chart.addSeries(HistogramSeries, {
              color: CHART_COLORS[index % CHART_COLORS.length],
            });
            
            // Map data with color opacity based on value (higher value = lower opacity)
            const dataWithOpacity = validData.map(item => {
              const normalizedValue = range > 0 ? (item.value - minValue) / range : 0.5;
              // Invert: higher value gets lower opacity (0.3-1.0 range)
              const opacity = 1.0 - (normalizedValue * 0.7);
              const color = CHART_COLORS[index % CHART_COLORS.length];
              // Convert hex to rgba
              const r = parseInt(color.slice(1, 3), 16);
              const g = parseInt(color.slice(3, 5), 16);
              const b = parseInt(color.slice(5, 7), 16);
              
              return {
                time: item.time,
                value: item.value,
                color: `rgba(${r}, ${g}, ${b}, ${opacity})`,
              };
            });
            
            series.setData(dataWithOpacity);
          }
        }
      });
    }

    chartRef.current = chart;

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
  }, [data, chartType, symbols]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
}
