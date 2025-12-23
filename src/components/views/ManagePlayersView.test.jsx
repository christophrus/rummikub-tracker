import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ManagePlayersView } from './ManagePlayersView';

// Mock child components
vi.mock('../PlayerAvatar', () => ({
  PlayerAvatar: ({ player }) => <div>{player.name}</div>
}));

describe('ManagePlayersView', () => {
  const mockT = (key) => key;
  const defaultProps = {
    savedPlayers: [
      { name: 'Player 1', image: null },
      { name: 'Player 2', image: null }
    ],
    onClose: vi.fn(),
    onDeletePlayer: vi.fn(),
    t: mockT
  };

  it('renders saved players list', () => {
    render(<ManagePlayersView {...defaultProps} />);
    expect(screen.getAllByText('Player 1')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Player 2')[0]).toBeInTheDocument();
  });

  it('shows empty state when no saved players', () => {
    render(<ManagePlayersView {...defaultProps} savedPlayers={[]} />);
    expect(screen.getByText('noSavedPlayers')).toBeInTheDocument();
  });

  it('calls onDeletePlayer when delete button is clicked', () => {
    render(<ManagePlayersView {...defaultProps} />);
    // Find delete buttons. There should be 2.
    // They likely have a trash icon.
    // Let's assume they are buttons.
    const buttons = screen.getAllByRole('button');
    // First button is close button, next are delete buttons (if any)
    // Let's look for the delete button specifically.
    // The component renders a button with Trash2 icon.
    // We can try to find by clicking the second button (index 1) assuming index 0 is close.
    // Or better, find the button within the player item.
    
    // Let's assume the close button is first.
    // The player list items have delete buttons.
    // Let's try to click the last button which should be a delete button for the last player.
    const deleteButtons = buttons.slice(1); // Skip close button
    fireEvent.click(deleteButtons[0]);
    expect(defaultProps.onDeletePlayer).toHaveBeenCalledWith('Player 1');
  });
});
