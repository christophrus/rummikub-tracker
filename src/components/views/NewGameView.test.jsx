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

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<NewGameView {...defaultProps} onClose={onClose} />);
    
    const closeButton = screen.getByRole('button', { name: '' }); // X icon button
    // Find the X button (it's at the top)
    const buttons = screen.getAllByRole('button');
    // First button is the close button
    fireEvent.click(buttons[0]);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onTimerDurationChange when timer is changed', () => {
    const onTimerDurationChange = vi.fn();
    render(<NewGameView {...defaultProps} onTimerDurationChange={onTimerDurationChange} />);
    
    const selects = screen.getAllByRole('combobox');
    // First select is timer duration
    fireEvent.change(selects[0], { target: { value: '120' } });
    
    expect(onTimerDurationChange).toHaveBeenCalledWith(120);
  });

  it('calls onMaxExtensionsChange when extensions setting changes', () => {
    const onMaxExtensionsChange = vi.fn();
    render(<NewGameView {...defaultProps} onMaxExtensionsChange={onMaxExtensionsChange} />);
    
    const selects = screen.getAllByRole('combobox');
    // Second select is max extensions
    fireEvent.change(selects[1], { target: { value: '5' } });
    
    expect(onMaxExtensionsChange).toHaveBeenCalledWith(5);
  });

  it('shows saved players when available', () => {
    const savedPlayers = [
      { name: 'Saved Player 1' },
      { name: 'Saved Player 2' }
    ];
    render(<NewGameView {...defaultProps} savedPlayers={savedPlayers} />);
    
    expect(screen.getByText('Saved Player 1')).toBeInTheDocument();
    expect(screen.getByText('Saved Player 2')).toBeInTheDocument();
  });

  it('calls onAddSavedPlayer when saved player button is clicked', () => {
    const onAddSavedPlayer = vi.fn();
    const savedPlayers = [{ name: 'Saved Player' }];
    render(<NewGameView {...defaultProps} savedPlayers={savedPlayers} onAddSavedPlayer={onAddSavedPlayer} />);
    
    fireEvent.click(screen.getByText('Saved Player'));
    
    expect(onAddSavedPlayer).toHaveBeenCalledWith({ name: 'Saved Player' });
  });

  it('calls onAddPlayer when add player button is clicked', () => {
    const onAddPlayer = vi.fn();
    render(<NewGameView {...defaultProps} onAddPlayer={onAddPlayer} />);
    
    fireEvent.click(screen.getByText('addPlayer'));
    
    expect(onAddPlayer).toHaveBeenCalled();
  });

  it('displays game name in input', () => {
    render(<NewGameView {...defaultProps} gameName="Test Game" />);
    
    expect(screen.getByDisplayValue('Test Game')).toBeInTheDocument();
  });
});
