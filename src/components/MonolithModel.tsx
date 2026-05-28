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

    // Collect meshes first; adding children mid-traverse would mutate the tree.
    const meshes: THREE.Mesh[] = [];
    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        meshes.push(mesh);
      }
    });

    // Keep the model's authored materials (purple dome, blue-grey walls, teal
    // signage) and overlay a wireframe on each mesh's structural edges — matching
    // how the model reads in Blender's viewport.
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.65,
    });
    for (const mesh of meshes) {
      if (!mesh.geometry) continue;

      // Blender "Solid" shading = flat lighting + basic (non-PBR, non-specular)
      // surface shading. Replace the PBR material with a flat-shaded Lambert one
      // that keeps each material's base colour (purple dome, blue-grey walls,
      // teal windows) but drops specular highlights and metalness.
      const orig = mesh.material as THREE.MeshStandardMaterial;
      let color = orig && orig.color ? orig.color.clone() : new THREE.Color(0xb6b6be);

      // The sign backing ("Panel") exported with no base colour, so glTF renders
      // it white — restore the green it has in Blender.
      if (orig && orig.name === 'Panel') color = new THREE.Color(0x4aa06e);

      // X-Ray at 0.5: half-transparent surfaces with depth-write off, so the
      // model reads see-through like Blender's X-Ray toggle.
      mesh.material = new THREE.MeshLambertMaterial({
        color,
        flatShading: true,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      });

      // EdgesGeometry with a low threshold shows all structural edges while
      // hiding coplanar triangulation — i.e. the clean topology, like Blender.
      const wire = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 1), wireMat);
      mesh.add(wire);
    }

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
