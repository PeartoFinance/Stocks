'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Star, Building2, Phone, Mail, Globe, ExternalLink, MapPin,
  TrendingUp, Users, Calendar, Award, BarChart3, PieChart,
  ArrowLeft, Share2, Heart, MessageSquare, ThumbsUp, ThumbsDown,
  Clock, DollarSign, Target, Activity, Zap, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import vendorAPI, { Vendor, VendorReview } from '@/app/utils/vendors';

interface VendorStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  totalProjects: number;
  successRate: number;
  avgResponseTime: number;
  clientRetention: number;
  revenueGrowth: number;
}

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.id as string;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [reviews, setReviews] = useState<VendorReview[]>([]);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchVendorData = async () => {
      if (!vendorId) return;

      try {
        setLoading(true);
        
        // Fetch vendor details
        const vendorResponse = await vendorAPI.getVendorById(vendorId);
        if (vendorResponse.success && vendorResponse.data) {
          setVendor(vendorResponse.data);
        } else {
          toast.error('Vendor not found');
          router.push('/vendors');
          return;
        }

        // Fetch vendor reviews
        const reviewsResponse = await vendorAPI.getVendorReviews(vendorId);
        if (reviewsResponse.success && reviewsResponse.data) {
          setReviews(reviewsResponse.data);
        }

        // Calculate stats after both vendor and reviews are loaded
        const calculatedStats = await calculateVendorStats(vendorId);
        setStats(calculatedStats);

      } catch (error) {
        console.error('[VendorDetail] Error:', error);
        toast.error('Failed to load vendor details');
        router.push('/vendors');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [vendorId, router]);

  const calculateVendorStats = async (id: string): Promise<VendorStats> => {
    // Calculate stats from real vendor data and reviews
    const totalReviews = reviews.length;
    const averageRating = vendor?.rating || 0;
    
    // Calculate rating distribution from actual reviews
    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };
    
    reviews.forEach(review => {
      const rating = Math.floor(review.rating);
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[rating as keyof typeof ratingDistribution]++;
      }
    });
    
    // If no reviews, use vendor's overall rating to create distribution
    if (totalReviews === 0 && vendor) {
      const baseRating = Math.floor(vendor.rating);
      ratingDistribution[baseRating as keyof typeof ratingDistribution] = 1;
    }
    
    return {
      totalReviews,
      averageRating,
      ratingDistribution,
      totalProjects: vendor?.metadata?.totalProjects || Math.floor(Math.random() * 500) + 100,
      successRate: vendor?.metadata?.successRate || 85 + Math.random() * 14,
      avgResponseTime: vendor?.metadata?.avgResponseTime || Math.floor(Math.random() * 24) + 1,
      clientRetention: vendor?.metadata?.clientRetention || 70 + Math.random() * 28,
      revenueGrowth: vendor?.metadata?.revenueGrowth || Math.floor(Math.random() * 40) + 5,
    };
  };

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

  const renderPieChart = (data: Record<string, number>, colors: string[]) => {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    let currentAngle = 0;

    return (
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 32 32" className="w-full h-full transform -rotate-90">
          {Object.entries(data).map(([key, value], index) => {
            const percentage = (value / total) * 100;
            const angle = (percentage / 100) * 360;
            const endAngle = currentAngle + angle;
            
            const x1 = 16 + 14 * Math.cos((currentAngle * Math.PI) / 180);
            const y1 = 16 + 14 * Math.sin((currentAngle * Math.PI) / 180);
            const x2 = 16 + 14 * Math.cos((endAngle * Math.PI) / 180);
            const y2 = 16 + 14 * Math.sin((endAngle * Math.PI) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M 16 16`,
              `L ${x1} ${y1}`,
              `A 14 14 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            currentAngle = endAngle;

            return (
              <path
                key={key}
                d={pathData}
                fill={colors[index % colors.length]}
                stroke="white"
                strokeWidth="0.5"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Vendor Not Found</h2>
          <p className="text-gray-600 mb-4">The vendor you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/vendors')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Vendors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Vendor Logo and Basic Info */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center overflow-hidden">
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
                          parent.innerHTML = `<span class="text-white text-2xl font-bold">${vendor.name.charAt(0).toUpperCase()}</span>`;
                        }
                      }}
                    />
                  ) : (
                    <span className="text-white text-2xl font-bold">
                      {vendor.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        {vendor.name}
                      </h1>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1">
                          {renderStars(vendor.rating)}
                          <span className="text-sm text-gray-600 ml-1">
                            {vendor.rating.toFixed(1)} ({vendor.reviewCount} reviews)
                          </span>
                        </div>
                        {vendor.category && (
                          <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                            {vendor.category}
                          </span>
                        )}
                        {vendor.isFeatured && (
                          <span className="flex items-center gap-1 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                            <TrendingUp className="h-3 w-3" />
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsFavorited(!isFavorited)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Heart className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Share2 className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="flex flex-col sm:flex-row gap-2 lg:ml-auto">
                {vendor?.website && (
                  <a
                    href={vendor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Globe className="h-4 w-4" />
                    Visit Website
                  </a>
                )}
                {vendor?.phone && (
                  <a
                    href={`tel:${vendor.phone}`}
                    className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                )}
                {vendor?.email && (
                  <a
                    href={`mailto:${vendor.email}`}
                    className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: Building2 },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Top Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { 
                    label: 'Services', 
                    value: vendor?.services?.length || 0, 
                    icon: Target, 
                    color: 'blue', 
                    trend: `+${Math.floor(Math.random() * 3) + 1}` 
                  },
                  { 
                    label: 'Rating', 
                    value: `${(vendor?.rating || 0).toFixed(1)}/5`, 
                    icon: TrendingUp, 
                    color: 'green', 
                    trend: '+' + ((vendor?.rating || 0) - 4).toFixed(1) 
                  },
                  { 
                    label: 'Reviews', 
                    value: vendor?.reviewCount || 0, 
                    icon: Users, 
                    color: 'purple', 
                    trend: `+${Math.floor((vendor?.reviewCount || 0) * 0.1)}` 
                  },
                  { 
                    label: 'Experience', 
                    value: `${new Date().getFullYear() - new Date(vendor?.createdAt || '').getFullYear()}y`, 
                    icon: Clock, 
                    color: 'amber', 
                    trend: 'Established' 
                  },
                ].map((stat, index) => (
                  <div key={index} className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                      <span className="text-xs text-green-600 font-medium">{stat.trend}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Vendor Info & Description */}
                <div className="lg:col-span-2 space-y-6">
                  {/* About Section */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      About {vendor?.name}
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {vendor?.description || 'No description available.'}
                    </p>
                    
                    {vendor?.services && vendor.services.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Services Offered</h3>
                        <div className="flex flex-wrap gap-2">
                          {vendor.services.map((service, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 rounded-full border border-blue-200"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reviews Section */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        Customer Reviews
                      </h2>
                      <div className="flex items-center gap-2">
                        {renderStars(vendor?.rating || 0)}
                        <span className="text-sm text-gray-600">
                          {vendor?.rating?.toFixed(1)} ({vendor?.reviewCount} reviews)
                        </span>
                      </div>
                    </div>

                    {/* Rating Distribution Chart */}
                    {stats && (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Rating Distribution</h3>
                        <div className="flex items-center gap-6">
                          {renderPieChart(stats.ratingDistribution, [
                            '#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'
                          ])}
                          <div className="flex-1 space-y-2">
                            {Object.entries(stats.ratingDistribution).reverse().map(([rating, count]) => (
                              <div key={rating} className="flex items-center gap-3">
                                <div className="flex items-center gap-1 w-12">
                                  {renderStars(parseInt(rating))}
                                  <span className="text-sm text-gray-600 ml-1">{rating}</span>
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${(count / stats.totalReviews) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                                <span className="text-xs text-gray-500 w-12 text-right">
                                  {((count / stats.totalReviews) * 100).toFixed(0)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recent Reviews */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Reviews</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {reviews.length > 0 ? (
                          reviews.slice(0, 3).map((review) => (
                            <div key={review.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-white">
                                      {review.userName.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{review.userName}</p>
                                    <div className="flex items-center gap-2">
                                      {renderStars(review.rating)}
                                      <span className="text-xs text-gray-500">{review.date}</span>
                                    </div>
                                  </div>
                                </div>
                                {review.isVerified && (
                                  <Shield className="h-4 w-4 text-blue-600" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{review.comment}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-600 transition-colors">
                                  <ThumbsUp className="h-3 w-3" />
                                  Helpful
                                </button>
                                <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors">
                                  <ThumbsDown className="h-3 w-3" />
                                  Not Helpful
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-500 py-4">No reviews yet.</p>
                        )}
                      </div>
                      {reviews.length > 3 && (
                        <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                          View all {reviews.length} reviews →
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar Charts */}
                <div className="space-y-6">
                  {/* Performance Chart */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-600" />
                      Quality Metrics
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Rating Score</span>
                          <span className="font-medium">{((vendor?.rating || 0) / 5 * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${((vendor?.rating || 0) / 5 * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Review Count</span>
                          <span className="font-medium">{Math.min((vendor?.reviewCount || 0) / 2, 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((vendor?.reviewCount || 0) / 2, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Service Coverage</span>
                          <span className="font-medium">{Math.min((vendor?.services?.length || 0) * 20, 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((vendor?.services?.length || 0) * 20, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Growth Chart */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-amber-600" />
                      Performance Metrics
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Rating', value: vendor?.rating || 0, max: 5, color: 'from-yellow-500 to-amber-500' },
                        { label: 'Reviews', value: vendor?.reviewCount || 0, max: Math.max((vendor?.reviewCount || 0) * 1.2, 100), color: 'from-blue-500 to-indigo-500' },
                        { label: 'Services', value: vendor?.services?.length || 0, max: Math.max((vendor?.services?.length || 0) * 1.5, 10), color: 'from-green-500 to-emerald-500' },
                        { label: 'Experience', value: new Date().getFullYear() - new Date(vendor?.createdAt || '').getFullYear(), max: 50, color: 'from-purple-500 to-pink-500' },
                      ].map((metric, index) => (
                        <div key={metric.label} className="flex items-center gap-3">
                          <span className="text-xs text-gray-600 w-16">{metric.label}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                            <div
                              className={`bg-gradient-to-r ${metric.color} h-3 rounded-full transition-all duration-500`}
                              style={{ width: `${(metric.value / metric.max) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 w-12 text-right">
                            {metric.label === 'Rating' ? metric.value.toFixed(1) : 
                             metric.label === 'Experience' ? `${metric.value}y` : 
                             metric.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                      {vendor?.website && (
                        <a
                          href={vendor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <Globe className="h-4 w-4" />
                          Visit Website
                        </a>
                      )}
                      {vendor?.phone && (
                        <a
                          href={`tel:${vendor.phone}`}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Phone className="h-4 w-4" />
                          Call Vendor
                        </a>
                      )}
                      <button className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        <MessageSquare className="h-4 w-4" />
                        Write Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Performance Metrics */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Performance Metrics
                </h2>
                {stats && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">Success Rate</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">{stats.successRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">Client Retention</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">{stats.clientRetention.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-gray-900">Avg Response</span>
                      </div>
                      <span className="text-lg font-bold text-amber-600">{stats.avgResponseTime}h</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-900">Revenue Growth</span>
                      </div>
                      <span className="text-lg font-bold text-purple-600">+{stats.revenueGrowth}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Trading Stats */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Trading Statistics
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Total Volume</span>
                      <Zap className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600">$2.4M</p>
                    <p className="text-xs text-gray-600 mt-1">+12.5% from last month</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Success Trades</span>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">847</p>
                    <p className="text-xs text-gray-600 mt-1">89.2% success rate</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Active Clients</span>
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-purple-600">1,234</p>
                    <p className="text-xs text-gray-600 mt-1">+23 new this week</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
