import React, { useEffect, useState } from 'react';
import { OrderBookLevel } from '../types/orderbook';
import clsx from 'clsx';

interface OrderBookRowProps {
  level: OrderBookLevel;
  side: 'bid' | 'ask';
}

export const OrderBookRow: React.FC<OrderBookRowProps> = ({ level, side }) => {
  const { price, amount, total, percentage, isChanged } = level;
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    if (isChanged) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isChanged]);

  return (
    <div className="order-row">
      <div
        className={clsx('order-row__depth', {
          'order-row__depth--bid': side === 'bid',
          'order-row__depth--ask': side === 'ask'
        })}
        style={{ width: `${percentage}%` }}
      />
      <div
        className={clsx('order-row__price', {
          'order-row__price--bid': side === 'bid',
          'order-row__price--ask': side === 'ask',
          'highlight': highlight
        })}
      >
        {price.toLocaleString('en-US', { minimumFractionDigits: 1 })}
      </div>
      <div className="order-row__amount">
        {amount.toLocaleString('en-US', { minimumFractionDigits: 4 })}
      </div>
      <div className="order-row__total">
        {total.toLocaleString('en-US', { minimumFractionDigits: 4 })}
      </div>
    </div>
  );
};