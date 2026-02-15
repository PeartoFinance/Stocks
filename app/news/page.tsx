'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Newspaper,
  Clock,
  TrendingUp,
  Eye,
  ExternalLink,
  Filter,
  Search,
  Activity,
  Globe,
  ChevronRight,
  BookOpen,
  Video,
  ChevronLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { stockAPI } from '../utils/api';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  source: string;
  publishedAt: string;
  category: string;
  imageUrl?: string;
}

function mapNewsItem(item: any): NewsArticle {
  return {
    id: String(item.id || ''),
    title: String(item.title || ''),
    summary: String(item.summary || ''),
    content: String(item.full_content || item.content || ''),
    author: String(item.author || 'Unknown'),
    source: String(item.source || 'News'),
    publishedAt: String(item.published_at || new Date().toISOString()),
    category: String(item.category || 'General'),
    imageUrl: String(item.image || item.image_url || ''),
  };
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSector, setActiveSector] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [sectors] = useState<string[]>(['All', 'Technology', 'Finance', 'Healthcare', 'Energy', 'Real Estate', 'Consumer', 'Industrial', 'Materials', 'Utilities', 'Telecom']);
  const [stats, setStats] = useState({ total: 0, sources: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await stockAPI.getPublishedNews();
        
        if (response.items && response.items.length > 0) {
          const mappedNews = response.items.map(mapNewsItem);
          setNews(mappedNews);
          setFilteredNews(mappedNews);
          
          const uniqueSources = new Set(mappedNews.map(n => n.source));
          setStats({ total: mappedNews.length, sources: uniqueSources.size });
        } else {
          setNews([]);
          setFilteredNews([]);
          setStats({ total: 0, sources: 0 });
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        toast.error('Failed to load news data');
        setNews([]);
        setFilteredNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    const filtered = news.filter(article => {
      const matchesSearch = !searchTerm || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSector = activeSector === 'All' || 
        article.title.toLowerCase().includes(activeSector.toLowerCase()) ||
        article.summary.toLowerCase().includes(activeSector.toLowerCase()) ||
        article.category.toLowerCase().includes(activeSector.toLowerCase());
      
      return matchesSearch && matchesSector;
    });

    setFilteredNews(filtered);
  }, [news, searchTerm, activeSector]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNews = filteredNews.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSector, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Activity className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Loading News</h2>
              <p className="text-gray-600 dark:text-slate-400">Please wait while we fetch the latest financial news...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <main className="p-3 sm:p-6 lg:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-300 dark:to-purple-400 mb-2 sm:mb-4">Financial News</h1>
          <p className="text-sm sm:text-base lg:text-xl text-gray-600 dark:text-slate-400">Stay informed with the latest market news and financial insights</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <Newspaper className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] sm:text-xs lg:text-sm text-gray-500 dark:text-slate-400">Articles</span>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 dark:text-slate-400">Total available</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-600 dark:text-green-400" />
              <span className="text-[10px] sm:text-xs lg:text-sm text-gray-500 dark:text-slate-400">Sector</span>
            </div>
            <p className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">{activeSector}</p>
            <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 dark:text-slate-400">Current filter</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <Filter className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-purple-600 dark:text-purple-400" />
              <span className="text-[10px] sm:text-xs lg:text-sm text-gray-500 dark:text-slate-400">Filtered</span>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{filteredNews.length}</p>
            <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 dark:text-slate-400">Matching results</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <Globe className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-orange-600 dark:text-orange-400" />
              <span className="text-[10px] sm:text-xs lg:text-sm text-gray-500 dark:text-slate-400">Sources</span>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{stats.sources}</p>
            <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 dark:text-slate-400">Unique publishers</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100 dark:border-slate-700 mb-4 sm:mb-8">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Sector Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Sector</label>
              <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                <div className="flex gap-2 min-w-max">
                  {sectors.map((sector) => (
                    <button key={sector} onClick={() => setActiveSector(sector)} className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-sm font-medium transition-all whitespace-nowrap ${activeSector === sector ? 'bg-purple-600 dark:bg-purple-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}>{sector}</button>
                  ))}
                </div>
              </div>
            </div>
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input type="text" placeholder="Search news..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400" />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="lg:col-span-2 space-y-3 sm:space-y-4 lg:space-y-6">
            {currentNews.map((article, index) => (
              <motion.div key={article.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }} className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all cursor-pointer overflow-hidden" onClick={() => setSelectedNews(article)}>
                <div className="flex flex-col sm:flex-row gap-0 sm:gap-4">
                  {article.imageUrl && article.imageUrl.trim() !== '' && (
                    <div className="w-full sm:w-1/3 flex-shrink-0">
                      <div className="w-full h-40 sm:h-full sm:min-h-[180px] bg-gray-100 dark:bg-gray-700">
                        <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" onError={(e) => { const parent = e.currentTarget.parentElement; if (parent) parent.style.display = 'none'; }} />
                      </div>
                    </div>
                  )}
                  <div className="flex-1 p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2 sm:mb-3">
                      <div className="flex items-center space-x-2 text-xs sm:text-sm">
                        <span className="font-medium text-blue-600 dark:text-blue-400 truncate max-w-[120px] sm:max-w-none">{article.source}</span>
                        <span className="text-gray-300 dark:text-slate-600">•</span>
                        <span className="text-gray-500 dark:text-slate-400 whitespace-nowrap">{formatTimeAgo(article.publishedAt)}</span>
                      </div>
                      <span className="inline-flex px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 whitespace-nowrap">{article.category}</span>
                    </div>
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">{article.title}</h2>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-slate-400 mb-3 sm:mb-4 line-clamp-2">{article.summary}</p>
                    <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-gray-100 dark:border-slate-700">
                      <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Read article</span>
                      </div>
                      <button className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                        <span className="text-xs sm:text-sm font-medium">Read More</span>
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg border border-gray-100 dark:border-slate-700">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredNews.length)} of {filteredNews.length}
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 sm:p-2 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        currentPage === page
                          ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
                          : 'border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 sm:p-2 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="space-y-3 sm:space-y-4 lg:space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-lg border border-gray-100 dark:border-slate-700">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Market Summary</h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center"><span className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">S&P 500</span><span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">+0.85%</span></div>
                <div className="flex justify-between items-center"><span className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">NASDAQ</span><span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">+1.23%</span></div>
                <div className="flex justify-between items-center"><span className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Dow Jones</span><span className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400">-0.34%</span></div>
                <div className="flex justify-between items-center"><span className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">VIX</span><span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">15.2</span></div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-lg border border-gray-100 dark:border-slate-700">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Trending Topics</h3>
              <div className="space-y-2 sm:space-y-3">
                {['Federal Reserve', 'AI Technology', 'Climate Investment', 'Cryptocurrency', 'Supply Chain'].map((topic, index) => (
                  <div key={topic} className="flex items-center justify-between"><span className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">{topic}</span><span className="text-[10px] sm:text-xs text-gray-400 dark:text-slate-500">#{index + 1}</span></div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-lg border border-gray-100 dark:border-slate-700">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Resources</h3>
              <div className="space-y-2 sm:space-y-3">
                <button className="flex items-center space-x-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors w-full text-left"><BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" /><span>Financial Education</span></button>
                <button className="flex items-center space-x-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors w-full text-left"><Video className="h-3.5 w-3.5 sm:h-4 sm:w-4" /><span>Market Analysis Videos</span></button>
                <button className="flex items-center space-x-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors w-full text-left"><Newspaper className="h-3.5 w-3.5 sm:h-4 sm:w-4" /><span>Newsletter Archive</span></button>
              </div>
            </div>
          </motion.div>
        </div>

        {filteredNews.length === 0 && (
          <div className="text-center py-16">
            <Newspaper className="h-16 w-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No news found</h3>
            <p className="text-gray-600 dark:text-slate-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </main>
    </div>
  );
}
