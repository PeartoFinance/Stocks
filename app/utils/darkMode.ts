// Pearto Dark Mode Utility Classes
// Use these consistent class patterns across all components

export const darkMode = {
  // Backgrounds
  bg: {
    primary: 'bg-white dark:bg-pearto-blockchain',
    secondary: 'bg-gray-50 dark:bg-pearto-surface',
    card: 'bg-white dark:bg-pearto-card',
    elevated: 'bg-white dark:bg-pearto-slate',
    hover: 'hover:bg-gray-50 dark:hover:bg-pearto-surface',
    active: 'bg-emerald-50 dark:bg-pearto-slate',
  },
  
  // Text Colors
  text: {
    primary: 'text-gray-900 dark:text-pearto-luna',
    secondary: 'text-gray-600 dark:text-pearto-cloud',
    muted: 'text-gray-500 dark:text-pearto-gray',
    hover: 'hover:text-gray-900 dark:hover:text-pearto-luna',
    link: 'text-emerald-600 dark:text-pearto-green hover:text-emerald-700 dark:hover:text-pearto-green-hover',
  },
  
  // Borders
  border: {
    default: 'border-gray-200 dark:border-pearto-border',
    subtle: 'border-gray-100 dark:border-pearto-border-subtle',
    hover: 'hover:border-gray-300 dark:hover:border-pearto-cloud',
  },
  
  // Buttons
  button: {
    primary: 'bg-emerald-600 dark:bg-pearto-pink hover:bg-emerald-700 dark:hover:bg-pearto-pink-hover text-white',
    secondary: 'bg-gray-100 dark:bg-pearto-surface text-gray-900 dark:text-pearto-luna hover:bg-gray-200 dark:hover:bg-pearto-slate',
    success: 'bg-green-500 dark:bg-pearto-green hover:bg-green-600 dark:hover:bg-pearto-green-hover text-white dark:text-pearto-blockchain',
    info: 'bg-blue-500 dark:bg-pearto-blue hover:bg-blue-600 dark:hover:bg-pearto-blue-hover text-white dark:text-pearto-blockchain',
    outline: 'border-2 border-emerald-600 dark:border-pearto-green text-emerald-600 dark:text-pearto-green hover:bg-emerald-50 dark:hover:bg-pearto-green/10',
  },
  
  // Market Data
  market: {
    positive: 'text-green-600 dark:text-pearto-green',
    negative: 'text-red-600 dark:text-pearto-pink',
    neutral: 'text-gray-600 dark:text-pearto-amber',
    bgPositive: 'bg-green-50 dark:bg-pearto-green/10',
    bgNegative: 'bg-red-50 dark:bg-pearto-pink/10',
  },
  
  // Cards & Containers
  card: {
    default: 'bg-white dark:bg-pearto-card border border-gray-200 dark:border-pearto-border shadow-sm dark:shadow-none',
    hover: 'hover:shadow-lg dark:hover:shadow-pearto-green/5 hover:border-gray-300 dark:hover:border-pearto-green/30',
    elevated: 'bg-white dark:bg-pearto-slate shadow-md dark:shadow-pearto-green/10',
  },
  
  // Inputs
  input: {
    default: 'bg-white dark:bg-pearto-surface border-gray-300 dark:border-pearto-border text-gray-900 dark:text-pearto-luna placeholder-gray-400 dark:placeholder-pearto-gray focus:border-emerald-500 dark:focus:border-pearto-green focus:ring-emerald-500 dark:focus:ring-pearto-green',
  },
  
  // Gradients
  gradient: {
    primary: 'bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-pearto-astronaut dark:to-pearto-slate',
    header: 'bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-pearto-astronaut dark:to-pearto-puerto-rico',
    card: 'bg-gradient-to-br from-gray-50 to-white dark:from-pearto-blockchain dark:to-pearto-surface',
  },
  
  // Icons
  icon: {
    default: 'text-gray-600 dark:text-pearto-cloud',
    hover: 'hover:text-emerald-600 dark:hover:text-pearto-green',
    active: 'text-emerald-600 dark:text-pearto-green',
    muted: 'text-gray-400 dark:text-pearto-gray',
  },
};

// Helper function to combine dark mode classes
export const dm = (...classes: string[]) => classes.join(' ');
