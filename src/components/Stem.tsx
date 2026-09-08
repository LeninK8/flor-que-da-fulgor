import { useMemo } from 'react';
import * as THREE from 'three';
import { STEM_CONFIG, createStemCurve } from '../config/stemConfig';

export function Stem() {
  const { geometry } = useMemo(() => {
    const {
      heightSegments,
      radialSegments,
      radiusBase,
      radiusTop,
      taperExponent,
      organicWiggle,
      colors,
    } = STEM_CONFIG;

    const curve = createStemCurve();

    // Obtener puntos y marcos de referencia (Frenet / Parallel transport) a lo largo de la curva
    const frames = curve.computeFrenetFrames(heightSegments, false);
    const points = curve.getSpacedPoints(heightSegments);

    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const colorList: number[] = [];
    const indices: number[] = [];

    const cBase = new THREE.Color(colors.baseColor);
    const cMid = new THREE.Color(colors.midColor);
    const cTop = new THREE.Color(colors.topColor);

    // Generar anillos transversales a lo largo de la curva
    for (let i = 0; i <= heightSegments; i++) {
      const t = i / heightSegments;
      const point = points[i];
      const normal = frames.normals[i];
      const binormal = frames.binormals[i];

      // Ahusamiento biológico progresivo (más grueso en la base, delgado arriba)
      const taperFactor = Math.pow(t, taperExponent);
      const currentRadius = THREE.MathUtils.lerp(radiusBase, radiusTop, taperFactor);

      // Micro-ondulación orgánica sutil para que no parezca un tubo industrial
      const wiggle =
        1.0 +
        Math.sin(t * Math.PI * 5 + 0.3) * organicWiggle * (1.0 - t * 0.4);

      const r = currentRadius * wiggle;

      // Color del tallo según altura relativa
      const vertexColor = new THREE.Color();
      if (t < 0.35) {
        const blend = t / 0.35;
        vertexColor.copy(cBase).lerp(cMid, blend);
      } else {
        const blend = (t - 0.35) / 0.65;
        vertexColor.copy(cMid).lerp(cTop, blend);
      }

      for (let j = 0; j <= radialSegments; j++) {
        const theta = (j / radialSegments) * Math.PI * 2;
        const sin = Math.sin(theta);
        const cos = Math.cos(theta);

        // Vector normal radial respecto al eje del tallo
        const nx = cos * normal.x + sin * binormal.x;
        const ny = cos * normal.y + sin * binormal.y;
        const nz = cos * normal.z + sin * binormal.z;

        const vx = point.x + r * nx;
        const vy = point.y + r * ny;
        const vz = point.z + r * nz;

        vertices.push(vx, vy, vz);
        normals.push(nx, ny, nz);
        uvs.push(j / radialSegments, t);
        colorList.push(vertexColor.r, vertexColor.g, vertexColor.b);
      }
    }

    // Caras triangulares del cuerpo del tallo
    for (let i = 0; i < heightSegments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const a = i * (radialSegments + 1) + j;
        const b = (i + 1) * (radialSegments + 1) + j;
        const c = (i + 1) * (radialSegments + 1) + (j + 1);
        const d = i * (radialSegments + 1) + (j + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    // Cierre limpio de la cúspide (preparado para recibir la futura flor)
    const topPoint = points[heightSegments];
    const topCenterIndex = vertices.length / 3;
    vertices.push(topPoint.x, topPoint.y, topPoint.z);
    normals.push(frames.tangents[heightSegments].x, frames.tangents[heightSegments].y, frames.tangents[heightSegments].z);
    uvs.push(0.5, 1.0);
    colorList.push(cTop.r, cTop.g, cTop.b);

    const topRingStart = heightSegments * (radialSegments + 1);
    for (let j = 0; j < radialSegments; j++) {
      indices.push(topRingStart + j, topCenterIndex, topRingStart + j + 1);
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colorList, 3));
    geom.setIndex(indices);

    return { geometry: geom };
  }, []);

  return (
    <group name="magic-flower-stem">
      {/* Tallo principal con curvatura elegante, ahusamiento biológico y arraigo natural */}
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          vertexColors={true}
          roughness={STEM_CONFIG.roughness}
          metalness={STEM_CONFIG.metalness}
          flatShading={false}
        />
      </mesh>
    </group>
  );
}
