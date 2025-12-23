import { describe, it, expect } from 'vitest';
import { formatTime, validateMinPlayers, getInitials, stripPlayerImages, sanitizeGameForStorage } from './helpers';

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
});
