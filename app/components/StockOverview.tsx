import React from "react";
import { Stock } from "../types";
import { useCurrency } from "../context/CurrencyContext";
import PriceDisplay from "./common/PriceDisplay";

interface StockOverviewProps {
  stock: Stock;
}

export default function StockOverview({ stock }: StockOverviewProps) {
  const { formatPrice } = useCurrency();

  const metrics = [
    {
      label: "Market Cap",
      value: stock.marketCap ? (
        <span className="flex items-center gap-0.5">
          <PriceDisplay
            amount={stock.marketCap / (stock.marketCap >= 1e12 ? 1e12 : (stock.marketCap >= 1e9 ? 1e9 : 1e6))}
            maximumFractionDigits={2}
          />
          {stock.marketCap >= 1e12 ? 'T' : (stock.marketCap >= 1e9 ? 'B' : 'M')}
        </span>
      ) : "N/A"
    },
    { label: "Volume", value: stock.volume?.toLocaleString() || "N/A" },
    { label: "Open", value: stock.price ? <PriceDisplay amount={stock.price * 1.01} /> : "N/A" }, // Mock logic kept
    { label: "Previous Close", value: stock.previousClose ? <PriceDisplay amount={stock.previousClose} /> : <PriceDisplay amount={stock.price - stock.change} /> },
    {
      label: "Day's Range",
      value: (stock.dayLow || stock.price) && (stock.dayHigh || stock.price) ? (
        <span className="flex items-center gap-1">
          <PriceDisplay amount={stock.dayLow || stock.price * 0.99} /> - <PriceDisplay amount={stock.dayHigh || stock.price * 1.01} />
        </span>
      ) : "N/A"
    },
    { label: "EPS (ttm)", value: stock.eps ? <PriceDisplay amount={stock.eps} /> : "-" },
    { label: "PE Ratio", value: stock.peRatio?.toFixed(2) || "-" },
    { label: "Beta", value: stock.beta?.toFixed(2) || "-" },
    { label: "Dividend", value: stock.dividendYield ? `${(stock.dividendYield * 100).toFixed(2)}%` : "-" },
    {
      label: "52-Week Range",
      value: (stock.week52Low && stock.week52High) ? (
        <span className="flex items-center gap-1">
          <PriceDisplay amount={stock.week52Low} /> - <PriceDisplay amount={stock.week52High} />
        </span>
      ) : "N/A"
    },
  ];

  return (
    <div className="bg-white dark:bg-pearto-card rounded-xl border border-slate-200 dark:border-pearto-border shadow-sm dark:shadow-pearto-green/5 overflow-hidden transition-colors duration-300">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-pearto-border bg-slate-50/50 dark:bg-pearto-surface/50 transition-colors duration-300">
        <h3 className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-pearto-gray">
          Market Statistics
        </h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 gap-y-0 text-sm">
          {metrics.map((metric, idx) => (
            <div key={idx} className="flex justify-between py-2.5 border-b border-slate-50 dark:border-pearto-border-subtle last:border-0 transition-colors duration-300">
              <span className="text-slate-500 dark:text-pearto-cloud font-medium">{metric.label}</span>
              <span className="font-medium text-slate-900 dark:text-pearto-luna">{metric.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}