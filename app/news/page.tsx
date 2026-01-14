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
  Video
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
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);

  const categories = ['All', 'Technology', 'Monetary Policy', 'Cryptocurrency', 'ESG', 'Manufacturing', 'Healthcare', 'Energy'];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await stockAPI.getPublishedNews(activeCategory);
        
        if (response.items && response.items.length > 0) {
          const mappedNews = response.items.map(mapNewsItem);
          setNews(mappedNews);
          setFilteredNews(mappedNews);
        } else {
          setNews([]);
          setFilteredNews([]);
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
  }, [activeCategory]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredNews(news);
      return;
    }

    const filtered = news.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.summary.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    setFilteredNews(filtered);
  }, [news, searchTerm]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Activity className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900">Loading News</h2>
              <p className="text-gray-600">Please wait while we fetch the latest financial news...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Financial News
          </h1>
          <p className="text-xl text-gray-600">
            Stay informed with the latest market news and financial insights
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Newspaper className="h-8 w-8 text-blue-600" />
              <span className="text-sm text-gray-500">Today</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">47</p>
            <p className="text-sm text-green-600 font-medium">+12 from yesterday</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <span className="text-sm text-gray-500">Trending</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">Fed Rate</p>
            <p className="text-sm text-gray-600">Most discussed topic</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Eye className="h-8 w-8 text-purple-600" />
              <span className="text-sm text-gray-500">Total Views</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">285K</p>
            <p className="text-sm text-green-600 font-medium">+18% vs last week</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Globe className="h-8 w-8 text-orange-600" />
              <span className="text-sm text-gray-500">Sources</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">24</p>
            <p className="text-sm text-gray-600">Trusted publications</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    activeCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </motion.div>

        {/* News Articles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Articles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            {filteredNews.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setSelectedNews(article)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-blue-600">{article.source}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500">{formatTimeAgo(article.publishedAt)}</span>
                  </div>
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600">
                    {article.category}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                  {article.title}
                </h2>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {article.summary}
                </p>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Read article</span>
                    </span>
                  </div>
                  <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors">
                    <span className="text-sm font-medium">Read More</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Market Summary */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Market Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">S&P 500</span>
                  <span className="text-sm font-medium text-green-600">+0.85%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">NASDAQ</span>
                  <span className="text-sm font-medium text-green-600">+1.23%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dow Jones</span>
                  <span className="text-sm font-medium text-red-600">-0.34%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">VIX</span>
                  <span className="text-sm font-medium text-gray-900">15.2</span>
                </div>
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Trending Topics</h3>
              <div className="space-y-3">
                {['Federal Reserve', 'AI Technology', 'Climate Investment', 'Cryptocurrency', 'Supply Chain'].map((topic, index) => (
                  <div key={topic} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{topic}</span>
                    <span className="text-xs text-gray-400">#{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Resources</h3>
              <div className="space-y-3">
                <button className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 transition-colors w-full text-left">
                  <BookOpen className="h-4 w-4" />
                  <span>Financial Education</span>
                </button>
                <button className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 transition-colors w-full text-left">
                  <Video className="h-4 w-4" />
                  <span>Market Analysis Videos</span>
                </button>
                <button className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 transition-colors w-full text-left">
                  <Newspaper className="h-4 w-4" />
                  <span>Newsletter Archive</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {filteredNews.length === 0 && (
          <div className="text-center py-16">
            <Newspaper className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No news found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </main>
    </div>
  );
}