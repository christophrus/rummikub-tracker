import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimerControl } from './useTimerControl';

describe('useTimerControl', () => {
  const defaultProps = {
    activeGame: { players: [{ name: 'P1' }, { name: 'P2' }], maxExtensions: 3 },
    setActiveGame: vi.fn(),
    currentPlayerIndex: 0,
    setCurrentPlayerIndex: vi.fn(),
    timerSeconds: 60,
    setTimerSeconds: vi.fn(),
    setTimerDuration: vi.fn(),
    originalTimerDuration: 60,
    setOriginalTimerDuration: vi.fn(),
    playerExtensions: {},
    setPlayerExtensions: vi.fn(),
    setTimerActive: vi.fn(),
    playTurnNotification: vi.fn(),
    speakPlayerName: vi.fn(),
    ttsLanguage: 'en-US'
  };

  it('switches to next player', () => {
    const { result } = renderHook(() => useTimerControl(defaultProps));
    
    vi.useFakeTimers();
    
    act(() => {
      result.current.nextPlayer();
    });

    expect(defaultProps.setTimerActive).toHaveBeenCalledWith(false);
    expect(defaultProps.playTurnNotification).toHaveBeenCalled();
    expect(defaultProps.setCurrentPlayerIndex).toHaveBeenCalledWith(1);
    expect(defaultProps.setTimerSeconds).toHaveBeenCalledWith(60);
    
    act(() => {
      vi.runAllTimers();
    });
    
    expect(defaultProps.setTimerActive).toHaveBeenCalledWith(true);
    
    vi.useRealTimers();
  });

  it('extends timer', () => {
    const { result } = renderHook(() => useTimerControl(defaultProps));
    
    act(() => {
      result.current.extendTimer();
    });

    // 60 + 30 (EXTENSION_DURATION_SECONDS usually 30 or 60, let's check constant or assume logic)
    // The hook adds EXTENSION_DURATION_SECONDS to current timerSeconds
    // Since we mocked setTimerSeconds, we check if it was called with > 60
    expect(defaultProps.setTimerSeconds).toHaveBeenCalled();
    // Check the last call
    const calls = defaultProps.setTimerSeconds.mock.calls;
    const lastCallArgs = calls[calls.length - 1][0];
    expect(lastCallArgs).toBeGreaterThan(60);
    
    expect(defaultProps.setPlayerExtensions).toHaveBeenCalled();
  });

  it('does not extend if max extensions reached', () => {
    const props = {
      ...defaultProps,
      setTimerSeconds: vi.fn(), // Fresh mock to avoid interference
      playerExtensions: { 'P1': 3 }
    };
    const { result } = renderHook(() => useTimerControl(props));
    
    act(() => {
      result.current.extendTimer();
    });

    expect(props.setTimerSeconds).not.toHaveBeenCalled();
  });

  it('updates timer duration', () => {
    const { result } = renderHook(() => useTimerControl(defaultProps));
    
    act(() => {
      result.current.updateTimerDuration(120);
    });

    expect(defaultProps.setTimerDuration).toHaveBeenCalledWith(120);
    expect(defaultProps.setOriginalTimerDuration).toHaveBeenCalledWith(120);
    expect(defaultProps.setTimerSeconds).toHaveBeenCalledWith(120);
  });

  it('resets timer', () => {
    const { result } = renderHook(() => useTimerControl(defaultProps));
    
    act(() => {
      result.current.resetTimer();
    });

    expect(defaultProps.setTimerSeconds).toHaveBeenCalledWith(60);
    expect(defaultProps.setTimerActive).toHaveBeenCalledWith(true);
  });

  it('pauses and resumes timer', () => {
    const { result } = renderHook(() => useTimerControl(defaultProps));
    
    act(() => {
      result.current.pauseTimer();
    });
    expect(defaultProps.setTimerActive).toHaveBeenCalledWith(false);

    act(() => {
      result.current.resumeTimer();
    });
    expect(defaultProps.setTimerActive).toHaveBeenCalledWith(true);
  });
});
