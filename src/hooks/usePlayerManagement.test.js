import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlayerManagement, useGamePlayerManagement } from './usePlayerManagement';

// Mock utils
vi.mock('../utils', () => ({
  addPlayer: (players) => [...players, { name: '' }],
  removePlayer: (players, index) => players.filter((_, i) => i !== index),
  updatePlayer: (players, index, field, value) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    return newPlayers;
  },
  movePlayerUp: (players, index) => {
    if (index === 0) return players;
    const newPlayers = [...players];
    [newPlayers[index - 1], newPlayers[index]] = [newPlayers[index], newPlayers[index - 1]];
    return newPlayers;
  },
  movePlayerDown: (players, index) => {
    if (index === players.length - 1) return players;
    const newPlayers = [...players];
    [newPlayers[index], newPlayers[index + 1]] = [newPlayers[index + 1], newPlayers[index]];
    return newPlayers;
  },
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

  it('moves player up in active game', () => {
    const setActiveGame = vi.fn();
    const setCurrentPlayerIndex = vi.fn();
    
    const { result } = renderHook(() => useGamePlayerManagement({
      activeGame: { 
        players: [{ name: 'P1' }, { name: 'P2' }, { name: 'P3' }],
        currentPlayerIndex: 1
      },
      setActiveGame,
      currentPlayerIndex: 1,
      setCurrentPlayerIndex
    }));
    
    act(() => {
      result.current.moveGamePlayerUp(1); // Move P2 up
    });

    expect(setActiveGame).toHaveBeenCalled();
  });

  it('does nothing when moving first player up', () => {
    const setActiveGame = vi.fn();
    
    const { result } = renderHook(() => useGamePlayerManagement({
      activeGame: { 
        players: [{ name: 'P1' }, { name: 'P2' }],
        currentPlayerIndex: 0
      },
      setActiveGame,
      currentPlayerIndex: 0,
      setCurrentPlayerIndex: vi.fn()
    }));
    
    act(() => {
      result.current.moveGamePlayerUp(0);
    });

    expect(setActiveGame).not.toHaveBeenCalled();
  });

  it('does nothing when moving last player down', () => {
    const setActiveGame = vi.fn();
    
    const { result } = renderHook(() => useGamePlayerManagement({
      activeGame: { 
        players: [{ name: 'P1' }, { name: 'P2' }],
        currentPlayerIndex: 0
      },
      setActiveGame,
      currentPlayerIndex: 0,
      setCurrentPlayerIndex: vi.fn()
    }));
    
    act(() => {
      result.current.moveGamePlayerDown(1); // Last player
    });

    expect(setActiveGame).not.toHaveBeenCalled();
  });

  it('handles drag and drop', () => {
    const setActiveGame = vi.fn();
    const setCurrentPlayerIndex = vi.fn();
    
    const { result } = renderHook(() => useGamePlayerManagement({
      activeGame: { 
        players: [{ name: 'P1' }, { name: 'P2' }, { name: 'P3' }],
        currentPlayerIndex: 0
      },
      setActiveGame,
      currentPlayerIndex: 0,
      setCurrentPlayerIndex
    }));
    
    // Start drag
    act(() => {
      result.current.handleGameDragStart(0);
    });
    
    expect(result.current.draggedGamePlayerIndex).toBe(0);
    
    // Drag over (prevent default)
    const mockEvent = { preventDefault: vi.fn() };
    act(() => {
      result.current.handleGameDragOver(mockEvent);
    });
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    
    // Drop
    act(() => {
      result.current.handleGameDrop({ preventDefault: vi.fn() }, 2);
    });
    
    expect(setActiveGame).toHaveBeenCalled();
    expect(result.current.draggedGamePlayerIndex).toBeNull();
  });

  it('does not reorder on drop to same position', () => {
    const setActiveGame = vi.fn();
    
    const { result } = renderHook(() => useGamePlayerManagement({
      activeGame: { 
        players: [{ name: 'P1' }, { name: 'P2' }],
        currentPlayerIndex: 0
      },
      setActiveGame,
      currentPlayerIndex: 0,
      setCurrentPlayerIndex: vi.fn()
    }));
    
    act(() => {
      result.current.handleGameDragStart(0);
    });
    
    act(() => {
      result.current.handleGameDrop({ preventDefault: vi.fn() }, 0); // Same position
    });
    
    expect(setActiveGame).not.toHaveBeenCalled();
  });
});

describe('usePlayerManagement - additional', () => {
  it('moves player up', () => {
    const { result } = renderHook(() => usePlayerManagement(6));
    
    // Add players
    act(() => {
      result.current.updatePlayer(0, 'name', 'P1');
      result.current.addPlayer();
    });
    act(() => {
      result.current.updatePlayer(1, 'name', 'P2');
    });
    
    act(() => {
      result.current.movePlayerUp(1);
    });

    // P2 should now be at index 0
    expect(result.current.players[0].name).toBe('P2');
  });

  it('moves player down', () => {
    const { result } = renderHook(() => usePlayerManagement(6));
    
    act(() => {
      result.current.updatePlayer(0, 'name', 'P1');
      result.current.addPlayer();
    });
    act(() => {
      result.current.updatePlayer(1, 'name', 'P2');
    });
    
    act(() => {
      result.current.movePlayerDown(0);
    });

    expect(result.current.players[0].name).toBe('P2');
    expect(result.current.players[1].name).toBe('P1');
  });

  it('handles drag start', () => {
    const { result } = renderHook(() => usePlayerManagement(6));
    
    act(() => {
      result.current.handleDragStart(0);
    });

    expect(result.current.draggedPlayerIndex).toBe(0);
  });

  it('handles drag over (prevents default)', () => {
    const { result } = renderHook(() => usePlayerManagement(6));
    const mockEvent = { preventDefault: vi.fn() };
    
    act(() => {
      result.current.handleDragOver(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('handles drop to reorder players', () => {
    const { result } = renderHook(() => usePlayerManagement(6));
    
    // Setup players
    act(() => {
      result.current.updatePlayer(0, 'name', 'P1');
      result.current.addPlayer();
    });
    act(() => {
      result.current.updatePlayer(1, 'name', 'P2');
      result.current.addPlayer();
    });
    act(() => {
      result.current.updatePlayer(2, 'name', 'P3');
    });
    
    // Drag P1 to position 2
    act(() => {
      result.current.handleDragStart(0);
    });
    act(() => {
      result.current.handleDrop({ preventDefault: vi.fn() }, 2);
    });

    expect(result.current.players[0].name).toBe('P2');
    expect(result.current.players[1].name).toBe('P3');
    expect(result.current.players[2].name).toBe('P1');
    expect(result.current.draggedPlayerIndex).toBeNull();
  });

  it('resets players', () => {
    const { result } = renderHook(() => usePlayerManagement(6));
    
    act(() => {
      result.current.updatePlayer(0, 'name', 'P1');
      result.current.addPlayer();
    });
    
    expect(result.current.players).toHaveLength(2);
    
    act(() => {
      result.current.resetPlayers();
    });

    expect(result.current.players).toHaveLength(1);
    expect(result.current.players[0].name).toBe('');
  });

  it('allows setting players directly', () => {
    const { result } = renderHook(() => usePlayerManagement(6));
    
    act(() => {
      result.current.setPlayers([{ name: 'Direct1' }, { name: 'Direct2' }]);
    });

    expect(result.current.players).toHaveLength(2);
    expect(result.current.players[0].name).toBe('Direct1');
  });
});
