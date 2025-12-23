import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActiveGameView } from './ActiveGameView';

// Mock child components
vi.mock('../index', () => ({
  AnalogClock: () => <div data-testid="analog-clock">Clock</div>,
  Confetti: () => <div data-testid="confetti">Confetti</div>,
  PlayerAvatar: ({ player }) => <div>{player.name}</div>
}));

describe('ActiveGameView', () => {
  const mockT = (key) => key;
  const defaultProps = {
    activeGame: {
      name: 'Test Game',
      players: [{ name: 'Player 1' }, { name: 'Player 2' }],
      rounds: [],
      maxExtensions: 3
    },
    currentPlayerIndex: 0,
    timerSeconds: 60,
    timerDuration: 60,
    timerActive: true,
    currentRound: 1,
    gameElapsedTime: 100,
    roundScores: {},
    playerExtensions: {},
    draggedGamePlayerIndex: null,
    declaredWinner: null,
    onClose: vi.fn(),
    onNextPlayer: vi.fn(),
    onPause: vi.fn(),
    onResume: vi.fn(),
    onResetTimer: vi.fn(),
    onExtendTimer: vi.fn(),
    onUpdateTimerDuration: vi.fn(),
    onUpdateRoundScore: vi.fn(),
    onUpdatePastScore: vi.fn(),
    onSaveRound: vi.fn(),
    onEndGame: vi.fn(),
    onDeclareWinner: vi.fn(),
    onCancelWinner: vi.fn(),
    onMovePlayerUp: vi.fn(),
    onMovePlayerDown: vi.fn(),
    onDragStart: vi.fn(),
    onDragOver: vi.fn(),
    onDrop: vi.fn(),
    t: mockT
  };

  it('renders active game view', () => {
    render(<ActiveGameView {...defaultProps} />);
    expect(screen.getByTestId('analog-clock')).toBeInTheDocument();
    expect(screen.getAllByText('Player 1')[0]).toBeInTheDocument();
  });

  it('shows winner declaration when declaredWinner is present', () => {
    render(<ActiveGameView {...defaultProps} declaredWinner={{ name: 'Player 1' }} />);
    expect(screen.getByTestId('confetti')).toBeInTheDocument();
  });

  it('calls onNextPlayer when next button is clicked', () => {
    render(<ActiveGameView {...defaultProps} />);
    const nextButton = screen.getByTitle('nextPlayer');
    fireEvent.click(nextButton);
    expect(defaultProps.onNextPlayer).toHaveBeenCalled();
  });

  it('calls onDeclareWinner when trophy button is clicked', () => {
    render(<ActiveGameView {...defaultProps} />);
    const trophyButton = screen.getByTitle('declareWinner');
    fireEvent.click(trophyButton);
    expect(defaultProps.onDeclareWinner).toHaveBeenCalled();
  });
});
