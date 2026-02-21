'use client';

import React from 'react';
import { useCurrency } from '@/app/context/CurrencyContext';

interface PriceDisplayProps {
    amount: number;
    className?: string;
    autoColor?: boolean; // If true, colors green for positive, red for negative (only makes sense if amount represents change, but sometimes price itself if coupled with change logic)
    coloredChange?: boolean; // Specifically for change values
    showSign?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
}

export default function PriceDisplay({
    amount,
    className = '',
    autoColor = false,
    coloredChange = false,
    showSign = false,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
}: PriceDisplayProps) {
    const { formatPrice } = useCurrency();

    // Determine color if requested
    let colorClass = '';
    if (autoColor) {
        if (amount > 0) colorClass = 'text-green-500';
        else if (amount < 0) colorClass = 'text-red-500';
        else colorClass = 'text-slate-500';
    }

    // Determine sign
    const sign = showSign && amount > 0 ? '+' : '';

    // Format the absolute value if we are handling sign manually for change, 
    // or just normal value. 
    // formatPrice handles the formatting including currency symbol.

    // Note: formatPrice takes the raw number and converts it based on current currency rates.
    // If we are displaying a *change* value (e.g. +$1.50), we should convert the magnitude.

    const formatted = formatPrice(Math.abs(amount), minimumFractionDigits, maximumFractionDigits);

    // If showing sign for change values, we need to reconstruct: "+ $1.50" or "- $1.50"
    // formatPrice returns "$1.50". 
    // So:
    const finalString = showSign
        ? (amount >= 0 ? '+' : '-') + formatted
        : (amount < 0 ? '-' : '') + formatted;

    // However, formatPrice handles negative numbers by formatting them as "-$1.50" usually.
    // So if showSign is false, formatPrice(amount) interacts with standard negative formatting.
    // If showSign is true (e.g. for change), we want "+" for positive.

    const displayString = showSign && amount > 0
        ? `+${formatPrice(amount, minimumFractionDigits, maximumFractionDigits)}`
        : formatPrice(amount, minimumFractionDigits, maximumFractionDigits);

    return (
        <span className={`${colorClass} ${className}`}>
            {displayString}
        </span>
    );
}
