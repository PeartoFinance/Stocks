'use client';

import React, { useState, useEffect } from 'react';
import { worldIndicesService, SectorData } from '../../utils/worldIndicesService';
import { Building, PieChart as PieChartIcon } from 'lucide-react';
// Fix: Import 'Pie' from react-chartjs-2
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale
} from 'chart.js';
import SectorHeatmap from './SectorHeatmap';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale);

interface SectorsSectionProps {
  className?: string;
}

export default function SectorsSection({ className = '' }: SectorsSectionProps) {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        setLoading(true);
        const data = await worldIndicesService.getSectors();
        setSectors(data);
      } catch (error) {
        console.error('Failed to fetch sectors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, []);

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading sectors data...</span>
        </div>
      </div>
    );
  }

  // Chart Data Configuration
  const pieData = {
    labels: sectors.map(d => d.sector),
    datasets: [{
      data: sectors.map(d => d.marketWeight),
      backgroundColor: [
        '#10b981', '#ef4444', '#22c55e', '#fb923c', 
        '#dc26af', '#9333ea', '#34d399', '#4a90e2', '#8b4513'
      ],
      borderColor: '#ffffff',
      borderWidth: 2
    }]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          font: { size: 10 }
        }
      }
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Building className="h-5 w-5 text-purple-600" />
        <h2 className="text-xl font-bold text-gray-900">Sector Analysis</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Sector Details - Left Side */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 text-sm">Sector Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">YTD Return</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sectors.map((sector, i) => (
                  <tr key={sector.sector} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 text-sm">{sector.sector}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          {sector.stockCount} stocks
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right text-sm text-gray-900 font-mono">
                      {sector.marketWeight.toFixed(1)}%
                    </td>
                    <td className={`px-3 py-2 text-right text-xs font-semibold ${
                      sector.ytdReturn >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {sector.ytdReturn >= 0 ? '+' : ''}{sector.ytdReturn.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sector Analysis - Right Side */}
        <div className="flex flex-col gap-4 lg:gap-6">
          {/* Distribution Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200 flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-orange-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Market Weighting</h3>
            </div>
            <div className="p-6 h-[300px]">
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>

          {/* Day Returns Heatmap Card */}
          <SectorHeatmap sectors={sectors} />
        </div>
      </div>
    </div>
  );
}