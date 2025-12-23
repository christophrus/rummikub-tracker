import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';

// Mock useTheme hook
const mockToggleTheme = vi.fn();
vi.mock('../hooks', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: mockToggleTheme
  })
}));

describe('ThemeToggle', () => {
  const mockT = (key) => key;

  it('renders toggle button', () => {
    render(<ThemeToggle t={mockT} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls toggleTheme when clicked', () => {
    render(<ThemeToggle t={mockT} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockToggleTheme).toHaveBeenCalled();
  });

  it('shows correct icon/label for light theme', () => {
    render(<ThemeToggle t={mockT} />);
    expect(screen.getByTitle('switchToDarkMode')).toBeInTheDocument();
  });
});
