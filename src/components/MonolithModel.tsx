import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

useGLTF.preload('/monolith.glb');

const TARGET_SIZE = 3.6; // largest dimension in world units (fits inside the service orbit)

export const MonolithModel: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/monolith.glb');

  // Clone the loaded scene, recenter it on the origin, and compute a fit scale.
  const { centered, scale } = useMemo(() => {
    const cloned = scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Translate in the model's own units so its center sits at the local origin.
    cloned.position.sub(center);

    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    return { centered: cloned, scale: TARGET_SIZE / maxDim };
  }, [scene]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.12;
    groupRef.current.position.y = 0.2 + Math.sin(t * 0.5) * 0.08;
  });

  return (
    <group ref={groupRef} position={[0, 0.2, 0]} scale={scale}>
      <primitive object={centered} />
    </group>
  );
};
