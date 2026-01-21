import React from 'react';
import { Building2, Globe, Users, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { Stock } from '../../types';

interface ProfileTabProps {
  stock: Stock;
}

export default function ProfileTab({ stock }: ProfileTabProps) {
  // Mock additional company data - in real app, this would come from API
  const companyProfile = {
    website: 'https://www.apple.com',
    headquarters: 'Cupertino, California, United States',
    employees: 164000,
    founded: '1976',
    ceo: 'Tim Cook',
    fiscalYearEnd: 'September',
    exchange: 'NASDAQ',
    currency: 'USD',
    country: 'United States',
    phone: '+1 (408) 996-1010',
    address: 'One Apple Park Way, Cupertino, CA 95014',
  };

  const keyExecutives = [
    { name: 'Tim Cook', position: 'Chief Executive Officer', tenure: '2011 - Present' },
    { name: 'Luca Maestri', position: 'Chief Financial Officer', tenure: '2014 - Present' },
    { name: 'Katherine Adams', position: 'General Counsel', tenure: '2017 - Present' },
    { name: 'Deirdre O\'Brien', position: 'Senior VP, Retail + People', tenure: '2019 - Present' },
  ];

  const businessSegments = [
    { segment: 'iPhone', description: 'Smartphone products and related services' },
    { segment: 'Mac', description: 'Desktop and laptop computers' },
    { segment: 'iPad', description: 'Tablet computers and accessories' },
    { segment: 'Wearables, Home and Accessories', description: 'Apple Watch, AirPods, HomePod, and accessories' },
    { segment: 'Services', description: 'App Store, iCloud, Apple Music, and other digital services' },
  ];

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Company Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-500" />
          Company Overview
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">About {stock.name}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              {stock.description || `${stock.name} is a leading company in the ${stock.sector || 'technology'} sector, operating in the ${stock.industry || 'consumer electronics'} industry. The company has established itself as a major player in its market segment with innovative products and services.`}
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-slate-400" />
                <a 
                  href={companyProfile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-500 flex items-center gap-1"
                >
                  {companyProfile.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="h-4 w-4 text-slate-400" />
                {companyProfile.headquarters}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Users className="h-4 w-4 text-slate-400" />
                {formatNumber(companyProfile.employees)} employees
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Calendar className="h-4 w-4 text-slate-400" />
                Founded in {companyProfile.founded}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Company Details</h4>
            <div className="space-y-3">
              {[
                { label: 'Sector', value: stock.sector || 'Technology' },
                { label: 'Industry', value: stock.industry || 'Consumer Electronics' },
                { label: 'Exchange', value: companyProfile.exchange },
                { label: 'Currency', value: companyProfile.currency },
                { label: 'Country', value: companyProfile.country },
                { label: 'Fiscal Year End', value: companyProfile.fiscalYearEnd },
                { label: 'CEO', value: companyProfile.ceo },
                { label: 'Phone', value: companyProfile.phone },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Executives */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-500" />
          Key Executives
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {keyExecutives.map((exec, index) => (
            <div key={index} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 dark:text-white">{exec.name}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{exec.position}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{exec.tenure}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Business Segments */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-green-500" />
          Business Segments
        </h3>
        
        <div className="space-y-4">
          {businessSegments.map((segment, index) => (
            <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">{segment.segment}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">{segment.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Highlights */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Financial Highlights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: 'Market Cap', 
              value: stock.marketCap ? `$${(stock.marketCap / 1e12).toFixed(2)}T` : 'N/A',
              color: 'blue'
            },
            { 
              label: 'P/E Ratio', 
              value: stock.peRatio ? stock.peRatio.toFixed(2) : 'N/A',
              color: 'green'
            },
            { 
              label: 'EPS (TTM)', 
              value: stock.eps ? `$${stock.eps.toFixed(2)}` : 'N/A',
              color: 'purple'
            },
            { 
              label: 'Dividend Yield', 
              value: stock.dividendYield ? `${(stock.dividendYield * 100).toFixed(2)}%` : 'N/A',
              color: 'orange'
            },
          ].map((item, index) => (
            <div key={index} className={`bg-${item.color}-50 dark:bg-${item.color}-900/20 border border-${item.color}-200 dark:border-${item.color}-800 rounded-lg p-4 text-center`}>
              <p className={`text-sm font-medium text-${item.color}-700 dark:text-${item.color}-300 mb-1`}>
                {item.label}
              </p>
              <p className={`text-xl font-bold text-${item.color}-900 dark:text-${item.color}-100`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Corporate Address</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {companyProfile.address}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Investor Relations</h4>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>Phone: {companyProfile.phone}</p>
              <p>Website: <a href={companyProfile.website} className="text-blue-600 hover:text-blue-500">{companyProfile.website}</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}