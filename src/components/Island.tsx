import { useMemo } from 'react';
import * as THREE from 'three';
import { ISLAND_CONFIG } from '../config/islandConfig';

export function Island() {
  const { geometry } = useMemo(() => {
    const {
      baseRadius,
      height,
      submergedDepth,
      irregularity,
      asymmetry,
      surfaceSoftness,
      radialSegments,
      ringSegments,
      colors,
    } = ISLAND_CONFIG;

    const vertices: number[] = [];
    const colorList: number[] = [];
    const indices: number[] = [];

    const cSubmerged = new THREE.Color(colors.submergedSoil);
    const cWaterline = new THREE.Color(colors.waterlineSoil);
    const cSlope = new THREE.Color(colors.slopeSoil);
    const cPlateau = new THREE.Color(colors.plateauSoil);
    const cWarmEarth = new THREE.Color(colors.warmEarth);

    // uWater marca el punto radial (0 a 1) donde la tierra corta el nivel del agua (y = 0)
    // De 0 a 0.36: Meseta superior amplia y baja
    // De 0.36 a 0.78: Caída progresiva y suave hacia la orilla
    // De 0.78 a 1.0: Falda sumergida que se extiende bajo el agua
    const uPlateau = 0.36;
    const uWater = 0.78;

    for (let rIndex = 0; rIndex <= ringSegments; rIndex++) {
      const u = rIndex / ringSegments; // 0 en el centro, 1 en el borde exterior sumergido

      // Perfil vertical continuo C1 (sin picos, sin pirámides, meseta ancha y laderas suaves)
      let profileY = 0;

      if (u <= uPlateau) {
        // 1. Meseta central amplia y suavemente abovedada
        const t = u / uPlateau;
        profileY = height * (1.0 - 0.10 * t * t);
      } else if (u <= uWater) {
        // 2. Pendiente lateral suave con curvatura Hermite
        const t = (u - uPlateau) / (uWater - uPlateau);
        const smoothDrop = 1.0 - (3 * t * t - 2 * t * t * t);
        const plateauEdgeY = height * 0.90;
        profileY = plateauEdgeY * smoothDrop;
      } else {
        // 3. Falda extendida sumergida bajo el agua
        const t = (u - uWater) / (1.0 - uWater);
        const smoothSubmerge = 3 * t * t - 2 * t * t * t;
        profileY = -submergedDepth * smoothSubmerge;
      }

      for (let aIndex = 0; aIndex < radialSegments; aIndex++) {
        const theta = (aIndex / radialSegments) * Math.PI * 2;

        // Modulación suave de radio para silueta orgánica ancha y asimétrica desde arriba
        const radiusFactor =
          1.0 +
          irregularity *
            (Math.sin(theta + 0.5) * 0.45 +
              Math.cos(theta * 2.0 - 0.7) * 0.35 +
              Math.sin(theta * 3.0 + 1.2) * 0.2);

        const currentR = u * baseRadius * radiusFactor;
        const x = Math.cos(theta) * currentR;
        const z = Math.sin(theta) * currentR;

        // Suave desnivel asimétrico (un flanco milimétricamente más alto que el otro)
        const falloff = Math.max(0, 1.0 - u * 1.1);
        const asym =
          asymmetry *
          (Math.sin(theta - 0.4) * 0.7 + Math.cos(theta * 2.0) * 0.3) *
          falloff;

        // Micro-suavizado orgánico de la tierra (sin picos)
        const microErosion =
          surfaceSoftness *
          (Math.sin(x * 1.3) * Math.cos(z * 1.2) * 0.6 +
            Math.cos(x * 2.0 + z * 1.8) * 0.4) *
          falloff;

        const y = profileY + asym + microErosion;

        vertices.push(x, y, z);

        // Coloración por vértice en tonos de tierra pura y natural
        const vertexColor = new THREE.Color();

        if (y < -0.04) {
          // Zona sumergida (tierra oscura saturada bajo el agua)
          const tSub = THREE.MathUtils.clamp((-y - 0.04) / submergedDepth, 0, 1);
          vertexColor.copy(cWaterline).lerp(cSubmerged, tSub);
        } else if (y < 0.10) {
          // Línea de orilla húmeda en contacto con el agua
          const tShore = THREE.MathUtils.clamp((y + 0.04) / 0.14, 0, 1);
          vertexColor.copy(cWaterline).lerp(cSlope, tShore);
        } else if (y < 0.38) {
          // Laderas de pendiente suave
          const tSlope = THREE.MathUtils.clamp((y - 0.10) / 0.28, 0, 1);
          vertexColor.copy(cSlope).lerp(cPlateau, tSlope);
        } else {
          // Meseta amplia superior
          const tPlat = THREE.MathUtils.clamp((y - 0.38) / 0.24, 0, 1);
          vertexColor.copy(cPlateau).lerp(cWarmEarth, tPlat);
        }

        colorList.push(vertexColor.r, vertexColor.g, vertexColor.b);
      }
    }

    // Generar índices triangulares de la superficie
    for (let rIndex = 0; rIndex < ringSegments; rIndex++) {
      for (let aIndex = 0; aIndex < radialSegments; aIndex++) {
        const nextA = (aIndex + 1) % radialSegments;

        const i0 = rIndex * radialSegments + aIndex;
        const i1 = rIndex * radialSegments + nextA;
        const i2 = (rIndex + 1) * radialSegments + aIndex;
        const i3 = (rIndex + 1) * radialSegments + nextA;

        indices.push(i0, i2, i1);
        indices.push(i1, i2, i3);
      }
    }

    // Tapa inferior sumergida para sellar la base bajo el agua
    const bottomCenterIndex = vertices.length / 3;
    vertices.push(0, -submergedDepth * 1.1, 0);
    colorList.push(cSubmerged.r, cSubmerged.g, cSubmerged.b);

    const lastRingStart = ringSegments * radialSegments;
    for (let aIndex = 0; aIndex < radialSegments; aIndex++) {
      const nextA = (aIndex + 1) % radialSegments;
      const i0 = lastRingStart + aIndex;
      const i1 = lastRingStart + nextA;
      indices.push(i0, i1, bottomCenterIndex);
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colorList, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    return { geometry: geom };
  }, []);

  return (
    <group name="natural-low-mound" position={[0, 0, 0]}>
      {/* Montículo bajo y ancho con gran base y meseta central amplia */}
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          vertexColors={true}
          roughness={ISLAND_CONFIG.roughness}
          metalness={ISLAND_CONFIG.metalness}
          flatShading={false}
        />
      </mesh>
    </group>
  );
}
