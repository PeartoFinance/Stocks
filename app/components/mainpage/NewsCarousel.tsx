'use client';

import React, { useState, useEffect } from 'react';
import { newsService } from '../../utils/marketService';
import { Newspaper, Clock, ExternalLink } from 'lucide-react';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  time: string;
  source: string;
  impact: 'high' | 'medium' | 'low';
  url?: string;
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
        const data = await newsService.getPublishedNews({ limit: 5 });
        
        // Transform the data to match our interface
        const transformedNews: NewsItem[] = (data as any[]).map((item: any, index) => ({
          id: item.id || index,
          title: item.title || 'Market Update',
          summary: item.summary || item.description || 'Latest market news and updates',
          time: item.time || item.published_at || new Date().toISOString(),
          source: item.source || 'Market News',
          impact: item.impact || 'medium',
          url: item.url || '#'
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
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000); // Auto-rotate every 5 seconds

    return () => clearInterval(interval);
  }, [news.length]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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

      if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return date.toLocaleDateString();
      }
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
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading news...</span>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-8 ${className}`}>
        <div className="text-center">
          <Newspaper className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No News Available</h3>
          <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
            Market news will appear here as soon as it becomes available. Check back later for the latest updates and market analysis.
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Last updated: Just now</span>
          </div>
        </div>
      </div>
    );
  }

  const currentNews = news[currentIndex];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">Latest News</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="relative">
          {/* News Content */}
          <div className="p-6">
            <div className="flex items-start gap-3 mb-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getImpactColor(currentNews.impact)}`}>
                {currentNews.impact.toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-2 leading-tight">
                  {currentNews.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {currentNews.summary}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
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
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg transition-all"
            aria-label="Previous news"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7 7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg transition-all"
            aria-label="Next news"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 p-4">
          {news.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-blue-600 w-8'
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
