import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { MonolithModel } from './MonolithModel';
import { useIsMobile } from './useIsMobile';

/**
 * Self-contained monolith for the mobile bento hero tile: a single live,
 * slowly auto-rotating wireframe (the model spins itself), framed in a fixed
 * three-quarter view. No scroll-driven camera, no orbiting satellites — the
 * bento tiles carry the navigation instead. Mounts on mobile only.
 */
export const MonolithTile: React.FC = () => {
  const isMobile = useIsMobile();
  if (!isMobile) return null;

  return (
    <Canvas
      className="bento-3d-canvas"
      camera={{ position: [2.6, 1.1, 6.4], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      flat
      dpr={[1, 1.5]}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <MonolithModel />
      </Suspense>
    </Canvas>
  );
};
