'use client';

import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, ColorType, CandlestickSeries, LineSeries, AreaSeries, BarSeries, BaselineSeries, HistogramSeries } from 'lightweight-charts';

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
}

export default function TradingChart({ data, chartType, indicators = [] }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);

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
          const period = indicator.settings?.period || 20;
          const maData = indicator.type === 'sma' ? calculateSMA(data, period) : calculateEMA(data, period);
          if (maData.length > 0) {
            const maSeries = chart.addSeries(LineSeries, {
              color: indicator.type === 'sma' ? '#F59E0B' : '#8B5CF6',
              lineWidth: 2,
              priceLineVisible: false,
              lastValueVisible: false,
            });
            maSeries.setData(maData);
            indicatorSeries.push(maSeries);
          }
        } else if (indicator.type === 'volume') {
          const volumeData = data.map(item => {
            const isUp = chartType === 'candlestick' || chartType === 'bar' 
              ? (item.close >= item.open)
              : true;
            return {
              time: item.time,
              value: item.volume || 0,
              color: isUp ? '#10B98180' : '#EF444480',
            };
          });
          if (volumeData.length > 0) {
            const volumeSeries = chart.addSeries(HistogramSeries, {
              priceFormat: { type: 'volume' },
              priceScaleId: '',
            });
            chart.priceScale('').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
            volumeSeries.setData(volumeData);
            indicatorSeries.push(volumeSeries);
          }
        } else if (indicator.type === 'bb') {
          const period = indicator.settings?.period || 20;
          const stdDev = indicator.settings?.stdDev || 2;
          const bbData = calculateBollingerBands(data, period, stdDev);
          if (bbData.upper.length > 0) {
            const upperSeries = chart.addSeries(LineSeries, {
              color: '#9333EA', lineWidth: 1, priceLineVisible: false, lastValueVisible: false,
            });
            upperSeries.setData(bbData.upper);
            const middleSeries = chart.addSeries(LineSeries, {
              color: '#9333EA', lineWidth: 1, priceLineVisible: false, lastValueVisible: false, lineStyle: 2,
            });
            middleSeries.setData(bbData.middle);
            const lowerSeries = chart.addSeries(LineSeries, {
              color: '#9333EA', lineWidth: 1, priceLineVisible: false, lastValueVisible: false,
            });
            lowerSeries.setData(bbData.lower);
            indicatorSeries.push(upperSeries, middleSeries, lowerSeries);
          }
        } else if (indicator.type === 'rsi') {
          const period = indicator.settings?.period || 14;
          const rsiData = calculateRSI(data, period);
          if (rsiData.length > 0) {
            const rsiSeries = chart.addSeries(LineSeries, {
              color: '#EC4899', lineWidth: 2, priceScaleId: 'rsi',
              priceLineVisible: false, lastValueVisible: false,
            });
            rsiSeries.setData(rsiData);
            chart.priceScale('rsi').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
            indicatorSeries.push(rsiSeries);
          }
        } else if (indicator.type === 'macd') {
          const macdData = calculateMACD(data);
          if (macdData.macd.length > 0) {
            const macdSeries = chart.addSeries(LineSeries, {
              color: '#3B82F6', lineWidth: 2, priceScaleId: 'macd',
              priceLineVisible: false, lastValueVisible: false,
            });
            macdSeries.setData(macdData.macd);
            const signalSeries = chart.addSeries(LineSeries, {
              color: '#F59E0B', lineWidth: 2, priceScaleId: 'macd',
              priceLineVisible: false, lastValueVisible: false,
            });
            signalSeries.setData(macdData.signal);
            const histogramSeries = chart.addSeries(HistogramSeries, {
              color: '#10B981', priceScaleId: 'macd',
            });
            histogramSeries.setData(macdData.histogram);
            chart.priceScale('macd').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
            indicatorSeries.push(macdSeries, signalSeries, histogramSeries);
          }
        } else if (indicator.type === 'stoch') {
          const period = indicator.settings?.period || 14;
          const stochData = calculateStochastic(data, period);
          if (stochData.k.length > 0) {
            const kSeries = chart.addSeries(LineSeries, {
              color: '#3B82F6', lineWidth: 2, priceScaleId: 'stoch',
              priceLineVisible: false, lastValueVisible: false,
            });
            kSeries.setData(stochData.k);
            const dSeries = chart.addSeries(LineSeries, {
              color: '#F59E0B', lineWidth: 2, priceScaleId: 'stoch',
              priceLineVisible: false, lastValueVisible: false,
            });
            dSeries.setData(stochData.d);
            chart.priceScale('stoch').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
            indicatorSeries.push(kSeries, dSeries);
          }
        } else if (indicator.type === 'atr') {
          const period = indicator.settings?.period || 14;
          const atrData = calculateATR(data, period);
          if (atrData.length > 0) {
            const atrSeries = chart.addSeries(LineSeries, {
              color: '#06B6D4', lineWidth: 2, priceScaleId: 'atr',
              priceLineVisible: false, lastValueVisible: false,
            });
            atrSeries.setData(atrData);
            chart.priceScale('atr').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
            indicatorSeries.push(atrSeries);
          }
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
  }, [chartType, indicators, data]);

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

// Helper functions for indicators
function calculateSMA(data: any[], period: number) {
  const result = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close || data[i - j].value;
    }
    result.push({ time: data[i].time, value: sum / period });
  }
  return result;
}

function calculateEMA(data: any[], period: number) {
  const result = [];
  const multiplier = 2 / (period + 1);
  let ema = data.slice(0, period).reduce((sum, item) => sum + (item.close || item.value), 0) / period;
  
  for (let i = period - 1; i < data.length; i++) {
    const value = data[i].close || data[i].value;
    ema = (value - ema) * multiplier + ema;
    result.push({ time: data[i].time, value: ema });
  }
  return result;
}

function calculateBollingerBands(data: any[], period: number, stdDev: number) {
  const upper = [], middle = [], lower = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += data[i - j].close || data[i - j].value;
    const sma = sum / period;
    let variance = 0;
    for (let j = 0; j < period; j++) {
      const value = data[i - j].close || data[i - j].value;
      variance += Math.pow(value - sma, 2);
    }
    const std = Math.sqrt(variance / period);
    middle.push({ time: data[i].time, value: sma });
    upper.push({ time: data[i].time, value: sma + stdDev * std });
    lower.push({ time: data[i].time, value: sma - stdDev * std });
  }
  return { upper, middle, lower };
}

function calculateRSI(data: any[], period: number) {
  const result = [];
  for (let i = period; i < data.length; i++) {
    let gains = 0, losses = 0;
    for (let j = 0; j < period; j++) {
      const change = (data[i - j].close || data[i - j].value) - (data[i - j - 1].close || data[i - j - 1].value);
      if (change > 0) gains += change;
      else losses -= change;
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    result.push({ time: data[i].time, value: rsi });
  }
  return result;
}

function calculateMACD(data: any[]) {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  const macd = [], signal = [], histogram = [];
  
  for (let i = 0; i < ema12.length && i < ema26.length; i++) {
    const macdValue = ema12[i].value - ema26[i].value;
    macd.push({ time: ema12[i].time, value: macdValue });
  }
  
  const signalLine = calculateEMA(macd.map(m => ({ time: m.time, value: m.value, close: m.value })), 9);
  for (let i = 0; i < signalLine.length; i++) {
    signal.push({ time: signalLine[i].time, value: signalLine[i].value });
    const histValue = macd[i + (macd.length - signalLine.length)].value - signalLine[i].value;
    histogram.push({ time: signalLine[i].time, value: histValue, color: histValue >= 0 ? '#10B98180' : '#EF444480' });
  }
  
  return { macd, signal, histogram };
}

function calculateStochastic(data: any[], period: number) {
  const k = [], d = [];
  for (let i = period - 1; i < data.length; i++) {
    let highest = -Infinity, lowest = Infinity;
    for (let j = 0; j < period; j++) {
      const high = data[i - j].high || data[i - j].close || data[i - j].value;
      const low = data[i - j].low || data[i - j].close || data[i - j].value;
      if (high > highest) highest = high;
      if (low < lowest) lowest = low;
    }
    const close = data[i].close || data[i].value;
    const kValue = lowest === highest ? 50 : ((close - lowest) / (highest - lowest)) * 100;
    k.push({ time: data[i].time, value: kValue });
  }
  
  for (let i = 2; i < k.length; i++) {
    const dValue = (k[i].value + k[i - 1].value + k[i - 2].value) / 3;
    d.push({ time: k[i].time, value: dValue });
  }
  
  return { k, d };
}

function calculateATR(data: any[], period: number) {
  const result = [];
  let atr = 0;
  
  for (let i = 1; i < data.length; i++) {
    const high = data[i].high || data[i].close || data[i].value;
    const low = data[i].low || data[i].close || data[i].value;
    const prevClose = data[i - 1].close || data[i - 1].value;
    const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    
    if (i < period) {
      atr += tr;
      if (i === period - 1) {
        atr = atr / period;
        result.push({ time: data[i].time, value: atr });
      }
    } else {
      atr = ((atr * (period - 1)) + tr) / period;
      result.push({ time: data[i].time, value: atr });
    }
  }
  
  return result;
}
