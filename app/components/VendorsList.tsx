'use client';

import React, { useState, useEffect } from 'react';
import { Star, ExternalLink, Phone, Mail, Globe, Building2, TrendingUp, Router } from 'lucide-react';
import { vendorAPI, Vendor } from '../utils/vendors';
import { motion } from 'framer-motion';
import Link from 'next/link';
interface VendorsListProps {
  className?: string;
  limit?: number;
  category?: string;
}

export default function VendorsList({ className = '', limit = 10, category }: VendorsListProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const response = await vendorAPI.getVendors({
          category,
          featured: true,
          limit
        });

        if (response.success && response.data) {
          setVendors(response.data);
        } else {
          setError('Failed to load vendors');
        }
      } catch (err) {
        console.error('[VendorsList] Error:', err);
        setError('Failed to load vendors');
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [category, limit]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 ${className}`}>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
          <Building2 className="h-4 w-4 text-blue-600" />
          Featured Vendors
        </h3>
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || vendors.length === 0) {
    return (
      <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 ${className}`}>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
          <Building2 className="h-4 w-4 text-blue-600" />
          Featured Vendors
        </h3>
        <div className="text-center py-8">
          <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-pearto-gray transition-colors duration-300">
            {error || 'No vendors available'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
        <Building2 className="h-4 w-4 text-blue-600" />
        Featured Vendors
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {vendors.map((vendor, index) => (
          <motion.div
            key={vendor.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-slate-100 dark:border-slate-800 rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            {/* Vendor Header */}
            <div className="flex items-start gap-3 mb-2">
              {/* Vendor Logo */}
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {vendor.logoUrl ? (
                  <img 
                    src={vendor.logoUrl} 
                    alt={`${vendor.name} logo`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-white text-sm font-bold">${vendor.name.charAt(0).toUpperCase()}</span>`;
                      }
                    }}
                  />
                ) : (
                  <span className="text-white text-sm font-bold">
                    {vendor.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate transition-colors duration-300">
                      {vendor.name}
                    </h4>
                    {vendor.category && (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full mt-1 transition-colors duration-300">
                        {vendor.category}
                      </span>
                    )}
                  </div>
                  {vendor.isFeatured && (
                    <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 transition-colors duration-300">
                      <TrendingUp className="h-3 w-3" />
                      <span className="font-medium">Featured</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {renderStars(vendor.rating)}
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">
                {vendor.rating.toFixed(1)} ({vendor.reviewCount})
              </span>
            </div>

            {/* Description */}
            {vendor.description && (
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2 transition-colors duration-300">
                {vendor.description}
              </p>
            )}

            {/* Services */}
            {vendor.services && vendor.services.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {vendor.services.slice(0, 3).map((service, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded transition-colors duration-300"
                  >
                    {service}
                  </span>
                ))}
                {vendor.services.length > 3 && (
                  <span className="px-2 py-0.5 text-xs text-slate-500 dark:text-slate-500 dark:text-pearto-gray transition-colors duration-300">
                    +{vendor.services.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Contact Links */}
            <div className="flex items-center gap-2 mt-2">
              {vendor.website && (
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                  title="Website"
                >
                  <Globe className="h-3 w-3 text-slate-500 dark:text-pearto-gray transition-colors duration-300" />
                </a>
              )}
              {vendor.phone && (
                <a
                  href={`tel:${vendor.phone}`}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                  title="Phone"
                >
                  <Phone className="h-3 w-3 text-slate-500 dark:text-pearto-gray transition-colors duration-300" />
                </a>
              )}
              {vendor.email && (
                <a
                  href={`mailto:${vendor.email}`}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                  title="Email"
                >
                  <Mail className="h-3 w-3 text-slate-500 dark:text-pearto-gray transition-colors duration-300" />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* View More Link */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <Link
  href="/vendors"
  className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
>
  View All Vendors
  <ExternalLink className="h-3 w-3" />
</Link>
      </div>
    </div>
  );
}
