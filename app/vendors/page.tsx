'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Star, Building2, Phone, Mail, Globe,
  ExternalLink, MapPin, TrendingUp, Users, ChevronDown,
  X, ArrowUpDown, Heart, Share2
} from 'lucide-react';
import { vendorAPI, Vendor } from '../utils/vendors';
import toast from 'react-hot-toast';

export default function VendorsPage() {
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
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[2560px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-12 py-4 sm:py-6 lg:py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Vendors Directory</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Discover and connect with trusted service providers</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              <Share2 className="h-4 w-4" />
              <span className="hidden md:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors by name, description, or services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 border rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {loading ? 'Loading...' : `${filteredVendors.length} Vendor${filteredVendors.length !== 1 ? 's' : ''} Found`}
          </h2>
        </div>

        {/* Vendors Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12 sm:py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredVendors.map((vendor, index) => (
              <motion.div
                key={vendor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                {/* Vendor Card Header */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {vendor.name}
                      </h3>
                      {vendor.category && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mt-1">
                          {vendor.category}
                        </span>
                      )}
                    </div>
                    {vendor.isFeatured && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                        <TrendingUp className="h-3 w-3" />
                        <span className="font-medium">Featured</span>
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {renderStars(vendor.rating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {vendor.rating.toFixed(1)} ({vendor.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Description */}
                  {vendor.description && (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                      {vendor.description}
                    </p>
                  )}

                  {/* Services */}
                  {vendor.services && vendor.services.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {vendor.services.slice(0, 3).map((service, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {service}
                        </span>
                      ))}
                      {vendor.services.length > 3 && (
                        <span className="px-2 py-1 text-xs text-gray-500">
                          +{vendor.services.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Contact Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    {vendor.website && (
                      <a
                        href={vendor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Website"
                      >
                        <Globe className="h-4 w-4 text-gray-500" />
                      </a>
                    )}
                    {vendor.phone && (
                      <a
                        href={`tel:${vendor.phone}`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Phone"
                      >
                        <Phone className="h-4 w-4 text-gray-500" />
                      </a>
                    )}
                    {vendor.email && (
                      <a
                        href={`mailto:${vendor.email}`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Email"
                      >
                        <Mail className="h-4 w-4 text-gray-500" />
                      </a>
                    )}
                    <button
                      onClick={() => setSelectedVendor(vendor)}
                      className="ml-auto p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <ExternalLink className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Vendor Detail Modal */}
        <AnimatePresence>
          {selectedVendor && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={() => setSelectedVendor(null)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedVendor.name}</h2>
                      {selectedVendor.category && (
                        <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full mt-2">
                          {selectedVendor.category}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedVendor(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                  {/* Rating and Reviews */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center">
                      {renderStars(selectedVendor.rating)}
                    </div>
                    <span className="text-lg font-medium text-gray-900">
                      {selectedVendor.rating.toFixed(1)}
                    </span>
                    <span className="text-gray-500">
                      ({selectedVendor.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Description */}
                  {selectedVendor.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                      <p className="text-gray-600">{selectedVendor.description}</p>
                    </div>
                  )}

                  {/* Services */}
                  {selectedVendor.services && selectedVendor.services.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Services</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedVendor.services.map((service, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                    <div className="space-y-3">
                      {selectedVendor.website && (
                        <a
                          href={selectedVendor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-blue-600 hover:text-blue-700"
                        >
                          <Globe className="h-5 w-5" />
                          <span>Visit Website</span>
                        </a>
                      )}
                      {selectedVendor.phone && (
                        <a
                          href={`tel:${selectedVendor.phone}`}
                          className="flex items-center gap-3 text-blue-600 hover:text-blue-700"
                        >
                          <Phone className="h-5 w-5" />
                          <span>{selectedVendor.phone}</span>
                        </a>
                      )}
                      {selectedVendor.email && (
                        <a
                          href={`mailto:${selectedVendor.email}`}
                          className="flex items-center gap-3 text-blue-600 hover:text-blue-700"
                        >
                          <Mail className="h-5 w-5" />
                          <span>{selectedVendor.email}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
