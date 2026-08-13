import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery';

describe('useMediaQuery', () => {
  it('tracks matchMedia changes', () => {
    let listener;
    const media = {
      matches: false,
      addEventListener: (_type, cb) => {
        listener = cb;
      },
      removeEventListener: () => {},
    };
    window.matchMedia = () => media;

    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));
    expect(result.current).toBe(false);

    media.matches = true;
    act(() => listener());
    expect(result.current).toBe(true);
  });
});
