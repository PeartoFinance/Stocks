'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import {
  Home, Star, BarChart3, Calendar, Briefcase,
  ChevronLeft, ChevronRight, X, Gem, TrendingUp, Bitcoin, Newspaper
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ isOpenMobile, setIsOpenMobile, onCollapseChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    onCollapseChange?.(isCollapsed);
  }, [isCollapsed, onCollapseChange]);

  useEffect(() => {
    const updateWidth = () => {
      if (window.innerWidth >= 1024) {
        document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '80px' : '260px');
      } else {
        document.documentElement.style.setProperty('--sidebar-width', '0px');
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [isCollapsed]);

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Star, label: 'Watchlist', href: '/watchlist' },
    { icon: BarChart3, label: 'Stocks', href: '/stocks' },
    { icon: Bitcoin, label: 'Crypto', href: '/crypto' },
    { icon: TrendingUp, label: 'Trending', href: '/trending' },
    { icon: Calendar, label: 'IPOs', href: '/ipos' },
    { icon: Briefcase, label: 'ETFs', href: '/etfs' },
    { icon: Newspaper, label: 'News', href: '/news' },
  ];

  const SidebarInner = ({ isMobile = false }) => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900/95 border-r border-gray-200 dark:border-gray-800/50 transition-colors duration-300">
      {/* Mobile close button */}
      {isMobile && (
        <div className="h-16 flex items-center justify-end px-6 border-b border-gray-100 dark:border-gray-800/50">
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 cursor-pointer" onClick={() => setIsOpenMobile(false)} />
        </div>
      )}

      <nav className={`flex-1 px-3 ${isMobile ? 'py-4' : 'py-6'} space-y-2`}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => isMobile && setIsOpenMobile(false)}
              className={`group flex items-center gap-4 p-3 rounded-xl transition-all duration-200 hover:scale-105 ${isActive 
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 hover:shadow-md'
              } ${isCollapsed && !isMobile ? 'justify-center' : ''}`}
            >
              <item.icon size={22} className="transition-transform duration-200 group-hover:scale-110" />
              {(!isCollapsed || isMobile) && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* MOBILE OPAQUE OVERLAY */}
      <AnimatePresence>
        {isOpenMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpenMobile(false)}
              className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-screen w-72 z-[101] lg:hidden shadow-2xl"
            >
              <SidebarInner isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR - Fixed vertically, stays in place when scrolling */}
      <aside
        className={`fixed left-0 top-32 h-[calc(100vh-8rem)] bg-white dark:bg-slate-900/95 border-r border-gray-200 dark:border-gray-800/50 z-30 transition-all duration-300 hidden lg:block overflow-y-auto ${isCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="fixed left-[68px] top-44 bg-emerald-500 dark:bg-emerald-600 border-2 border-white dark:border-gray-800 rounded-full p-1.5 shadow-lg z-50 text-white hover:bg-emerald-600 dark:hover:bg-emerald-700 hover:scale-110 transition-all duration-200"
          style={{ left: isCollapsed ? '68px' : '244px' }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        <SidebarInner />
      </aside>
    </>
  );
}