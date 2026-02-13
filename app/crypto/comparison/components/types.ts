export interface ComparisonCrypto {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  rank?: number;
  circulatingSupply?: number;
  totalSupply?: number;
  maxSupply?: number;
  high24h?: number;
  low24h?: number;
  ath?: number;
  atl?: number;
  color: string;
  historicalData?: any[];
}
