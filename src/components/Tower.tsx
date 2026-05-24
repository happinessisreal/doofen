import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Builds a line loop from an array of [x, y] pairs, extruded slightly in z.
 * Returns a THREE.BufferGeometry of line segments for use with <lineSegments>.
 */
function buildOutline(points: [number, number][], depth: number = 0.3): THREE.BufferGeometry {
  const verts: number[] = [];

  // Front face outline
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    verts.push(x1, y1, depth / 2, x2, y2, depth / 2);
  }
  // Back face outline
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    verts.push(x1, y1, -depth / 2, x2, y2, -depth / 2);
  }
  // Connecting edges (front to back)
  for (const [x, y] of points) {
    verts.push(x, y, depth / 2, x, y, -depth / 2);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  return geo;
}

/**
 * Builds the fan/spoke lines inside the arch dome.
 */
function buildFanSpokes(cx: number, cy: number, radius: number, spokeCount: number, depth: number = 0.3): THREE.BufferGeometry {
  const verts: number[] = [];
  for (let i = 0; i <= spokeCount; i++) {
    const angle = (i / spokeCount) * Math.PI;
    const ex = cx + Math.cos(angle) * radius;
    const ey = cy + Math.sin(angle) * radius;
    // Front
    verts.push(cx, cy, depth / 2, ex, ey, depth / 2);
    // Back
    verts.push(cx, cy, -depth / 2, ex, ey, -depth / 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  return geo;
}

/**
 * Builds the semicircular arch outline.
 */
function buildArch(cx: number, cy: number, radius: number, segments: number, depth: number = 0.3): THREE.BufferGeometry {
  const verts: number[] = [];
  const pts: [number, number][] = [];

  // Arc from 0 to PI
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI;
    pts.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
  }

  // Front arc
  for (let i = 0; i < pts.length - 1; i++) {
    verts.push(pts[i][0], pts[i][1], depth / 2, pts[i + 1][0], pts[i + 1][1], depth / 2);
  }
  // Back arc
  for (let i = 0; i < pts.length - 1; i++) {
    verts.push(pts[i][0], pts[i][1], -depth / 2, pts[i + 1][0], pts[i + 1][1], -depth / 2);
  }
  // Connecting edges
  for (const [x, y] of pts) {
    verts.push(x, y, depth / 2, x, y, -depth / 2);
  }
  // Base line
  verts.push(pts[0][0], pts[0][1], depth / 2, pts[pts.length - 1][0], pts[pts.length - 1][1], depth / 2);
  verts.push(pts[0][0], pts[0][1], -depth / 2, pts[pts.length - 1][0], pts[pts.length - 1][1], -depth / 2);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  return geo;
}


export const Tower: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = t * 0.06;
      groupRef.current.position.y = Math.sin(t * 0.4) * 0.04;
    }
  });

  const lineMat = useMemo(() => new THREE.LineBasicMaterial({
    color: 0xb794d6,
    transparent: true,
    opacity: 0.9,
  }), []);

  const lineDim = useMemo(() => new THREE.LineBasicMaterial({
    color: 0x7D53B2,
    transparent: true,
    opacity: 0.4,
  }), []);

  // Build geometries matching the logo
  const d = 0.4; // z-depth for 3D extrusion

  // 1. Semicircular arch (top dome)
  const archGeo = useMemo(() => buildArch(0, 2.6, 1.2, 24, d), []);

  // 2. Fan spokes inside dome
  const fanGeo = useMemo(() => buildFanSpokes(0, 2.6, 1.15, 6, d), []);

  // 3. Main rectangular body
  const bodyGeo = useMemo(() => buildOutline([
    [-1.0, 2.6],   // top-left
    [1.0, 2.6],    // top-right (extends behind arch base)
    [1.0, 0.6],    // bottom-right
    [-1.0, 0.6],   // bottom-left
  ], d), []);

  // 4. Billboard/sign frame on the front
  const signGeo = useMemo(() => buildOutline([
    [-0.85, 2.1],
    [0.35, 2.1],
    [0.35, 1.5],
    [-0.85, 1.5],
  ], d + 0.1), []);

  // 5. Horizontal bar under sign (shelf)
  const shelfGeo = useMemo(() => buildOutline([
    [-1.05, 1.45],
    [0.5, 1.45],
    [0.5, 1.35],
    [-1.05, 1.35],
  ], d), []);

  // 6. Tall right-side vertical column
  const rightColGeo = useMemo(() => buildOutline([
    [0.65, 2.8],
    [0.85, 2.8],
    [0.85, -0.5],
    [0.65, -0.5],
  ], d * 0.6), []);

  // 7. Side cup/trapezoid (wider top, narrower bottom)
  const cupGeo = useMemo(() => buildOutline([
    [1.05, 2.0],   // top-left
    [1.85, 2.0],   // top-right
    [1.55, 0.6],   // bottom-right (narrower)
    [1.05, 0.6],   // bottom-left
  ], d * 0.5), []);

  // 8. Three base support pillars
  const pillar1 = useMemo(() => buildOutline([
    [-0.85, 0.6], [-0.65, 0.6], [-0.65, -0.8], [-0.85, -0.8],
  ], d * 0.4), []);
  const pillar2 = useMemo(() => buildOutline([
    [-0.35, 0.6], [-0.15, 0.6], [-0.15, -0.8], [-0.35, -0.8],
  ], d * 0.4), []);
  const pillar3 = useMemo(() => buildOutline([
    [0.15, 0.6], [0.35, 0.6], [0.35, -0.8], [0.15, -0.8],
  ], d * 0.4), []);

  // 9. Small inner detail rectangles (the windows/doorways on the lower body)
  const innerL = useMemo(() => buildOutline([
    [-0.75, 1.25], [-0.45, 1.25], [-0.45, 0.7], [-0.75, 0.7],
  ], d * 0.3), []);
  const innerR = useMemo(() => buildOutline([
    [-0.15, 1.25], [0.15, 1.25], [0.15, 0.7], [-0.15, 0.7],
  ], d * 0.3), []);

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {/* Dome arch */}
      <lineSegments geometry={archGeo}>
        <primitive object={lineMat} attach="material" />
      </lineSegments>

      {/* Fan spokes */}
      <lineSegments geometry={fanGeo}>
        <primitive object={lineDim} attach="material" />
      </lineSegments>

      {/* Main body */}
      <lineSegments geometry={bodyGeo}>
        <primitive object={lineMat} attach="material" />
      </lineSegments>

      {/* Billboard sign */}
      <lineSegments geometry={signGeo}>
        <primitive object={lineMat} attach="material" />
      </lineSegments>

      {/* Shelf bar */}
      <lineSegments geometry={shelfGeo}>
        <primitive object={lineDim} attach="material" />
      </lineSegments>

      {/* Right tall column */}
      <lineSegments geometry={rightColGeo}>
        <primitive object={lineMat} attach="material" />
      </lineSegments>

      {/* Side cup structure */}
      <lineSegments geometry={cupGeo}>
        <primitive object={lineMat} attach="material" />
      </lineSegments>

      {/* Base pillars */}
      <lineSegments geometry={pillar1}>
        <primitive object={lineMat} attach="material" />
      </lineSegments>
      <lineSegments geometry={pillar2}>
        <primitive object={lineMat} attach="material" />
      </lineSegments>
      <lineSegments geometry={pillar3}>
        <primitive object={lineMat} attach="material" />
      </lineSegments>

      {/* Inner detail windows */}
      <lineSegments geometry={innerL}>
        <primitive object={lineDim} attach="material" />
      </lineSegments>
      <lineSegments geometry={innerR}>
        <primitive object={lineDim} attach="material" />
      </lineSegments>
    </group>
  );
};
