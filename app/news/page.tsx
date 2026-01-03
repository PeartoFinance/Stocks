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

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  source: string;
  publishedAt: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  readTime: number;
  views: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  isPremium: boolean;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);

  // Mock news data
  const mockNews: NewsArticle[] = [
    {
      id: '1',
      title: 'Federal Reserve Signals Potential Rate Cut in Q2 2026',
      summary: 'Fed Chairman Jerome Powell hints at monetary policy adjustments amid economic indicators showing cooling inflation.',
      content: 'The Federal Reserve is considering a potential interest rate reduction in the second quarter of 2026, according to recent statements from Chairman Jerome Powell...',
      author: 'Sarah Johnson',
      source: 'Financial Times',
      publishedAt: '2025-11-17T08:30:00Z',
      category: 'Monetary Policy',
      tags: ['Federal Reserve', 'Interest Rates', 'Jerome Powell', 'Inflation'],
      readTime: 4,
      views: 15420,
      sentiment: 'positive',
      isPremium: false
    },
    {
      id: '2',
      title: 'Tech Giants Report Strong Q4 Earnings Despite Market Volatility',
      summary: 'Apple, Microsoft, and Google exceed analyst expectations with robust quarterly performance driven by AI investments.',
      content: 'Major technology companies have delivered impressive fourth-quarter results, defying market expectations...',
      author: 'Michael Chen',
      source: 'TechCrunch',
      publishedAt: '2025-11-17T07:15:00Z',
      category: 'Technology',
      tags: ['Apple', 'Microsoft', 'Google', 'Q4 Earnings', 'AI'],
      readTime: 6,
      views: 28350,
      sentiment: 'positive',
      isPremium: true
    },
    {
      id: '3',
      title: 'Cryptocurrency Market Sees Major Institutional Adoption Wave',
      summary: 'BlackRock and Fidelity announce expansion of crypto investment products following regulatory clarity.',
      content: 'The cryptocurrency market is experiencing unprecedented institutional adoption as major financial firms...',
      author: 'David Rodriguez',
      source: 'CoinDesk',
      publishedAt: '2025-11-17T06:45:00Z',
      category: 'Cryptocurrency',
      tags: ['BlackRock', 'Fidelity', 'Bitcoin', 'ETF', 'Regulation'],
      readTime: 5,
      views: 19850,
      sentiment: 'positive',
      isPremium: false
    },
    {
      id: '4',
      title: 'Climate Investment Funds Reach Record $2.5 Trillion Milestone',
      summary: 'ESG-focused investments continue surge as renewable energy sector attracts unprecedented capital flows.',
      content: 'Environmental, social, and governance (ESG) investment funds have reached a historic milestone...',
      author: 'Emma Thompson',
      source: 'Bloomberg',
      publishedAt: '2025-11-17T05:30:00Z',
      category: 'ESG',
      tags: ['ESG', 'Climate Change', 'Renewable Energy', 'Investment Funds'],
      readTime: 7,
      views: 12750,
      sentiment: 'positive',
      isPremium: true
    },
    {
      id: '5',
      title: 'Global Supply Chain Disruptions Impact Manufacturing Sector',
      summary: 'Automotive and electronics industries face continued challenges from geopolitical tensions and trade restrictions.',
      content: 'Manufacturing companies worldwide are grappling with supply chain disruptions that continue to affect production...',
      author: 'James Wilson',
      source: 'Reuters',
      publishedAt: '2025-11-17T04:20:00Z',
      category: 'Manufacturing',
      tags: ['Supply Chain', 'Manufacturing', 'Automotive', 'Electronics'],
      readTime: 5,
      views: 8930,
      sentiment: 'negative',
      isPremium: false
    }
  ];

  const categories = ['All', 'Technology', 'Monetary Policy', 'Cryptocurrency', 'ESG', 'Manufacturing', 'Healthcare', 'Energy'];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setNews(mockNews);
        setFilteredNews(mockNews);
      } catch (error) {
        console.error('Error fetching news:', error);
        toast.error('Failed to load news data');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    let filtered = news.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = activeCategory === 'All' || article.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort by published date (newest first)
    filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    setFilteredNews(filtered);
  }, [news, searchTerm, activeCategory]);

  const getSentimentColor = (sentiment: NewsArticle['sentiment']) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      case 'neutral': return 'text-gray-600 bg-gray-50';
    }
  };

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
                    {article.isPremium && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                        Premium
                      </span>
                    )}
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(article.sentiment)}`}>
                    {article.sentiment}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                  {article.title}
                </h2>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {article.summary}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{article.readTime} min read</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{article.views.toLocaleString()} views</span>
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