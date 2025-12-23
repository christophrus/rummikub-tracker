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
});
