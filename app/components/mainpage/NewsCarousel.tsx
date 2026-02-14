'use client';

import React, { useState, useEffect } from 'react';
import { newsAPI } from '../../utils/newsAPI';
import { Newspaper, Clock, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  time: string;
  source: string;
  impact: 'high' | 'medium' | 'low';
  url?: string;
  image?: string;
}

interface NewsCarouselProps {
  className?: string;
}

export default function NewsCarousel({ className = '' }: NewsCarouselProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await newsAPI.getMarketNews(5);
        
        const transformedNews: NewsItem[] = (response.data as any[]).map((item: any, index) => ({
          id: item.id || index,
          title: item.title || 'Market Update',
          summary: item.summary || item.description || 'Latest market news and updates',
          time: item.time || item.publishedAt || new Date().toISOString(),
          source: item.source || 'Market News',
          impact: item.impact || 'medium',
          url: item.url || '#',
          image: item.image || undefined
        }));
        
        setNews(transformedNews);
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    if (news.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [news.length]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 dark:bg-pearto-pink/10 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 dark:bg-pearto-green/10 text-green-700 border-green-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-slate-700 dark:text-gray-400 border-slate-200 dark:border-gray-700';
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return timeString;
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % news.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-slate-600 dark:text-gray-400 transition-colors duration-300">Loading news...</span>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-slate-200 dark:border-gray-700 p-8 ${className}`}>
        <div className="text-center">
          <Newspaper className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-400 mb-2 transition-colors duration-300">No News Available</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto transition-colors duration-300">
            Market news will appear here as soon as it becomes available.
          </p>
        </div>
      </div>
    );
  }

  const currentNews = news[currentIndex];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors duration-300">Latest News</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        {currentNews && (
          <div className="relative">
            <div className="p-6">
              {/* Added safe optional chaining here */}
              {currentNews?.image && (
                <div className="mb-4">
                  <img 
                    src={currentNews.image} 
                    alt={currentNews.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="flex items-start gap-3 mb-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getImpactColor(currentNews.impact)}`}>
                  {currentNews.impact.toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2 leading-tight transition-colors duration-300">
                    {currentNews.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-3 transition-colors duration-300">
                    {currentNews.summary}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(currentNews.time)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{currentNews.source}</span>
                  {currentNews.url && currentNews.url !== '#' && (
                    <a
                      href={currentNews.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800/90 hover:bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-400 p-2 rounded-full shadow-md transition-all z-10"
              aria-label="Previous news"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800/90 hover:bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-400 p-2 rounded-full shadow-md transition-all z-10"
              aria-label="Next news"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Indicators */}
        <div className="flex justify-center gap-2 p-4 border-t border-gray-50">
          {news.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-blue-600 dark:bg-pearto-blue w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to news ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}