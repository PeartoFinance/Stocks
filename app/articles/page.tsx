'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Bookmark, Clock, User, Search, Tag, Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { stockAPI } from '../utils/api';

interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  author: string;
  readTime: number;
  publishedAt: string;
  tags: string[];
  likes: number;
  bookmarked?: boolean;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Dynamically generate categories from actual articles with capitalized first letter
  const categories = ['All', ...Array.from(new Set(articles.map(a => a.category.charAt(0).toUpperCase() + a.category.slice(1)))).sort()];

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        
        // Fetch articles from backend API
        const newsRes = await stockAPI.getPublishedNews();
        if (newsRes && newsRes.items && newsRes.items.length > 0) {
          const articlesData: Article[] = newsRes.items.map((item: any) => ({
            id: item.id?.toString() || Math.random().toString(),
            title: item.title || 'Untitled Article',
            summary: item.summary || item.excerpt || 'No summary available.',
            category: item.category || 'General',
            author: item.author || 'Pearto Team',
            readTime: Math.ceil((item.content?.length || 500) / 200) || 5, // Estimate read time
            publishedAt: item.published_at || item.created_at || new Date().toISOString(),
            tags: item.tags ? (Array.isArray(item.tags) ? item.tags : item.tags.split(',').map((t: string) => t.trim())) : ['Article'],
            likes: item.likes || Math.floor(Math.random() * 1000) + 100,
            bookmarked: false
          }));
          setArticles(articlesData);
        } else {
          // Fallback articles if API returns no data
          setArticles([
            {
              id: '1',
              title: 'Getting Started with Stock Analysis',
              summary: 'Learn the fundamentals of analyzing stocks and making informed investment decisions.',
              category: 'Education',
              author: 'Pearto Team',
              readTime: 5,
              publishedAt: new Date().toISOString(),
              tags: ['Stocks', 'Analysis', 'Beginner'],
              likes: 245
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch articles:', error);
        toast.error('Failed to load articles');
        // Set fallback articles on error
        setArticles([
          {
            id: '1',
            title: 'Market Analysis Fundamentals',
            summary: 'Understanding market trends and analysis techniques for better investment decisions.',
            category: 'Analysis',
            author: 'Pearto Team',
            readTime: 6,
            publishedAt: new Date().toISOString(),
            tags: ['Market', 'Analysis'],
            likes: 180
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const filtered = articles.filter((a) => {
    const cat = category === 'All' || a.category.toLowerCase() === category.toLowerCase();
    const term = search === '' || 
                 a.title.toLowerCase().includes(search.toLowerCase()) ||
                 a.summary.toLowerCase().includes(search.toLowerCase()) ||
                 a.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return cat && term;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedArticles = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-3">Articles</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Learn investing with concise, practical guides and frameworks.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700 animate-pulse transition-colors duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="flex gap-3">
                    <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-3">Articles</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Learn investing with concise, practical guides and frameworks. 
            <span className="text-blue-600 dark:text-blue-400 font-semibold ml-2">({filtered.length} {filtered.length === 1 ? 'article' : 'articles'})</span>
          </p>
        </motion.div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8 transition-colors duration-300">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              {categories.map(c => (
                <button 
                  key={c} 
                  onClick={() => setCategory(c)} 
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    category===c
                      ?'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      :'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input 
                value={search} 
                onChange={(e)=>setSearch(e.target.value)} 
                placeholder="Search articles…" 
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm transition-colors duration-300" 
              />
            </div>
          </div>
        </div>

        {paginatedArticles.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No articles found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {paginatedArticles.map((a, i) => (
                <motion.article 
                  key={a.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i*0.05 }} 
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                      <BookOpen className="h-3 w-3 sm:h-4 sm:w-4"/>
                      {a.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      {a.readTime} min
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">{a.title}</h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{a.summary}</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
                    {a.tags.slice(0, 3).map(t => (
                      <span key={t} className="px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md flex items-center gap-1">
                        <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 sm:gap-2 truncate">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">{a.author}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">{new Date(a.publishedAt).toLocaleDateString()}</span>
                    </span>
                    <div className="flex items-center gap-2 sm:gap-3 text-gray-500 dark:text-gray-400">
                      <button className="hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition-colors">
                        <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-[10px] sm:text-xs">{a.likes}</span>
                      </button>
                      <button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <button className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${a.bookmarked?'text-blue-600 dark:text-blue-400':''}`}>
                        <Bookmark className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
                
                <div className="flex items-center gap-1 sm:gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
