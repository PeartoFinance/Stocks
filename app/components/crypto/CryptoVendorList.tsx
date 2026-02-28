'use client';

import React, { useState, useEffect } from 'react';
import { Building2, ExternalLink } from 'lucide-react';
import { vendorAPI, Vendor } from '../../utils/vendors';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CryptoVendorListProps {
  className?: string;
  limit?: number;
  sector?: string;
}

export default function CryptoVendorList({ className = '', limit = 8, sector }: CryptoVendorListProps) {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const response = await vendorAPI.getVendors({
          category: sector,
          featured: true,
          limit
        });

        if (response.success && response.data) {
          setVendors(response.data);
        } else {
          setError('Failed to load vendors');
        }
      } catch (err) {
        console.error('[CryptoVendorList] Error:', err);
        setError('Failed to load vendors');
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [sector, limit]);

  if (loading) {
    return (
      <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 ${className}`}>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5 transition-colors duration-300">
          <Building2 className="h-4 w-4 text-blue-600" />
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
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5 transition-colors duration-300">
          <Building2 className="h-4 w-4 text-blue-600" />
          Related Vendors
        </h3>
        <div className="text-center py-4">
          <Building2 className="h-6 w-6 text-slate-400 mx-auto mb-1.5" />
          <p className="text-xs text-slate-500 dark:text-pearto-gray transition-colors duration-300">
            {error || 'No vendors available'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 ${className}`}>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5 transition-colors duration-300">
        <Building2 className="h-4 w-4 text-blue-600" />
        Related Vendors
      </h3>
      
      <div className="space-y-2 overflow-y-auto" style={{ height: '84px' }}>
        {vendors.map((vendor, index) => (
          <motion.div
            key={vendor.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
            onClick={() => router.push(`/vendor/${vendor.id}`)}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                      const initial = vendor.name.charAt(0).toUpperCase();
                      const span = document.createElement('span');
                      span.className = 'text-white text-xs font-medium';
                      span.textContent = initial;
                      parent.appendChild(span);
                    }
                  }}
                />
              ) : (
                <span className="text-white text-xs font-medium">
                  {vendor.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {vendor.name}
              </h4>
              {vendor.category && (
                <span className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
                  {vendor.category}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <Link
          href="/vendors"
          className="flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
        >
          View All Vendors
          <ExternalLink className="h-2.5 w-2.5" />
        </Link>
      </div>
    </div>
  );
}
