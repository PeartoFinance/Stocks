'use client';

import React, { useRef, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Clock, 
  Calendar, 
  Building2, 
  LucideIcon
} from 'lucide-react';

export type TabId = 'overview' | 'statistics' | 'chart' | 'history' | 'profile';

interface Tab {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'statistics', label: 'Statistics', icon: PieChart },
  { id: 'chart', label: 'Chart', icon: Clock },
  { id: 'history', label: 'History', icon: Calendar },
  { id: 'profile', label: 'Profile', icon: Building2 },
];

interface CryptoTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function CryptoTabs({ activeTab, onTabChange }: CryptoTabsProps) {
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
      <div className="bg-white dark:bg-pearto-card dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300">
        
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
                    ? 'bg-emerald-600 dark:bg-pearto-pink text-white shadow-md'
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
