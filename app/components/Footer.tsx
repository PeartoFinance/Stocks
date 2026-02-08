'use client';

import Link from 'next/link';
import {
    TrendingUp,
    Twitter,
    Facebook,
    Instagram,
    Linkedin,
    Youtube,
    Mail,
    MapPin,
    Phone
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
            { label: 'About Us', href: `${mainAppUrl}/about` },
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
        <footer className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-pearto-astronaut dark:to-pearto-slate text-white transition-colors duration-300">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-3 lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="h-10 w-10 rounded-lg bg-white/20 dark:bg-pearto-green/20 flex items-center justify-center">
                                <span className="text-white dark:text-pearto-green font-bold text-lg">P</span>
                            </div>
                            <span className="text-xl font-bold text-white dark:text-pearto-luna">Pearto Stocks</span>
                        </Link>
                        <p className="text-white/70 dark:text-pearto-cloud text-sm mb-4">
                            Professional stock analysis platform with real-time data, powerful screening tools, and comprehensive market insights.
                        </p>
                        <div className="flex gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-lg bg-white/10 dark:bg-pearto-surface hover:bg-white/20 dark:hover:bg-pearto-green/20 flex items-center justify-center transition"
                                    aria-label={social.label}
                                >
                                    <social.icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Markets */}
                    <div>
                        <h3 className="font-semibold text-white dark:text-pearto-luna mb-4">Markets</h3>
                        <ul className="space-y-2">
                            {footerLinks.markets.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-white/70 dark:text-pearto-cloud hover:text-white dark:hover:text-pearto-green text-sm transition">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Tools */}
                    <div>
                        <h3 className="font-semibold text-white dark:text-pearto-luna mb-4">Tools</h3>
                        <ul className="space-y-2">
                            {footerLinks.tools.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-white/70 dark:text-pearto-cloud hover:text-white dark:hover:text-pearto-green text-sm transition">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-semibold text-white dark:text-pearto-luna mb-4">Resources</h3>
                        <ul className="space-y-2">
                            {footerLinks.resources.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-white/70 dark:text-pearto-cloud hover:text-white dark:hover:text-pearto-green text-sm transition">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-semibold text-white dark:text-pearto-luna mb-4">Company</h3>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <a href={link.href} className="text-white/70 dark:text-pearto-cloud hover:text-white dark:hover:text-pearto-green text-sm transition">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 dark:border-pearto-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-white/70 dark:text-pearto-gray text-sm">
                            © {currentYear} Pearto Stocks. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <a
                                href={mainAppUrl}
                                className="text-white/70 dark:text-pearto-cloud hover:text-white dark:hover:text-pearto-green text-sm transition"
                            >
                                Main Platform
                            </a>
                            <span className="text-white/30 dark:text-pearto-border">|</span>
                            <span className="text-white/50 dark:text-pearto-gray text-xs">
                                Data provided for informational purposes only.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
