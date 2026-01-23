import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.71:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const stockAPI = {
  // Market data
  getMarketOverview: () => api.get('/market-overview'),
  getTrendingStocks: () => api.get('/trending-stocks'),

  // Stock data
  searchStocks: (query) => api.get(`/stocks/search?q=${query}`),
  getStockInfo: (symbol) => api.get(`/stocks/${symbol}`),
  getStockHistory: (symbol, period = '1y', interval = '1d') =>
    api.get(`/stocks/${symbol}/history?period=${period}&interval=${interval}`),
  getStockScreener: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/stocks/screener?${params}`);
  },

  // Analysis
  getTechnicalAnalysis: (symbol) => api.get(`/analysis/${symbol}/technical`),
  getFundamentalAnalysis: (symbol) => api.get(`/analysis/${symbol}/fundamentals`),
  getRecommendation: (symbol) => api.get(`/analysis/${symbol}/recommendation`),
};

export default api;