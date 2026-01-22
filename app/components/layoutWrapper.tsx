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

  if (!mounted) return <div className="min-h-screen bg-gray-50" />;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Ticker Tape - Market data marquee */}
      <TickerTape />
      
      {/* Header - Full width at top */}
      <Header onOpenSidebar={() => setIsOpenMobile(true)} />

      {/* Middle section: Sidebar + Content */}
      <div className="flex flex-1">
        {/* Sidebar - sticky within content area */}
        <Sidebar isOpenMobile={isOpenMobile} setIsOpenMobile={setIsOpenMobile} />

        {/* Main content - no margin needed since sidebar is in the flow */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Footer - Full width at bottom */}
      <Footer />
    </div>
  );
}