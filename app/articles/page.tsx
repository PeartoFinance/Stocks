'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Bookmark, Clock, User, Search, Tag, Heart, Share2 } from 'lucide-react';
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

  const categories = ['All', 'Market', 'Analysis', 'Education', 'Technology', 'Finance'];

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
    const cat = category === 'All' || a.category === category;
    const term = a.title.toLowerCase().includes(search.toLowerCase()) ||
                 a.summary.toLowerCase().includes(search.toLowerCase()) ||
                 a.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return cat && term;
  });

  if (loading) {
    return (
      <main className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">Articles</h1>
          <p className="text-gray-600">Learn investing with concise, practical guides and frameworks.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="h-6 w-full bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-4"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
                <div className="h-6 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="flex gap-3">
                  <div className="h-4 w-8 bg-gray-200 rounded"></div>
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">Articles</h1>
        <p className="text-gray-600">Learn investing with concise, practical guides and frameworks.</p>
      </motion.div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1 rounded-full text-sm ${category===c?'bg-blue-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{c}</button>
            ))}
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search articles…" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((a, i) => (
          <motion.article key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.05 }} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-2 text-sm text-blue-600"><BookOpen className="h-4 w-4"/>{a.category}</span>
              <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="h-4 w-4" />{a.readTime} min</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">{a.title}</h2>
            <p className="text-gray-600 mb-4 line-clamp-2">{a.summary}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {a.tags.map(t => <span key={t} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md"><Tag className="h-3 w-3 inline mr-1" />{t}</span>)}
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <User className="h-4 w-4" />
                {a.author} • {new Date(a.publishedAt).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-3 text-gray-500">
                <button className="hover:text-red-600 flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {a.likes}
                </button>
                <button className="hover:text-blue-600">
                  <Share2 className="h-4 w-4" />
                </button>
                <button className={`hover:text-blue-600 ${a.bookmarked?'text-blue-600':''}`}>
                  <Bookmark className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </main>
  );
}
