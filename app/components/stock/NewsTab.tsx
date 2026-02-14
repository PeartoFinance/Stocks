import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Clock, TrendingUp, Search, Filter, Loader2 } from 'lucide-react';
import { newsService } from '../../utils/marketService';

interface NewsArticle {
  id: string | number;
  title: string;
  summary?: string;
  description?: string;
  link?: string;
  url?: string;
  image?: string;
  source?: string;
  category?: string;
  featured?: boolean;
  slug?: string;
  author?: string;
  publishedAt?: string;
  isInternal?: boolean;
  country?: string;
}

interface NewsTabProps {
  symbol: string;
  news?: NewsArticle[];
  loading?: boolean;
}

export default function NewsTab({ symbol, news: initialNews, loading: initialLoading }: NewsTabProps) {
  const [news, setNews] = useState<NewsArticle[]>(initialNews || []);
  const [loading, setLoading] = useState(initialLoading || false);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!initialNews || initialNews.length === 0) {
      fetchNews();
    }
  }, [symbol, initialNews]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await newsService.getNewsByStock(symbol, 20);
      setNews((data as any)?.items || []);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 dark:text-pearto-green bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'negative': return 'text-red-600 dark:text-pearto-pink bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'neutral': return 'text-slate-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'text-slate-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-3 w-3" />;
      case 'negative': return <TrendingUp className="h-3 w-3 rotate-180" />;
      default: return null;
    }
  };

  const filteredNews = news.filter(article => {
    const matchesSearch = searchTerm === '' || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.summary || article.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8 transition-colors duration-300">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* News Header & Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
            <Newspaper className="h-5 w-5 text-blue-500" />
            Latest News for {symbol}
          </h3>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
              />
            </div>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">
          <span>Showing {filteredNews.length} of {news.length} articles</span>
          {searchTerm && (
            <span>• Filtered by: "{searchTerm}"</span>
          )}
        </div>
      </div>

      {/* News Articles */}
      <div className="space-y-4">
        {filteredNews.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center transition-colors duration-300">
            <Newspaper className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 transition-colors duration-300">
              No News Found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 transition-colors duration-300">
              {searchTerm
                ? 'Try adjusting your search criteria.'
                : 'No news articles are currently available for this stock.'
              }
            </p>
          </div>
        ) : (
          filteredNews.map((article) => (
            <div key={article.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Article Image */}
                {article.image && (
                  <div className="lg:w-48 flex-shrink-0">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-32 lg:h-24 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                {/* Article Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white leading-tight transition-colors duration-300">
                      {article.title}
                    </h4>
                  </div>
                  
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-3 transition-colors duration-300">
                    {article.summary || article.description || 'No summary available.'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
                      <span className="font-medium">{article.source || 'Unknown Source'}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Unknown Date'}</span>
                      </div>
                    </div>
                    
                    <a
                      href={article.link || article.url || `/news/${article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors"
                    >
                      Read More
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {filteredNews.length > 0 && (
        <div className="text-center">
          <button
            onClick={fetchNews}
            className="px-6 py-2 bg-blue-600 dark:bg-pearto-blue hover:bg-blue-700 dark:hover:bg-pearto-blue-hover text-white rounded-lg font-medium transition-colors"
          >
            Load More News
          </button>
        </div>
      )}
    </div>
  );
}