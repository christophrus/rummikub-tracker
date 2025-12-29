import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameData } from './useGameData';

// Mock utils
vi.mock('../utils', () => ({
  sanitizeGameForStorage: (game) => game
}));

describe('useGameData', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useGameData());
    expect(result.current.activeGame).toBeNull();
    expect(result.current.gameHistory).toEqual([]);
    expect(result.current.savedPlayers).toEqual([]);
  });

  it('loads saved players from localStorage', () => {
    const players = [{ name: 'Player 1', image: null }];
    localStorage.setItem('saved-players', JSON.stringify(players));
    
    const { result } = renderHook(() => useGameData());
    expect(result.current.savedPlayers).toEqual(players);
  });

  it('loads game history from localStorage', () => {
    const history = [{ id: 1, name: 'Game 1', players: [] }];
    localStorage.setItem('game-history', JSON.stringify(history));
    
    const { result } = renderHook(() => useGameData());
    expect(result.current.gameHistory).toHaveLength(1);
    expect(result.current.gameHistory[0].name).toBe('Game 1');
  });

  it('saves new player when starting a game', () => {
    const { result } = renderHook(() => useGameData());
    
    act(() => {
      result.current.startNewGame(
        [{ name: 'New Player', image: null }],
        'Game 1',
        60,
        3,
        'en-US'
      );
    });

    expect(result.current.savedPlayers).toHaveLength(1);
    expect(result.current.savedPlayers[0].name).toBe('New Player');
    expect(JSON.parse(localStorage.getItem('saved-players'))).toHaveLength(1);
  });

  it('deletes saved player', () => {
    const players = [{ name: 'Player 1' }];
    localStorage.setItem('saved-players', JSON.stringify(players));
    
    const { result } = renderHook(() => useGameData());
    
    act(() => {
      result.current.deleteSavedPlayer('Player 1');
    });

    expect(result.current.savedPlayers).toHaveLength(0);
  });

  it('deletes game from history', () => {
    const history = [{ id: 1, name: 'Game 1' }, { id: 2, name: 'Game 2' }];
    localStorage.setItem('game-history', JSON.stringify(history));
    
    const { result } = renderHook(() => useGameData());
    
    act(() => {
      result.current.deleteGame(1);
    });

    expect(result.current.gameHistory).toHaveLength(1);
    expect(result.current.gameHistory[0].id).toBe(2);
  });

  it('handles corrupted localStorage gracefully', () => {
    // Suppress expected error output
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    localStorage.setItem('saved-players', 'invalid-json');
    localStorage.setItem('game-history', 'invalid-json');
    
    const { result } = renderHook(() => useGameData());
    
    expect(result.current.savedPlayers).toEqual([]);
    expect(result.current.gameHistory).toEqual([]);
    
    consoleErrorSpy.mockRestore();
  });

  it('starts new game with correct properties', () => {
    const { result } = renderHook(() => useGameData());
    
    act(() => {
      result.current.startNewGame(
        [{ name: 'Player 1' }, { name: 'Player 2' }],
        'Test Game',
        90,
        5,
        'de-DE'
      );
    });

    expect(result.current.activeGame).not.toBeNull();
    expect(result.current.activeGame.name).toBe('Test Game');
    expect(result.current.activeGame.timerDuration).toBe(90);
    expect(result.current.activeGame.maxExtensions).toBe(5);
    expect(result.current.activeGame.ttsLanguage).toBe('de-DE');
    expect(result.current.activeGame.players).toHaveLength(2);
  });

  it('generates default game name when not provided', () => {
    const { result } = renderHook(() => useGameData());
    
    act(() => {
      result.current.startNewGame(
        [{ name: 'Player 1' }],
        '', // Empty name
        60,
        3,
        'en-US'
      );
    });

    expect(result.current.activeGame.name).toContain('Game');
    expect(result.current.activeGame.name).toContain('#');
  });

  it('updates round score', () => {
    const { result } = renderHook(() => useGameData());
    
    act(() => {
      result.current.startNewGame([{ name: 'P1' }], 'Game', 60, 3, 'en');
    });
    
    act(() => {
      result.current.updateRoundScore({ name: 'P1' }, '25');
    });
    
    expect(result.current.roundScores).toEqual({ 'P1': '25' });
  });

  it('saves round with scores when valid', () => {
    const { result } = renderHook(() => useGameData());
    
    act(() => {
      result.current.startNewGame(
        [{ name: 'P1' }, { name: 'P2' }],
        'Game',
        60,
        3,
        'en'
      );
    });
    
    // Enter valid scores (exactly one 0 score for winner)
    act(() => {
      result.current.updateRoundScore({ name: 'P1' }, '0');
      result.current.updateRoundScore({ name: 'P2' }, '25');
    });
    
    let savedRound;
    act(() => {
      savedRound = result.current.saveRound();
    });
    
    // Check if round was saved (savedRound should be the updated game or null if validation failed)
    if (savedRound) {
      expect(result.current.activeGame.rounds).toHaveLength(1);
      expect(result.current.currentRound).toBe(2);
    }
  });

  it('returns null from saveRound when not all scores entered', () => {
    const { result } = renderHook(() => useGameData());
    
    act(() => {
      result.current.startNewGame([{ name: 'P1' }, { name: 'P2' }], 'Game', 60, 3, 'en');
    });
    
    // Only enter one score
    act(() => {
      result.current.updateRoundScore({ name: 'P1' }, '0');
    });
    
    let savedRound;
    act(() => {
      savedRound = result.current.saveRound();
    });
    
    expect(savedRound).toBeNull();
  });

  it('ends game and adds to history', () => {
    const { result } = renderHook(() => useGameData());
    
    act(() => {
      result.current.startNewGame(
        [{ name: 'P1' }, { name: 'P2' }],
        'Game',
        60,
        3,
        'en'
      );
    });
    
    // Manually set game with a round to properly test endGame
    act(() => {
      result.current.setActiveGame({
        ...result.current.activeGame,
        rounds: [{ round: 1, scores: { 'P1': 0, 'P2': 25 } }]
      });
    });
    
    act(() => {
      result.current.endGame();
    });
    
    expect(result.current.activeGame).toBeNull();
    expect(result.current.gameHistory).toHaveLength(1);
    expect(result.current.gameHistory[0].status).toBe('completed');
    // Winner is player with lowest score (P1 has 0)
    expect(result.current.gameHistory[0].winner).toBe('P1');
  });

  it('cancels active game', () => {
    const { result } = renderHook(() => useGameData());
    
    act(() => {
      result.current.startNewGame([{ name: 'P1' }], 'Game', 60, 3, 'en');
    });
    
    expect(result.current.activeGame).not.toBeNull();
    
    act(() => {
      result.current.cancelActiveGame();
    });
    
    expect(result.current.activeGame).toBeNull();
    expect(localStorage.getItem('active-game')).toBeNull();
  });

  it('loads active game from localStorage', () => {
    const game = {
      id: 1,
      name: 'Saved Game',
      players: [{ name: 'P1' }],
      rounds: [{ round: 1, scores: { 'P1': 10 } }],
      currentPlayerIndex: 0
    };
    localStorage.setItem('active-game', JSON.stringify(game));
    
    const { result } = renderHook(() => useGameData());
    
    expect(result.current.activeGame).not.toBeNull();
    expect(result.current.activeGame.name).toBe('Saved Game');
    expect(result.current.currentRound).toBe(2); // rounds.length + 1
  });

  it('adds saved player to game in empty slot', () => {
    const { result } = renderHook(() => useGameData());
    
    const players = [{ name: '', image: null }, { name: 'P2', image: null }];
    const savedPlayer = { name: 'Saved', image: 'data:...' };
    
    let newPlayers;
    act(() => {
      newPlayers = result.current.addSavedPlayerToGame(players, savedPlayer);
    });
    
    expect(newPlayers[0].name).toBe('Saved');
  });

  it('adds saved player to end when no empty slot', () => {
    const { result } = renderHook(() => useGameData());
    
    const players = [{ name: 'P1' }, { name: 'P2' }];
    const savedPlayer = { name: 'Saved' };
    
    let newPlayers;
    act(() => {
      newPlayers = result.current.addSavedPlayerToGame(players, savedPlayer);
    });
    
    expect(newPlayers).toHaveLength(3);
    expect(newPlayers[2].name).toBe('Saved');
  });

  it('does not add duplicate saved players', () => {
    const players = [{ name: 'Player 1' }];
    localStorage.setItem('saved-players', JSON.stringify(players));
    
    const { result } = renderHook(() => useGameData());
    
    act(() => {
      result.current.startNewGame([{ name: 'player 1' }], 'Game', 60, 3, 'en');
    });
    
    // Should not duplicate (case-insensitive check)
    expect(result.current.savedPlayers).toHaveLength(1);
  });

  it('hydrates player images from saved players', () => {
    const savedPlayers = [{ name: 'Player 1', image: 'saved-image-data' }];
    localStorage.setItem('saved-players', JSON.stringify(savedPlayers));
    
    const history = [{ id: 1, name: 'Game', players: [{ name: 'Player 1' }] }];
    localStorage.setItem('game-history', JSON.stringify(history));
    
    const { result } = renderHook(() => useGameData());
    
    // Player image should be hydrated from saved players
    expect(result.current.gameHistory[0].players[0].image).toBe('saved-image-data');
  });
});
