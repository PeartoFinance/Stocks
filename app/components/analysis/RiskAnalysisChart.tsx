'use client';

import { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getTechnicalAnalysis } from '@/app/utils/technicalAnalysis';
import { Loader2, PieChart } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface RiskAnalysisChartProps {
  symbol: string;
  className?: string;
}

export default function RiskAnalysisChart({ symbol, className = '' }: RiskAnalysisChartProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getTechnicalAnalysis(symbol);
        setData(result);
      } catch (error) {
        console.error('Failed to fetch technical analysis:', error);
      } finally {
        setLoading(false);
      }
    };
    if (symbol) fetchData();
  }, [symbol]);

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-4 md:p-6 flex items-center justify-center min-h-[200px] md:min-h-[300px] shadow-lg ${className}`}>
        <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (!data || !data.summary || !data.summary.counts) return null;

  const { summary } = data;
  const totalBuy = summary.counts.oscillators.buy + summary.counts.movingAverages.buy;
  const totalNeutral = summary.counts.oscillators.neutral + summary.counts.movingAverages.neutral;
  const totalSell = summary.counts.oscillators.sell + summary.counts.movingAverages.sell;

  const chartData = {
    labels: ['Buy', 'Neutral', 'Sell'],
    datasets: [{
      data: [totalBuy, totalNeutral, totalSell],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverOffset: 4
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 10 },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        bodyFont: { size: 12, weight: 500 as const },
        titleFont: { size: 13, weight: 600 as const },
        padding: 8,
        cornerRadius: 6
      }
    },
    cutout: '65%',
    animation: { animateScale: true, animateRotate: true }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-4 md:p-6 shadow-lg ${className}`}>
      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <div className="p-1.5 md:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <PieChart className="h-4 w-4 md:h-5 md:w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Signal Distribution</h3>
      </div>
      
      <div className="h-32 md:h-40 relative mb-4 md:mb-6">
        <Doughnut data={chartData} options={options} />
      </div>
      
      <div className="text-center mb-4 md:mb-6">
        <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1">
          {summary.signal}
        </div>
        <div className="text-xs md:text-sm text-slate-500 dark:text-gray-400">
          Score: {summary.score.toFixed(1)}
        </div>
      </div>
      
      <div className="space-y-2 md:space-y-3 pt-3 md:pt-4 border-t border-slate-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-xs md:text-sm text-slate-600 dark:text-gray-400">Buy</span>
          <span className="font-bold text-sm md:text-base text-green-600 dark:text-green-400">{totalBuy}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs md:text-sm text-slate-600 dark:text-gray-400">Neutral</span>
          <span className="font-bold text-sm md:text-base text-yellow-600 dark:text-yellow-400">{totalNeutral}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs md:text-sm text-slate-600 dark:text-gray-400">Sell</span>
          <span className="font-bold text-sm md:text-base text-red-600 dark:text-red-400">{totalSell}</span>
        </div>
      </div>
    </div>
  );
}
