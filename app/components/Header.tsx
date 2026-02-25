'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useCountry } from '@/app/context/CountryContext';
import { useSubscription } from '@/app/context/SubscriptionContext';
import { stockAPI } from '@/app/utils/api';
import { debounce } from '@/lib/utils';
import { fetchNavigation, getSection, NavigationItem } from '@/app/services/navigationService';
import {
  Search,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Star,
  Briefcase,
  Sun,
  Moon,
  Layers,
  Wrench,
  BookOpen,
  Globe,
  Bell,
  Sparkles,
  Wallet,
  BarChart3,
  Home,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import TickerTape from './TickerTape';
import { useTheme } from '@/app/context/ThemeContext';
import { SignInToContinue } from './common/SignInToContinue';

interface SearchResult {
  symbol: string;
  name: string;
}

export default function Header({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { country, countries, setCountry } = useCountry();
  const { theme, toggleTheme } = useTheme();
  const { planName, isPro, status } = useSubscription();
  const router = useRouter();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pillarsOpen, setPillarsOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const countryMenuRef = useRef<HTMLDivElement>(null);

  const mainAppUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:5173';
  const authRedirectBase = process.env.NEXT_PUBLIC_AUTH_REDIRECT || 'http://pearto.com';

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [mobileMenuOpen]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await stockAPI.searchStocks(query);
        setSearchResults(response.data || []);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Search failed. Please try again.');
      }
      setIsSearching(false);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (countryMenuRef.current && !countryMenuRef.current.contains(e.target as Node)) {
        setCountryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchResultClick = (symbol: string) => {
    router.push(`/stock/${symbol}`);
    setSearchQuery('');
    setShowSearchResults(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setUserMenuOpen(false);
  };

  const initials = user?.name
    ? user.name.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join('')
    : 'U';


  const [pillarsItems, setPillarsItems] = useState<any[]>([
    { label: 'Markets', href: `${mainAppUrl}/markets` },
    { label: 'Crypto', href: `/crypto` },
    { label: 'News', href: `/news` },
    { label: 'Analysis', href: `/analysis` },
  ]);

  const [toolsItems, setToolsItems] = useState<any[]>([
    { label: 'Stock Screener', href: '/screener' },
    { label: 'Technical Chart', href: '/chart' },
    { label: 'Portfolio Tracker', href: '/profile/portfolio', requiresAuth: true },
    { label: 'Watchlist', href: '/profile/watchlist', requiresAuth: true },
    { label: 'Compare Stocks', href: '/stocks/comparison' },
    { label: 'Compare Crypto', href: '/crypto/comparison' },
    { label: 'All Tools', href: `${mainAppUrl}/tools` },
  ]);

  const [resourcesItems, setResourcesItems] = useState<any[]>([
    { label: 'Articles', href: '/articles' },
    { label: 'Newsletter', href: '/newsletter' },
    { label: 'About Us', href: `${mainAppUrl}/p/about` },
    { label: 'Contact', href: `${mainAppUrl}/contact` },
  ]);

  // Fetch dynamic navigation on mount
  useEffect(() => {
    const loadNavigation = async () => {
      try {
        const navData = await fetchNavigation();

        if (navData && navData.navigation) {
          // Helper to map API items to UI format
          const mapItems = (items: NavigationItem[]) => items.map(item => ({
            label: item.label,
            href: item.url.startsWith('http') ? item.url : `${mainAppUrl}${item.url.startsWith('/') ? '' : '/'}${item.url}`,
            icon: item.icon // We might need to map icons string to components if needed, or just pass string
          }));

          const pillars = getSection(navData, 'pillars');
          if (pillars && pillars.length > 0) {
            // For pillars, we might want to keep local Stocks app specific links if API returns general ones
            // But goal is to match frontend. 
            // Let's check if we should map them or use as is.
            // The frontend just links them.
            setPillarsItems(pillars.map((p: NavigationItem) => ({
              label: p.label,
              href: p.url.startsWith('http') ? p.url : `${mainAppUrl}/${p.url.replace(/^\//, '')}`
            })));
          }

          const tools = getSection(navData, 'tools');
          if (tools && tools.length > 0) {
            setToolsItems(tools.map((t: NavigationItem) => ({
              label: t.label,
              href: t.url.startsWith('http') ? t.url : (t.url.includes('screener') || t.url.includes('chart') || t.url.includes('watchlist') ? t.url : `${mainAppUrl}/${t.url.replace(/^\//, '')}`)
            })));
          }

          const resources = getSection(navData, 'resources');
          if (resources && resources.length > 0) {
            setResourcesItems(resources.map((r: NavigationItem) => ({
              label: r.label,
              href: r.url.startsWith('http') ? r.url : `${mainAppUrl}/${r.url.replace(/^\//, '')}`
            })));
          }
        }
      } catch (error) {
        console.warn('Failed to load dynamic navigation, using fallbacks', error);
      }
    };

    loadNavigation();
  }, [mainAppUrl]);

  return (
    <>
      {/* TickerTape - Fixed at very top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <TickerTape />
      </div>

      {/* PRIMARY NAVBAR - Fixed below TickerTape */}
      <nav className="fixed top-8 left-0 right-0 z-[60] bg-white dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
        <div className="container mx-auto px-2 sm:px-4 md:px-6">
          <div className="flex items-center justify-between h-12 sm:h-14 md:h-16 gap-2 sm:gap-4">

            {/* Mobile Menu Trigger - Left side only */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600 dark:text-slate-300" />
            </button>

            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 mr-auto lg:mr-0">
              <img src="/logo.svg" alt="Pearto Logo" className="h-6 sm:h-7 md:h-8 w-auto" />
              <span className="text-xl sm:text-2xl md:text-3xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-500 truncate">
                Pearto
              </span>
            </Link>

            {/* Center: Search Bar */}
            <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl mx-4 relative">
              <button
                className="w-full flex items-center gap-3 h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm text-slate-500 dark:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                onClick={() => setShowSearchResults(true)}
              >
                <Search size={18} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stocks, crypto, news..."
                  className="flex-1 text-left bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 transition-colors duration-300"
                />
                <span className="hidden lg:flex items-center gap-1 text-xs text-slate-400">
                  <kbd className="px-1.5 py-0.5 rounded border bg-white dark:bg-slate-700 text-[10px] transition-colors duration-300">/</kbd>
                </span>
              </button>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showSearchResults && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-80 overflow-y-auto z-50 transition-colors duration-300"
                  >
                    {searchResults.map((stock) => (
                      <button
                        key={stock.symbol}
                        onClick={() => handleSearchResultClick(stock.symbol)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition"
                      >
                        <div className="font-medium text-slate-900 dark:text-white transition-colors duration-300">{stock.symbol}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 truncate transition-colors duration-300">{stock.name}</div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Search Modal */}
            <AnimatePresence>
              {showSearchResults && (
                <div className="md:hidden fixed inset-0 top-8 z-[200] bg-white dark:bg-slate-900">
                  <div className="flex flex-col h-full">
                    {/* Search Header */}
                    <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => {
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <X size={20} className="text-slate-600 dark:text-slate-300" />
                      </button>
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search stocks, crypto, news..."
                          autoFocus
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                      </div>
                    </div>

                    {/* Search Results */}
                    <div className="flex-1 overflow-y-auto">
                      {isSearching ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                          {searchResults.map((stock) => (
                            <button
                              key={stock.symbol}
                              onClick={() => handleSearchResultClick(stock.symbol)}
                              className="w-full px-4 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                            >
                              <div className="font-medium text-slate-900 dark:text-white">{stock.symbol}</div>
                              <div className="text-sm text-slate-600 dark:text-slate-400 truncate">{stock.name}</div>
                            </button>
                          ))}
                        </div>
                      ) : searchQuery.trim() ? (
                        <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400">
                          No results found
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400">
                          Start typing to search...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              {/* Mobile search button */}
              <button
                className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-300"
                onClick={() => {
                  setShowSearchResults(true);
                  setMobileMenuOpen(false);
                }}
              >
                <Search size={18} className="text-slate-600 dark:text-slate-300" />
              </button>

              {/* Theme, Country, AI Group */}
              <div className="hidden md:flex items-center gap-2 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
                {/* Theme toggle */}
                <button
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300"
                  onClick={toggleTheme}
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? (
                    <Sun size={18} className="text-emerald-500" />
                  ) : (
                    <Moon size={18} className="text-slate-600 transition-colors duration-300" />
                  )}
                </button>

                {/* Country selector */}
                <div className="relative" ref={countryMenuRef}>
                  <button
                    onClick={() => setCountryMenuOpen(!countryMenuOpen)}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-sm transition"
                  >
                    {countries.find(c => c.code === country)?.flagEmoji || '🌐'}                  <span className="text-slate-700 dark:text-slate-300">{country}</span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button >

                {countryMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 max-h-80 overflow-y-auto z-50 transition-colors duration-300">
                    {countries.length > 0 ? (
                      countries.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => { setCountry(c.code); setCountryMenuOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition ${country === c.code ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-700 dark:text-slate-300'}`}
                        >
                          {c.flagEmoji} {c.name}
                        </button>
                      ))
                    ) : (
                      <>
                        <button onClick={() => { setCountry('US'); setCountryMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-300">🇺🇸 United States</button>
                        <button onClick={() => { setCountry('NP'); setCountryMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-300">🇳🇵 Nepal</button>
                        <button onClick={() => { setCountry('IN'); setCountryMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-300">🇮🇳 India</button>
                      </>
                    )}
                  </div>
                  )
                  }
                </div >

                {/* AI Button */}
                < a
                  href={`${mainAppUrl}/ai`}
                  className="px-3 py-2 rounded-lg font-medium text-sm text-white bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 hover:shadow-md transition flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.912 5.813a2 2 0 001.276 1.276L21 12l-5.812 1.912a2 2 0 00-1.276 1.276L12 21l-1.912-5.812a2 2 0 00-1.276-1.276L3 12l5.812-1.912a2 2 0 001.276-1.276L12 3z" />
                  </svg>
                  AI
                </a >
              </div>

              {/* Auth buttons */}
              {
                !isAuthenticated ? (
                  <div className="hidden md:flex items-center gap-2">
                    <a href={`${authRedirectBase}/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : mainAppUrl)}`} className="px-3 py-2 text-sm font-medium hover:text-emerald-600 transition">
                      Sign In
                    </a>
                    <a href={`${authRedirectBase}/signup?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : mainAppUrl)}`} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-500 rounded-lg shadow hover:shadow-md transition">
                      Sign Up
                    </a>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center gap-2 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
                    {/* Plan Badge */}
                    <div className={`px-2.5 py-1 rounded-md text-xs font-medium uppercase tracking-wider ${isPro
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                      : status === 'trialing'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                      {status === 'trialing' ? 'Trial' : isPro ? 'Pro' : 'Free'}
                    </div>

                    <div className="relative" ref={userMenuRef}>
                      <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      >
                        {user?.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-medium">
                            {initials}
                          </div>
                        )}
                        <span className="text-sm text-slate-700 dark:text-slate-300 max-w-[100px] truncate transition-colors duration-300">{user?.name || 'Account'}</span>
                        <ChevronDown size={14} className="text-slate-400" />
                      </button>

                      {userMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50 transition-colors duration-300">
                          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 transition-colors duration-300">
                            <p className="font-medium text-slate-900 dark:text-white transition-colors duration-300">{user?.name || user?.email}</p>
                            <p className="text-sm text-slate-500 transition-colors duration-300">{user?.email}</p>
                          </div>
                          <div className="py-2">
                            <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-300">
                              <User size={16} className="text-slate-400" /> Profile
                            </Link>
                            <Link href="/profile/portfolio" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-300">
                              <Briefcase size={16} className="text-slate-400" /> Portfolio
                            </Link>
                            <Link href="/profile/watchlist" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-300">
                              <Star size={16} className="text-slate-400" /> Watchlist
                            </Link>
                            <Link href="/profile/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-300">
                              <Settings size={16} className="text-slate-400" /> Settings
                            </Link>
                          </div>
                          <div className="border-t border-slate-100 dark:border-slate-700 py-2 transition-colors duration-300">
                            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors duration-300">
                              <LogOut size={16} /> Sign out
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              }


            </div >
          </div >
        </div >
      </nav >

      {/* SECONDARY NAVBAR - Fixed below primary navbar, always visible */}
      < div className="fixed top-24 left-0 right-0 z-[55] bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 hidden md:block transition-colors duration-300" >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center gap-3 py-2.5">
            {/* Pillars Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setPillarsOpen(true)}
              onMouseLeave={() => setPillarsOpen(false)}
            >
              <button className="inline-flex items-center gap-2 h-9 px-3 rounded-full border transition text-sm font-medium text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
                <Layers size={14} className="opacity-70" />
                Pillars
                <ChevronDown size={14} className={`opacity-70 transition-transform ${pillarsOpen ? 'rotate-180' : ''}`} />
              </button>
              {pillarsOpen && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50 transition-colors duration-300">
                  {pillarsItems.map((item) => (
                    item.href.startsWith('http') || item.href.startsWith(mainAppUrl) ? (
                      <a
                        key={item.label}
                        href={item.href}
                        className="block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                      >
                        {item.label}
                      </Link>
                    )
                  ))}
                </div>
              )}
            </div>

            {/* Booyah Button */}
            <a
              href={`${mainAppUrl}/booyah`}
              className="px-4 py-2 rounded-lg font-medium text-sm text-white bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 shadow hover:shadow-md transition"
            >
              Booyah
            </a>

            {/* Tools Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setToolsOpen(true)}
              onMouseLeave={() => setToolsOpen(false)}
            >
              <button className="inline-flex items-center gap-2 h-9 px-3 rounded-full border transition text-sm font-medium text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
                <Wrench size={14} className="opacity-70" />
                Tools
                <ChevronDown size={14} className={`opacity-70 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>
              {toolsOpen && (
                <div className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50 transition-colors duration-300">
                  {toolsItems.map((item) => {
                    if (item.requiresAuth && !isAuthenticated) {
                      return (
                        <button
                          key={item.label}
                          onClick={() => { setShowSignIn(true); setToolsOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                        >
                          {item.label}
                        </button>
                      );
                    }
                    return item.href.startsWith('http') || item.href.startsWith(mainAppUrl) ? (
                      <a
                        key={item.label}
                        href={item.href}
                        className="block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setResourcesOpen(true)}
              onMouseLeave={() => setResourcesOpen(false)}
            >
              <button className="inline-flex items-center gap-2 h-9 px-3 rounded-full border transition text-sm font-medium text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
                <BookOpen size={14} className="opacity-70" />
                Resources
                <ChevronDown size={14} className={`opacity-70 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
              </button>
              {resourcesOpen && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50 transition-colors duration-300">
                  {resourcesItems.map((item) => (
                    item.href.startsWith('http') || item.href.startsWith(mainAppUrl) ? (
                      <a
                        key={item.label}
                        href={item.href}
                        className="block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                      >
                        {item.label}
                      </Link>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div >

      {/* Mobile Menu */}
      <AnimatePresence>
        {
          mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[45]"
              />
              {/* Menu Panel - Left Side */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="md:hidden fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl z-[70] overflow-y-auto"
              >
                <div className="min-h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <div className="flex items-center gap-2">
                      <img src="/logo.svg" alt="Pearto" className="h-7 w-auto" />
                      <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-cyan-500">Pearto</span>
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <X size={20} className="text-slate-600 dark:text-slate-300" />
                    </button>
                  </div>

                  {/* All Content - Scrollable */}
                  <div className="p-4 space-y-3">
                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={toggleTheme}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        {theme === 'dark' ? <Sun size={16} className="text-emerald-500" /> : <Moon size={16} className="text-slate-600" />}
                        <span className="text-sm font-medium">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                      </button>
                      <div className="relative" ref={countryMenuRef}>
                        <button
                          onClick={() => setCountryMenuOpen(!countryMenuOpen)}
                          className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full"
                        >
                          <span>{countries.find(c => c.code === country)?.flagEmoji || '🌐'}</span>
                          <span className="text-sm font-medium">{country}</span>
                        </button>
                        {countryMenuOpen && (
                          <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 max-h-48 overflow-y-auto z-50">
                            {countries.length > 0 ? (
                              countries.map((c) => (
                                <button
                                  key={c.code}
                                  onClick={() => { setCountry(c.code); setCountryMenuOpen(false); }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition ${country === c.code ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
                                >
                                  {c.flagEmoji} {c.name}
                                </button>
                              ))
                            ) : (
                              <>
                                <button onClick={() => { setCountry('US'); setCountryMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">🇺🇸 US</button>
                                <button onClick={() => { setCountry('NP'); setCountryMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">🇳🇵 Nepal</button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* AI Button */}
                    <a
                      href={`${mainAppUrl}/ai`}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium text-white bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3l1.912 5.813a2 2 0 001.276 1.276L21 12l-5.812 1.912a2 2 0 00-1.276 1.276L12 21l-1.912-5.812a2 2 0 00-1.276-1.276L3 12l5.812-1.912a2 2 0 001.276-1.276L12 3z" />
                      </svg>
                      AI Assistant
                    </a>

                    {/* Sidebar Navigation Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-2 py-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800/50 hover:shadow-md transition-all">
                        <Home size={20} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Home</span>
                      </Link>
                      <Link href="/stocks" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-2 py-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800/50 hover:shadow-md transition-all">
                        <BarChart3 size={20} className="text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Stocks</span>
                      </Link>
                      <Link href="/crypto" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-2 py-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50 hover:shadow-md transition-all">
                        <Wallet size={20} className="text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Crypto</span>
                      </Link>
                      <Link href="/trending" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-2 py-3 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border border-rose-200 dark:border-rose-800/50 hover:shadow-md transition-all">
                        <TrendingUp size={20} className="text-rose-600 dark:text-rose-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Trending</span>
                      </Link>
                      <Link href="/ipos" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-2 py-3 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800/50 hover:shadow-md transition-all">
                        <Calendar size={20} className="text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">IPOs</span>
                      </Link>
                      <Link href="/etfs" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-2 py-3 rounded-xl bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-900/20 dark:to-sky-900/20 border border-cyan-200 dark:border-cyan-800/50 hover:shadow-md transition-all">
                        <Briefcase size={20} className="text-cyan-600 dark:text-cyan-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">ETFs</span>
                      </Link>
                    </div>

                    {/* Two Column Layout for Menu Sections */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Pillars - Left Column */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800/50 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200">
                        <div className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1.5 font-bold">
                          <Layers size={12} /> Pillars
                        </div>
                        <div className="space-y-1">
                          {pillarsItems.map((item) => (
                            item.href.startsWith('http') || item.href.startsWith(mainAppUrl) ? (
                              <a key={item.label} href={item.href} className="block py-2 px-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium transition-all text-slate-700 dark:text-slate-300 hover:translate-x-1" onClick={() => setMobileMenuOpen(false)}>
                                {item.label}
                              </a>
                            ) : (
                              <Link key={item.label} href={item.href} className="block py-2 px-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium transition-all text-slate-700 dark:text-slate-300 hover:translate-x-1" onClick={() => setMobileMenuOpen(false)}>
                                {item.label}
                              </Link>
                            )
                          ))}
                        </div>
                      </div>

                      {/* Resources - Right Column */}
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800/50 shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200">
                        <div className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5 font-bold">
                          <BookOpen size={12} /> Resources
                        </div>
                        <div className="space-y-1">
                          {resourcesItems.map((item) => (
                            item.href.startsWith('http') || item.href.startsWith(mainAppUrl) ? (
                              <a key={item.label} href={item.href} className="block py-2 px-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:text-amber-700 dark:hover:text-amber-300 text-xs font-medium transition-all text-slate-700 dark:text-slate-300 hover:translate-x-1" onClick={() => setMobileMenuOpen(false)}>
                                {item.label}
                              </a>
                            ) : (
                              <Link key={item.label} href={item.href} className="block py-2 px-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:text-amber-700 dark:hover:text-amber-300 text-xs font-medium transition-all text-slate-700 dark:text-slate-300 hover:translate-x-1" onClick={() => setMobileMenuOpen(false)}>
                                {item.label}
                              </Link>
                            )
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Tools - Full Width */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800/50 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200">
                      <div className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5 font-bold">
                        <Wrench size={12} /> Tools
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {toolsItems.map((item) => {
                          if (item.requiresAuth && !isAuthenticated) {
                            return (
                              <button
                                key={item.label}
                                onClick={() => { setShowSignIn(true); setMobileMenuOpen(false); }}
                                className="block py-2 px-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-medium transition-all text-slate-700 dark:text-slate-300 hover:scale-105"
                              >
                                {item.label}
                              </button>
                            );
                          }
                          return item.href.startsWith('http') || item.href.startsWith(mainAppUrl) ? (
                            <a key={item.label} href={item.href} className="block py-2 px-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-medium transition-all text-slate-700 dark:text-slate-300 hover:scale-105" onClick={() => setMobileMenuOpen(false)}>
                              {item.label}
                            </a>
                          ) : (
                            <Link key={item.label} href={item.href} className="block py-2 px-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-medium transition-all text-slate-700 dark:text-slate-300 hover:scale-105" onClick={() => setMobileMenuOpen(false)}>
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Profile/Auth Section */}
                    {isAuthenticated ? (
                      <>
                        {/* User Profile Card */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800/50">
                          {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
                              {initials}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white truncate text-sm">{user?.name || 'User'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                          </div>
                          <div className={`px-2 py-1 rounded-md text-xs font-bold ${isPro ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                            {status === 'trialing' ? 'Trial' : isPro ? 'Pro' : 'Free'}
                          </div>
                        </div>
                        {/* Profile Actions Grid */}
                        <div className="grid grid-cols-2 gap-2">
                          <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all">
                            <User size={18} className="text-emerald-600" />
                            <span className="text-xs font-medium">Profile</span>
                          </Link>
                          <Link href="/profile/portfolio" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all">
                            <Briefcase size={18} className="text-emerald-600" />
                            <span className="text-xs font-medium">Portfolio</span>
                          </Link>
                          <Link href="/profile/watchlist" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all">
                            <Star size={18} className="text-emerald-600" />
                            <span className="text-xs font-medium">Watchlist</span>
                          </Link>
                          <Link href="/profile/alerts" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all">
                            <Bell size={18} className="text-emerald-600" />
                            <span className="text-xs font-medium">Alerts</span>
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Link href="/profile/settings" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all">
                            <Settings size={18} className="text-emerald-600" />
                            <span className="text-xs font-medium">Settings</span>
                          </Link>
                        </div>
                        <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-all">
                          <LogOut size={16} />
                          <span className="text-sm">Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <a href={`${authRedirectBase}/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : mainAppUrl)}`} className="block py-3 text-center rounded-lg border-2 border-emerald-500 font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all" onClick={() => setMobileMenuOpen(false)}>
                            Sign In
                          </a>
                          <a href={`${authRedirectBase}/signup?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : mainAppUrl)}`} className="block py-3 text-center rounded-lg text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-500 font-medium shadow-md hover:shadow-lg transition-all" onClick={() => setMobileMenuOpen(false)}>
                            Sign Up
                          </a>
                        </div>
                        {/* Profile CTAs for non-authenticated users */}
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-3 border border-slate-200 dark:border-slate-600">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 font-medium">Sign in to access:</p>
                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => { setShowSignIn(true); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1.5 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all">
                              <Briefcase size={16} className="text-slate-400" />
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Portfolio</span>
                            </button>
                            <button onClick={() => { setShowSignIn(true); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1.5 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all">
                              <Star size={16} className="text-slate-400" />
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Watchlist</span>
                            </button>
                            <button onClick={() => { setShowSignIn(true); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1.5 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all">
                              <Bell size={16} className="text-slate-400" />
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Alerts</span>
                            </button>
                            <button onClick={() => { setShowSignIn(true); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1.5 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all">
                              <Settings size={16} className="text-slate-400" />
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Settings</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )
        }
      </AnimatePresence >

      <SignInToContinue
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        message="Sign in to access your portfolio, watchlist, alerts, and more personalized features."
      />
    </>
  );
}
