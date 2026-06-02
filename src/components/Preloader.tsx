import React, { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';

/**
 * Branded "boot sequence" overlay shown while monolith.glb streams in.
 * Reads drei's global load progress, then dissolves once assets are ready.
 */
export const Preloader: React.FC = () => {
  const { active, progress } = useProgress();
  const [done, setDone] = useState(false);   // triggers the fade-out
  const [removed, setRemoved] = useState(false); // unmounts after the fade
  // The reveal animation in the model needs a beat after assets resolve, so we
  // never dismiss before a short minimum so the boot sequence is always seen.
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    if (active) return; // still loading — keep the overlay up
    const elapsed = Date.now() - mountedAt.current;
    const wait = Math.max(0, 650 - elapsed); // minimum on-screen time
    const fade = setTimeout(() => setDone(true), wait);
    const gone = setTimeout(() => setRemoved(true), wait + 900);
    return () => { clearTimeout(fade); clearTimeout(gone); };
  }, [active]);

  if (removed) return null;

  const pct = active ? Math.min(99, Math.round(progress)) : 100;

  return (
    <div className={`preloader${done ? ' preloader--done' : ''}`} role="status" aria-live="polite">
      <div className="preloader-inner">
        <span className="preloader-brand">Doofenshmirtz Evil Inc.</span>
        <span className="preloader-status">
          {done ? 'Monolith Online' : 'Initializing Monolith'}
          <span className="preloader-caret">▌</span>
        </span>
        <div className="preloader-bar">
          <span className="preloader-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="preloader-pct">{String(pct).padStart(3, '0')}%</span>
      </div>
    </div>
  );
};
