import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { OrderBookRow } from './OrderBookRow';
import { OrderBookControls } from './OrderBookControls';
import { OrderBookLevel } from '../types/orderbook';
import { AlertCircle, Loader2 } from 'lucide-react';
import { RootState } from '../store/store';
import { useOrderBook } from '../hooks/useOrderBook';
import '../styles/OrderBook.scss';

export const OrderBook: React.FC = () => {
  const { orderBook, connectionStatus } = useOrderBook();
  const { zoom, displayRows } = useSelector((state: RootState) => state.orderBook);

  const processedLevels = useMemo(() => {
    const bids: OrderBookLevel[] = [];
    const asks: OrderBookLevel[] = [];
    
    let bidTotal = 0;
    let askTotal = 0;
    const maxTotal = Math.max(
      orderBook.bids.reduce((acc, bid) => acc + bid.amount, 0),
      orderBook.asks.reduce((acc, ask) => acc + ask.amount, 0)
    );

    orderBook.bids.forEach((bid) => {
      bidTotal += bid.amount;
      bids.push({
        ...bid,
        total: bidTotal,
        percentage: (bidTotal / maxTotal) * 100 * zoom
      });
    });

    orderBook.asks.forEach((ask) => {
      askTotal += ask.amount;
      asks.push({
        ...ask,
        total: askTotal,
        percentage: (askTotal / maxTotal) * 100 * zoom
      });
    });

    return { 
      bids: bids.slice(0, displayRows), 
      asks: asks.slice(0, displayRows) 
    };
  }, [orderBook, zoom, displayRows]);

  if (connectionStatus === 'error') {
    return (
      <div className="order-book order-book--error">
        <div className="flex flex-col items-center justify-center space-y-4 p-8">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-semibold">Connection Error</h2>
          <p className="text-gray-400 text-center">
            Unable to connect to the order book. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (connectionStatus === 'connecting') {
    return (
      <div className="order-book order-book--loading">
        <div className="flex flex-col items-center justify-center space-y-4 p-8">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <h2 className="text-xl font-semibold">Connecting</h2>
          <p className="text-gray-400">Establishing connection to order book...</p>
        </div>
      </div>
    );
  }

  const spread = orderBook.asks[0]?.price - orderBook.bids[0]?.price;
  const spreadPercentage = ((spread / orderBook.bids[0]?.price) * 100) || 0;

  return (
    <div className="order-book">
      <div className="order-book__header">
        <h2 className="order-book__title">Order Book</h2>
        <OrderBookControls />
      </div>

      <div className="order-book__table-header">
        <div>PRICE</div>
        <div>AMOUNT</div>
        <div>TOTAL</div>
      </div>

      <div className="order-book__content">
        <div className="order-book__rows">
          {processedLevels.asks.slice().reverse().map((level) => (
            <OrderBookRow
              key={level.price}
              level={level}
              side="ask"
            />
          ))}
        </div>

        <div className="order-book__spread">
          <span>Spread: {spread.toFixed(1)} ({spreadPercentage.toFixed(2)}%)</span>
        </div>

        <div className="order-book__rows">
          {processedLevels.bids.map((level) => (
            <OrderBookRow
              key={level.price}
              level={level}
              side="bid"
            />
          ))}
        </div>
      </div>
    </div>
  );
};