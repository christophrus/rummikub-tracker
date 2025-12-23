import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlayerManagement, useGamePlayerManagement } from './usePlayerManagement';

// Mock utils
vi.mock('../utils', () => ({
  addPlayer: (players, max) => [...players, { name: '' }],
  removePlayer: (players, index) => players.filter((_, i) => i !== index),
  updatePlayer: (players, index, field, value) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    return newPlayers;
  },
  movePlayerUp: (players) => players, // Simplified mock
  movePlayerDown: (players) => players, // Simplified mock
  handleImageUpload: (file, cb) => cb('base64-image'),
  sanitizeGameForStorage: (g) => g,
  reorderPlayers: (players, from, to) => {
    const newPlayers = [...players];
    const [moved] = newPlayers.splice(from, 1);
    newPlayers.splice(to, 0, moved);
    return newPlayers;
  }
}));

describe('usePlayerManagement', () => {
  it('initializes with one empty player', () => {
    const { result } = renderHook(() => usePlayerManagement(6));
    expect(result.current.players).toHaveLength(1);
    expect(result.current.players[0].name).toBe('');
  });

  it('adds a player', () => {
    const { result } = renderHook(() => usePlayerManagement(6));
    
    act(() => {
      result.current.addPlayer();
    });

    expect(result.current.players).toHaveLength(2);
  });

  it('removes a player', () => {
    const { result } = renderHook(() => usePlayerManagement(6));
    
    // Add a player first so we have 2
    act(() => {
      result.current.addPlayer();
    });
    expect(result.current.players).toHaveLength(2);

    act(() => {
      result.current.removePlayer(1);
    });
    expect(result.current.players).toHaveLength(1);
  });

  it('updates a player', () => {
    const { result } = renderHook(() => usePlayerManagement(6));
    
    act(() => {
      result.current.updatePlayer(0, 'name', 'New Name');
    });

    expect(result.current.players[0].name).toBe('New Name');
  });

  it('handles image upload', () => {
    const { result } = renderHook(() => usePlayerManagement(6));
    
    act(() => {
      result.current.handleImageUploadWrapper(0, new File([], 'test.png'));
    });

    expect(result.current.players[0].image).toBe('base64-image');
  });
});

describe('useGamePlayerManagement', () => {
  const defaultProps = {
    activeGame: { 
      players: [{ name: 'P1' }, { name: 'P2' }, { name: 'P3' }],
      currentPlayerIndex: 0
    },
    setActiveGame: vi.fn(),
    currentPlayerIndex: 0,
    setCurrentPlayerIndex: vi.fn()
  };

  it('reorders players in active game', () => {
    const { result } = renderHook(() => useGamePlayerManagement(defaultProps));
    
    act(() => {
      result.current.moveGamePlayerDown(0); // Move P1 down (swap with P2)
    });

    // P1 was at 0, now at 1. P2 at 0.
    // Current player was P1 (index 0). New index for P1 should be 1.
    
    // Check if setActiveGame was called with reordered players
    expect(defaultProps.setActiveGame).toHaveBeenCalled();
    const updatedGame = defaultProps.setActiveGame.mock.calls[0][0];
    expect(updatedGame.players[1].name).toBe('P1');
    expect(defaultProps.setCurrentPlayerIndex).toHaveBeenCalledWith(1);
  });
});
