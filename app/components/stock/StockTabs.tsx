import React from 'react';
import { BarChart3, TrendingUp, Calendar, Building2, Newspaper, Clock, PieChart, Activity } from 'lucide-react';

export type TabId = 'overview' | 'financials' | 'forecast' | 'statistics' | 'metrics' | 'dividends' | 'history' | 'profile' | 'news';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'financials', label: 'Financials', icon: TrendingUp },
  { id: 'forecast', label: 'Forecast', icon: Calendar },
  { id: 'statistics', label: 'Statistics', icon: PieChart },
  { id: 'metrics', label: 'Metrics', icon: Activity },
  { id: 'dividends', label: 'Dividends', icon: TrendingUp },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'profile', label: 'Profile', icon: Building2 },
  { id: 'news', label: 'News', icon: Newspaper },
];

interface StockTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function StockTabs({ activeTab, onTabChange }: StockTabsProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-1">
      <nav className="flex space-x-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}