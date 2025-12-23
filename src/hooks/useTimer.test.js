import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from './useTimer';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with the correct duration', () => {
    const { result } = renderHook(() => useTimer(60, () => {}, false));
    expect(result.current.timerSeconds).toBe(60);
  });

  it('counts down when active', () => {
    const { result } = renderHook(() => useTimer(60, () => {}, true));
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.timerSeconds).toBe(59);
  });

  it('does not count down when inactive', () => {
    const { result } = renderHook(() => useTimer(60, () => {}, false));
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.timerSeconds).toBe(60);
  });

  it('calls onTimeUp when timer reaches 0', () => {
    const onTimeUp = vi.fn();
    const { result } = renderHook(() => useTimer(2, onTimeUp, true));

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.timerSeconds).toBe(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    // After reaching 0, it resets to duration in the next tick or same tick depending on implementation
    // The implementation says: if (newValue <= 0) { onTimeUp(); return timerDuration; }
    // So it should be back to duration immediately after hitting 0 (or effectively 0 then reset)
    
    expect(onTimeUp).toHaveBeenCalled();
  });

  it('resets timer', () => {
    const { result } = renderHook(() => useTimer(60, () => {}, true));
    
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(result.current.timerSeconds).toBe(50);

    act(() => {
      result.current.resetTimer();
    });
    expect(result.current.timerSeconds).toBe(60);
  });
});
