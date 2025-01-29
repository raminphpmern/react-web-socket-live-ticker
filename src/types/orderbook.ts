export interface OrderBookEntry {
  price: number;
  count: number;
  amount: number;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export interface OrderBookLevel {
  price: number;
  count: number;
  amount: number;
  total: number;
  percentage: number;
  isChanged?: boolean;
}

export type PrecisionLevel = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
export type DisplayRows = 25 | 50 | 100;