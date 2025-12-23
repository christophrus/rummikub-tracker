import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerAvatar, QuickAddPlayerButton } from './PlayerAvatar';

describe('PlayerAvatar', () => {
  it('renders initials when no image provided', () => {
    const player = { name: 'John Doe', image: null };
    render(<PlayerAvatar player={player} />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders question mark when name is missing', () => {
    const player = { name: '', image: null };
    render(<PlayerAvatar player={player} />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('renders image when provided', () => {
    const player = { name: 'John Doe', image: 'base64-image-string' };
    render(<PlayerAvatar player={player} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'base64-image-string');
    expect(img).toHaveAttribute('alt', 'John Doe');
  });

  it('applies size classes correctly', () => {
    const player = { name: 'John Doe' };
    const { container } = render(<PlayerAvatar player={player} size="lg" />);
    // The container's first child should have the size class
    expect(container.firstChild).toHaveClass('w-10 h-10');
  });
});

describe('QuickAddPlayerButton', () => {
  it('renders player name and avatar', () => {
    const player = { name: 'Jane Doe' };
    render(<QuickAddPlayerButton player={player} onClick={() => {}} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const player = { name: 'Jane Doe' };
    const handleClick = vi.fn();
    render(<QuickAddPlayerButton player={player} onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
