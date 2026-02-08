'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import {
  Home, Star, BarChart3, Calendar, Briefcase,
  ChevronLeft, ChevronRight, X, Gem, TrendingUp, Bitcoin
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export default function Sidebar({ isOpenMobile, setIsOpenMobile }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();

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
  ];

  const SidebarInner = ({ isMobile = false }) => (
    <div className="flex flex-col h-full bg-white dark:bg-pearto-blockchain border-r border-gray-200 dark:border-pearto-border transition-colors duration-300">
      {/* Mobile close button */}
      {isMobile && (
        <div className="h-16 flex items-center justify-end px-6 border-b border-gray-100 dark:border-pearto-border">
          <X className="w-5 h-5 text-gray-500 dark:text-pearto-cloud hover:text-gray-700 dark:hover:text-pearto-luna transition-colors duration-200 cursor-pointer" onClick={() => setIsOpenMobile(false)} />
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
                ? 'bg-emerald-50 dark:bg-pearto-slate text-emerald-700 dark:text-pearto-green font-bold shadow-sm' 
                : 'text-gray-500 dark:text-pearto-cloud hover:bg-gray-50 dark:hover:bg-pearto-surface hover:text-gray-700 dark:hover:text-pearto-luna hover:shadow-md'
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

      {/* DESKTOP SIDEBAR - Sticky within content area, not fixed full height */}
      <aside
        className={`sticky top-0 self-start h-screen bg-white dark:bg-pearto-blockchain border-r border-gray-200 dark:border-pearto-border z-40 transition-all duration-300 hidden lg:block flex-shrink-0 ${isCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-white dark:bg-pearto-slate border border-gray-200 dark:border-pearto-border rounded-full p-1 shadow-md z-50 text-gray-600 dark:text-pearto-cloud hover:text-emerald-500 dark:hover:text-pearto-green hover:scale-110 transition-all duration-200"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        <SidebarInner />
      </aside>
    </>
  );
}