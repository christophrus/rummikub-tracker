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

  it('plays victory sound with multiple notes', () => {
    const { result } = renderHook(() => useAudio());
    result.current.playVictorySound();
    
    // Victory sound plays 4 notes (C5, E5, G5, C6)
    expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(4);
    expect(mockOscillator.start).toHaveBeenCalledTimes(4);
  });

  it('speaks player name using speech synthesis', () => {
    // Mock SpeechSynthesisUtterance
    globalThis.SpeechSynthesisUtterance = vi.fn().mockImplementation(function(text) {
      this.text = text;
      this.rate = 1.0;
      this.pitch = 1.0;
      this.volume = 1.0;
      this.lang = '';
      this.voice = null;
    });

    const mockCancel = vi.fn();
    const mockSpeak = vi.fn();
    
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        cancel: mockCancel,
        speak: mockSpeak,
        getVoices: vi.fn(() => [
          { lang: 'de-DE', name: 'German Voice' },
          { lang: 'en-US', name: 'English Voice' }
        ])
      },
      writable: true,
      configurable: true
    });

    const { result } = renderHook(() => useAudio());
    
    vi.useFakeTimers();
    result.current.speakPlayerName('John', 'de-DE');
    
    expect(mockCancel).toHaveBeenCalled();
    
    // Advance past the 400ms delay
    vi.advanceTimersByTime(500);
    
    expect(mockSpeak).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('cleans up audio context on unmount', () => {
    const { result, unmount } = renderHook(() => useAudio());
    
    // Initialize context
    result.current.playTickTock();
    
    // Unmount
    unmount();
    
    expect(mockAudioContext.close).toHaveBeenCalled();
  });

  it('reuses existing audio context', () => {
    const { result } = renderHook(() => useAudio());
    
    result.current.playTickTock();
    result.current.playTickTock();
    
    // Should only create one AudioContext
    expect(window.AudioContext).toHaveBeenCalledTimes(1);
  });
});
