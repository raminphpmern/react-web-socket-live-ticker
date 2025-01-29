import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { OrderBook, OrderBookEntry, PrecisionLevel } from '../types/orderbook';

interface OrderBookState {
  data: OrderBook;
  precision: PrecisionLevel;
  connectionStatus: 'connecting' | 'connected' | 'error';
  zoom: number;
  displayRows: number;
}

const initialState: OrderBookState = {
  data: { bids: [], asks: [] },
  precision: 'P0',
  connectionStatus: 'connecting',
  zoom: 1,
  displayRows: 25
};

const orderBookSlice = createSlice({
  name: 'orderBook',
  initialState,
  reducers: {
    setOrderBook: (state, action: PayloadAction<OrderBook>) => {
      state.data = action.payload;
    },
    updateOrderBookEntry: (state, action: PayloadAction<{
      side: 'bids' | 'asks';
      entry: OrderBookEntry & { isChanged?: boolean };
    }>) => {
      const { side, entry } = action.payload;
      const index = state.data[side].findIndex(item => item.price === entry.price);
      
      if (index !== -1) {
        state.data[side][index] = entry;
      } else {
        state.data[side].push(entry);
        state.data[side].sort((a, b) => 
          side === 'bids' ? b.price - a.price : a.price - b.price
        );
      }
    },
    removeOrderBookEntry: (state, action: PayloadAction<{
      side: 'bids' | 'asks';
      price: number;
    }>) => {
      const { side, price } = action.payload;
      state.data[side] = state.data[side].filter(item => item.price !== price);
    },
    setPrecision: (state, action: PayloadAction<PrecisionLevel>) => {
      state.precision = action.payload;
    },
    setConnectionStatus: (state, action: PayloadAction<'connecting' | 'connected' | 'error'>) => {
      state.connectionStatus = action.payload;
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = Math.max(0.25, Math.min(4, action.payload));
    },
    setDisplayRows: (state, action: PayloadAction<number>) => {
      state.displayRows = action.payload;
    }
  }
});

export const {
  setOrderBook,
  updateOrderBookEntry,
  removeOrderBookEntry,
  setPrecision,
  setConnectionStatus,
  setZoom,
  setDisplayRows
} = orderBookSlice.actions;

export default orderBookSlice.reducer;