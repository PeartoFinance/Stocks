import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number | undefined): string {
  if (value === undefined || value === null) return 'N/A';
  
  if (Math.abs(value) >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  }
  if (Math.abs(value) >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  }
  if (Math.abs(value) >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  }
  
  return `$${value.toLocaleString()}`;
}

export function formatVolume(value: number | undefined): string {
  if (value === undefined || value === null) return 'N/A';
  
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  
  return value.toLocaleString();
}

export function formatPercent(value: number | undefined): string {
  if (value === undefined || value === null) return 'N/A';
  return `${(value * 100).toFixed(2)}%`;
}

export function formatPrice(value: number | undefined): string {
  if (value === undefined || value === null) return 'N/A';
  return `$${value.toFixed(2)}`;
}

export function formatChange(change: number | undefined, changePercent: number | undefined): {
  value: string;
  isPositive: boolean;
} {
  if (change === undefined || changePercent === undefined) {
    return { value: 'N/A', isPositive: false };
  }
  
  const changeStr = change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2);
  const percentStr = changePercent >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`;
  
  return {
    value: `${changeStr} (${percentStr})`,
    isPositive: change >= 0
  };
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

export function getChangeColorClass(change: number | undefined): string {
  if (change === undefined || change === null) return 'text-muted-foreground';
  return change >= 0 ? 'text-positive' : 'text-negative';
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function calculatePercentChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

export function isMarketHours(): boolean {
  const now = new Date();
  const dayOfWeek = now.getDay();
  
  // Weekend check (0 = Sunday, 6 = Saturday)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }
  
  // Convert to Eastern Time (approximate)
  const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
  const hours = easternTime.getHours();
  const minutes = easternTime.getMinutes();
  const currentTime = hours * 60 + minutes;
  
  // Market hours: 9:30 AM - 4:00 PM Eastern
  const marketOpen = 9 * 60 + 30; // 9:30 AM
  const marketClose = 16 * 60;    // 4:00 PM
  
  return currentTime >= marketOpen && currentTime <= marketClose;
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function validateStockSymbol(symbol: string): boolean {
  // Basic validation for stock symbols (1-5 characters, letters only)
  return /^[A-Z]{1,5}$/.test(symbol.toUpperCase());
}

export function sanitizeInput(input: string): string {
  return input.replace(/[<>'"]/g, '');
}

export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
  }
}