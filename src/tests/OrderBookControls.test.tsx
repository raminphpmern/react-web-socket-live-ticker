import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import orderBookReducer from '../store/orderBookSlice';
import { OrderBookControls } from '../components/OrderBookControls';

const createTestStore = () => {
  return configureStore({
    reducer: {
      orderBook: orderBookReducer
    }
  });
};

describe('OrderBookControls', () => {
  it('renders all control buttons', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <OrderBookControls />
      </Provider>
    );

    expect(screen.getByTitle('Increase Precision')).toBeInTheDocument();
    expect(screen.getByTitle('Decrease Precision')).toBeInTheDocument();
    expect(screen.getByTitle('Zoom In')).toBeInTheDocument();
    expect(screen.getByTitle('Zoom Out')).toBeInTheDocument();
    expect(screen.getByTitle('Toggle Price')).toBeInTheDocument();
  });

  it('handles precision changes correctly', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <OrderBookControls />
      </Provider>
    );

    const increaseButton = screen.getByTitle('Increase Precision');
    const decreaseButton = screen.getByTitle('Decrease Precision');

    // Initially at P0, decrease should be disabled
    expect(decreaseButton).toBeDisabled();
    expect(increaseButton).not.toBeDisabled();

    // Increase precision
    fireEvent.click(increaseButton);
    expect(store.getState().orderBook.precision).toBe('P1');
  });

  it('handles zoom controls correctly', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <OrderBookControls />
      </Provider>
    );

    const zoomInButton = screen.getByTitle('Zoom In');
    const zoomOutButton = screen.getByTitle('Zoom Out');

    fireEvent.click(zoomInButton);
    expect(store.getState().orderBook.zoom).toBeGreaterThan(1);

    fireEvent.click(zoomOutButton);
    expect(store.getState().orderBook.zoom).toBe(1);
  });
});