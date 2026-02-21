'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import TickerTape from './TickerTape';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-slate-50 dark:bg-slate-900" />;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-x-hidden w-full">
      {/* Header - Full width at top */}
      <Header onOpenSidebar={() => setIsOpenMobile(true)} />

      {/* Sidebar - Fixed vertically */}
      <Sidebar isOpenMobile={isOpenMobile} setIsOpenMobile={setIsOpenMobile} onCollapseChange={setSidebarCollapsed} />

      {/* Main content with left padding for sidebar */}
      <main className={`flex-1 w-full overflow-x-hidden pt-24 transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {children}
      </main>

      {/* Footer - Full width at bottom */}
      <Footer />
    </div>
  );
}