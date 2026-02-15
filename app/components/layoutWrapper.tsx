'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import TickerTape from './TickerTape';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-gray-50 dark:bg-slate-900" />;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-x-hidden w-full">
      {/* Header - Full width at top */}
      <Header onOpenSidebar={() => setIsOpenMobile(true)} />

      {/* Middle section: Sidebar + Content with top padding for fixed header */}
      <div className="flex flex-1 pt-32">
        {/* Sidebar - sticky within content area */}
        <Sidebar isOpenMobile={isOpenMobile} setIsOpenMobile={setIsOpenMobile} />

        {/* Main content */}
        <main className="flex-1 w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Footer - Full width at bottom */}
      <Footer />
    </div>
  );
}