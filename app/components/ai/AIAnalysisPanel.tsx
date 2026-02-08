'use client';

/**
 * AI Analysis Panel for Stock Project
 * Self-contained component with typing animation and markdown rendering
 * Adapted from main project for Next.js App Router
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, RefreshCw, ChevronDown, ChevronUp, Loader2, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIAnalysisPanelProps {
    title?: string;
    pageType: string;
    pageData: any;
    autoAnalyze?: boolean;
    compact?: boolean;
    quickPrompts?: string[];
    className?: string;
    maxHeight?: string;
}

// Helper to format data for better AI understanding
function formatDataForAI(pageType: string, pageData: any): string {
    try {
        if (!pageData || Object.keys(pageData).length === 0) {
            return 'No data available';
        }

        let summary = '';

        // Format stock-detail data
        if (pageType === 'stock-detail') {
            summary += `**Stock:** ${pageData.symbol || 'N/A'}\n`;
            if (pageData.name) summary += `**Company:** ${pageData.name}\n`;
            if (pageData.price) summary += `**Price:** $${Number(pageData.price).toFixed(2)}\n`;
            if (pageData.change !== undefined) {
                const change = Number(pageData.change) || 0;
                summary += `**Change:** ${change >= 0 ? '+' : ''}${change.toFixed(2)}%\n`;
            }
            if (pageData.volume) summary += `**Volume:** ${Number(pageData.volume).toLocaleString()}\n`;
            if (pageData.marketCap) summary += `**Market Cap:** ${pageData.marketCap}\n`;
            if (pageData.pe) summary += `**P/E Ratio:** ${pageData.pe}\n`;
            if (pageData.sector) summary += `**Sector:** ${pageData.sector}\n`;
        }
        // Format stock-screener data
        else if (pageType === 'stock-screener') {
            summary += `**Total Stocks:** ${pageData.count || 0}\n`;
            if (pageData.filters) {
                summary += `**Active Filters:** ${Object.keys(pageData.filters).join(', ')}\n`;
            }
            if (pageData.topStocks && pageData.topStocks.length > 0) {
                summary += '\n**Top Results:**\n';
                pageData.topStocks.slice(0, 5).forEach((s: any) => {
                    summary += `- ${s.symbol}: $${Number(s.price || 0).toFixed(2)} (${Number(s.change || 0) >= 0 ? '+' : ''}${Number(s.change || 0).toFixed(2)}%)\n`;
                });
            }
        }
        // Format market-movers data
        else if (pageType === 'market-movers') {
            if (pageData.gainers && pageData.gainers.length > 0) {
                summary += '**Top Gainers:**\n';
                pageData.gainers.slice(0, 5).forEach((g: any) => {
                    summary += `- ${g.symbol}: $${Number(g.price || 0).toFixed(2)} (+${Number(g.changePercent || 0).toFixed(2)}%)\n`;
                });
            }
            if (pageData.losers && pageData.losers.length > 0) {
                summary += '\n**Top Losers:**\n';
                pageData.losers.slice(0, 5).forEach((l: any) => {
                    summary += `- ${l.symbol}: $${Number(l.price || 0).toFixed(2)} (${Number(l.changePercent || 0).toFixed(2)}%)\n`;
                });
            }
        }
        // Format ETF data
        else if (pageType === 'etf-overview') {
            summary += `**Total ETFs:** ${pageData.count || 0}\n`;
            if (pageData.categories) {
                summary += `**Categories:** ${pageData.categories.join(', ')}\n`;
            }
            if (pageData.topETFs && pageData.topETFs.length > 0) {
                summary += '\n**Top ETFs:**\n';
                pageData.topETFs.slice(0, 5).forEach((e: any) => {
                    summary += `- ${e.symbol}: $${Number(e.price || 0).toFixed(2)}\n`;
                });
            }
        }
        // Format trending data
        else if (pageType === 'trending') {
            summary += `**Trending Stocks Count:** ${pageData.count || 0}\n`;
            if (pageData.trending && pageData.trending.length > 0) {
                summary += '\n**Currently Trending:**\n';
                pageData.trending.slice(0, 5).forEach((t: any) => {
                    summary += `- ${t.symbol}: ${t.name || ''}\n`;
                });
            }
        }
        // Format screener-advanced data
        else if (pageType === 'screener-advanced') {
            summary += `**Screening Results:** ${pageData.count || 0} stocks\n`;
            if (pageData.criteria) {
                summary += `\n**Filter Criteria:**\n`;
                Object.entries(pageData.criteria).forEach(([key, value]) => {
                    summary += `- ${key}: ${value}\n`;
                });
            }
        }
        // Format market-dashboard data (Stock home page)
        else if (pageType === 'market-dashboard') {
            summary += `**Market Status:** ${pageData.marketStatus || 'Unknown'}\n`;
            if (pageData.indices && pageData.indices.length > 0) {
                summary += '\n**Major Indices:**\n';
                pageData.indices.forEach((idx: any) => {
                    summary += `- ${idx.name}: ${idx.value} (${idx.change})\n`;
                });
            }
            if (pageData.topGainers && pageData.topGainers.length > 0) {
                summary += '\n**Top Gainers:**\n';
                pageData.topGainers.forEach((g: any) => {
                    summary += `- ${g.symbol}: +${Number(g.change || 0).toFixed(2)}%\n`;
                });
            }
            if (pageData.topLosers && pageData.topLosers.length > 0) {
                summary += '\n**Top Losers:**\n';
                pageData.topLosers.forEach((l: any) => {
                    summary += `- ${l.symbol}: ${Number(l.change || 0).toFixed(2)}%\n`;
                });
            }
        }
        // Format watchlist data
        else if (pageType === 'watchlist') {
            summary += `**Watchlist:** ${pageData.activeWatchlist || 'My Watchlist'}\n`;
            summary += `**Stock Count:** ${pageData.stockCount || 0}\n`;
            if (pageData.stocks && pageData.stocks.length > 0) {
                summary += '\n**Holdings:**\n';
                pageData.stocks.forEach((s: any) => {
                    summary += `- ${s.symbol}: $${s.price?.toFixed(2)} (${s.change >= 0 ? '+' : ''}${s.change?.toFixed(2)}%)\n`;
                });
            }
            if (pageData.indices && pageData.indices.length > 0) {
                summary += '\n**Market Indices:**\n';
                pageData.indices.forEach((idx: any) => {
                    summary += `- ${idx.name}: ${idx.change >= 0 ? '+' : ''}${idx.change?.toFixed(2)}%\n`;
                });
            }
        }
        // Format IPOs data
        else if (pageType === 'ipos') {
            summary += `**Upcoming IPOs:** ${pageData.upcomingCount || 0}\n`;
            summary += `**Pricing IPOs:** ${pageData.pricingCount || 0}\n`;
            summary += `**Total Value:** $${((pageData.totalValue || 0) / 1e9).toFixed(2)}B\n`;
            if (pageData.sectors && pageData.sectors.length > 0) {
                summary += `\n**Sectors:** ${pageData.sectors.join(', ')}\n`;
            }
            if (pageData.topIPOs && pageData.topIPOs.length > 0) {
                summary += '\n**Featured IPOs:**\n';
                pageData.topIPOs.forEach((ipo: any) => {
                    summary += `- ${ipo.symbol}: ${ipo.company} ($${(ipo.value / 1e6).toFixed(0)}M) - ${ipo.status}\n`;
                });
            }
        }
        // Format comparison data
        else if (pageType === 'comparison') {
            summary += `**Stocks Being Compared:** ${pageData.stockCount || 0}\n`;
            summary += `**Active Category:** ${pageData.activeCategory || 'Overview'}\n`;
            if (pageData.stocks && pageData.stocks.length > 0) {
                summary += '\n**Comparison Stocks:**\n';
                pageData.stocks.forEach((s: any) => {
                    summary += `- ${s.symbol} (${s.name}): $${s.price?.toFixed(2)}, P/E: ${s.pe?.toFixed(1)}, Sector: ${s.sector}\n`;
                });
            }
        }
        // Generic fallback
        else {
            summary = JSON.stringify(pageData, null, 2).slice(0, 500);
        }

        return summary || 'Data received but no summary generated';
    } catch (e) {
        console.error('Error formatting data:', e);
        return `Error formatting data: ${e}`;
    }
}

export default function AIAnalysisPanel({
    title = 'AI Analysis',
    pageType,
    pageData,
    autoAnalyze = true,
    compact = false,
    quickPrompts = [],
    className = '',
    maxHeight = '400px'
}: AIAnalysisPanelProps) {
    const [analysis, setAnalysis] = useState<string>('');
    const [displayedText, setDisplayedText] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Typing effect
    useEffect(() => {
        if (!analysis || isLoading) {
            setDisplayedText('');
            return;
        }

        setIsTyping(true);
        let currentIndex = 0;
        const typingSpeed = 8;

        const typeNextChar = () => {
            if (currentIndex < analysis.length) {
                const chunkSize = 3;
                setDisplayedText(analysis.slice(0, Math.min(currentIndex + chunkSize, analysis.length)));
                currentIndex += chunkSize;
                setTimeout(typeNextChar, typingSpeed);
            } else {
                setIsTyping(false);
            }
        };

        typeNextChar();

        return () => {
            setIsTyping(false);
        };
    }, [analysis, isLoading]);

    // Auto-scroll while typing
    useEffect(() => {
        if (isTyping && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [displayedText, isTyping]);

    // Fetch AI analysis - uses same API base as other Stock API calls
    const fetchAnalysis = useCallback(async (prompt?: string) => {
        setIsLoading(true);
        setError(null);
        setAnalysis('');
        setDisplayedText('');

        try {
            const dataSummary = formatDataForAI(pageType, pageData);

            const formattingInstructions = `
Format your response with clean, readable markdown:
- Use ## for section headers (2-3 sections max)
- Use **bold** for key numbers and important terms
- Use bullet points (•) for lists
- Keep paragraphs short (2-3 sentences)
- Add blank lines between sections
- Be concise but insightful (150-250 words max)
- Focus on actionable insights, not just listing data back`;

            const message = prompt
                ? `${prompt}\n\n${formattingInstructions}\n\nCurrent Data:\n${dataSummary}`
                : `Analyze this ${pageType} data briefly. Highlight 2-3 key insights and any notable trends or opportunities.\n\n${formattingInstructions}\n\nData:\n${dataSummary}`;

            // Build API URL using same pattern as stockAPI
            const rawApiBase = process.env.NEXT_PUBLIC_API_URL || '';
            const apiBase = rawApiBase.replace(/\/$/, '');
            const apiIncludesPath = apiBase.endsWith('/api');
            const aiEndpoint = apiIncludesPath ? '/ai/chat' : '/api/ai/chat';
            const apiUrl = `${apiBase}${aiEndpoint}`;

            console.log('[AIAnalysisPanel] Fetching:', apiUrl);

            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    context: {
                        pageType,
                        pageData,
                        dataSummary,
                        history: []
                    }
                })
            });

            if (!res.ok) {
                throw new Error(`AI request failed: ${res.status}`);
            }

            const data = await res.json();
            setAnalysis(data.response || 'No analysis available.');
        } catch (err) {
            console.error('AI Analysis error:', err);
            setError('Unable to generate analysis. Please try again.');
            setAnalysis('');
        } finally {
            setIsLoading(false);
        }
    }, [pageType, pageData]);

    // Auto-analyze when autoAnalyze becomes true (data is ready)
    const hasAutoAnalyzedRef = useRef(false);

    useEffect(() => {
        // Only run once when autoAnalyze is true and data exists
        if (autoAnalyze && !hasAutoAnalyzedRef.current && pageData && Object.keys(pageData).length > 0) {
            hasAutoAnalyzedRef.current = true;
            console.log('[AIAnalysisPanel] Auto-triggering analysis for:', pageType);
            // Call fetchAnalysis directly after a small delay
            const timer = setTimeout(() => {
                fetchAnalysis();
            }, 300);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoAnalyze, pageData, pageType]);

    const handleQuickPrompt = (prompt: string) => {
        fetchAnalysis(prompt);
    };

    return (
        <div className={`bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/30 shadow-lg ${className}`}>
            {/* Header */}
            <div className={`${compact ? 'p-3' : 'p-4'} border-b border-purple-100 dark:border-purple-800/50`}>
                <div className="flex items-center justify-between">
                    <h3 className={`flex items-center gap-2 font-semibold ${compact ? 'text-sm' : 'text-base'} text-gray-900 dark:text-white`}>
                        <Sparkles className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-purple-600`} />
                        {title}
                    </h3>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => fetchAnalysis()}
                            disabled={isLoading}
                            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 text-gray-600 dark:text-gray-300 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                        >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300 transition-colors duration-300" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300 transition-colors duration-300" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className={`${compact ? 'p-3' : 'p-4'}`}>
                    {/* Quick Prompts */}
                    {quickPrompts.length > 0 && !isLoading && !analysis && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {quickPrompts.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleQuickPrompt(prompt)}
                                    className="text-[10px] px-2 py-1 rounded-full border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-gray-700 dark:text-gray-300 transition-colors"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Scrollable Content Area */}
                    <div
                        ref={scrollRef}
                        className="overflow-y-auto pr-2"
                        style={{ maxHeight }}
                    >
                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex items-center gap-2 py-4">
                                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                <span className="text-sm text-gray-500 dark:text-pearto-gray transition-colors duration-300">Analyzing data...</span>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !isLoading && (
                            <div className="text-sm text-red-600 dark:text-red-400 py-2 transition-colors duration-300">
                                {error}
                            </div>
                        )}

                        {/* Analysis Content with Typing Effect */}
                        {displayedText && !isLoading && (
                            <div className={`${compact ? 'text-xs' : 'text-sm'} leading-relaxed prose prose-sm dark:prose-invert max-w-none`}>
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        h1: ({ children }) => (
                                            <h1 className="text-lg font-bold text-purple-800 dark:text-purple-300 mt-4 mb-3 pb-2 border-b-2 border-purple-200 dark:border-purple-800 transition-colors duration-300">
                                                {children}
                                            </h1>
                                        ),
                                        h2: ({ children }) => (
                                            <h2 className="text-base font-semibold text-purple-700 dark:text-purple-400 mt-5 mb-2 pb-1 border-b border-purple-100 dark:border-purple-900 transition-colors duration-300">
                                                {children}
                                            </h2>
                                        ),
                                        h3: ({ children }) => (
                                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2 transition-colors duration-300">
                                                {children}
                                            </h3>
                                        ),
                                        p: ({ children }) => (
                                            <p className="my-3 leading-relaxed text-gray-700 dark:text-gray-300 transition-colors duration-300">
                                                {children}
                                            </p>
                                        ),
                                        ul: ({ children }) => (
                                            <ul className="my-3 ml-1 space-y-2">
                                                {children}
                                            </ul>
                                        ),
                                        ol: ({ children }) => (
                                            <ol className="my-3 ml-1 space-y-2 list-decimal list-inside">
                                                {children}
                                            </ol>
                                        ),
                                        li: ({ children }) => (
                                            <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                                                <span className="text-purple-500 mt-1.5 text-xs">●</span>
                                                <span className="flex-1">{children}</span>
                                            </li>
                                        ),
                                        strong: ({ children }) => (
                                            <strong className="font-semibold text-emerald-700 dark:text-emerald-400 transition-colors duration-300">
                                                {children}
                                            </strong>
                                        ),
                                        em: ({ children }) => (
                                            <em className="italic text-gray-600 dark:text-gray-400 transition-colors duration-300">
                                                {children}
                                            </em>
                                        ),
                                        table: ({ children }) => (
                                            <div className="my-4 overflow-x-auto rounded-lg border border-purple-200 dark:border-purple-800 transition-colors duration-300">
                                                <table className="w-full text-sm">
                                                    {children}
                                                </table>
                                            </div>
                                        ),
                                        thead: ({ children }) => (
                                            <thead className="bg-purple-50 dark:bg-purple-900/40 transition-colors duration-300">
                                                {children}
                                            </thead>
                                        ),
                                        th: ({ children }) => (
                                            <th className="px-3 py-2 text-left font-semibold text-purple-800 dark:text-purple-300 border-b border-purple-200 dark:border-purple-800 transition-colors duration-300">
                                                {children}
                                            </th>
                                        ),
                                        td: ({ children }) => (
                                            <td className="px-3 py-2 border-b border-purple-100 dark:border-purple-900/50 transition-colors duration-300">
                                                {children}
                                            </td>
                                        ),
                                        hr: () => (
                                            <hr className="my-4 border-t-2 border-purple-100 dark:border-purple-900 transition-colors duration-300" />
                                        ),
                                        code: ({ children, className }) => {
                                            const isInline = !className;
                                            return isInline ? (
                                                <code className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 text-xs font-mono transition-colors duration-300">
                                                    {children}
                                                </code>
                                            ) : (
                                                <code className="block p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-mono overflow-x-auto transition-colors duration-300">
                                                    {children}
                                                </code>
                                            );
                                        },
                                        blockquote: ({ children }) => (
                                            <blockquote className="my-3 pl-4 border-l-4 border-purple-300 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-900/20 py-2 italic text-gray-600 dark:text-gray-400 transition-colors duration-300">
                                                {children}
                                            </blockquote>
                                        ),
                                    }}
                                >
                                    {displayedText}
                                </ReactMarkdown>
                                {isTyping && (
                                    <span className="inline-block w-2 h-4 bg-purple-600 animate-pulse ml-0.5" />
                                )}
                            </div>
                        )}

                        {/* Empty State */}
                        {!analysis && !isLoading && !error && (
                            <div className="text-center py-4">
                                <MessageSquare className="w-8 h-8 mx-auto text-purple-300 dark:text-purple-700 mb-2 transition-colors duration-300" />
                                <p className="text-xs text-gray-500 dark:text-pearto-gray transition-colors duration-300">
                                    Click refresh to get AI insights
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Disclaimer */}
                    {displayedText && !isTyping && (
                        <p className="text-[9px] text-gray-400 mt-3 pt-2 border-t border-purple-100 dark:border-purple-900 transition-colors duration-300">
                            ⚠️ AI analysis is for informational purposes only. Not financial advice.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
