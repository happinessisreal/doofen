import React, { Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MonolithModel } from './MonolithModel';
import { useIsMobile } from './useIsMobile';

const lerp = THREE.MathUtils.lerp;

/**
 * Light scroll-linked camera for the mobile scrollytelling home. Far gentler
 * than the desktop reveal→orbit: a slow dolly-back, a small descent, and a
 * fractional turn as you scroll past the (self-rotating) monolith.
 */
const ScrollyCamera: React.FC = () => {
  const { camera } = useThree();

  useFrame(() => {
    const p = (window as any).scrollProgress || 0;
    const radius = lerp(6.0, 7.6, p);
    const camY = lerp(1.0, -0.9, p);
    const angle = lerp(-0.28, 0.4, p);

    const tx = radius * Math.sin(angle);
    const tz = radius * Math.cos(angle);
    camera.position.x = lerp(camera.position.x, tx, 0.1);
    camera.position.y = lerp(camera.position.y, camY, 0.1);
    camera.position.z = lerp(camera.position.z, tz, 0.1);
    camera.lookAt(0, lerp(0.5, -0.2, p), 0);
  });

  return null;
};

/**
 * Full-bleed, fixed monolith behind the mobile caption panels. Just the
 * building — no orbiting satellites — so it stays light. Mobile only.
 */
export const MonolithMobile: React.FC = () => {
  const isMobile = useIsMobile();
  if (!isMobile) return null;

  return (
    <Canvas
      camera={{ position: [-1.66, 1.0, 5.76], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      flat
      dpr={[1, 1.5]}
      style={{ background: 'transparent' }}
    >
      <ScrollyCamera />
      <Suspense fallback={null}>
        <MonolithModel />
      </Suspense>
    </Canvas>
  );
};
