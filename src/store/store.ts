import { configureStore } from '@reduxjs/toolkit';
import orderBookReducer from './orderBookSlice';

export const store = configureStore({
  reducer: {
    orderBook: orderBookReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;