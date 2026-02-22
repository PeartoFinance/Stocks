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
    { icon: BarChart3, label: 'Stocks', href: '/stocks' },
    { icon: Bitcoin, label: 'Crypto', href: '/crypto' },
    { icon: TrendingUp, label: 'Trending', href: '/trending' },
    { icon: Calendar, label: 'IPOs', href: '/ipos' },
    { icon: Briefcase, label: 'ETFs', href: '/etfs' },
    { icon: Newspaper, label: 'News', href: '/news' },
  ];

  const SidebarInner = ({ isMobile = false }) => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900/95 transition-colors duration-300">
      {/* Mobile header */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Navigation</h2>
          <button
            onClick={() => setIsOpenMobile(false)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      )}

      <nav className={`flex-1 p-3 ${isMobile ? 'py-4' : 'py-6'} overflow-y-auto`}>
        {isMobile ? (
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const colors = {
                Home: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 text-blue-700 dark:text-blue-400',
                Stocks: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-700 text-emerald-700 dark:text-emerald-400',
                Crypto: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800/50 hover:border-amber-300 dark:hover:border-amber-700 text-amber-700 dark:text-amber-400',
                Trending: 'from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border-rose-200 dark:border-rose-800/50 hover:border-rose-300 dark:hover:border-rose-700 text-rose-700 dark:text-rose-400',
                IPOs: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800/50 hover:border-purple-300 dark:hover:border-purple-700 text-purple-700 dark:text-purple-400',
                ETFs: 'from-cyan-50 to-sky-50 dark:from-cyan-900/20 dark:to-sky-900/20 border-cyan-200 dark:border-cyan-800/50 hover:border-cyan-300 dark:hover:border-cyan-700 text-cyan-700 dark:text-cyan-400',
                News: 'from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 border-slate-200 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-400',
              }[item.label] || 'from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 border-slate-200 dark:border-slate-800/50';
              
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpenMobile(false)}
                  className={`group flex flex-col items-center justify-center gap-2 p-4 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 bg-gradient-to-br ${colors} ${
                    isActive ? 'ring-2 ring-offset-2 ring-emerald-500' : ''
                  }`}
                >
                  <item.icon size={24} className="transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group flex items-center gap-4 p-3 rounded-xl transition-all duration-200 hover:scale-105 ${isActive 
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 hover:shadow-md'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <item.icon size={22} className="transition-transform duration-200 group-hover:scale-110" />
                  {!isCollapsed && <span className="text-sm">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        )}
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
              className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-[100] lg:hidden"
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
        className={`fixed left-0 top-32 h-[calc(100vh-8rem)] bg-white dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800/50 z-30 transition-all duration-300 hidden lg:block overflow-y-auto ${isCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="fixed left-[68px] top-44 bg-emerald-500 dark:bg-emerald-600 border-2 border-white dark:bg-slate-800 rounded-full p-1.5 shadow-lg z-50 text-white hover:bg-emerald-600 dark:hover:bg-emerald-700 hover:scale-110 transition-all duration-200"
          style={{ left: isCollapsed ? '68px' : '244px' }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        <SidebarInner />
      </aside>
    </>
  );
}