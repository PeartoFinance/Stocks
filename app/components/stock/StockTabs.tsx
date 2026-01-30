'use client';

import React, { useRef, useEffect } from 'react';
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

export type TabId = 'overview' | 'financials' | 'forecast' | 'statistics' | 'metrics' | 'dividends' | 'chart' | 'history' | 'profile' | 'news';

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
  { id: 'chart', label: 'Chart', icon: Clock },
  { id: 'history', label: 'History', icon: Calendar },
  { id: 'profile', label: 'Profile', icon: Building2 },
  { id: 'news', label: 'News', icon: Newspaper },
];

interface StockTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function StockTabs({ activeTab, onTabChange }: StockTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the active tab into view on mobile
  useEffect(() => {
    const activeElement = scrollRef.current?.querySelector(`[data-active="true"]`);
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeTab]);

  return (
    <div className="sticky top-24 z-30 mb-6">
      {/* Container with shadow and rounded corners */}
      <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        
        {/* Navigation Wrapper */}
        <nav 
          ref={scrollRef}
          className="flex flex-nowrap items-center gap-1 p-1 overflow-x-auto no-scrollbar scroll-smooth snap-x"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                data-active={isActive}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all snap-center flex-shrink-0
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                `}
              >
                <Icon size={16} className={isActive ? "animate-pulse" : ""} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Notice: No Absolute Gradient Overlays here. 
            They block pointer-events. Use CSS mask-image if you really want fades, 
            but for trading apps, clear visibility is better.
        */}
      </div>
    </div>
  );
}