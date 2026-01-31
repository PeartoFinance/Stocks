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

  useEffect(() => {
    const activeElement = scrollRef.current?.querySelector(`[data-active="true"]`);
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeTab]);

  return (
    // min-w-0 ensures this component doesn't force the parent width to expand
    <div className="sticky top-24 z-30 mb-6 w-full min-w-0">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        
        <nav 
          ref={scrollRef}
          className="flex flex-nowrap items-center p-1 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory"
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
                  flex-shrink-0 snap-center transition-all flex
                  /* MOBILE: 20% width (5 tabs visible), vertical stack */
                  w-1/5 flex-col items-center justify-center gap-1 py-3 px-1
                  /* DESKTOP (lg): natural width, horizontal row */
                  lg:w-auto lg:flex-row lg:px-4 lg:py-2.5 lg:gap-2
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                  rounded-lg font-bold
                `}
              >
                <Icon size={16} className={isActive ? "animate-pulse" : ""} />
                <span className="text-[9px] lg:text-sm whitespace-nowrap uppercase lg:capitalize tracking-tighter lg:tracking-normal">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}