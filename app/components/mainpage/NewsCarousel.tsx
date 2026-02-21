'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
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
      case 'high': return 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20';
      case 'low': return 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20';
      default: return 'bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700';
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
      <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-slate-600 dark:text-slate-400 transition-colors duration-300">Loading news...</span>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 ${className}`}>
        <div className="text-center">
          <Newspaper className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-400 mb-2 transition-colors duration-300">No News Available</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-md mx-auto transition-colors duration-300">
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
        <Newspaper className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl font-medium text-slate-900 dark:text-white">Latest News</h2>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {currentNews && (
          <div className="relative">
            <div className="flex gap-4">
              {currentNews?.image && currentNews.image.trim() !== '' && (
                <div className="w-1/3 flex-shrink-0">
                  <div className="w-full h-full min-h-[200px] bg-gray-100 dark:bg-slate-700">
                    <img 
                      src={currentNews.image} 
                      alt={currentNews.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { 
                        const parent = e.currentTarget.parentElement;
                        if (parent) parent.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex-1 p-6">
                <div className="flex items-start gap-3 mb-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getImpactColor(currentNews.impact)}`}>
                    {currentNews.impact.toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 dark:text-white mb-2 leading-tight">
                      {currentNews.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                      {currentNews.summary}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
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
            </div>

            {/* Navigation Controls */}
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-gray-600 text-slate-700 dark:text-slate-300 p-2 rounded-full shadow-md transition-all z-10"
              aria-label="Previous news"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-gray-600 text-slate-700 dark:text-slate-300 p-2 rounded-full shadow-md transition-all z-10"
              aria-label="Next news"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Indicators */}
        <div className="flex justify-center gap-2 p-4 border-t border-gray-100 dark:border-slate-700">
          {news.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-blue-600 dark:bg-blue-500 w-8'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-slate-500'
              }`}
              aria-label={`Go to news ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <button
        onClick={() => router.push('/news')}
        className="block w-full mt-4 text-center py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors font-medium text-sm"
      >
        View All News →
      </button>
    </div>
  );
}