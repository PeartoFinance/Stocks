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
                const [gainersRes, losersRes] = await Promise.all([
                    stockAPI.getMarketMovers('gainers').catch(() => ({ success: false, data: null })),
                    stockAPI.getMarketMovers('losers').catch(() => ({ success: false, data: null }))
                ]);
                
                const items: TickerItem[] = [];

                // Add top gainers
                if (gainersRes?.success && Array.isArray(gainersRes.data)) {
                    gainersRes.data.slice(0, 8).forEach((stock: any) => {
                        if (stock?.symbol && typeof stock.price === 'number') {
                            const changePercent = typeof stock.changePercent === 'number' ? stock.changePercent : 0;
                            items.push({
                                symbol: stock.symbol,
                                price: stock.price,
                                change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
                                up: changePercent >= 0
                            });
                        }
                    });
                }

                // Add top losers
                if (losersRes?.success && Array.isArray(losersRes.data)) {
                    losersRes.data.slice(0, 7).forEach((stock: any) => {
                        if (stock?.symbol && typeof stock.price === 'number') {
                            const changePercent = typeof stock.changePercent === 'number' ? stock.changePercent : 0;
                            items.push({
                                symbol: stock.symbol,
                                price: stock.price,
                                change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
                                up: changePercent >= 0
                            });
                        }
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
            <div className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 py-2 text-xs font-medium border-b border-slate-300 dark:border-slate-700 transition-colors duration-300">
                <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                    <span>Market data unavailable</span>
                    <span className="text-xs">• Import data from admin panel</span>
                </div>
            </div>
        );
    }

    if (loading && tickerData.length === 0) {
        return (
            <div className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 py-2 text-xs font-medium border-b border-slate-300 dark:border-slate-700 transition-colors duration-300">
                <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={12} />
                    <span className="text-slate-600 dark:text-slate-400">Loading market data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 py-2 text-xs font-medium overflow-hidden border-b border-slate-300 dark:border-slate-700 transition-colors duration-300">
            <div className="flex items-center gap-8 animate-marquee hover:pause-animation">
                {tickerData.map((ticker, index) => (
                    <div key={`${ticker.symbol}-${index}`} className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-slate-600 dark:text-pearto-gray">{ticker.symbol || 'N/A'}</span>
                        <PriceDisplay amount={ticker.price ?? 0} className="font-medium" />
                        <span className={`flex items-center gap-0.5 ${ticker.up ? 'text-green-600 dark:text-pearto-green' : 'text-red-600 dark:text-pearto-pink'}`}>
                            {ticker.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {ticker.change || '0.00%'}
                        </span>
                    </div>
                ))}

                {tickerData.map((ticker, index) => (
                    <div key={`dup-${ticker.symbol}-${index}`} className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-slate-600 dark:text-pearto-gray">{ticker.symbol || 'N/A'}</span>
                        <PriceDisplay amount={ticker.price ?? 0} className="font-medium" />
                        <span className={`flex items-center gap-0.5 ${ticker.up ? 'text-green-600 dark:text-pearto-green' : 'text-red-600 dark:text-pearto-pink'}`}>
                            {ticker.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {ticker.change || '0.00%'}
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