import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatTime, validateMinPlayers, getInitials, stripPlayerImages, sanitizeGameForStorage, handleImageUpload } from './helpers';

describe('formatTime', () => {
  it('formats seconds to MM:SS', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(9)).toBe('00:09');
    expect(formatTime(59)).toBe('00:59');
    expect(formatTime(60)).toBe('01:00');
    expect(formatTime(61)).toBe('01:01');
    expect(formatTime(3599)).toBe('59:59');
  });

  it('handles large numbers correctly', () => {
    expect(formatTime(3600)).toBe('60:00');
  });
});

describe('validateMinPlayers', () => {
  it('returns valid players if count met', () => {
    const players = [{ name: 'P1' }, { name: 'P2' }];
    expect(validateMinPlayers(players, 2)).toEqual(players);
  });

  it('returns null if not enough players', () => {
    const players = [{ name: 'P1' }];
    expect(validateMinPlayers(players, 2)).toBeNull();
  });

  it('filters out empty names', () => {
    const players = [{ name: 'P1' }, { name: ' ' }];
    expect(validateMinPlayers(players, 2)).toBeNull();
  });
});

describe('getInitials', () => {
  it('returns first letter capitalized', () => {
    expect(getInitials('john')).toBe('J');
  });

  it('handles uppercase names', () => {
    expect(getInitials('JOHN')).toBe('J');
  });

  it('handles single character', () => {
    expect(getInitials('a')).toBe('A');
  });
});

describe('stripPlayerImages', () => {
  it('removes image data from players', () => {
    const players = [{ name: 'P1', image: 'data:image...' }, { name: 'P2' }];
    const stripped = stripPlayerImages(players);
    expect(stripped[0]).toEqual({ name: 'P1' });
    expect(stripped[1]).toEqual({ name: 'P2' });
  });

  it('handles string players (legacy)', () => {
    const players = ['P1', 'P2'];
    expect(stripPlayerImages(players)).toEqual(players);
  });
  
  it('returns non-array input as is', () => {
    expect(stripPlayerImages(null)).toBeNull();
  });
});

describe('sanitizeGameForStorage', () => {
  it('strips images from game players', () => {
    const game = { players: [{ name: 'P1', image: 'data:...' }] };
    const sanitized = sanitizeGameForStorage(game);
    expect(sanitized.players[0]).toEqual({ name: 'P1' });
  });

  it('returns input if not object', () => {
    expect(sanitizeGameForStorage(null)).toBeNull();
  });

  it('preserves other game properties', () => {
    const game = { 
      id: 1, 
      name: 'Game', 
      rounds: [{ scores: {} }],
      players: [{ name: 'P1', image: 'data:...' }] 
    };
    const sanitized = sanitizeGameForStorage(game);
    expect(sanitized.id).toBe(1);
    expect(sanitized.name).toBe('Game');
    expect(sanitized.rounds).toEqual([{ scores: {} }]);
  });

  it('handles undefined', () => {
    expect(sanitizeGameForStorage(undefined)).toBeUndefined();
  });
});

describe('handleImageUpload', () => {
  beforeEach(() => {
    // Mock FileReader
    global.FileReader = vi.fn().mockImplementation(function() {
      this.readAsDataURL = vi.fn().mockImplementation(function() {
        setTimeout(() => {
          this.onload({ target: { result: 'data:image/jpeg;base64,mockdata' } });
        }, 0);
      });
    });

    // Mock Image
    global.Image = vi.fn().mockImplementation(function() {
      setTimeout(() => {
        this.width = 100;
        this.height = 100;
        if (this.onload) this.onload();
      }, 0);
    });

    // Mock canvas
    const mockCtx = {
      drawImage: vi.fn()
    };
    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx);
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/jpeg;base64,resized');
  });

  it('processes image file and calls callback', async () => {
    const callback = vi.fn();
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    
    handleImageUpload(file, callback);
    
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(callback).toHaveBeenCalledWith('data:image/jpeg;base64,resized');
  });

  it('does nothing for non-image files', () => {
    const callback = vi.fn();
    const file = new File([''], 'test.txt', { type: 'text/plain' });
    
    handleImageUpload(file, callback);
    
    expect(callback).not.toHaveBeenCalled();
  });

  it('does nothing if file is null', () => {
    const callback = vi.fn();
    
    handleImageUpload(null, callback);
    
    expect(callback).not.toHaveBeenCalled();
  });

  it('handles large images by resizing', async () => {
    global.Image = vi.fn().mockImplementation(function() {
      setTimeout(() => {
        this.width = 500;
        this.height = 300;
        if (this.onload) this.onload();
      }, 0);
    });

    const callback = vi.fn();
    const file = new File([''], 'large.jpg', { type: 'image/png' });
    
    handleImageUpload(file, callback);
    
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(callback).toHaveBeenCalled();
  });
});
