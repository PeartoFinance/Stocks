'use client';

import Link from 'next/link';
import {
    Twitter,
    Facebook,
    Instagram,
    Linkedin,
    Youtube,
} from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const mainAppUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:5173';

    const footerLinks = {
        markets: [
            { label: 'Stocks', href: '/stocks' },
            { label: 'ETFs', href: '/etfs' },
            { label: 'IPOs', href: '/ipos' },
            { label: 'Crypto', href: '/crypto' },
            { label: 'Market Movers', href: '/movers' },
        ],
        tools: [
            { label: 'Stock Screener', href: '/screener' },
            { label: 'Technical Charts', href: '/chart' },
            { label: 'Watchlist', href: '/watchlist' },
            { label: 'Comparison Tool', href: '/stocks/comparison' },
            { label: 'Trending Stocks', href: '/trending' },
        ],
        resources: [
            { label: 'Articles', href: '/articles' },
            { label: 'News', href: '/news' },
            { label: 'Newsletter', href: '/newsletter' },
            { label: 'Stock Analysis Pro', href: '/pro' },
        ],
        company: [
            { label: 'About Us', href: `${mainAppUrl}/p/about` },
            { label: 'Contact', href: `${mainAppUrl}/contact` },
            { label: 'Privacy Policy', href: `${mainAppUrl}/privacy` },
            { label: 'Terms of Service', href: `${mainAppUrl}/terms` },
        ],
    };

    const socialLinks = [
        { icon: Twitter, href: '#', label: 'Twitter' },
        { icon: Facebook, href: '#', label: 'Facebook' },
        { icon: Instagram, href: '#', label: 'Instagram' },
        { icon: Linkedin, href: '#', label: 'LinkedIn' },
        { icon: Youtube, href: '#', label: 'YouTube' },
    ];

    return (
        /* Shadow added via relative positioning and shadow-inner/border-t */
        <footer className="relative bg-gradient-to-r from-emerald-600 to-teal-600 dark:bg-none dark:bg-slate-900/95 text-white transition-colors duration-300 border-t border-black/10 dark:border-white/5 w-full overflow-x-hidden">
            
            {/* Top Shadow Layer */}
            <div className="absolute inset-x-0 top-0 h-4 shadow-[inset_0_4px_6px_-1px_rgba(0,0,0,0.1),_0_-4px_10px_rgba(0,0,0,0.05)] pointer-events-none" />

            {/* Main Footer Container */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12 lg:py-16">
                
                {/* Responsive Grid System */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-6 sm:gap-y-12 gap-x-4 sm:gap-x-8">
                    
                    {/* Brand Section */}
                    <div className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4 sm:mb-6 group">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-white/20 dark:bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="text-white dark:text-emerald-400 font-extrabold text-lg sm:text-xl">P</span>
                            </div>
                            <span className="text-xl sm:text-2xl font-medium tracking-tight text-white">Pearto Stocks</span>
                        </Link>
                        <p className="text-emerald-50 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-8 max-w-xs">
                            Professional stock analysis platform with real-time data, powerful screening tools, and comprehensive market insights.
                        </p>
                        <div className="flex flex-wrap gap-2 sm:gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 dark:bg-slate-800 hover:bg-white/25 dark:hover:bg-slate-700 flex items-center justify-center transition-all active:scale-95"
                                    aria-label={social.label}
                                >
                                    <social.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div>
                        <h3 className="text-[10px] sm:text-sm font-medium uppercase tracking-wider text-white mb-3 sm:mb-6">Markets</h3>
                        <ul className="space-y-2 sm:space-y-4">
                            {footerLinks.markets.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-emerald-50/70 dark:text-slate-400 hover:text-white dark:hover:text-emerald-400 text-[10px] sm:text-sm transition-colors block">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[10px] sm:text-sm font-medium uppercase tracking-wider text-white mb-3 sm:mb-6">Tools</h3>
                        <ul className="space-y-2 sm:space-y-4">
                            {footerLinks.tools.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-emerald-50/70 dark:text-slate-400 hover:text-white dark:hover:text-emerald-400 text-[10px] sm:text-sm transition-colors block">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[10px] sm:text-sm font-medium uppercase tracking-wider text-white mb-3 sm:mb-6">Resources</h3>
                        <ul className="space-y-2 sm:space-y-4">
                            {footerLinks.resources.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-emerald-50/70 dark:text-slate-400 hover:text-white dark:hover:text-emerald-400 text-[10px] sm:text-sm transition-colors block">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[10px] sm:text-sm font-medium uppercase tracking-wider text-white mb-3 sm:mb-6">Company</h3>
                        <ul className="space-y-2 sm:space-y-4">
                            {footerLinks.company.map((link) => (
                                <li key={link.label}>
                                    <a href={link.href} className="text-emerald-50/70 dark:text-slate-400 hover:text-white dark:hover:text-emerald-400 text-[10px] sm:text-sm transition-colors block">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 sm:mt-16 pt-4 sm:pt-8 border-t border-white/10 dark:border-slate-800">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-3 sm:gap-6 text-center lg:text-left">
                        <div className="order-2 lg:order-1">
                            <p className="text-emerald-100/60 dark:text-slate-500 text-[10px] sm:text-sm">
                                © {currentYear} Pearto Stocks. Built for modern investors.
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap justify-center items-center gap-x-4 sm:gap-x-8 gap-y-2 sm:gap-y-4 order-1 lg:order-2">
                            <a
                                href={mainAppUrl}
                                className="text-emerald-50/80 dark:text-slate-400 hover:text-white dark:hover:text-emerald-400 text-[10px] sm:text-sm font-medium transition-colors"
                            >
                                Main Platform
                            </a>
                            <div className="hidden sm:block h-4 w-px bg-white/20 dark:bg-slate-800" />
                            <span className="text-emerald-100/40 dark:text-slate-600 text-[9px] sm:text-xs max-w-[250px] sm:max-w-none">
                                Data provided for informational purposes only.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}