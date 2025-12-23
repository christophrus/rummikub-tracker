import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NewGameView } from './NewGameView';

// Mock child components to simplify testing
vi.mock('../PlayerCard', () => ({
  PlayerCard: ({ player, onNameChange }) => (
    <div data-testid="player-card">
      <input 
        value={player.name} 
        onChange={(e) => onNameChange(0, e.target.value)}
        placeholder="Player Name"
      />
    </div>
  )
}));

vi.mock('../PlayerAvatar', () => ({
  QuickAddPlayerButton: ({ player, onClick }) => (
    <button onClick={onClick}>{player.name}</button>
  )
}));

describe('NewGameView', () => {
  const mockT = (key) => key;
  const defaultProps = {
    players: [{ name: 'Player 1' }],
    gameName: '',
    timerDuration: 60,
    maxExtensions: 3,
    savedPlayers: [],
    onClose: vi.fn(),
    onGameNameChange: vi.fn(),
    onTimerDurationChange: vi.fn(),
    onMaxExtensionsChange: vi.fn(),
    onAddPlayer: vi.fn(),
    onRemovePlayer: vi.fn(),
    onUpdatePlayer: vi.fn(),
    onImageUpload: vi.fn(),
    onMovePlayerUp: vi.fn(),
    onMovePlayerDown: vi.fn(),
    onDragStart: vi.fn(),
    onDragOver: vi.fn(),
    onDrop: vi.fn(),
    onAddSavedPlayer: vi.fn(),
    onStartGame: vi.fn(),
    draggedPlayerIndex: null,
    t: mockT
  };

  it('renders new game form', () => {
    render(<NewGameView {...defaultProps} />);
    expect(screen.getByText('newGame')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('gameNamePlaceholder')).toBeInTheDocument();
  });

  it('calls onGameNameChange when input changes', () => {
    render(<NewGameView {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText('gameNamePlaceholder'), { target: { value: 'My Game' } });
    expect(defaultProps.onGameNameChange).toHaveBeenCalledWith('My Game');
  });

  it('calls onStartGame when start button is clicked', () => {
    render(<NewGameView {...defaultProps} />);
    const startButton = screen.getByText('startGame');
    fireEvent.click(startButton);
    expect(defaultProps.onStartGame).toHaveBeenCalled();
  });

  it('renders player cards', () => {
    render(<NewGameView {...defaultProps} />);
    expect(screen.getAllByTestId('player-card')).toHaveLength(1);
  });
});
