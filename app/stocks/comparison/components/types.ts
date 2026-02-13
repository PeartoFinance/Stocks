import { Stock } from '../../../types';

export interface ComparisonStock extends Stock {
  color: string;
  historicalData?: any[];
}
