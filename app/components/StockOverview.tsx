import React from "react";
import { Stock } from "../types";

interface StockOverviewProps {
  stock: Stock;
}

export default function StockOverview({ stock }: StockOverviewProps) {
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const metrics = [
    { label: "Market Cap", value: stock.marketCap ? `$${(stock.marketCap / 1e12).toFixed(2)}T` : "N/A" },
    { label: "Volume", value: stock.volume?.toLocaleString() || "N/A" },
    { label: "Open", value: formatPrice(stock.price * 1.01) },
    { label: "Previous Close", value: formatPrice(stock.price + stock.change) },
    { label: "Day's Range", value: `${formatPrice(stock.price * 0.99)} - ${formatPrice(stock.price * 1.01)}` },
    { label: "EPS (ttm)", value: stock.eps?.toFixed(2) || "7.46" },
    { label: "PE Ratio", value: stock.peRatio?.toFixed(2) || "34.25" },
    { label: "Beta", value: stock.beta?.toFixed(2) || "1.09" },
    { label: "Dividend", value: stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : "0.41%" },
    { label: "52-Week Range", value: `${stock.low52Week ? formatPrice(stock.low52Week) : "N/A"} - ${stock.high52Week ? formatPrice(stock.high52Week) : "N/A"}` },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Market Statistics
        </h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 gap-y-0 text-sm">
          {metrics.map((metric, idx) => (
            <div key={idx} className="flex justify-between py-2.5 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
              <span className="text-slate-500 dark:text-slate-400 font-medium">{metric.label}</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{metric.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}