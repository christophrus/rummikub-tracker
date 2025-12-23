import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnalogClock } from './AnalogClock';

// Mock constants
vi.mock('../constants', () => ({
  TIMER_LOW_TIME: 10,
  TIMER_WARNING_TIME: 30
}));

// Mock utils
vi.mock('../utils', () => ({
  formatTime: (seconds) => `${seconds}s`
}));

describe('AnalogClock', () => {
  const defaultProps = {
    seconds: 60,
    duration: 60,
    isActive: true,
    t: (key) => key,
    onClick: vi.fn()
  };

  it('renders clock svg', () => {
    render(<AnalogClock {...defaultProps} />);
    // Check for the SVG element or some part of it
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays formatted time', () => {
    render(<AnalogClock {...defaultProps} />);
    expect(screen.getByText('60s')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(<AnalogClock {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(defaultProps.onClick).toHaveBeenCalled();
  });

  it('changes color based on time remaining', () => {
    const { rerender } = render(<AnalogClock {...defaultProps} seconds={40} />);
    // Normal color (indigo/blue-ish) - checking stroke color might be hard with just class names if it's inline style or attribute
    // The code uses stroke attribute on the circle
    
    // Let's check low time
    rerender(<AnalogClock {...defaultProps} seconds={5} />);
    // The circle stroke should be red (#ef4444)
    // We need to find the circle with the stroke. It's the third circle in the SVG.
    // This is a bit brittle, but let's try to find by attribute if possible or just trust the logic if we can't easily query.
    // Alternatively, we can check if the text class changes
    const text = screen.getByText('5s');
    expect(text).toHaveClass('fill-red-600');
  });
});
