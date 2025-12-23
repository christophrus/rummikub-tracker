import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAudio } from './useAudio';

describe('useAudio', () => {
  let mockAudioContext;
  let mockOscillator;
  let mockGainNode;

  beforeEach(() => {
    mockOscillator = {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 0 },
      type: 'sine'
    };
    
    mockGainNode = {
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
      }
    };

    mockAudioContext = {
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGainNode),
      destination: {},
      currentTime: 0,
      state: 'running',
      resume: vi.fn(),
      close: vi.fn()
    };

    window.AudioContext = vi.fn().mockImplementation(function() {
      return mockAudioContext;
    });
    window.webkitAudioContext = window.AudioContext;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes AudioContext on demand', () => {
    const { result } = renderHook(() => useAudio());
    
    // Should not initialize immediately
    expect(window.AudioContext).not.toHaveBeenCalled();
    
    // Trigger a sound
    result.current.playTickTock();
    
    expect(window.AudioContext).toHaveBeenCalled();
  });

  it('plays tick tock sound', () => {
    const { result } = renderHook(() => useAudio());
    result.current.playTickTock();
    
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
    expect(mockOscillator.start).toHaveBeenCalled();
    expect(mockOscillator.stop).toHaveBeenCalled();
  });

  it('plays turn notification', () => {
    const { result } = renderHook(() => useAudio());
    result.current.playTurnNotification();
    
    // Should create 2 oscillators for the chord/sequence
    expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(2);
  });

  it('resumes suspended context', () => {
    mockAudioContext.state = 'suspended';
    const { result } = renderHook(() => useAudio());
    result.current.playTickTock();
    
    expect(mockAudioContext.resume).toHaveBeenCalled();
  });
});
