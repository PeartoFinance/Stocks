'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ExternalLink } from 'lucide-react';
import { vendorAPI, Vendor } from '../utils/vendors';
import { motion } from 'framer-motion';

interface VendorsListSimpleProps {
  className?: string;
  limit?: number;
  category?: string;
}

export default function VendorsListSimple({ className = '', limit = 8, category }: VendorsListSimpleProps) {
  const router = useRouter();
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
        console.error('[VendorsListSimple] Error:', err);
        setError('Failed to load vendors');
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [category, limit]);

  if (loading) {
    return (
      <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 ${className}`}>
        <h3 className="text-xs font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-blue-600" />
          Related Vendors
        </h3>
        <div className="space-y-1.5">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded-lg"></div>
              <div className="h-3 bg-gray-200 rounded flex-1"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || vendors.length === 0) {
    return (
      <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 ${className}`}>
        <h3 className="text-xs font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-blue-600" />
          Related Vendors
        </h3>
        <div className="text-center py-4">
          <Building2 className="h-6 w-6 text-gray-400 mx-auto mb-1.5" />
          <p className="text-xs text-gray-500">
            {error || 'No vendors available'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 ${className}`}>
      <h3 className="text-xs font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
        <Building2 className="h-3.5 w-3.5 text-blue-600" />
        Related Vendors
      </h3>
      
      {/* Fixed height container - shows 2 vendors, scrollable for more */}
      <div className="space-y-1.5 overflow-y-auto" style={{ height: '84px' }}>
        {vendors.map((vendor, index) => (
          <motion.div
            key={vendor.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
          >
            {/* Vendor Logo/Avatar */}
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                      parent.innerHTML = `<span class="text-white text-[10px] font-bold">${vendor.name.charAt(0).toUpperCase()}</span>`;
                    }
                  }}
                />
              ) : (
                <span className="text-white text-[10px] font-bold">
                  {vendor.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            {/* Vendor Name */}
            <div className="flex-1 min-w-0">
              <h4 
                className="text-[11px] font-medium text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
                onClick={() => router.push(`/vendor/${vendor.id}`)}
              >
                {vendor.name}
              </h4>
              {vendor.category && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {vendor.category}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* View More Link */}
      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <a
          href="/vendors"
          className="flex items-center justify-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
        >
          View All Vendors
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
    </div>
  );
}