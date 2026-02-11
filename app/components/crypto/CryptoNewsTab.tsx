'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ExternalLink, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import cryptoService from '@/app/utils/cryptoService';

interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  full_content?: string;
  url?: string;
  canonical_url?: string;
  source: string;
  source_type?: string;
  author?: string;
  image?: string;
  category?: string;
  featured?: boolean;
  published_at: string;
  slug?: string;
  country_code?: string;
  related_symbol?: string;
}

interface CryptoNewsTabProps {
  symbol: string;
  slug: string;
}

export default function CryptoNewsTab({ symbol, slug }: CryptoNewsTabProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await cryptoService.getNews(symbol);
      
      if (response && response.items) {
        setArticles(response.items);
        if (showRefreshToast) {
          toast.success(`Found ${response.items.length} news articles for ${symbol}`);
        }
      } else {
        setArticles([]);
        toast.error('No news articles found');
      }
    } catch (error) {
      console.error('Failed to fetch crypto news:', error);
      setArticles([]);
      toast.error('Failed to load news articles');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (symbol) {
      fetchNews();
    }
  }, [symbol]);

  const handleRefresh = () => {
    fetchNews(true);
  };

  // Remove sentiment-related functions since Flask API doesn't provide sentiment
  const getArticleUrl = (article: NewsArticle) => {
    return article.canonical_url || article.url || '#';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {symbol} News
          </h3>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-2 w-full"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {symbol} News & Updates
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Latest news and market insights for {symbol} (searching: "{symbol.toLowerCase()}")
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* News Articles */}
      {articles.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No news available
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            There are currently no news articles for {symbol}. Try refreshing or check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
            >
              <a
                href={getArticleUrl(article)}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 sm:p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Image (if available) */}
                  {article.image && (
                    <div className="flex-shrink-0">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full lg:w-32 h-24 lg:h-24 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title and Source */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="text-base font-semibold text-slate-900 dark:text-white line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                        {article.title}
                      </h4>
                      <ExternalLink className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-3">
                      {article.summary}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                      {/* Source */}
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {article.source}
                      </span>

                      {/* Time */}
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(article.published_at)}
                      </div>

                      {/* Category */}
                      {article.category && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                          <span className="capitalize">{article.category}</span>
                        </div>
                      )}

                      {/* Featured Badge */}
                      {article.featured && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                          <span>Featured</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            </motion.article>
          ))}
        </div>
      )}

      {/* Load More / Footer */}
      {articles.length > 0 && (
        <div className="text-center pt-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing {articles.length} latest news articles
          </p>
        </div>
      )}
    </div>
  );
}
