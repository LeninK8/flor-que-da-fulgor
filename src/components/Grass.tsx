import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GRASS_CONFIG, getMoundSurface } from '../config/grassConfig';

interface TuftLocation {
  x: number;
  z: number;
  y: number;
  normal: THREE.Vector3;
  scale: number;
  rotationY: number;
  colorVariation: number;
}

export function Grass() {
  const meshRef = useRef<THREE.Mesh>(null);

  // 1. Generar ubicaciones orgánicas para los mechones de pasto
  const { geometry, tuftCount } = useMemo(() => {
    const locations: TuftLocation[] = [];
    const targetCount = GRASS_CONFIG.tuftCount;

    // Generar candidatos con distribución orgánica (más densidad en meseta y pendientes suaves, con claros de tierra)
    let attempts = 0;
    const maxAttempts = 8000;

    while (locations.length < targetCount && attempts < maxAttempts) {
      attempts++;
      // Muestreo polar ponderado hacia el interior pero extendido a laderas
      const r = Math.pow(Math.random(), 0.65) * 2.3; // radio hasta 2.3
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      // Dejar un pequeño espacio en el centro para el futuro tallo (r < 0.28)
      if (r < 0.28) continue;

      const { y, normal } = getMoundSurface(x, z);

      // Solo colocar sobre tierra firme (y > 0.06 sobre el agua)
      if (y <= 0.06) continue;

      // Función de ruido procedural para crear agrupaciones naturales y claros de tierra expuesta
      const densityPattern =
        Math.sin(x * 2.2 + 0.4) * Math.cos(z * 2.0 - 0.6) * 0.5 +
        Math.cos(x * 3.8 + z * 3.5) * 0.35 +
        Math.sin(angle * 3.0) * 0.15;

      // Aceptar según patrón de densidad para evitar apariencia de césped artificial uniforme
      const threshold = y > 0.4 ? -0.35 : -0.1; // Más denso arriba, más disperso en las laderas bajas
      if (densityPattern < threshold && Math.random() > 0.25) {
        continue;
      }

      locations.push({
        x,
        z,
        y,
        normal,
        scale: 0.75 + Math.random() * 0.5,
        rotationY: Math.random() * Math.PI * 2,
        colorVariation: Math.random(),
      });
    }

    // 2. Construir la geometría 3D de todas las briznas de pasto
    const vertices: number[] = [];
    const normals: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const cRoot = new THREE.Color(GRASS_CONFIG.palette.rootColor);
    const cMid = new THREE.Color(GRASS_CONFIG.palette.midGreen);
    const cLight = new THREE.Color(GRASS_CONFIG.palette.lightGreen);
    const cOlive = new THREE.Color(GRASS_CONFIG.palette.oliveGreen);
    const cGolden = new THREE.Color(GRASS_CONFIG.palette.goldenTip);

    let vertexOffset = 0;

    locations.forEach((tuft) => {
      // Cantidad de briznas por mechón (4 a 7 briznas)
      const bladeCount =
        GRASS_CONFIG.bladesPerTuft.min +
        Math.floor(
          Math.random() *
            (GRASS_CONFIG.bladesPerTuft.max - GRASS_CONFIG.bladesPerTuft.min + 1)
        );

      // Color base de este mechón específico (variación sutil)
      const tuftMidColor = cMid.clone().lerp(cOlive, tuft.colorVariation * 0.7);
      const tuftTipColor = cLight.clone().lerp(cGolden, tuft.colorVariation * 0.6);

      for (let b = 0; b < bladeCount; b++) {
        // Ángulo de la brizna alrededor del centro del mechón
        const bladeAngle =
          (b / bladeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const bladeTilt = 0.15 + Math.random() * GRASS_CONFIG.maxTiltAngle;

        // Altura y anchura de la brizna
        const bladeH =
          (GRASS_CONFIG.bladeHeightMin +
            Math.random() *
              (GRASS_CONFIG.bladeHeightMax - GRASS_CONFIG.bladeHeightMin)) *
          tuft.scale;

        const wBase = GRASS_CONFIG.bladeWidthBase * tuft.scale;
        const wTip = GRASS_CONFIG.bladeWidthTip * tuft.scale;

        // Vector director horizontal perpendicular a la brizna para darle anchura
        const perpX = Math.cos(bladeAngle + Math.PI / 2);
        const perpZ = Math.sin(bladeAngle + Math.PI / 2);

        // Vector de inclinación radial hacia afuera
        const outX = Math.cos(bladeAngle);
        const outZ = Math.sin(bladeAngle);

        // Pequeño desplazamiento de la raíz respecto al centro del mechón (1 a 3 cm)
        const rootOffsetDist = 0.015 + Math.random() * 0.02;
        const rootX = tuft.x + outX * rootOffsetDist;
        const rootZ = tuft.z + outZ * rootOffsetDist;
        const rootY = tuft.y - 0.005; // Ligeramente enclavado en la tierra para que nazca de ella

        // 3 segmentos por brizna (Base, Medio, Punta) para curvatura suave
        const segments = 3;
        for (let s = 0; s <= segments; s++) {
          const t = s / segments;

          // Ancho interpolado (se estrecha hacia la punta)
          const halfW = THREE.MathUtils.lerp(wBase * 0.5, wTip * 0.5, t);

          // Curvatura de la brizna hacia afuera y gravedad suave
          const curveOut = Math.pow(t, 1.4) * Math.sin(bladeTilt) * bladeH * 1.1;
          const heightY = Math.cos(bladeTilt) * bladeH * t - Math.pow(t, 2.2) * 0.03;

          const cx = rootX + outX * curveOut;
          const cy = rootY + heightY;
          const cz = rootZ + outZ * curveOut;

          // Vértice izquierdo y derecho
          const vLeftX = cx - perpX * halfW;
          const vLeftY = cy;
          const vLeftZ = cz - perpZ * halfW;

          const vRightX = cx + perpX * halfW;
          const vRightY = cy;
          const vRightZ = cz + perpZ * halfW;

          vertices.push(vLeftX, vLeftY, vLeftZ);
          vertices.push(vRightX, vRightY, vRightZ);

          // Normal orientada hacia arriba y curvatura
          normals.push(tuft.normal.x, tuft.normal.y, tuft.normal.z);
          normals.push(tuft.normal.x, tuft.normal.y, tuft.normal.z);

          // Gradiente de color realista por vértice (Raíz oscura -> Verde medio -> Punta iluminada)
          const vertexColor = new THREE.Color();
          if (t < 0.25) {
            const blend = t / 0.25;
            vertexColor.copy(cRoot).lerp(tuftMidColor, blend);
          } else if (t < 0.75) {
            const blend = (t - 0.25) / 0.5;
            vertexColor.copy(tuftMidColor).lerp(tuftTipColor, blend);
          } else {
            const blend = (t - 0.75) / 0.25;
            vertexColor.copy(tuftTipColor).lerp(cGolden, blend * 0.4);
          }

          colors.push(vertexColor.r, vertexColor.g, vertexColor.b);
          colors.push(vertexColor.r, vertexColor.g, vertexColor.b);
        }

        // Triángulos de los segmentos de la brizna
        for (let s = 0; s < segments; s++) {
          const baseIdx = vertexOffset + s * 2;
          const i0 = baseIdx;
          const i1 = baseIdx + 1;
          const i2 = baseIdx + 2;
          const i3 = baseIdx + 3;

          indices.push(i0, i2, i1);
          indices.push(i1, i2, i3);
        }

        vertexOffset += (segments + 1) * 2;
      }
    });

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    return { geometry: geom, tuftCount: locations.length };
  }, []);

  // Brisa suave en tiempo real que hace ondular las puntas del pasto suavemente
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime() * GRASS_CONFIG.windSpeed;
    const pos = meshRef.current.geometry.attributes.position;
    if (!pos) return;

    // Leve oscilación del conjunto en el eje horizontal para simular viento suave
    meshRef.current.rotation.y = Math.sin(time * 0.3) * 0.008;
  });

  return (
    <group name="natural-grass-system">
      <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          vertexColors={true}
          roughness={GRASS_CONFIG.roughness}
          metalness={GRASS_CONFIG.metalness}
          side={THREE.DoubleSide}
          shadowSide={THREE.DoubleSide}
          flatShading={false}
        />
      </mesh>
    </group>
  );
}
