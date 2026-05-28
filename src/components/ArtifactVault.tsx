import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { type ActiveItem } from './ServiceDrawer';
import { PRODUCTS, type Product } from '../data/products';

interface ArtifactVaultProps {
  onSelectProduct: (item: ActiveItem) => void;
}

const GEOMETRIES = ['dodecahedron', 'torusKnot', 'icosahedron'] as const;

interface ArtifactProps {
  product: Product;
  index: number;
  onSelect: (item: ActiveItem) => void;
}

const Artifact: React.FC<ArtifactProps> = ({ product, index, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.3 + index * 2;
      meshRef.current.rotation.x = Math.sin(t * 0.4 + index) * 0.15;

      // Gentle float
      const floatY = hovered
        ? Math.sin(t * 2.5) * 0.15
        : Math.sin(t * 0.8 + index) * 0.05;
      meshRef.current.position.y = product.position[1] + floatY;

      const s = hovered ? 1.15 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
    }
  });

  const geo = GEOMETRIES[index];
  const color = hovered ? 0xc9aef0 : 0x9d77d1;

  return (
    <group position={product.position}>
      {/* Product shape */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect({
            name: product.name,
            type: 'product',
            description: product.desc,
            detail: `Product ${String(index + 1).padStart(2, '0')} / ${PRODUCTS.length}`
          });
        }}
      >
        {geo === 'dodecahedron' && <dodecahedronGeometry args={[0.35, 0]} />}
        {geo === 'torusKnot' && <torusKnotGeometry args={[0.22, 0.06, 48, 6, 3, 4]} />}
        {geo === 'icosahedron' && <icosahedronGeometry args={[0.35, 0]} />}
        <meshBasicMaterial color={color} wireframe transparent opacity={0.9} />
      </mesh>

      {/* Label */}
      <Html
        position={[0, 0.6, 0]}
        distanceFactor={5}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '10px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: hovered ? '#ffffff' : '#b794d6',
          opacity: hovered ? 1 : 0.7,
          transition: 'all 0.2s ease',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          textShadow: hovered ? '0 0 12px rgba(125, 83, 178, 0.8)' : 'none',
        }}>
          {product.name}
        </div>
      </Html>
    </group>
  );
};

export const ArtifactVault: React.FC<ArtifactVaultProps> = ({ onSelectProduct }) => {
  return (
    <group>
      {PRODUCTS.map((prod, idx) => (
        <Artifact
          key={prod.name}
          product={prod}
          index={idx}
          onSelect={onSelectProduct}
        />
      ))}
    </group>
  );
};
