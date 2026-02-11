'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { stockAPI } from '../utils/api';

import { useCurrency } from '@/app/context/CurrencyContext';
import PriceDisplay from './common/PriceDisplay';

interface TickerItem {
    symbol: string;
    price: number;
    change: string;
    up: boolean;
}

export default function TickerTape() {
    const { formatPrice } = useCurrency(); // Although we use PriceDisplay, logic might need accessing context
    const [tickerData, setTickerData] = useState<TickerItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [overviewRes, gainersRes] = await Promise.all([
                    stockAPI.getMarketOverview(),
                    stockAPI.getMarketMovers('gainers')
                ]);

                const items: TickerItem[] = [];

                // Add market indices
                if (overviewRes.success && overviewRes.data) {
                    overviewRes.data.slice(0, 4).forEach((idx: any) => {
                        const changePercent = idx.changePercent || 0;
                        items.push({
                            symbol: idx.name || idx.symbol,
                            price: idx.price || 0,
                            change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
                            up: changePercent >= 0
                        });
                    });
                }

                // Add top gainers
                if (gainersRes.success && gainersRes.data) {
                    gainersRes.data.slice(0, 3).forEach((stock: any) => {
                        const changePercent = stock.changePercent || 0;
                        items.push({
                            symbol: stock.symbol,
                            price: stock.price || 0,
                            change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
                            up: changePercent >= 0
                        });
                    });
                }

                if (items.length > 0) {
                    setTickerData(items);
                    setError(false);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error('Failed to fetch ticker data:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    if (error && tickerData.length === 0) {
        return (
            <div className="bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-100 py-2 text-xs font-medium border-b border-gray-300 dark:border-gray-700 transition-colors duration-300">
                <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                    <span>Market data unavailable</span>
                    <span className="text-xs">• Import data from admin panel</span>
                </div>
            </div>
        );
    }

    if (loading && tickerData.length === 0) {
        return (
            <div className="bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-100 py-2 text-xs font-medium border-b border-gray-300 dark:border-gray-700 transition-colors duration-300">
                <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={12} />
                    <span className="text-gray-600 dark:text-gray-400">Loading market data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-100 py-2 text-xs font-medium overflow-hidden border-b border-gray-300 dark:border-gray-700 transition-colors duration-300">
            <div className="flex items-center gap-8 animate-marquee hover:pause-animation">
                {tickerData.map((ticker, index) => (
                    <div key={index} className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-gray-600 dark:text-pearto-gray">{ticker.symbol}</span>
                        <PriceDisplay amount={ticker.price} className="font-semibold" />
                        <span className={`flex items-center gap-0.5 ${ticker.up ? 'text-green-600 dark:text-pearto-green' : 'text-red-600 dark:text-pearto-pink'}`}>
                            {ticker.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {ticker.change}
                        </span>
                    </div>
                ))}

                {tickerData.map((ticker, index) => (
                    <div key={`dup-${index}`} className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-gray-600 dark:text-pearto-gray">{ticker.symbol}</span>
                        <PriceDisplay amount={ticker.price} className="font-semibold" />
                        <span className={`flex items-center gap-0.5 ${ticker.up ? 'text-green-600 dark:text-pearto-green' : 'text-red-600 dark:text-pearto-pink'}`}>
                            {ticker.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {ticker.change}
                        </span>
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}