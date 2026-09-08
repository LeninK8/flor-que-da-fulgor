/**
 * COMPONENTE FIREFLIES — EXACTAMENTE 10 LUCIÉRNAGAS BIOLUMINISCENTES
 *
 * Añade 10 luciérnagas ambientales delicadas con:
 * - Cantidad fija y exacta: 10 luciérnagas individuales.
 * - Distribución tridimensional equilibrada (cerca de la flor, entre linternas, sobre el agua, a gran altura y periféricas).
 * - Físicamente protegidas: las que vuelan sobre el agua nunca atraviesan la superficie (Y >= 0.2m).
 * - Parpadeo orgánico independiente (frecuencia, fase, duración y brillo asimétrico: brilla -> disminuye -> casi desaparece -> vuelve a brillar).
 * - Apariencia de pequeño insecto con abdomen brillante y halo suave translúcido.
 * - Movimiento pausado, errático y natural con aleteo rápido en alas microscópicas translúcidas.
 * - Cero impacto sobre la flor, linternas, iluminación global o rendimiento.
 */

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export interface FireflyConfig {
  id: string;
  basePosition: [number, number, number];
  driftAmpX: number;
  driftAmpY: number;
  driftAmpZ: number;
  driftSpeedX: number;
  driftSpeedY: number;
  driftSpeedZ: number;
  phaseX: number;
  phaseY: number;
  phaseZ: number;
  pulseSpeed: number;
  pulsePhase: number;
  minBrightness: number;
  maxBrightness: number;
  glowColor: string;
  scale: number;
}

/**
 * CONFIGURACIÓN FIJA DE EXACTAMENTE 10 LUCIÉRNAGAS
 * Cuidadosamente distribuidas en el espacio 3D para evitar agrupaciones
 */
export const FIREFLIES_DATA: FireflyConfig[] = [
  // 1. Cerca de la flor (aire superior sobre los pétalos)
  {
    id: 'firefly-1-flower-upper',
    basePosition: [0.95, 3.45, 0.85],
    driftAmpX: 0.35,
    driftAmpY: 0.22,
    driftAmpZ: 0.32,
    driftSpeedX: 0.55,
    driftSpeedY: 0.65,
    driftSpeedZ: 0.48,
    phaseX: 0.4,
    phaseY: 1.2,
    phaseZ: 2.1,
    pulseSpeed: 1.85,
    pulsePhase: 0.0,
    minBrightness: 0.08,
    maxBrightness: 0.95,
    glowColor: '#f0ff70',
    scale: 0.9,
  },
  // 2. Cerca de la flor (baja sobre el follaje y césped de la isla)
  {
    id: 'firefly-2-flower-grass',
    basePosition: [-0.85, 1.65, 0.70],
    driftAmpX: 0.32,
    driftAmpY: 0.18,
    driftAmpZ: 0.30,
    driftSpeedX: 0.62,
    driftSpeedY: 0.58,
    driftSpeedZ: 0.52,
    phaseX: 3.1,
    phaseY: 0.8,
    phaseZ: 1.5,
    pulseSpeed: 2.35,
    pulsePhase: 1.45,
    minBrightness: 0.05,
    maxBrightness: 0.90,
    glowColor: '#e2ff54',
    scale: 0.85,
  },
  // 3. Sobre el agua (cerca de la orilla de la isla, altitud baja)
  {
    id: 'firefly-3-water-shore',
    basePosition: [2.60, 0.48, -1.80],
    driftAmpX: 0.40,
    driftAmpY: 0.14,
    driftAmpZ: 0.38,
    driftSpeedX: 0.45,
    driftSpeedY: 0.52,
    driftSpeedZ: 0.42,
    phaseX: 1.8,
    phaseY: 2.9,
    phaseZ: 0.6,
    pulseSpeed: 1.55,
    pulsePhase: 2.80,
    minBrightness: 0.06,
    maxBrightness: 0.92,
    glowColor: '#ffd54f',
    scale: 0.88,
  },
  // 4. Sobre el agua (zona abierta del estanque, altitud baja-media)
  {
    id: 'firefly-4-water-open',
    basePosition: [-2.90, 0.55, -2.40],
    driftAmpX: 0.42,
    driftAmpY: 0.15,
    driftAmpZ: 0.40,
    driftSpeedX: 0.48,
    driftSpeedY: 0.45,
    driftSpeedZ: 0.54,
    phaseX: 4.2,
    phaseY: 1.6,
    phaseZ: 3.8,
    pulseSpeed: 2.15,
    pulsePhase: 4.10,
    minBrightness: 0.08,
    maxBrightness: 0.88,
    glowColor: '#eaff6b',
    scale: 0.92,
  },
  // 5. Entre las linternas (cuadrante este, altura media)
  {
    id: 'firefly-5-between-lanterns-east',
    basePosition: [3.80, 2.20, 2.10],
    driftAmpX: 0.45,
    driftAmpY: 0.28,
    driftAmpZ: 0.42,
    driftSpeedX: 0.52,
    driftSpeedY: 0.68,
    driftSpeedZ: 0.46,
    phaseX: 0.9,
    phaseY: 4.5,
    phaseZ: 2.3,
    pulseSpeed: 1.70,
    pulsePhase: 5.30,
    minBrightness: 0.07,
    maxBrightness: 0.96,
    glowColor: '#fff07a',
    scale: 0.95,
  },
  // 6. Entre las linternas (cuadrante oeste, altura media)
  {
    id: 'firefly-6-between-lanterns-west',
    basePosition: [-3.40, 2.80, 1.20],
    driftAmpX: 0.40,
    driftAmpY: 0.25,
    driftAmpZ: 0.38,
    driftSpeedX: 0.58,
    driftSpeedY: 0.62,
    driftSpeedZ: 0.50,
    phaseX: 2.7,
    phaseY: 3.2,
    phaseZ: 5.1,
    pulseSpeed: 2.50,
    pulsePhase: 0.90,
    minBrightness: 0.05,
    maxBrightness: 0.92,
    glowColor: '#d8ff4d',
    scale: 0.86,
  },
  // 7. Perímetro intermedio sobre el agua
  {
    id: 'firefly-7-water-perimeter',
    basePosition: [4.50, 1.10, -3.20],
    driftAmpX: 0.46,
    driftAmpY: 0.22,
    driftAmpZ: 0.44,
    driftSpeedX: 0.42,
    driftSpeedY: 0.48,
    driftSpeedZ: 0.56,
    phaseX: 5.0,
    phaseY: 0.3,
    phaseZ: 2.8,
    pulseSpeed: 1.40,
    pulsePhase: 3.50,
    minBrightness: 0.09,
    maxBrightness: 0.85,
    glowColor: '#ffd95a',
    scale: 0.90,
  },
  // 8. Bóveda aérea a mayor altura (cuadrante norte)
  {
    id: 'firefly-8-high-altitude-north',
    basePosition: [1.40, 5.20, -1.60],
    driftAmpX: 0.50,
    driftAmpY: 0.35,
    driftAmpZ: 0.48,
    driftSpeedX: 0.50,
    driftSpeedY: 0.55,
    driftSpeedZ: 0.45,
    phaseX: 1.3,
    phaseY: 2.1,
    phaseZ: 4.4,
    pulseSpeed: 2.05,
    pulsePhase: 2.10,
    minBrightness: 0.08,
    maxBrightness: 0.94,
    glowColor: '#ecff73',
    scale: 1.0,
  },
  // 9. Bóveda aérea a mayor altura (cuadrante sur)
  {
    id: 'firefly-9-high-altitude-south',
    basePosition: [-2.10, 4.60, 2.80],
    driftAmpX: 0.48,
    driftAmpY: 0.32,
    driftAmpZ: 0.45,
    driftSpeedX: 0.46,
    driftSpeedY: 0.58,
    driftSpeedZ: 0.52,
    phaseX: 3.8,
    phaseY: 5.2,
    phaseZ: 1.1,
    pulseSpeed: 1.62,
    pulsePhase: 4.75,
    minBrightness: 0.06,
    maxBrightness: 0.90,
    glowColor: '#e5ff5e',
    scale: 0.96,
  },
  // 10. Periferia lejana ambiental
  {
    id: 'firefly-10-outer-ambient',
    basePosition: [-4.80, 1.80, -3.80],
    driftAmpX: 0.52,
    driftAmpY: 0.28,
    driftAmpZ: 0.50,
    driftSpeedX: 0.44,
    driftSpeedY: 0.50,
    driftSpeedZ: 0.48,
    phaseX: 2.2,
    phaseY: 1.7,
    phaseZ: 3.4,
    pulseSpeed: 2.22,
    pulsePhase: 1.80,
    minBrightness: 0.07,
    maxBrightness: 0.88,
    glowColor: '#ffe066',
    scale: 0.92,
  },
];

/**
 * Textura procedural de halo bioluminiscente suave
 */
function createFireflyGlowTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const center = size / 2;
    const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.2, 'rgba(235, 255, 140, 0.8)');
    grad.addColorStop(0.5, 'rgba(180, 240, 60, 0.28)');
    grad.addColorStop(0.8, 'rgba(120, 200, 30, 0.06)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

interface SingleFireflyProps {
  config: FireflyConfig;
  glowTexture: THREE.CanvasTexture;
  headGeo: THREE.SphereGeometry;
  abdomenGeo: THREE.SphereGeometry;
  wingGeo: THREE.PlaneGeometry;
  bodyMaterial: THREE.MeshStandardMaterial;
  wingMaterial: THREE.MeshStandardMaterial;
}

function SingleFirefly({
  config,
  glowTexture,
  headGeo,
  abdomenGeo,
  wingGeo,
  bodyMaterial,
  wingMaterial,
}: SingleFireflyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const abdomenRef = useRef<THREE.Mesh>(null);
  const glowSpriteRef = useRef<THREE.Sprite>(null);
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);

  // Material individual para el abdomen con color bioluminiscente específico
  const abdomenMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(config.glowColor),
    });
  }, [config.glowColor]);

  // Material individual para el sprite de resplandor
  const spriteMaterial = useMemo(() => {
    return new THREE.SpriteMaterial({
      map: glowTexture,
      color: new THREE.Color(config.glowColor),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [glowTexture, config.glowColor]);

  useEffect(() => {
    return () => {
      abdomenMaterial.dispose();
      spriteMaterial.dispose();
    };
  }, [abdomenMaterial, spriteMaterial]);

  // Bucle de animación: vuelo errático suave + parpadeo biológico asimétrico + aleteo
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // 1. Movimiento de vuelo libre con armónicos asimétricos
    const dx =
      Math.sin(t * config.driftSpeedX + config.phaseX) * config.driftAmpX +
      Math.cos(t * (config.driftSpeedX * 0.53) + config.phaseX * 1.8) * (config.driftAmpX * 0.35);

    const dy =
      Math.sin(t * config.driftSpeedY + config.phaseY) * config.driftAmpY +
      Math.cos(t * (config.driftSpeedY * 0.61) + config.phaseY * 1.3) * (config.driftAmpY * 0.3);

    const dz =
      Math.cos(t * config.driftSpeedZ + config.phaseZ) * config.driftAmpZ +
      Math.sin(t * (config.driftSpeedZ * 0.47) + config.phaseZ * 0.9) * (config.driftAmpZ * 0.35);

    const x = config.basePosition[0] + dx;
    // Protección estricta sobre el agua: Y nunca baja de +0.22m sobre la superficie
    const y = Math.max(0.22, config.basePosition[1] + dy);
    const z = config.basePosition[2] + dz;

    groupRef.current.position.set(x, y, z);

    // 2. Orientación orgánica según la dirección instantánea del vuelo
    const vx =
      config.driftSpeedX * Math.cos(t * config.driftSpeedX + config.phaseX) * config.driftAmpX;
    const vz =
      -config.driftSpeedZ * Math.sin(t * config.driftSpeedZ + config.phaseZ) * config.driftAmpZ;
    const yaw = Math.atan2(vx, vz);
    groupRef.current.rotation.y = yaw;
    groupRef.current.rotation.x = -dy * 0.6;
    groupRef.current.rotation.z = Math.sin(t * 2.1 + config.phaseX) * 0.12;

    // 3. Parpadeo bioluminiscente orgánico:
    // "brilla → disminuye → casi desaparece → vuelve a brillar"
    const wave1 = Math.sin(t * config.pulseSpeed + config.pulsePhase);
    const wave2 = Math.sin(t * (config.pulseSpeed * 0.47) + config.pulsePhase * 1.6);
    const rawPulse = Math.max(0, (wave1 * 0.72 + wave2 * 0.28 + 0.25) / 1.25);
    const smoothBrightness =
      config.minBrightness +
      Math.pow(rawPulse, 2.3) * (config.maxBrightness - config.minBrightness);

    // Aplicar intensidad al abdomen y al sprite de brillo
    if (abdomenRef.current) {
      const abdomenScale = 0.9 + smoothBrightness * 0.35;
      abdomenRef.current.scale.set(
        0.038 * abdomenScale,
        0.032 * abdomenScale,
        0.055 * abdomenScale
      );
    }

    if (glowSpriteRef.current) {
      spriteMaterial.opacity = Math.max(0.04, smoothBrightness * 0.92);
      const spriteScale = 0.16 + smoothBrightness * 0.22;
      glowSpriteRef.current.scale.set(spriteScale, spriteScale, 1);
    }

    // 4. Micro-aleteo de alas translúcidas (vibración rápida ~34 Hz)
    const wingFlutter = Math.sin(t * 34.0 + config.phaseY) * 0.42;
    if (leftWingRef.current) {
      leftWingRef.current.rotation.z = 0.28 + wingFlutter;
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.z = -0.28 - wingFlutter;
    }
  });

  return (
    <group
      ref={groupRef}
      name={`firefly-${config.id}`}
      position={config.basePosition}
      scale={[config.scale, config.scale, config.scale]}
    >
      {/* 1. Cabeza y tórax oscuro del insecto (muy pequeño y discreto) */}
      <mesh
        geometry={headGeo}
        material={bodyMaterial}
        position={[0, 0.005, 0.022]}
        scale={[0.022, 0.018, 0.026]}
        castShadow={false}
        receiveShadow={false}
      />

      {/* 2. Abdomen bioluminiscente (órgano fotóforo brillante) */}
      <mesh
        ref={abdomenRef}
        geometry={abdomenGeo}
        material={abdomenMaterial}
        position={[0, 0, -0.018]}
        scale={[0.038, 0.032, 0.055]}
        castShadow={false}
        receiveShadow={false}
      />

      {/* 3. Alas microscópicas translúcidas */}
      <mesh
        ref={leftWingRef}
        geometry={wingGeo}
        material={wingMaterial}
        position={[-0.018, 0.018, 0.002]}
        rotation={[0.15, 0.2, 0.28]}
        scale={[0.042, 0.022, 1]}
      />
      <mesh
        ref={rightWingRef}
        geometry={wingGeo}
        material={wingMaterial}
        position={[0.018, 0.018, 0.002]}
        rotation={[0.15, -0.2, -0.28]}
        scale={[0.042, 0.022, 1]}
      />

      {/* 4. Resplandor / Halo luminoso suave (glow sprite aditivo) */}
      <sprite
        ref={glowSpriteRef}
        material={spriteMaterial}
        position={[0, 0, -0.018]}
        scale={[0.26, 0.26, 1]}
      />
    </group>
  );
}

/**
 * COMPONENTE PRINCIPAL FIREFLIES
 * Renderiza exactamente 10 luciérnagas individuales con recursos compartidos
 */
export function Fireflies() {
  // Textura y geometrías compartidas para máxima eficiencia
  const glowTexture = useMemo(() => createFireflyGlowTexture(), []);
  const headGeo = useMemo(() => new THREE.SphereGeometry(1, 8, 8), []);
  const abdomenGeo = useMemo(() => new THREE.SphereGeometry(1, 10, 10), []);
  const wingGeo = useMemo(() => new THREE.PlaneGeometry(1, 1), []);

  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1a1612',
        roughness: 0.9,
        metalness: 0.1,
      }),
    []
  );

  const wingMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#e2edee',
        transparent: true,
        opacity: 0.42,
        roughness: 0.3,
        side: THREE.DoubleSide,
      }),
    []
  );

  // Limpieza de recursos al desmontar
  useEffect(() => {
    return () => {
      glowTexture.dispose();
      headGeo.dispose();
      abdomenGeo.dispose();
      wingGeo.dispose();
      bodyMaterial.dispose();
      wingMaterial.dispose();
    };
  }, [glowTexture, headGeo, abdomenGeo, wingGeo, bodyMaterial, wingMaterial]);

  return (
    <group name="fireflies-system">
      {FIREFLIES_DATA.map((firefly) => (
        <SingleFirefly
          key={firefly.id}
          config={firefly}
          glowTexture={glowTexture}
          headGeo={headGeo}
          abdomenGeo={abdomenGeo}
          wingGeo={wingGeo}
          bodyMaterial={bodyMaterial}
          wingMaterial={wingMaterial}
        />
      ))}
    </group>
  );
}

export default Fireflies;
