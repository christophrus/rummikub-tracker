import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameFlow } from './useGameFlow';

// Mock utils
vi.mock('../utils', () => ({
  validateMinPlayers: (players) => players.length >= 2 ? players : null
}));

describe('useGameFlow', () => {
  const defaultProps = {
    activeGame: null,
    currentPlayerIndex: 0,
    setCurrentPlayerIndex: vi.fn(),
    setPlayerExtensions: vi.fn(),
    roundScores: {},
    updateRoundScore: vi.fn(),
    saveRound: vi.fn(),
    startNewGame: vi.fn(() => ({ playerExtensions: {}, timerDuration: 60 })),
    playTurnNotification: vi.fn(),
    speakPlayerName: vi.fn(),
    playVictorySound: vi.fn(),
    setTimerActive: vi.fn(),
    setTimerSeconds: vi.fn(),
    timerDuration: 60
  };

  it('validates and prepares pending game', () => {
    const { result } = renderHook(() => useGameFlow(defaultProps));
    
    let response;
    act(() => {
      response = result.current.handleStartGame(
        [{ name: 'P1' }, { name: 'P2' }],
        'Game 1',
        60,
        3,
        'en-US',
        2
      );
    });

    expect(response.success).toBe(true);
    expect(response.showPlayerSelection).toBe(true);
    expect(result.current.pendingGame).not.toBeNull();
  });

  it('returns error if not enough players', () => {
    const { result } = renderHook(() => useGameFlow(defaultProps));
    
    let response;
    act(() => {
      response = result.current.handleStartGame(
        [{ name: 'P1' }],
        'Game 1',
        60,
        3,
        'en-US',
        2
      );
    });

    expect(response.error).toBe('minPlayersAlert');
  });

  it('starts game when starting player is selected', () => {
    const { result } = renderHook(() => useGameFlow(defaultProps));
    
    // Setup pending game first
    act(() => {
      result.current.handleStartGame(
        [{ name: 'P1' }, { name: 'P2' }],
        'Game 1',
        60,
        3,
        'en-US',
        2
      );
    });

    act(() => {
      result.current.handlePlayerSelected(1);
    });

    expect(defaultProps.startNewGame).toHaveBeenCalled();
    expect(defaultProps.setCurrentPlayerIndex).toHaveBeenCalledWith(1);
    expect(result.current.pendingGame).toBeNull();
  });

  it('declares winner', () => {
    const props = {
      ...defaultProps,
      activeGame: { players: [{ name: 'P1' }, { name: 'P2' }] },
      currentPlayerIndex: 0
    };
    const { result } = renderHook(() => useGameFlow(props));
    
    act(() => {
      result.current.handleDeclareWinner();
    });

    expect(props.setTimerActive).toHaveBeenCalledWith(false);
    expect(props.updateRoundScore).toHaveBeenCalledWith({ name: 'P1' }, '0');
    expect(props.playVictorySound).toHaveBeenCalled();
    expect(result.current.declaredWinner).toEqual({ name: 'P1' });
  });

  it('cancels winner declaration', () => {
    const { result } = renderHook(() => useGameFlow(defaultProps));
    
    act(() => {
      result.current.handleCancelWinner();
    });

    expect(result.current.declaredWinner).toBeNull();
    expect(defaultProps.setTimerActive).toHaveBeenCalledWith(true);
  });

  it('saves round scores', () => {
    const props = {
      ...defaultProps,
      activeGame: { players: [{ name: 'P1' }, { name: 'P2' }] },
      roundScores: { 'P1': '0', 'P2': '10' },
      startingPlayerIndex: 0
    };
    const { result } = renderHook(() => useGameFlow(props));
    
    let response;
    act(() => {
      response = result.current.handleSaveRound(vi.fn(), 'en-US');
    });

    expect(response.success).toBe(true);
    expect(props.saveRound).toHaveBeenCalled();
    expect(props.setCurrentPlayerIndex).toHaveBeenCalled();
  });

  it('validates round scores before saving', () => {
    const props = {
      ...defaultProps,
      activeGame: { players: [{ name: 'P1' }, { name: 'P2' }] },
      roundScores: { 'P1': '0' } // Missing P2 score
    };
    const { result } = renderHook(() => useGameFlow(props));
    
    let response;
    act(() => {
      response = result.current.handleSaveRound(vi.fn(), 'en-US');
    });

    expect(response.error).toBe('enterAllScoresAlert');
  });

  it('returns error when multiple players have zero scores', () => {
    const props = {
      ...defaultProps,
      activeGame: { players: [{ name: 'P1' }, { name: 'P2' }] },
      roundScores: { 'P1': '0', 'P2': '0' }
    };
    const { result } = renderHook(() => useGameFlow(props));
    
    let response;
    act(() => {
      response = result.current.handleSaveRound(vi.fn(), 'en-US');
    });

    expect(response.error).toBe('multipleZeroScoresAlert');
  });

  it('returns error when handlePlayerSelected is called without pending game', () => {
    const { result } = renderHook(() => useGameFlow(defaultProps));
    
    let response;
    act(() => {
      response = result.current.handlePlayerSelected(0);
    });

    expect(response.error).toBe('noPendingGame');
  });

  it('handles quota exceeded error when starting game', () => {
    const props = {
      ...defaultProps,
      startNewGame: vi.fn(() => {
        const error = new Error('quota exceeded');
        error.name = 'QuotaExceededError';
        throw error;
      })
    };
    const { result } = renderHook(() => useGameFlow(props));
    
    // Setup pending game first
    act(() => {
      result.current.handleStartGame(
        [{ name: 'P1' }, { name: 'P2' }],
        'Game 1',
        60,
        3,
        'en-US',
        2
      );
    });

    let response;
    act(() => {
      response = result.current.handlePlayerSelected(0);
    });

    expect(response.error).toBe('quotaExceeded');
  });

  it('handles generic error when starting game', () => {
    const props = {
      ...defaultProps,
      startNewGame: vi.fn(() => {
        throw new Error('some other error');
      })
    };
    const { result } = renderHook(() => useGameFlow(props));
    
    // Setup pending game first
    act(() => {
      result.current.handleStartGame(
        [{ name: 'P1' }, { name: 'P2' }],
        'Game 1',
        60,
        3,
        'en-US',
        2
      );
    });

    let response;
    act(() => {
      response = result.current.handlePlayerSelected(0);
    });

    expect(response.error).toBe('genericError');
  });

  it('does nothing if no active game when declaring winner', () => {
    const props = {
      ...defaultProps,
      setTimerActive: vi.fn(),
      updateRoundScore: vi.fn()
    };
    const { result } = renderHook(() => useGameFlow(props));
    
    act(() => {
      result.current.handleDeclareWinner();
    });

    // Should not call any of the functions (activeGame is null)
    expect(props.setTimerActive).not.toHaveBeenCalled();
    expect(props.updateRoundScore).not.toHaveBeenCalled();
  });

  it('cancels pending game', () => {
    const { result } = renderHook(() => useGameFlow(defaultProps));
    
    // Create pending game
    act(() => {
      result.current.handleStartGame(
        [{ name: 'P1' }, { name: 'P2' }],
        'Game 1',
        60,
        3,
        'en-US',
        2
      );
    });
    
    expect(result.current.pendingGame).not.toBeNull();
    
    // Cancel it
    act(() => {
      result.current.cancelPendingGame();
    });
    
    expect(result.current.pendingGame).toBeNull();
  });
});
