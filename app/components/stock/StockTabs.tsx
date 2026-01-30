import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Building2, 
  Newspaper, 
  Clock, 
  PieChart, 
  Activity,
  LucideIcon
} from 'lucide-react';

export type TabId = 'overview' | 'financials' | 'forecast' | 'statistics' | 'metrics' | 'dividends' | 'history' | 'profile' | 'news';

interface Tab {
  id: TabId;
  label: string;
  icon: LucideIcon;
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
    <div className="sticky top-0 z-20 -mx-4 px-4 sm:mx-0 sm:px-0 bg-gray-50 dark:bg-slate-950 lg:bg-transparent">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-2 lg:p-1 shadow-sm">
        {/* Mobile Grid Layout - 3x3 grid */}
        <nav className="grid grid-cols-3 gap-2 lg:hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-lg font-bold text-xs transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={16} className={isActive ? "animate-pulse" : ""} />
                <span className="text-center leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Desktop Horizontal Layout */}
        <nav 
          className="hidden lg:flex space-x-1 overflow-x-auto no-scrollbar scroll-smooth snap-x"
          style={{ WebkitOverflowScrolling: 'touch' }} // Smooth momentum scroll for iOS
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                // snap-center makes the tab align to middle when scrolled to on mobile
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap transition-all snap-center ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={16} className={isActive ? "animate-pulse" : ""} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Visual Fade Indicator - Only for desktop horizontal scroll */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-gray-50 dark:from-slate-950 to-transparent hidden sm:block lg:hidden" />
    </div>
  );
}