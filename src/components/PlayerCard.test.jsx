import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerCard } from './PlayerCard';

describe('PlayerCard', () => {
  const mockPlayer = {
    name: 'John Doe',
    image: null
  };
  const mockT = (key) => key;

  it('renders player name', () => {
    render(
      <PlayerCard 
        player={mockPlayer} 
        index={0} 
        t={mockT} 
      />
    );
    // There are two inputs for name (mobile and desktop layout probably, or just one)
    // Let's check if we can find the input with the value
    const inputs = screen.getAllByDisplayValue('John Doe');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('calls onNameChange when input changes', () => {
    const onNameChange = vi.fn();
    render(
      <PlayerCard 
        player={mockPlayer} 
        index={0} 
        onNameChange={onNameChange}
        t={mockT} 
      />
    );

    const inputs = screen.getAllByDisplayValue('John Doe');
    fireEvent.change(inputs[0], { target: { value: 'Jane Doe' } });

    expect(onNameChange).toHaveBeenCalledWith(0, 'Jane Doe');
  });

  it('calls onRemove when remove button is clicked', () => {
    const onRemove = vi.fn();
    render(
      <PlayerCard 
        player={mockPlayer} 
        index={0} 
        onRemove={onRemove}
        t={mockT} 
        canRemove={true}
      />
    );

    // Since there are mobile and desktop layouts, there might be multiple buttons.
    // We can click any of them.
    const removeButtons = screen.getAllByText('removePlayer');
    fireEvent.click(removeButtons[0]);

    expect(onRemove).toHaveBeenCalledWith(0);
  });
});
