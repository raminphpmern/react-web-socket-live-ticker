import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import orderBookReducer, { setOrderBook, setConnectionStatus } from '../store/orderBookSlice';
import { OrderBook } from '../components/OrderBook';

const createTestStore = () => {
  return configureStore({
    reducer: {
      orderBook: orderBookReducer
    }
  });
};

describe('OrderBook', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('shows loading state when connecting', () => {
    render(
      <Provider store={store}>
        <OrderBook />
      </Provider>
    );
    expect(screen.getByText('Connecting')).toBeInTheDocument();
  });

  it('shows error state when connection fails', () => {
    store.dispatch(setConnectionStatus('error'));
    
    render(
      <Provider store={store}>
        <OrderBook />
      </Provider>
    );
    expect(screen.getByText('Connection Error')).toBeInTheDocument();
  });

  it('displays order book data when connected', () => {
    store.dispatch(setConnectionStatus('connected'));
    store.dispatch(setOrderBook({
      bids: [
        { price: 50000, count: 1, amount: 1.5 },
        { price: 49900, count: 1, amount: 2.0 }
      ],
      asks: [
        { price: 50100, count: 1, amount: 1.0 },
        { price: 50200, count: 1, amount: 1.8 }
      ]
    }));

    render(
      <Provider store={store}>
        <OrderBook />
      </Provider>
    );

    expect(screen.getByText('50,000.0')).toBeInTheDocument();
    expect(screen.getByText('49,900.0')).toBeInTheDocument();
    expect(screen.getByText('50,100.0')).toBeInTheDocument();
    expect(screen.getByText('50,200.0')).toBeInTheDocument();
  });
});