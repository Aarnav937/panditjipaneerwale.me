import React, { useEffect, useRef } from 'react';

// Glossy spheres on three depth planes. Far planes get a massive blur, near planes
// a lighter one (depth of field), and each plane moves at its own speed on scroll
// and pointer movement, which is what gives the background its 2.5D feel.
const PLANES = [
  {
    depth: 'far',
    orbs: [
      { tone: 'saffron', size: 52, x: -14, y: -16, drift: 'a', dur: 26 },
      { tone: 'marigold', size: 44, x: 66, y: 8, drift: 'b', dur: 30 },
      { tone: 'rani', size: 38, x: 24, y: 62, drift: 'c', dur: 34 },
    ],
  },
  {
    depth: 'mid',
    orbs: [
      { tone: 'kesar', size: 24, x: 58, y: -4, drift: 'b', dur: 22 },
      { tone: 'cream', size: 28, x: -8, y: 46, drift: 'a', dur: 24 },
      { tone: 'rani', size: 16, x: 80, y: 66, drift: 'c', dur: 20 },
    ],
  },
  {
    depth: 'near',
    orbs: [
      { tone: 'marigold', size: 11, x: 4, y: 62, drift: 'c', dur: 16 },
      { tone: 'kesar', size: 8, x: 88, y: 30, drift: 'a', dur: 14 },
      { tone: 'rani', size: 6, x: 52, y: 96, drift: 'b', dur: 18 },
    ],
  },
];

const AmbientBackground = () => {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window.matchMedia !== 'function') return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let frame = 0;
    let target = { mx: 0, my: 0 };
    let current = { mx: 0, my: 0 };

    const scrollProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };

    const render = () => {
      frame = 0;
      // Ease the pointer tilt so the planes glide instead of snapping.
      current.mx += (target.mx - current.mx) * 0.08;
      current.my += (target.my - current.my) * 0.08;
      root.style.setProperty('--orb-p', scrollProgress().toFixed(4));
      root.style.setProperty('--orb-mx', current.mx.toFixed(4));
      root.style.setProperty('--orb-my', current.my.toFixed(4));
      if (Math.abs(target.mx - current.mx) > 0.001 || Math.abs(target.my - current.my) > 0.001) {
        frame = requestAnimationFrame(render);
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    const onPointer = (event) => {
      if (event.pointerType && event.pointerType !== 'mouse') return;
      target = {
        mx: (event.clientX / window.innerWidth) * 2 - 1,
        my: (event.clientY / window.innerHeight) * 2 - 1,
      };
      schedule();
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('pointermove', onPointer, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden="true" className="ambient-bg fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
      {PLANES.map((plane) => (
        <div key={plane.depth} className={`ambient-plane ambient-plane--${plane.depth}`}>
          {plane.orbs.map((orb, i) => (
            <span
              key={i}
              className={`ambient-orb ambient-orb--${orb.tone} ambient-drift-${orb.drift}`}
              style={{
                width: `${orb.size}vmax`,
                height: `${orb.size}vmax`,
                left: `${orb.x}%`,
                top: `${orb.y}%`,
                animationDuration: `${orb.dur}s`,
              }}
            />
          ))}
        </div>
      ))}
      <div className="ambient-veil" />
    </div>
  );
};

export default AmbientBackground;
