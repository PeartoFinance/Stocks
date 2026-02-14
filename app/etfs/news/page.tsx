'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, ExternalLink, TrendingUp, Filter, Search, Bookmark, Share2, Calendar, Tag } from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  author: string;
  publishedAt: string;
  readTime: number;
  category: string;
  tags: string[];
  imageUrl: string;
  impact: 'high' | 'medium' | 'low';
  relatedETFs: string[];
}

export default function ETFNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateNewsArticles = (): NewsArticle[] => {
      return [
        {
          id: '1',
          title: 'SPY Hits New All-Time High as Technology Sector Rallies',
          summary: 'The SPDR S&P 500 ETF Trust reaches unprecedented levels driven by strong tech earnings and positive market sentiment.',
          content: 'The SPDR S&P 500 ETF Trust (SPY) hit a new all-time high today as investors flocked to equity markets...',
          source: 'ETF Daily News',
          author: 'Sarah Mitchell',
          publishedAt: '2024-01-15T09:30:00Z',
          readTime: 4,
          category: 'Market Update',
          tags: ['SPY', 'Technology', 'All-Time High'],
          imageUrl: '/api/placeholder/600/300',
          impact: 'high',
          relatedETFs: ['SPY', 'QQQ', 'VTI']
        },
        {
          id: '2',
          title: 'New Bitcoin ETF Launches with $500M in First Week',
          summary: 'The latest cryptocurrency ETF sees massive inflows as institutional investors embrace digital assets.',
          content: 'A new Bitcoin ETF has captured significant attention from institutional investors...',
          source: 'Crypto ETF Weekly',
          author: 'Michael Chen',
          publishedAt: '2024-01-15T08:15:00Z',
          readTime: 6,
          category: 'New Launch',
          tags: ['Bitcoin', 'Cryptocurrency', 'Launch'],
          imageUrl: '/api/placeholder/600/300',
          impact: 'high',
          relatedETFs: ['GBTC', 'BITO']
        },
        {
          id: '3',
          title: 'ESG ETFs See Record Inflows Despite Market Volatility',
          summary: 'Environmental, Social, and Governance focused ETFs continue to attract investor capital amid market uncertainty.',
          content: 'ESG-focused exchange-traded funds have demonstrated remarkable resilience...',
          source: 'Sustainable Investing Today',
          author: 'Jennifer Park',
          publishedAt: '2024-01-15T07:45:00Z',
          readTime: 5,
          category: 'ESG & Sustainable',
          tags: ['ESG', 'Sustainable', 'Inflows'],
          imageUrl: '/api/placeholder/600/300',
          impact: 'medium',
          relatedETFs: ['ESGU', 'SUSA', 'VFTSE']
        },
        {
          id: '4',
          title: 'Vanguard Reduces Fees on Popular ETFs',
          summary: 'Vanguard announces fee reductions across several of its most popular ETF offerings.',
          content: 'Vanguard Group has announced fee reductions on several of its flagship ETFs...',
          source: 'Fund News Network',
          author: 'David Rodriguez',
          publishedAt: '2024-01-15T06:30:00Z',
          readTime: 3,
          category: 'Fee Changes',
          tags: ['Vanguard', 'Fees', 'Cost'],
          imageUrl: '/api/placeholder/600/300',
          impact: 'medium',
          relatedETFs: ['VTI', 'VEA', 'VNQ']
        },
        {
          id: '5',
          title: 'AI-Powered ETF Strategy Outperforms Market by 15%',
          summary: 'A new artificial intelligence-driven ETF strategy has significantly outperformed traditional indices.',
          content: 'An innovative AI-powered ETF has caught the attention of investors...',
          source: 'Tech Investment Review',
          author: 'Amanda Foster',
          publishedAt: '2024-01-15T05:00:00Z',
          readTime: 7,
          category: 'Innovation',
          tags: ['AI', 'Technology', 'Performance'],
          imageUrl: '/api/placeholder/600/300',
          impact: 'high',
          relatedETFs: ['ARKQ', 'ROBO', 'QTEC']
        },
        {
          id: '6',
          title: 'International ETFs Gain Momentum as Dollar Weakens',
          summary: 'Currency movements drive increased interest in international and emerging market ETFs.',
          content: 'As the US dollar shows signs of weakness, investors are turning to international ETFs...',
          source: 'Global Markets Today',
          author: 'Robert Kim',
          publishedAt: '2024-01-15T04:20:00Z',
          readTime: 5,
          category: 'International',
          tags: ['International', 'Currency', 'Emerging Markets'],
          imageUrl: '/api/placeholder/600/300',
          impact: 'medium',
          relatedETFs: ['VEA', 'VWO', 'EFA']
        }
      ];
    };

    setTimeout(() => {
      const mockArticles = generateNewsArticles();
      setArticles(mockArticles);
      setFilteredArticles(mockArticles);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    setFilteredArticles(filtered);
  }, [articles, searchTerm, categoryFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = ['all', ...Array.from(new Set(articles.map(article => article.category)))];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-pearto-blockchain dark:bg-gray-700">

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {!selectedArticle ? (
          <>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white dark:text-white mb-4">ETF News & Analysis</h1>
              <p className="text-slate-600 dark:text-gray-400 dark:text-gray-400">Stay updated with the latest developments in the ETF market</p>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 dark:border-gray-700 p-6 mb-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-400 dark:text-gray-400 mb-2">Search News</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by title, content, or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-gray-600 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-400 dark:text-gray-400 mb-2">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* News Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {filteredArticles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500"></div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(article.impact)}`}>
                          {article.impact.toUpperCase()} IMPACT
                        </span>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400">{article.readTime} min read</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white mb-2 line-clamp-2">{article.title}</h3>
                      <p className="text-slate-600 dark:text-gray-400 dark:text-gray-400 text-sm mb-4 line-clamp-3">{article.summary}</p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {article.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-gray-700 dark:bg-gray-700 text-slate-700 dark:text-gray-400 dark:text-gray-400">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white dark:text-white">{article.source}</p>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400">{formatDate(article.publishedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-gray-400 hover:text-slate-600 dark:text-gray-400 dark:text-gray-400">
                            <Bookmark className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-slate-600 dark:text-gray-400 dark:text-gray-400">
                            <Share2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {filteredArticles.length === 0 && !isLoading && (
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white dark:text-white mb-2">No articles found</h3>
                <p className="text-slate-600 dark:text-gray-400 dark:text-gray-400">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </>
        ) : (
          /* Article Detail View */
          <>
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                ← Back to News
              </button>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-slate-600 dark:text-gray-400 dark:text-gray-400">
                  <Bookmark className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-slate-600 dark:text-gray-400 dark:text-gray-400">
                  <Share2 className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-slate-600 dark:text-gray-400 dark:text-gray-400">
                  <ExternalLink className="h-5 w-5" />
                </button>
              </div>
            </div>

            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 dark:border-gray-700 overflow-hidden"
            >
              <div className="h-96 bg-gradient-to-r from-blue-500 to-purple-500"></div>

              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getImpactColor(selectedArticle.impact)}`}>
                    {selectedArticle.impact.toUpperCase()} IMPACT
                  </span>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{selectedArticle.readTime} min read</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(selectedArticle.publishedAt)}</span>
                    </div>
                  </div>
                </div>

                <h1 className="text-4xl font-bold text-slate-900 dark:text-white dark:text-white mb-6">{selectedArticle.title}</h1>

                <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-slate-200 dark:border-gray-700 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white dark:text-white">{selectedArticle.author}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400">{selectedArticle.source}</p>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="text-xl text-slate-600 dark:text-gray-400 dark:text-gray-400 mb-8">{selectedArticle.summary}</p>
                  <div className="text-slate-900 dark:text-white dark:text-white leading-relaxed">
                    {selectedArticle.content}
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-gray-700 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-sm font-medium text-slate-700 dark:text-gray-400 dark:text-gray-400">Related ETFs:</span>
                    {selectedArticle.relatedETFs.map((etf) => (
                      <span key={etf} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {etf}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-gray-400 dark:text-gray-400">Tags:</span>
                    {selectedArticle.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-gray-700 dark:bg-gray-700 text-slate-700 dark:text-gray-400 dark:text-gray-400">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.article>
          </>
        )}
      </div>
    </div>
  );
}