'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useCountry } from '@/app/context/CountryContext';
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
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import TickerTape from './TickerTape';
import { useTheme } from '@/app/context/ThemeContext';

interface SearchResult {
  symbol: string;
  name: string;
}

export default function Header({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { country, countries, setCountry } = useCountry();
  const { theme, toggleTheme } = useTheme();
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

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const countryMenuRef = useRef<HTMLDivElement>(null);

  const mainAppUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:5173';
  const authRedirectBase = process.env.NEXT_PUBLIC_AUTH_REDIRECT || 'http://pearto.com';

  // Handle scroll for secondary navbar hiding
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    { label: 'Crypto', href: `${mainAppUrl}/crypto` },
    { label: 'News', href: `${mainAppUrl}/news` },
    { label: 'Analysis', href: `${mainAppUrl}/analysis` },
  ]);

  const [toolsItems, setToolsItems] = useState<any[]>([
    { label: 'Stock Screener', href: '/screener' },
    { label: 'Technical Chart', href: '/chart' },
    { label: 'Portfolio Tracker', href: '/profile/portfolio' },
    { label: 'Watchlist', href: '/watchlist' },
    { label: 'Compare Stocks', href: '/stocks/comparison' },
    { label: 'All Tools', href: `${mainAppUrl}/tools` },
  ]);

  const [resourcesItems, setResourcesItems] = useState<any[]>([
    { label: 'Articles', href: '/articles' },
    { label: 'Newsletter', href: '/newsletter' },
    { label: 'About Us', href: `${mainAppUrl}/about` },
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
      <nav className="fixed top-8 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-pearto-border/50 dark:border-gray-800/50 transition-colors duration-300">
        <div className="container mx-auto px-2 sm:px-4 md:px-6">
          <div className="flex items-center justify-between h-12 sm:h-14 md:h-16 gap-2 sm:gap-4">

            {/* Mobile Menu Trigger - ONLY visible on sm/md screens */}
            <button
              onClick={onOpenSidebar}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-300 transition-colors duration-300" />
            </button>

            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 mr-auto lg:mr-0">
              <img src="/logo.svg" alt="Pearto Logo" className="h-6 sm:h-7 md:h-8 w-auto" />
              <span className="text-base sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-500 truncate">
                Pearto
              </span>
            </Link>

            {/* Center: Search Bar */}
            <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl mx-4 relative">
              <button
                className="w-full flex items-center gap-3 h-10 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-500 dark:text-gray-400 transition focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                onClick={() => setShowSearchResults(true)}
              >
                <Search size={18} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stocks, crypto, news..."
                  className="flex-1 text-left bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 transition-colors duration-300"
                />
                <span className="hidden lg:flex items-center gap-1 text-xs text-gray-400">
                  <kbd className="px-1.5 py-0.5 rounded border bg-white dark:bg-gray-700 text-[10px] transition-colors duration-300">/</kbd>
                </span>
              </button>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showSearchResults && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-80 overflow-y-auto z-50 transition-colors duration-300"
                  >
                    {searchResults.map((stock) => (
                      <button
                        key={stock.symbol}
                        onClick={() => handleSearchResultClick(stock.symbol)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition"
                      >
                        <div className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">{stock.symbol}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate transition-colors duration-300">{stock.name}</div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              {/* Mobile search button */}
              <button
                className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
                onClick={() => setShowSearchResults(true)}
              >
                <Search size={18} />
              </button>

              {/* Theme toggle */}
              <button
                className="hidden sm:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-pearto-slate/50 transition-all duration-300"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun size={18} className="text-pearto-green" />
                ) : (
                  <Moon size={18} className="text-gray-600 dark:text-pearto-cloud transition-colors duration-300" />
                )}
              </button>

              {/* Country selector */}
              <div className="relative hidden md:block" ref={countryMenuRef}>
                <button
                  onClick={() => setCountryMenuOpen(!countryMenuOpen)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition"
                >
                  {countries.find(c => c.code === country)?.flagEmoji || '🌐'}                  <span className="text-gray-700 dark:text-gray-300">{country}</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button >

                {countryMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 max-h-80 overflow-y-auto z-50 transition-colors duration-300">
                    {countries.length > 0 ? (
                      countries.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => { setCountry(c.code); setCountryMenuOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition ${country === c.code ? 'text-emerald-600 dark:text-pearto-green bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-700 dark:text-gray-300'}`}
                        >
                          {c.flagEmoji} {c.name}
                        </button>
                      ))
                    ) : (
                      <>
                        <button onClick={() => { setCountry('US'); setCountryMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">🇺🇸 United States</button>
                        <button onClick={() => { setCountry('NP'); setCountryMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">🇳🇵 Nepal</button>
                        <button onClick={() => { setCountry('IN'); setCountryMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">🇮🇳 India</button>
                      </>
                    )}
                  </div>
                )
                }
              </div >

              {/* AI Button */}
              < a
                href={`${mainAppUrl}/ai`}
                className="hidden md:flex px-3 py-2 rounded-lg font-semibold text-sm text-white bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 shadow hover:shadow-md transition items-center gap-1.5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.912 5.813a2 2 0 001.276 1.276L21 12l-5.812 1.912a2 2 0 00-1.276 1.276L12 21l-1.912-5.812a2 2 0 00-1.276-1.276L3 12l5.812-1.912a2 2 0 001.276-1.276L12 3z" />
                </svg>
                AI
              </a >

              {/* Auth buttons */}
              {
                !isAuthenticated ? (
                  <div className="hidden md:flex items-center gap-2">
                    <a href={`${authRedirectBase}/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : mainAppUrl)}`} className="px-3 py-2 text-sm font-medium hover:text-emerald-600 dark:text-pearto-green transition">
                      Sign In
                    </a>
                    <a href={`${authRedirectBase}/signup?redirect=true`} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-500 rounded-lg shadow hover:shadow-md transition">
                      Sign Up
                    </a>
                  </div>
                ) : (
                  <div className="hidden md:block relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-medium">
                          {initials}
                        </div>
                      )}
                      <span className="text-sm text-gray-700 dark:text-gray-300 max-w-[100px] truncate transition-colors duration-300">{user?.name || 'Account'}</span>
                      <ChevronDown size={14} className="text-gray-400" />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 transition-colors duration-300">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
                          <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{user?.name || user?.email}</p>
                          <p className="text-sm text-gray-500 dark:text-pearto-gray transition-colors duration-300">{user?.email}</p>
                        </div>
                        <div className="py-2">
                          <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                            <User size={16} className="text-gray-400" /> Profile
                          </Link>
                          <Link href="/profile/portfolio" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                            <Briefcase size={16} className="text-gray-400" /> Portfolio
                          </Link>
                          <Link href="/profile/watchlist" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                            <Star size={16} className="text-gray-400" /> Watchlist
                          </Link>
                          <Link href="/profile/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                            <Settings size={16} className="text-gray-400" /> Settings
                          </Link>
                        </div>
                        <div className="border-t border-gray-100 dark:border-gray-700 py-2 transition-colors duration-300">
                          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-pearto-pink hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors duration-300">
                            <LogOut size={16} /> Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              }

              {/* Mobile burger */}
              <button
                className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors duration-300"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div >
          </div >
        </div >
      </nav >

      {/* SECONDARY NAVBAR - Fixed below primary navbar, always visible */}
      < div className="fixed top-24 left-0 right-0 z-30 bg-white dark:bg-gray-900 backdrop-blur border-b border-gray-200 dark:border-gray-800/50 hidden md:block transition-colors duration-300" >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center gap-2 py-2.5">
            {/* Pillars Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setPillarsOpen(true)}
              onMouseLeave={() => setPillarsOpen(false)}
            >
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <Layers size={14} className="opacity-80" />
                Pillars
                <ChevronDown size={14} className={`transition-transform ${pillarsOpen ? 'rotate-180' : ''}`} />
              </button>
              {pillarsOpen && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 transition-colors duration-300">
                  {pillarsItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Booyah Button */}
            <a
              href={`${mainAppUrl}/booyah`}
              className="px-4 py-2 rounded-lg font-bold text-white bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 shadow hover:from-green-600 hover:to-emerald-600 transition-all text-sm"
            >
              Booyah
            </a>

            {/* Tools Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setToolsOpen(true)}
              onMouseLeave={() => setToolsOpen(false)}
            >
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <Wrench size={14} className="opacity-80" />
                Tools
                <ChevronDown size={14} className={`transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>
              {toolsOpen && (
                <div className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 transition-colors duration-300">
                  {toolsItems.map((item) => (
                    item.href.startsWith('http') || item.href.startsWith(mainAppUrl) ? (
                      <a
                        key={item.label}
                        href={item.href}
                        className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      >
                        {item.label}
                      </Link>
                    )
                  ))}
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setResourcesOpen(true)}
              onMouseLeave={() => setResourcesOpen(false)}
            >
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <BookOpen size={14} className="opacity-80" />
                Resources
                <ChevronDown size={14} className={`transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
              </button>
              {resourcesOpen && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 transition-colors duration-300">
                  {resourcesItems.map((item) => (
                    item.href.startsWith('http') || item.href.startsWith(mainAppUrl) ? (
                      <a
                        key={item.label}
                        href={item.href}
                        className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
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
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden fixed inset-x-0 top-12 sm:top-14 z-40 bg-white dark:bg-gray-900 overflow-auto max-h-[calc(100vh-3.5rem)] transition-colors duration-300"
            >
              <div className="p-3 sm:p-4 space-y-3 pb-20">
                {/* Close button at the top */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
                  >
                    <X size={20} className="text-gray-600 dark:text-gray-300" />
                  </button>
                </div>

                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search stocks..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300"
                  />
                </div>

                {/* AI Button */}
                <a
                  href={`${mainAppUrl}/ai`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 shadow-md"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.912 5.813a2 2 0 001.276 1.276L21 12l-5.812 1.912a2 2 0 00-1.276 1.276L12 21l-1.912-5.812a2 2 0 00-1.276-1.276L3 12l5.812-1.912a2 2 0 001.276-1.276L12 3z" />
                  </svg>
                  AI Assistant
                </a>

                {/* Booyah */}
                <a
                  href={`${mainAppUrl}/booyah`}
                  className="flex items-center justify-center w-full py-3 rounded-xl font-bold text-white bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 shadow-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Booyah
                </a>

                {/* Menu Sections */}
                <div className="space-y-4">
                  {/* Pillars */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 transition-colors duration-300">
                    <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-pearto-gray mb-3 flex items-center gap-2 transition-colors duration-300">
                      <Layers size={14} /> Pillars
                    </div>
                    <div className="space-y-1">
                      {pillarsItems.map((item) => (
                        <a key={item.label} href={item.href} className="block py-2.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition-colors duration-300" onClick={() => setMobileMenuOpen(false)}>
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Tools */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 transition-colors duration-300">
                    <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-pearto-gray mb-3 flex items-center gap-2 transition-colors duration-300">
                      <Wrench size={14} /> Tools
                    </div>
                    <div className="space-y-1">
                      {toolsItems.map((item) => (
                        item.href.startsWith('http') || item.href.startsWith(mainAppUrl) ? (
                          <a key={item.label} href={item.href} className="block py-2.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition-colors duration-300" onClick={() => setMobileMenuOpen(false)}>
                            {item.label}
                          </a>
                        ) : (
                          <Link key={item.label} href={item.href} className="block py-2.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition-colors duration-300" onClick={() => setMobileMenuOpen(false)}>
                            {item.label}
                          </Link>
                        )
                      ))}
                    </div>
                  </div>

                  {/* Resources */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 transition-colors duration-300">
                    <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-pearto-gray mb-3 flex items-center gap-2 transition-colors duration-300">
                      <BookOpen size={14} /> Resources
                    </div>
                    <div className="space-y-1">
                      {resourcesItems.map((item) => (
                        item.href.startsWith('http') || item.href.startsWith(mainAppUrl) ? (
                          <a key={item.label} href={item.href} className="block py-2.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition-colors duration-300" onClick={() => setMobileMenuOpen(false)}>
                            {item.label}
                          </a>
                        ) : (
                          <Link key={item.label} href={item.href} className="block py-2.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition-colors duration-300" onClick={() => setMobileMenuOpen(false)}>
                            {item.label}
                          </Link>
                        )
                      ))}
                    </div>
                  </div>
                </div>

                {/* Auth Section */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
                  {!isAuthenticated ? (
                    <div className="flex gap-3">
                      <a href={`${authRedirectBase}/login?redirect=true`} className="flex-1 py-3 text-center rounded-xl border border-gray-200 dark:border-gray-700 font-medium transition-colors duration-300" onClick={() => setMobileMenuOpen(false)}>
                        Sign In
                      </a>
                      <a href={`${authRedirectBase}/signup?redirect=true`} className="flex-1 py-3 text-center rounded-xl text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-500 font-medium" onClick={() => setMobileMenuOpen(false)}>
                        Sign Up
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300">Profile</Link>
                      <Link href="/profile/portfolio" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300">Portfolio</Link>
                      <Link href="/profile/settings" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300">Settings</Link>
                      <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full py-3 rounded-xl bg-red-50 dark:bg-pearto-pink/100/10 text-red-600 dark:text-pearto-pink font-medium transition-colors duration-300">
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        }
      </AnimatePresence >
    </>
  );
}
