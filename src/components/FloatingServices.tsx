import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { type ActiveItem } from './ServiceDrawer';
import { SERVICES, type Service } from '../data/services';

interface FloatingServicesProps {
  onSelectService: (item: ActiveItem) => void;
}

interface ServiceNodeProps {
  service: Service;
  index: number;
  total: number;
  onSelect: (item: ActiveItem) => void;
}

const ServiceNode: React.FC<ServiceNodeProps> = ({ service, index, total, onSelect }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Distribute in a helix around the tower
  const baseAngle = (index / total) * Math.PI * 2;
  const radius = 2.8 + (index % 3) * 0.5;
  const baseY = -1.2 + (index / total) * 3.8;
  const speed = 0.04 + (index % 5) * 0.008;

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    const angle = baseAngle + t * speed;

    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    const y = baseY + Math.sin(t * 0.6 + index) * 0.06;

    groupRef.current.position.set(x, y, z);

    // Face camera (billboard the label)
    groupRef.current.lookAt(
      state.camera.position.x,
      groupRef.current.position.y,
      state.camera.position.z
    );
  });

  return (
    <group ref={groupRef}>
      {/* Node sphere */}
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect({
            name: service.name,
            type: 'service',
            description: service.desc,
            detail: `Node ${String(index + 1).padStart(2, '0')} / ${total}`
          });
        }}
      >
        <sphereGeometry args={[hovered ? 0.1 : 0.06, 8, 8]} />
        <meshBasicMaterial
          color={hovered ? 0xc9aef0 : 0x9d77d1}
          transparent
          opacity={hovered ? 1 : 0.8}
        />
      </mesh>

      {/* Pulsing ring on hover */}
      {hovered && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.14, 0.18, 16]} />
          <meshBasicMaterial color={0xb794d6} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Always-visible label */}
      <Html
        position={[0.18, 0, 0]}
        distanceFactor={5}
        style={{
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '10px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: hovered ? '#ffffff' : '#9d77d1',
          opacity: hovered ? 1 : 0.6,
          transition: 'all 0.2s ease',
          textShadow: hovered ? '0 0 12px rgba(125, 83, 178, 0.8)' : 'none',
          borderLeft: `1px solid ${hovered ? '#b794d6' : 'rgba(125, 83, 178, 0.3)'}`,
          paddingLeft: '6px',
          lineHeight: 1,
        }}>
          {service.name}
        </div>
      </Html>
    </group>
  );
};

export const FloatingServices: React.FC<FloatingServicesProps> = ({ onSelectService }) => {
  return (
    <group>
      {SERVICES.map((service, index) => (
        <ServiceNode
          key={service.name}
          service={service}
          index={index}
          total={SERVICES.length}
          onSelect={onSelectService}
        />
      ))}
    </group>
  );
};
