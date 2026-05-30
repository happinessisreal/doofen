import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

useGLTF.preload('/monolith.glb');

const TARGET_SIZE = 3.6; // largest dimension in world units (fits inside the service orbit)

// ── Powering-up reveal tuning ──
const REVEAL_WINDOW = 1.6; // span over which meshes begin lighting up (base → top)
const DRAW_DURATION = 0.95; // time each mesh takes to finish tracing its edges
const SPIN_SPEED = 0.05; // slow, stately idle rotation (rad/s)

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

interface WirePart {
  geometry: THREE.BufferGeometry;
  count: number; // total line vertices
  delay: number; // seconds before this part starts drawing
}

export const MonolithModel: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const wireMatRef = useRef<THREE.LineBasicMaterial | null>(null);
  const wirePartsRef = useRef<WirePart[]>([]);
  const powerStart = useRef<number | null>(null);
  const { scene } = useGLTF('/monolith.glb');

  // Clone the loaded scene, recenter it on the origin, and compute a fit scale.
  const { centered, scale } = useMemo(() => {
    const cloned = scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Translate in the model's own units so its center sits at the local origin.
    cloned.position.sub(center);
    cloned.updateMatrixWorld(true);

    // Collect meshes first; adding children mid-traverse would mutate the tree.
    const meshes: THREE.Mesh[] = [];
    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) meshes.push(mesh);
    });

    // Wireframe-only rendering tinted in the site's violet theme
    // (--color-violet-bright, #b794d6). Surfaces are hidden; only the structural
    // edges render, drawn as glowing violet lines.
    const wireMat = new THREE.LineBasicMaterial({
      color: 0xb794d6,
      transparent: true,
      opacity: 0.85,
    });
    wireMatRef.current = wireMat;

    // Build each mesh's wireframe and record its base height so the reveal can
    // climb the monolith from the ground up — a more majestic "powering on".
    const wpos = new THREE.Vector3();
    const built = meshes
      .filter((m) => m.geometry)
      .map((mesh) => {
        mesh.material = new THREE.MeshBasicMaterial({ visible: false });

        // EdgesGeometry (low threshold) keeps clean topology, hiding triangulation.
        const wireGeo = new THREE.EdgesGeometry(mesh.geometry, 1);
        const wire = new THREE.LineSegments(wireGeo, wireMat);
        wire.frustumCulled = false;
        wireGeo.setDrawRange(0, 0); // start blank; useFrame traces it on
        mesh.add(wire);

        mesh.getWorldPosition(wpos);
        return { wireGeo, count: wireGeo.getAttribute('position').count, y: wpos.y };
      });

    // Order parts bottom → top and spread their start times across the window.
    built.sort((a, b) => a.y - b.y);
    const n = Math.max(built.length - 1, 1);
    wirePartsRef.current = built.map((b, i) => ({
      geometry: b.wireGeo,
      count: b.count,
      delay: (i / n) * REVEAL_WINDOW,
    }));

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    return { centered: cloned, scale: TARGET_SIZE / maxDim };
  }, [scene]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    const g = groupRef.current;

    // ── Powering-up reveal ── trace each mesh's edges on, base first.
    if (powerStart.current === null) powerStart.current = t;
    const pt = t - powerStart.current;
    const totalReveal = REVEAL_WINDOW + DRAW_DURATION;

    for (const part of wirePartsRef.current) {
      const local = THREE.MathUtils.clamp((pt - part.delay) / DRAW_DURATION, 0, 1);
      if (local >= 1) {
        part.geometry.setDrawRange(0, Infinity); // fully lit
      } else {
        const drawn = Math.floor((part.count * easeOutCubic(local)) / 2) * 2;
        part.geometry.setDrawRange(0, drawn);
      }
    }

    // Brighten the edges as the structure powers up, then hold steady.
    if (wireMatRef.current) {
      const lit = THREE.MathUtils.clamp(pt / totalReveal, 0, 1);
      wireMatRef.current.opacity = THREE.MathUtils.lerp(0.4, 0.85, lit);
    }

    // ── Idle ── slow, stately spin with a barely-there float. No sway/breathing.
    g.rotation.y = t * SPIN_SPEED;
    g.position.y = 0.35 + Math.sin(t * 0.3) * 0.04;
  });

  return (
    <group ref={groupRef} position={[0, 0.35, 0]} scale={scale}>
      <primitive object={centered} />
    </group>
  );
};
