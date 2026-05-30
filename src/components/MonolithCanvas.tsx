import React, { Suspense, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MonolithModel } from './MonolithModel';
import { OrbitalSystem } from './OrbitalSystem';
import { FloatingServices } from './FloatingServices';
import { ArtifactVault } from './ArtifactVault';
import { type ActiveItem } from './ServiceDrawer';

interface MonolithCanvasProps {
  onSelectItem: (item: ActiveItem) => void;
}

// Fraction of total scroll spent revealing the building before free orbiting.
const REVEAL_END = 0.28;
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const lerp = THREE.MathUtils.lerp;

const CameraController: React.FC = () => {
  const { camera, size } = useThree();

  useFrame(() => {
    const progress = (window as any).scrollProgress || 0;
    const isMobile = size.width < 768;

    // Three keyframe poses the camera moves through with scroll:
    //   START — close and below the base, so on landing you only glimpse part of it.
    //   WIDE  — pulled back and raised: the whole monolith finally in frame.
    //   END   — orbited round and descended for the lower content sections.
    const startR = isMobile ? 3.0 : 2.4;
    const startY = -2.2;
    const startAngle = -0.4;

    const wideR = isMobile ? 9.0 : 7.0;
    const wideY = 3.5;

    const endR = isMobile ? 7.0 : 5.0;
    const endY = -1.0;

    let radius: number, camY: number, angle: number, lookAtY: number;

    if (progress < REVEAL_END) {
      // ── Reveal phase ── pull back + rise from the base to the full framed shot.
      const e = smoothstep(progress / REVEAL_END);
      radius = lerp(startR, wideR, e);
      camY = lerp(startY, wideY, e);
      angle = lerp(startAngle, 0, e);
      lookAtY = lerp(-1.4, wideY * 0.4, e);
    } else {
      // ── Orbit phase ── drift a quarter-turn around the monolith while descending,
      // so most of the perceived rotation comes from the building's own slow spin.
      const k = (progress - REVEAL_END) / (1 - REVEAL_END);
      radius = lerp(wideR, endR, k);
      camY = lerp(wideY, endY, k);
      angle = k * (Math.PI / 2);
      lookAtY = camY * 0.4;
    }

    const targetX = radius * Math.cos(angle);
    const targetZ = radius * Math.sin(angle);

    camera.position.x = lerp(camera.position.x, targetX, 0.08);
    camera.position.y = lerp(camera.position.y, camY, 0.08);
    camera.position.z = lerp(camera.position.z, targetZ, 0.08);
    camera.lookAt(new THREE.Vector3(0, lookAtY, 0));
  });

  return null;
};

export const MonolithCanvas: React.FC<MonolithCanvasProps> = ({ onSelectItem }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <Canvas
      camera={{
        // Match the scroll-reveal START pose so the first painted frame is already
        // the close, partial view at the base — the full building appears on scroll.
        position: [isMobile ? 3.0 : 2.4, -2.2, 0],
        fov: isMobile ? 55 : 45,
      }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
      flat
      dpr={[1, isMobile ? 1.5 : 2]}
    >
      {/* Flat, even lighting to emulate Blender's "Solid" viewport studio light.
          Kept modest so material colours render at true saturation instead of
          clipping to white (tone mapping is off, so bright values hard-clip). */}
      <ambientLight intensity={0.6} />
      <hemisphereLight args={['#ffffff', '#8a8a95', 0.35]} />
      <directionalLight position={[2, 5, 5]} intensity={0.5} color="#ffffff" />

      <CameraController />
      <OrbitalSystem />
      <Suspense fallback={null}>
        <MonolithModel />
      </Suspense>
      <FloatingServices onSelectService={onSelectItem} />
      <ArtifactVault onSelectProduct={onSelectItem} />
    </Canvas>
  );
};
