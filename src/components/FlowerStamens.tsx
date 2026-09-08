/**
 * COMPONENTE FLOWER STAMENS — 3 ESTRUCTURAS FLORALES TIPO ESTAMBRE BIOLUMINISCENTES
 *
 * Añade exactamente 3 estructuras tipo estambre en el centro interior de la flor:
 * 1. Estructura 1 (pequeña): la más corta, tallo delgado, curva suave, espiral pequeña visible.
 * 2. Estructura 2 (mediana): intermedia, dirección distinta, curva más amplia, espiral visible mayor.
 * 3. Estructura 3 (grande): la más alta y larga, curva final pronunciada, espiral grande definida.
 *
 * Secuencia estricta de cada estructura:
 * BASE → TALLO CURVADO → CURVA MÁS PRONUNCIADA → PUNTA ENROLLADA EN ESPIRAL 🌀
 *
 * Bioluminiscencia:
 * - Gradiente orgánico: púrpura basal → orquídea/magenta → fucsia vibrante → oro polen bioluminiscente.
 * - Micro-nódulos/perlas de polen resplandeciente en el corazón del rizo de cada espiral.
 * - Suave iluminación interior y esporas de polen flotantes.
 */

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  STAMENS_CONFIG,
  StamenParamConfig,
  generateStamenPath,
  buildOrganicStamenGeometry,
  StamenCurveData,
} from '../config/stamensConfig';

interface SingleStamenProps {
  config: StamenParamConfig;
  index: number;
}

function SingleStamen({ config, index }: SingleStamenProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pollenMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Genera el camino y la geometría una sola vez de forma memoizada
  const { curveData, geometry } = useMemo(() => {
    const data = generateStamenPath(config);
    const geo = buildOrganicStamenGeometry(config, data, 16);
    return { curveData: data, geometry: geo };
  }, [config]);

  // Micro-animación orgánica de respiración y pulsación bioluminiscente suave
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      // Oscilación armónica sutil diferenciada para cada estambre
      const freq = 0.9 + index * 0.25;
      const phase = index * 2.1;
      groupRef.current.rotation.z = Math.sin(t * freq + phase) * 0.012;
      groupRef.current.rotation.x = Math.cos(t * (freq * 0.85) + phase) * 0.009;
    }
    if (pollenMaterialRef.current) {
      // Suave respiración de la emisión de las perlas de polen
      const pulse = 0.85 + Math.sin(t * 2.2 + index * 1.5) * 0.25;
      pollenMaterialRef.current.emissiveIntensity = pulse;
    }
  });

  // Limpieza de memoria
  React.useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <group ref={groupRef} name={`stamen-structure-${config.id}`}>
      {/* Tallo orgánico cónico con la espiral 🌀 */}
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          vertexColors
          roughness={0.32}
          metalness={0.12}
          emissive={new THREE.Color(config.glowColor)}
          emissiveIntensity={0.28}
        />
      </mesh>

      {/* Micro-perlas / anidación de polen bioluminiscente en el corazón de la espiral */}
      <group name={`pollen-anthers-${config.id}`}>
        {curveData.pollenPositions.map((pollen, pIdx) => (
          <mesh
            key={`pollen-${config.id}-${pIdx}`}
            position={pollen.position}
            scale={[pollen.scale, pollen.scale, pollen.scale]}
          >
            <sphereGeometry args={[1, 12, 12]} />
            <meshStandardMaterial
              ref={pIdx === 0 ? pollenMaterialRef : undefined}
              color={config.glowColor}
              roughness={0.2}
              metalness={0.08}
              emissive={new THREE.Color(config.glowColor)}
              emissiveIntensity={0.95}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/**
 * Nube de micro-esporas de polen bioluminiscente flotantes en el centro
 */
function CentralPollenSpores() {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, scales] = useMemo(() => {
    const count = 36;
    const pos = new Float32Array(count * 3);
    const sc = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const radius = 0.03 + Math.random() * 0.16;
      const angle = Math.random() * Math.PI * 2;
      const height = 0.08 + Math.random() * 0.75;
      pos[i * 3 + 0] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
      sc[i] = 0.5 + Math.random() * 0.8;
    }
    return [pos, sc];
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const count = posAttr.count;

    for (let i = 0; i < count; i++) {
      let y = posAttr.getY(i);
      y += Math.sin(t * 1.5 + i) * 0.0004;
      posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        color="#fef08a"
        transparent
        opacity={0.78}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/**
 * COMPONENTE PRINCIPAL: LAS 3 ESTRUCTURAS TIPO ESTAMBRE EN EL CENTRO
 */
export function FlowerStamens() {
  return (
    <group name="flower-inner-stamens" position={[0, 0, 0]}>
      {/* Luz bioluminiscente suave y cálida que emana desde el corazón de la flor */}
      <pointLight
        name="stamen-bioluminescent-light"
        position={[0, 0.28, 0]}
        color="#fef08a"
        intensity={0.65}
        distance={1.6}
        decay={2}
      />

      {/* Luz puntual secundaria orquídea-magenta que resalta las bases púrpuras */}
      <pointLight
        name="stamen-magenta-ambient-light"
        position={[0, 0.06, 0]}
        color="#e879f9"
        intensity={0.45}
        distance={0.9}
        decay={2}
      />

      {/* Las 3 estructuras diferenciadas: pequeña, mediana, grande */}
      {STAMENS_CONFIG.map((cfg, index) => (
        <SingleStamen key={cfg.id} config={cfg} index={index} />
      ))}

      {/* Micro-esporas de polen bioluminiscente flotando mágicamente */}
      <CentralPollenSpores />
    </group>
  );
}

export default FlowerStamens;
