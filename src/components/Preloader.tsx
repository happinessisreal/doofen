import { useEffect, useRef } from 'react';
import { useProgress } from '@react-three/drei';

/**
 * Drives the static boot-sequence overlay (rendered in index.astro so it paints
 * before this island mounts). Reads drei's load progress, updates the counter,
 * then dissolves and removes the overlay once monolith.glb is ready.
 */
export const Preloader = (): null => {
  const { active, progress } = useProgress();
  const mountedAt = useRef(Date.now());

  // Live progress → counter + bar on the static overlay.
  useEffect(() => {
    const pct = active ? Math.min(99, Math.round(progress)) : 100;
    const bar = document.getElementById('preloader-bar');
    const pctEl = document.getElementById('preloader-pct');
    if (bar) bar.style.width = `${pct}%`;
    if (pctEl) pctEl.textContent = `${String(pct).padStart(3, '0')}%`;
  }, [active, progress]);

  // Once assets resolve, hold briefly so the boot screen is always seen, then fade.
  useEffect(() => {
    if (active) return;
    const el = document.getElementById('preloader');
    if (!el || el.classList.contains('preloader--done')) return;
    const text = document.getElementById('preloader-text');
    if (text) text.textContent = 'Monolith Online';
    const wait = Math.max(0, 650 - (Date.now() - mountedAt.current));
    const fade = setTimeout(() => el.classList.add('preloader--done'), wait);
    const gone = setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, wait + 1000);
    return () => { clearTimeout(fade); clearTimeout(gone); };
  }, [active]);

  return null;
};
