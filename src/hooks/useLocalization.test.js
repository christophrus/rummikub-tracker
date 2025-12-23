import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalization } from './useLocalization';

describe('useLocalization', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('initializes with default language (en)', () => {
    const { result } = renderHook(() => useLocalization());
    expect(result.current.uiLanguage).toBe('en');
  });

  it('initializes with saved language', () => {
    localStorage.setItem('ui-language', 'de');
    const { result } = renderHook(() => useLocalization());
    expect(result.current.uiLanguage).toBe('de');
  });

  it('changes language and saves to localStorage', () => {
    const { result } = renderHook(() => useLocalization());
    
    act(() => {
      result.current.changeUiLanguage('fr');
    });

    expect(result.current.uiLanguage).toBe('fr');
    expect(localStorage.getItem('ui-language')).toBe('fr');
  });
});
