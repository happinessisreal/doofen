import { useEffect, useState } from 'react';

/**
 * Viewport gate shared by the home experience. The initial value is read
 * synchronously on first render (these components are client:only, so `window`
 * exists) — this avoids a one-frame flash where the wrong 3D canvas mounts.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(
    () => typeof window !== 'undefined' && window.innerWidth <= breakpoint,
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);

  return isMobile;
}
