import { useState, useEffect } from 'react';

/** Subscribe to a CSS media query. Safe for Vite SPA (no SSR). */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/**
 * Track the visual viewport so iOS/Android keyboards do not cover
 * the sticky Place Order footer.
 */
export function useVisualViewport() {
  const [viewport, setViewport] = useState(() => ({
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    offsetTop: 0,
    keyboard: 0,
  }));

  useEffect(() => {
    const visual = window.visualViewport;

    const sync = () => {
      if (!visual) {
        setViewport({ height: window.innerHeight, offsetTop: 0, keyboard: 0 });
        return;
      }
      const keyboard = Math.max(0, window.innerHeight - visual.height - visual.offsetTop);
      setViewport({
        height: visual.height,
        offsetTop: visual.offsetTop,
        keyboard,
      });
    };

    sync();
    if (!visual) return undefined;
    visual.addEventListener('resize', sync);
    visual.addEventListener('scroll', sync);
    window.addEventListener('resize', sync);
    return () => {
      visual.removeEventListener('resize', sync);
      visual.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  return viewport;
}
