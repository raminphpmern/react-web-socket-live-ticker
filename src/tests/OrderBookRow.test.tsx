import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderBookRow } from '../components/OrderBookRow';

describe('OrderBookRow', () => {
  const mockLevel = {
    price: 50000,
    count: 1,
    amount: 1.5,
    total: 1.5,
    percentage: 50
  };

  it('renders bid row correctly', () => {
    render(<OrderBookRow level={mockLevel} side="bid" />);
    expect(screen.getByText('50,000.0')).toHaveClass('order-row__price--bid');
    expect(screen.getByText('1.5000')).toBeInTheDocument();
  });

  it('renders ask row correctly', () => {
    render(<OrderBookRow level={mockLevel} side="ask" />);
    expect(screen.getByText('50,000.0')).toHaveClass('order-row__price--ask');
    expect(screen.getByText('1.5000')).toBeInTheDocument();
  });

  it('shows depth bar with correct percentage', () => {
    const { container } = render(<OrderBookRow level={mockLevel} side="bid" />);
    const depthBar = container.querySelector('.order-row__depth');
    expect(depthBar).toHaveStyle({ width: '50%' });
  });
});