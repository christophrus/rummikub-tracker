import { describe, it, expect, beforeEach } from 'vitest';
import { 
  movePlayerUp, 
  movePlayerDown, 
  reorderPlayers, 
  updatePlayer, 
  addPlayer, 
  removePlayer 
} from './playerManagement';

describe('playerManagement', () => {
  let initialPlayers;

  beforeEach(() => {
    initialPlayers = [
      { name: 'Player 1', image: null },
      { name: 'Player 2', image: null },
      { name: 'Player 3', image: null }
    ];
  });

  describe('movePlayerUp', () => {
    it('moves player up one position', () => {
      const result = movePlayerUp(initialPlayers, 1);
      expect(result[0].name).toBe('Player 2');
      expect(result[1].name).toBe('Player 1');
      expect(result[2].name).toBe('Player 3');
    });

    it('does nothing if player is already at top', () => {
      const result = movePlayerUp(initialPlayers, 0);
      expect(result).toEqual(initialPlayers);
    });
  });

  describe('movePlayerDown', () => {
    it('moves player down one position', () => {
      const result = movePlayerDown(initialPlayers, 1);
      expect(result[0].name).toBe('Player 1');
      expect(result[1].name).toBe('Player 3');
      expect(result[2].name).toBe('Player 2');
    });

    it('does nothing if player is already at bottom', () => {
      const result = movePlayerDown(initialPlayers, 2);
      expect(result).toEqual(initialPlayers);
    });
  });

  describe('reorderPlayers', () => {
    it('reorders players correctly', () => {
      const result = reorderPlayers(initialPlayers, 0, 2);
      expect(result[0].name).toBe('Player 2');
      expect(result[1].name).toBe('Player 3');
      expect(result[2].name).toBe('Player 1');
    });

    it('does nothing if dragged index is null', () => {
      const result = reorderPlayers(initialPlayers, null, 2);
      expect(result).toEqual(initialPlayers);
    });
  });

  describe('updatePlayer', () => {
    it('updates player field', () => {
      const result = updatePlayer(initialPlayers, 0, 'name', 'Updated Name');
      expect(result[0].name).toBe('Updated Name');
      expect(result[1].name).toBe('Player 2');
    });
  });

  describe('addPlayer', () => {
    it('adds a new player', () => {
      const result = addPlayer(initialPlayers, 6);
      expect(result.length).toBe(4);
      expect(result[3].name).toBe('');
    });

    it('does not add player if max reached', () => {
      const result = addPlayer(initialPlayers, 3);
      expect(result.length).toBe(3);
    });
  });

  describe('removePlayer', () => {
    it('removes a player', () => {
      const result = removePlayer(initialPlayers, 1);
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Player 1');
      expect(result[1].name).toBe('Player 3');
    });

    it('does not remove if only one player left', () => {
      const singlePlayer = [{ name: 'Player 1' }];
      const result = removePlayer(singlePlayer, 0);
      expect(result.length).toBe(1);
    });
  });

  describe('reorderPlayers edge cases', () => {
    it('does nothing if dragged index equals drop index', () => {
      const result = reorderPlayers(initialPlayers, 1, 1);
      expect(result).toEqual(initialPlayers);
    });

    it('handles moving to beginning', () => {
      const result = reorderPlayers(initialPlayers, 2, 0);
      expect(result[0].name).toBe('Player 3');
      expect(result[1].name).toBe('Player 1');
      expect(result[2].name).toBe('Player 2');
    });
  });
});
