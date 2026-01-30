'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Star, Building2, Phone, Mail, Globe,
  ExternalLink, MapPin, TrendingUp, Users, ChevronDown,
  X, ArrowUpDown, Heart, Share2
} from 'lucide-react';
import { vendorAPI, Vendor } from '../utils/vendors';
import toast from 'react-hot-toast';
import AIAnalysisPanel from '../components/ai/AIAnalysisPanel';

export default function VendorsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'name'>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);

  // Categories and services for filters
  const categories = [
    'all', 'Technology', 'Financial Services', 'Healthcare', 
    'Real Estate', 'Consulting', 'Marketing', 'Legal'
  ];

  const services = [
    'all', 'Software Development', 'Financial Analysis', 'Medical Services',
    'Property Management', 'Business Consulting', 'Digital Marketing', 'Legal Services'
  ];

  // Fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const response = await vendorAPI.getVendors({
          limit: 100
        });

        if (response.success && response.data) {
          setVendors(response.data);
          setFilteredVendors(response.data);
        } else {
          toast.error('Failed to load vendors');
        }
      } catch (error) {
        console.error('[VendorsPage] Error:', error);
        toast.error('Failed to load vendors');
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = vendors.filter(vendor => {
      // Search filter
      const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory;

      // Service filter
      const matchesService = selectedService === 'all' || 
        vendor.services.some(service => service.toLowerCase().includes(selectedService.toLowerCase()));

      // Featured filter
      const matchesFeatured = !showFeaturedOnly || vendor.isFeatured;

      return matchesSearch && matchesCategory && matchesService && matchesFeatured;
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'reviews':
          aValue = a.reviewCount;
          bValue = b.reviewCount;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredVendors(filtered);
  }, [vendors, searchTerm, selectedCategory, selectedService, showFeaturedOnly, sortBy, sortOrder]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleSort = (field: 'rating' | 'reviews' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedService('all');
    setShowFeaturedOnly(false);
    setSortBy('rating');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || 
    selectedService !== 'all' || showFeaturedOnly;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-[2560px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-12 py-4 sm:py-6 lg:py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Vendors Directory</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Discover and connect with trusted service providers</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className="xl:hidden flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm flex-1 sm:flex-none text-sm"
            >
              <Star className="h-4 w-4" />
              <span>AI Insights</span>
            </button>
            <button className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              <Share2 className="h-4 w-4" />
              <span className="hidden md:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Main Content - Desktop Flex Layout */}
        <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0 xl:max-w-[calc(100%-416px)]">

        {/* Search and Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex flex-col lg:flex-row gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search vendors by name, description, or services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base bg-white/50 backdrop-blur-sm"
                  />
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 border rounded-lg transition-all text-sm sm:text-base whitespace-nowrap ${
                    showFilters || hasActiveFilters
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 text-blue-700 shadow-sm'
                      : 'bg-white/50 backdrop-blur-sm border-gray-300 text-gray-700 hover:bg-white/70'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {hasActiveFilters && (
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {[selectedCategory !== 'all', selectedService !== 'all', showFeaturedOnly].filter(Boolean).length}
                    </span>
                  )}
                </button>
              </div>

          {/* Collapsible Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat === 'all' ? 'All Categories' : cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Service Filter */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Service</label>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white"
                    >
                      {services.map(service => (
                        <option key={service} value={service}>
                          {service === 'all' ? 'All Services' : service}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Sort By</label>
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split('-');
                        setSortBy(field as 'rating' | 'reviews' | 'name');
                        setSortOrder(order as 'asc' | 'desc');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white"
                    >
                      <option value="rating-desc">Highest Rated</option>
                      <option value="rating-asc">Lowest Rated</option>
                      <option value="reviews-desc">Most Reviews</option>
                      <option value="reviews-asc">Least Reviews</option>
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                    </select>
                  </div>

                  {/* Featured Only */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Options</label>
                    <button
                      onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
                        showFeaturedOnly
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <TrendingUp className="h-4 w-4 inline mr-2" />
                      Featured Only
                    </button>
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <X className="h-4 w-4" /> Clear All Filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {loading ? 'Loading...' : `${filteredVendors.length} Vendor${filteredVendors.length !== 1 ? 's' : ''} Found`}
              </h2>
            </div>

            {/* Vendors Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12 sm:py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gradient-to-r from-blue-600 to-indigo-600"></div>
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-medium shadow-sm"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {filteredVendors.map((vendor, index) => (
                  <motion.div
                    key={vendor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer"
                    onClick={() => router.push(`/vendor/${vendor.id}`)}
                  >
                    {/* Vendor Card Header */}
                    <div className="p-3 sm:p-4">
                      <div className="flex items-start gap-3">
                        {/* Vendor Logo */}
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {vendor.logoUrl ? (
                            <img 
                              src={vendor.logoUrl} 
                              alt={`${vendor.name} logo`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<span class="text-white text-lg font-bold">${vendor.name.charAt(0).toUpperCase()}</span>`;
                                }
                              }}
                            />
                          ) : (
                            <span className="text-white text-lg font-bold">
                              {vendor.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        {/* Vendor Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent truncate group-hover:from-blue-600 group-hover:to-indigo-600 transition-all">
                                {vendor.name}
                              </h3>
                              {vendor.category && (
                                <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full mt-1">
                                  {vendor.category}
                                </span>
                              )}
                            </div>
                            {vendor.isFeatured && (
                              <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                <TrendingUp className="h-3 w-3" />
                                <span className="font-medium">Featured</span>
                              </div>
                            )}
                          </div>

                          {/* Rating and Reviews */}
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < Math.floor(vendor.rating)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-600">
                              {vendor.rating.toFixed(1)} ({vendor.reviewCount})
                            </span>
                          </div>

                          {/* Description */}
                          {vendor.description && (
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {vendor.description}
                            </p>
                          )}

                          {/* Services */}
                          {vendor.services && vendor.services.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {vendor.services.slice(0, 3).map((service, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 text-xs bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-full border border-gray-200"
                                >
                                  {service}
                                </span>
                              ))}
                              {vendor.services.length > 3 && (
                                <span className="px-1.5 py-0.5 text-xs text-gray-500">
                                  +{vendor.services.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contact Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        {vendor.phone && (
                          <a
                            href={`tel:${vendor.phone}`}
                            className="p-1.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all"
                            title="Phone"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone className="h-3 w-3 text-gray-500 group-hover:text-blue-600" />
                          </a>
                        )}
                        {vendor.email && (
                          <a
                            href={`mailto:${vendor.email}`}
                            className="p-1.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all"
                            title="Email"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="h-3 w-3 text-gray-500 group-hover:text-blue-600" />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* AI Analysis Panel - Desktop Sidebar */}
          <div className="hidden xl:block w-96 flex-shrink-0">
            <div className="sticky top-8">
              <AIAnalysisPanel
                title="AI Vendor Insights"
                pageType="vendors-directory"
                pageData={{
                  count: filteredVendors.length,
                  filters: {
                    category: selectedCategory !== 'all' ? selectedCategory : null,
                    service: selectedService !== 'all' ? selectedService : null,
                    featured: showFeaturedOnly
                  },
                  topVendors: filteredVendors.slice(0, 5).map(v => ({
                    name: v.name,
                    rating: v.rating,
                    category: v.category,
                    services: v.services.slice(0, 2)
                  }))
                }}
                autoAnalyze={!loading && filteredVendors.length > 0}
                quickPrompts={['Best rated vendors', 'Top featured providers', 'Vendor recommendations']}
                maxHeight="calc(100vh - 180px)"
              />
            </div>
          </div>
        </div>
      </div>

        {/* Mobile AI Panel */}
        <AnimatePresence>
          {showAIPanel && (
            <div className="xl:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowAIPanel(false)}>
              <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b flex justify-between">
                  <h3 className="font-semibold">AI Insights</h3>
                  <button onClick={() => setShowAIPanel(false)}><X className="h-5 w-5" /></button>
                </div>
                <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(85vh - 60px)' }}>
                  <AIAnalysisPanel
                    title=""
                    pageType="vendors-directory"
                    pageData={{
                      count: filteredVendors.length,
                      topVendors: filteredVendors.slice(0, 5).map(v => ({
                        name: v.name,
                        rating: v.rating,
                        category: v.category
                      }))
                    }}
                    autoAnalyze={!loading && filteredVendors.length > 0}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
  )   
}
