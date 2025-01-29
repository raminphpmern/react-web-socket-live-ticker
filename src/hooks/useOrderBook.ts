import { useEffect, useRef, useState, useCallback } from 'react';
import type { OrderBook, OrderBookEntry, PrecisionLevel } from '../types/orderbook';
import { debounce } from '../utils/debounce';

const TRADING_PAIR = 'tBTCUSD';
const WS_URL = 'wss://api-pub.bitfinex.com/ws/2';
const LOCAL_STORAGE_KEY = 'orderbook_data';

export const useOrderBook = () => {
  const [orderBook, setOrderBook] = useState<OrderBook>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : { bids: [], asks: [] };
  });
  const [precision, setPrecision] = useState<PrecisionLevel>('P0');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const channelId = useRef<number | null>(null);
  const MAX_RECONNECT_ATTEMPTS = 3;

  // Debounced local storage update
  const updateLocalStorage = useCallback(
    debounce((data: OrderBook) => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    }, 1000),
    []
  );

  const connect = useCallback(() => {
    try {
      setConnectionStatus('connecting');
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
        subscribe();
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.event === 'subscribed' && data.channel === 'book') {
          channelId.current = data.chanId;
          return;
        }
        
        if (Array.isArray(data)) {
          const [chanId, payload] = data;
          if (chanId !== channelId.current) return;
          
          if (Array.isArray(payload)) {
            if (Array.isArray(payload[0])) {
              // Snapshot
              const entries = payload.map((entry) => ({
                price: entry[0],
                count: entry[1],
                amount: entry[2]
              }));
              
              const newBook = {
                bids: entries.filter((entry) => entry.amount > 0),
                asks: entries.filter((entry) => entry.amount < 0).map(entry => ({
                  ...entry,
                  amount: Math.abs(entry.amount)
                }))
              };
              
              setOrderBook(newBook);
              updateLocalStorage(newBook);
            } else {
              // Update
              const [price, count, amount] = payload;
              
              setOrderBook((prev) => {
                const newBook = { ...prev };
                const entry: OrderBookEntry = { price, count, amount: Math.abs(amount) };
                
                if (count === 0) {
                  if (amount > 0) {
                    newBook.bids = prev.bids.filter((bid) => bid.price !== price);
                  } else {
                    newBook.asks = prev.asks.filter((ask) => ask.price !== price);
                  }
                } else if (amount > 0) {
                  const index = prev.bids.findIndex((bid) => bid.price === price);
                  if (index === -1) {
                    newBook.bids = [...prev.bids, entry].sort((a, b) => b.price - a.price);
                  } else {
                    newBook.bids = [...prev.bids];
                    newBook.bids[index] = { ...entry, isChanged: true };
                  }
                } else {
                  const index = prev.asks.findIndex((ask) => ask.price === price);
                  if (index === -1) {
                    newBook.asks = [...prev.asks, entry].sort((a, b) => a.price - b.price);
                  } else {
                    newBook.asks = [...prev.asks];
                    newBook.asks[index] = { ...entry, isChanged: true };
                  }
                }
                
                updateLocalStorage(newBook);
                return newBook;
              });
            }
          }
        }
      };

      ws.current.onerror = () => {
        setConnectionStatus('error');
        ws.current?.close();
      };

      ws.current.onclose = () => {
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current += 1;
          setTimeout(connect, 1000 * Math.pow(2, reconnectAttempts.current));
        } else {
          setConnectionStatus('error');
        }
      };
    } catch (error) {
      setConnectionStatus('error');
      console.error('WebSocket connection error:', error);
    }
  }, [updateLocalStorage]);

  const subscribe = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const msg = JSON.stringify({
        event: 'subscribe',
        channel: 'book',
        symbol: TRADING_PAIR,
        prec: precision,
        freq: 'F0',
        len: '100'
      });
      ws.current.send(msg);
    }
  }, [precision]);

  const unsubscribe = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN && channelId.current) {
      const msg = JSON.stringify({
        event: 'unsubscribe',
        chanId: channelId.current
      });
      ws.current.send(msg);
      channelId.current = null;
    }
  }, []);

  const changePrecision = useCallback((newPrecision: PrecisionLevel) => {
    unsubscribe();
    setPrecision(newPrecision);
  }, [unsubscribe]);

  useEffect(() => {
    connect();
    return () => {
      unsubscribe();
      ws.current?.close();
    };
  }, [connect, unsubscribe]);

  useEffect(() => {
    if (connectionStatus === 'connected') {
      subscribe();
    }
  }, [precision, subscribe, connectionStatus]);

  return { 
    orderBook, 
    connectionStatus,
    precision,
    changePrecision
  };
};