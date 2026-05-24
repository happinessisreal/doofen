import React, { useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Tower } from './Tower';
import { FloatingServices } from './FloatingServices';
import { ArtifactVault } from './ArtifactVault';
import { type ActiveItem } from './ServiceDrawer';

interface MonolithCanvasProps {
  onSelectItem: (item: ActiveItem) => void;
}

const CameraController: React.FC = () => {
  const { camera, size } = useThree();

  useFrame(() => {
    const progress = (window as any).scrollProgress || 0;
    const isMobile = size.width < 768;

    // On mobile: pull camera back further so the tower + labels fit
    const startY = 3.5;
    const endY = -1.0;
    const currentY = startY - progress * (startY - endY);

    const startRadius = isMobile ? 9.0 : 7.0;
    const endRadius = isMobile ? 7.0 : 5.0;
    const radius = startRadius - progress * (startRadius - endRadius);

    const angle = progress * Math.PI * 2.5;

    const targetX = radius * Math.cos(angle);
    const targetZ = radius * Math.sin(angle);

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, currentY, 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);

    const lookAtY = currentY * 0.4;
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
        position: [isMobile ? 9.0 : 7.0, 3.5, 0],
        fov: isMobile ? 55 : 45,
      }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, isMobile ? 1.5 : 2]}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#7D53B2" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#9d77d1" />

      <CameraController />
      <Tower />
      <FloatingServices onSelectService={onSelectItem} />
      <ArtifactVault onSelectProduct={onSelectItem} />
    </Canvas>
  );
};
