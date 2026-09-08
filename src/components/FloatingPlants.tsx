import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WATER_CONFIG } from '../config/waterConfig';

interface PadData {
  position: [number, number, number];
  baseY: number;
  scale: [number, number, number];
  rotationY: number;
  tilt: [number, number, number];
  color: string;
  speedOffset: number;
}

export function FloatingPlants() {
  const groupRef = useRef<THREE.Group>(null);

  // Pre-calcular posiciones orgánicas para evitar recreaciones
  const pads = useMemo(() => {
    const list: PadData[] = [];
    const colors = ['#234731', '#2c543b', '#356345', '#1e3d2a', '#294f38'];

    // Puntos de dispersión natural en grupos irregulares alrededor del estanque
    // Dejando libre el área central inmediata (donde irá el futuro montículo)
    const clusterCenters = [
      { x: -3.8, z: -2.5, spread: 1.4 },
      { x: 3.2, z: -3.2, spread: 1.6 },
      { x: -4.5, z: 2.8, spread: 1.5 },
      { x: 4.2, z: 3.0, spread: 1.8 },
      { x: 1.8, z: -5.0, spread: 1.3 },
      { x: -2.5, z: 5.2, spread: 1.7 },
    ];

    let id = 0;
    clusterCenters.forEach((cluster) => {
      const count = 4 + Math.floor(Math.random() * 5); // 4 a 8 hojitas por racimo
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.pow(Math.random(), 0.6) * cluster.spread;
        const x = cluster.x + Math.cos(angle) * dist;
        const z = cluster.z + Math.sin(angle) * dist;

        const radius =
          WATER_CONFIG.floatingPlants.minRadius +
          Math.random() *
            (WATER_CONFIG.floatingPlants.maxRadius -
              WATER_CONFIG.floatingPlants.minRadius);

        const color = colors[(id + i) % colors.length];

        list.push({
          position: [x, 0.015, z],
          baseY: 0.015,
          scale: [radius, 0.012, radius],
          rotationY: Math.random() * Math.PI * 2,
          tilt: [
            (Math.random() - 0.5) * 0.04,
            0,
            (Math.random() - 0.5) * 0.04,
          ],
          color,
          speedOffset: Math.random() * 10,
        });
        id++;
      }
    });

    return list;
  }, []);

  // Animación sutil de flotabilidad al compás de las ondas
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime() * WATER_CONFIG.waveSpeed;

    groupRef.current.children.forEach((child, index) => {
      const pad = pads[index];
      if (pad) {
        // Ondulación suave basada en coordenadas del agua
        const wave =
          Math.sin(pad.position[0] * WATER_CONFIG.waveFrequency + t) *
            Math.cos(pad.position[2] * WATER_CONFIG.waveFrequency * 0.8 + t * 0.9) *
            WATER_CONFIG.waveAmplitude;

        child.position.y = pad.baseY + wave * 0.7;
        child.rotation.z = Math.sin(t + pad.speedOffset) * 0.015;
      }
    });
  });

  return (
    <group ref={groupRef} name="floating-plants">
      {pads.map((pad, idx) => (
        <group
          key={idx}
          position={pad.position}
          rotation={[pad.tilt[0], pad.rotationY, pad.tilt[2]]}
          scale={pad.scale}
        >
          {/* Hoja plana sutil con borde orgánico */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[1, 0.9, 1, 20]} />
            <meshStandardMaterial
              color={pad.color}
              roughness={0.65}
              metalness={0.05}
              flatShading={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
