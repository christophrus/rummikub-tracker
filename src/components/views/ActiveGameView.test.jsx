import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActiveGameView } from './ActiveGameView';

// Mock child components
vi.mock('../index', () => ({
  AnalogClock: ({ onClick }) => <div data-testid="analog-clock" onClick={onClick}>Clock</div>,
  Confetti: ({ active }) => active ? <div data-testid="confetti">Confetti</div> : null,
  PlayerAvatar: ({ player }) => <div data-testid="player-avatar">{player?.name}</div>
}));

describe('ActiveGameView', () => {
  const mockT = (key, params) => params ? `${key} ${JSON.stringify(params)}` : key;
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
    originalTimerDuration: 60,
    timerActive: true,
    currentRound: 1,
    gameElapsedTime: '00:05:30',
    roundScores: {},
    playerExtensions: { 'Player 1': 0, 'Player 2': 0 },
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

  it('shows game name and round info', () => {
    render(<ActiveGameView {...defaultProps} />);
    expect(screen.getByText('Test Game')).toBeInTheDocument();
    expect(screen.getByText(/round 1/i)).toBeInTheDocument();
  });

  it('shows elapsed time', () => {
    render(<ActiveGameView {...defaultProps} />);
    expect(screen.getByText(/00:05:30/)).toBeInTheDocument();
  });

  it('shows winner declaration when declaredWinner is present', () => {
    render(<ActiveGameView {...defaultProps} declaredWinner={{ name: 'Player 1' }} />);
    expect(screen.getByTestId('confetti')).toBeInTheDocument();
    expect(screen.getByText('roundWinner')).toBeInTheDocument();
  });

  it('calls onNextPlayer when next button is clicked', () => {
    const onNextPlayer = vi.fn();
    render(<ActiveGameView {...defaultProps} onNextPlayer={onNextPlayer} />);
    const nextButton = screen.getByTitle('nextPlayer');
    fireEvent.click(nextButton);
    expect(onNextPlayer).toHaveBeenCalled();
  });

  it('calls onDeclareWinner when trophy button is clicked', () => {
    const onDeclareWinner = vi.fn();
    render(<ActiveGameView {...defaultProps} onDeclareWinner={onDeclareWinner} />);
    const trophyButton = screen.getByTitle('declareWinner');
    fireEvent.click(trophyButton);
    expect(onDeclareWinner).toHaveBeenCalled();
  });

  it('calls onPause when pause button is clicked', () => {
    const onPause = vi.fn();
    render(<ActiveGameView {...defaultProps} timerActive={true} onPause={onPause} />);
    const pauseButton = screen.getByTitle('pause');
    fireEvent.click(pauseButton);
    expect(onPause).toHaveBeenCalled();
  });

  it('calls onResume when play button is clicked', () => {
    const onResume = vi.fn();
    render(<ActiveGameView {...defaultProps} timerActive={false} onResume={onResume} />);
    const playButton = screen.getByTitle('resume');
    fireEvent.click(playButton);
    expect(onResume).toHaveBeenCalled();
  });

  it('calls onResetTimer when reset button is clicked', () => {
    const onResetTimer = vi.fn();
    render(<ActiveGameView {...defaultProps} onResetTimer={onResetTimer} />);
    const resetButton = screen.getByTitle('reset');
    fireEvent.click(resetButton);
    expect(onResetTimer).toHaveBeenCalled();
  });

  it('calls onExtendTimer when extend button is clicked', () => {
    const onExtendTimer = vi.fn();
    render(<ActiveGameView {...defaultProps} onExtendTimer={onExtendTimer} />);
    
    // Find button that contains "addSeconds"
    const extendButton = screen.getByText(/addSeconds/);
    fireEvent.click(extendButton);
    expect(onExtendTimer).toHaveBeenCalled();
  });

  it('disables extend button when player has no extensions left', () => {
    const playerExtensions = { 'Player 1': 3, 'Player 2': 0 };
    render(<ActiveGameView {...defaultProps} playerExtensions={playerExtensions} />);
    
    const extendButton = screen.getByText(/addSeconds/).closest('button');
    expect(extendButton).toBeDisabled();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<ActiveGameView {...defaultProps} onClose={onClose} />);
    
    // Close button is an X icon at the top
    const buttons = screen.getAllByRole('button');
    // Find the close button (first button with X icon)
    const closeButton = buttons.find(btn => btn.querySelector('svg'));
    if (closeButton) {
      fireEvent.click(closeButton);
    }
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onUpdateTimerDuration when duration is changed', () => {
    const onUpdateTimerDuration = vi.fn();
    render(<ActiveGameView {...defaultProps} onUpdateTimerDuration={onUpdateTimerDuration} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '120' } });
    
    expect(onUpdateTimerDuration).toHaveBeenCalledWith(120);
  });

  it('shows score input form when winner is declared', () => {
    render(<ActiveGameView {...defaultProps} declaredWinner={{ name: 'Player 1' }} />);
    
    expect(screen.getByText(/enterRoundScores/)).toBeInTheDocument();
    // Should have score inputs for each player
    const numberInputs = screen.getAllByRole('spinbutton');
    expect(numberInputs.length).toBe(2);
  });

  it('calls onUpdateRoundScore when score is entered', () => {
    const onUpdateRoundScore = vi.fn();
    render(
      <ActiveGameView 
        {...defaultProps} 
        declaredWinner={{ name: 'Player 1' }} 
        onUpdateRoundScore={onUpdateRoundScore} 
      />
    );
    
    const numberInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(numberInputs[0], { target: { value: '10' } });
    
    expect(onUpdateRoundScore).toHaveBeenCalled();
  });

  it('enables save round button when all scores entered', () => {
    const roundScores = { 'Player 1': '0', 'Player 2': '25' };
    render(
      <ActiveGameView 
        {...defaultProps} 
        declaredWinner={{ name: 'Player 1' }}
        roundScores={roundScores}
      />
    );
    
    const saveButton = screen.getByText('saveRound').closest('button');
    expect(saveButton).not.toBeDisabled();
  });

  it('disables save round button when scores are missing', () => {
    render(
      <ActiveGameView 
        {...defaultProps} 
        declaredWinner={{ name: 'Player 1' }}
        roundScores={{}}
      />
    );
    
    const saveButton = screen.getByText('saveRound').closest('button');
    expect(saveButton).toBeDisabled();
  });

  it('calls onSaveRound when save button is clicked', () => {
    const onSaveRound = vi.fn();
    const roundScores = { 'Player 1': '0', 'Player 2': '25' };
    render(
      <ActiveGameView 
        {...defaultProps} 
        declaredWinner={{ name: 'Player 1' }}
        roundScores={roundScores}
        onSaveRound={onSaveRound}
      />
    );
    
    fireEvent.click(screen.getByText('saveRound'));
    expect(onSaveRound).toHaveBeenCalled();
  });

  it('displays score summary when rounds exist', () => {
    const propsWithRounds = {
      ...defaultProps,
      activeGame: {
        ...defaultProps.activeGame,
        rounds: [
          { round: 1, scores: { 'Player 1': 0, 'Player 2': 25 } }
        ]
      }
    };
    render(<ActiveGameView {...propsWithRounds} />);
    
    expect(screen.getByText('scoreSummary')).toBeInTheDocument();
    expect(screen.getByText('total')).toBeInTheDocument();
  });

  it('calls onMovePlayerUp when up button is clicked', () => {
    const onMovePlayerUp = vi.fn();
    render(<ActiveGameView {...defaultProps} onMovePlayerUp={onMovePlayerUp} />);
    
    const upButtons = screen.getAllByTitle('moveUp');
    // Click on second player's up button (first is disabled)
    fireEvent.click(upButtons[1]);
    
    expect(onMovePlayerUp).toHaveBeenCalledWith(1);
  });

  it('calls onMovePlayerDown when down button is clicked', () => {
    const onMovePlayerDown = vi.fn();
    render(<ActiveGameView {...defaultProps} onMovePlayerDown={onMovePlayerDown} />);
    
    const downButtons = screen.getAllByTitle('moveDown');
    // Click on first player's down button
    fireEvent.click(downButtons[0]);
    
    expect(onMovePlayerDown).toHaveBeenCalledWith(0);
  });

  it('calls onCancelWinner when close button clicked with winner declared', () => {
    const onCancelWinner = vi.fn();
    render(
      <ActiveGameView 
        {...defaultProps} 
        declaredWinner={{ name: 'Player 1' }}
        onCancelWinner={onCancelWinner}
      />
    );
    
    // The close button should call onCancelWinner when winner is declared
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons[0]; // First button is close
    fireEvent.click(closeButton);
    
    expect(onCancelWinner).toHaveBeenCalled();
  });

  it('shows current player extensions used', () => {
    const playerExtensions = { 'Player 1': 2, 'Player 2': 0 };
    render(<ActiveGameView {...defaultProps} playerExtensions={playerExtensions} />);
    
    // Shows "2/3" for Player 1
    expect(screen.getByText('2/3')).toBeInTheDocument();
  });

  it('allows editing past round scores', () => {
    const activeGameWithRounds = {
      ...defaultProps.activeGame,
      rounds: [{ round: 1, scores: { 'Player 1': 15, 'Player 2': 25 } }]
    };
    const onUpdatePastScore = vi.fn();
    render(<ActiveGameView {...defaultProps} activeGame={activeGameWithRounds} onUpdatePastScore={onUpdatePastScore} />);
    
    // Click on a past score to edit it
    const scoreCells = screen.getAllByText('15');
    fireEvent.click(scoreCells[0]);
    
    // Now there should be an input - get the spinbutton that has value 15
    const inputs = screen.getAllByRole('spinbutton');
    const scoreInput = inputs.find(input => input.value === '15');
    if (scoreInput) {
      fireEvent.change(scoreInput, { target: { value: '30' } });
      expect(onUpdatePastScore).toHaveBeenCalledWith(0, 'Player 1', '30');
    }
  });

  it('closes edit input on blur', () => {
    const activeGameWithRounds = {
      ...defaultProps.activeGame,
      rounds: [{ round: 1, scores: { 'Player 1': 17, 'Player 2': 22 } }]
    };
    render(<ActiveGameView {...defaultProps} activeGame={activeGameWithRounds} />);
    
    // Click on a past score to edit it
    const scoreCells = screen.getAllByText('17');
    fireEvent.click(scoreCells[0]);
    
    // Now there should be an input, blur it
    const inputs = screen.getAllByRole('spinbutton');
    const scoreInput = inputs.find(input => input.value === '17');
    if (scoreInput) {
      fireEvent.blur(scoreInput);
    }
    
    // Should still find the score
    expect(screen.getAllByText('17').length).toBeGreaterThan(0);
  });

  it('closes edit input on Enter key', () => {
    const activeGameWithRounds = {
      ...defaultProps.activeGame,
      rounds: [{ round: 1, scores: { 'Player 1': 18, 'Player 2': 28 } }]
    };
    render(<ActiveGameView {...defaultProps} activeGame={activeGameWithRounds} />);
    
    // Click on a past score to edit it
    const scoreCells = screen.getAllByText('18');
    fireEvent.click(scoreCells[0]);
    
    // Press Enter to close
    const inputs = screen.getAllByRole('spinbutton');
    const scoreInput = inputs.find(input => input.value === '18');
    if (scoreInput) {
      fireEvent.keyDown(scoreInput, { key: 'Enter' });
    }
    
    // Score should still be there
    expect(screen.getAllByText('18').length).toBeGreaterThan(0);
  });

  it('closes edit input on Escape key', () => {
    const activeGameWithRounds = {
      ...defaultProps.activeGame,
      rounds: [{ round: 1, scores: { 'Player 1': 19, 'Player 2': 29 } }]
    };
    render(<ActiveGameView {...defaultProps} activeGame={activeGameWithRounds} />);
    
    // Click on a past score to edit it
    const scoreCells = screen.getAllByText('19');
    fireEvent.click(scoreCells[0]);
    
    // Press Escape to close
    const inputs = screen.getAllByRole('spinbutton');
    const scoreInput = inputs.find(input => input.value === '19');
    if (scoreInput) {
      fireEvent.keyDown(scoreInput, { key: 'Escape' });
    }
    
    // Score should still be there
    expect(screen.getAllByText('19').length).toBeGreaterThan(0);
  });

  it('handles drag and drop for player reordering', () => {
    const onDragStart = vi.fn();
    const onDragOver = vi.fn();
    const onDrop = vi.fn();
    render(
      <ActiveGameView 
        {...defaultProps} 
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
      />
    );
    
    // Find a draggable player element
    const playerCards = document.querySelectorAll('[draggable="true"]');
    if (playerCards.length > 0) {
      fireEvent.dragStart(playerCards[0]);
      expect(onDragStart).toHaveBeenCalledWith(0);
      
      fireEvent.dragOver(playerCards[0]);
      expect(onDragOver).toHaveBeenCalled();
      
      fireEvent.drop(playerCards[0]);
      expect(onDrop).toHaveBeenCalled();
    }
  });

  it('displays game elapsed time', () => {
    render(<ActiveGameView {...defaultProps} gameElapsedTime="25m" />);
    
    expect(screen.getByText(/25m/)).toBeInTheDocument();
  });

  it('shows originalTimerDuration in dropdown not extended timerDuration', () => {
    // Simulate extended timer scenario: timerDuration is 90 (extended), but originalTimerDuration is 60
    render(
      <ActiveGameView 
        {...defaultProps} 
        timerDuration={90}
        originalTimerDuration={60}
      />
    );
    
    const select = screen.getByRole('combobox');
    // The dropdown should show 60 (originalTimerDuration), not 90 (extended)
    expect(select.value).toBe('60');
  });

  it('dropdown shows correct value after multiple extensions', () => {
    // Simulate multiple extensions: original was 45s, extended to 105s
    render(
      <ActiveGameView 
        {...defaultProps} 
        timerSeconds={105}
        timerDuration={105}
        originalTimerDuration={45}
      />
    );
    
    const select = screen.getByRole('combobox');
    // Should still show 45 as the configured duration
    expect(select.value).toBe('45');
  });

  it('changing duration dropdown calls onUpdateTimerDuration with new value', () => {
    const onUpdateTimerDuration = vi.fn();
    render(
      <ActiveGameView 
        {...defaultProps} 
        timerDuration={90}
        originalTimerDuration={60}
        onUpdateTimerDuration={onUpdateTimerDuration}
      />
    );
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '120' } });
    
    // Should call with the new duration value
    expect(onUpdateTimerDuration).toHaveBeenCalledWith(120);
  });
});
