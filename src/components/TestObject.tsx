import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';

export function TestObject() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Rotate the test object smoothly to verify real-time 3D rendering
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.7;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial
        color="#38bdf8"
        roughness={0.3}
        metalness={0.2}
      />
    </mesh>
  );
}
