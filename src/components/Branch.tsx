import { useMemo } from 'react';
import * as THREE from 'three';
import { BRANCH_CONFIG, createBranchCurve } from '../config/branchConfig';

export interface BranchProps {
  branchConfig?: Partial<typeof BRANCH_CONFIG>;
}

export function Branch({ branchConfig }: BranchProps = {}) {
  const { geometry } = useMemo(() => {
    const config = { ...BRANCH_CONFIG, ...branchConfig };
    const {
      segments,
      radialSegments,
      radiusBase,
      radiusTip,
      taperExponent,
      colors,
    } = config;

    const { curve } = createBranchCurve(config);
    const frames = curve.computeFrenetFrames(segments, false);
    const points = curve.getSpacedPoints(segments);

    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const colorList: number[] = [];
    const indices: number[] = [];

    const cJunction = new THREE.Color(colors.junctionColor);
    const cBase = new THREE.Color(colors.baseColor);
    const cMid = new THREE.Color(colors.midColor);
    const cTip = new THREE.Color(colors.tipColor);

    // Generar anillos transversales a lo largo de la ramita
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = points[i];
      const normal = frames.normals[i];
      const binormal = frames.binormals[i];

      // Ahusamiento continuo de base a punta
      const taperFactor = Math.pow(t, taperExponent);
      let r = THREE.MathUtils.lerp(radiusBase, radiusTip, taperFactor);

      // Ensanchamiento natural en el punto exacto de inserción (axila/collar de inserción)
      // para que la transición con la corteza del tallo sea suave y continua
      if (t < 0.15) {
        const collar = (1.0 - t / 0.15);
        r += radiusBase * 0.35 * Math.pow(collar, 1.8);
      }

      // Gradiente de color a lo largo de la ramita
      const vertexColor = new THREE.Color();
      if (t < 0.18) {
        const blend = t / 0.18;
        vertexColor.copy(cJunction).lerp(cBase, blend);
      } else if (t < 0.65) {
        const blend = (t - 0.18) / 0.47;
        vertexColor.copy(cBase).lerp(cMid, blend);
      } else {
        const blend = (t - 0.65) / 0.35;
        vertexColor.copy(cMid).lerp(cTip, blend);
      }

      for (let j = 0; j <= radialSegments; j++) {
        const theta = (j / radialSegments) * Math.PI * 2;
        const sin = Math.sin(theta);
        const cos = Math.cos(theta);

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

    // Caras triangulares del tubo de la ramita
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const a = i * (radialSegments + 1) + j;
        const b = (i + 1) * (radialSegments + 1) + j;
        const c = (i + 1) * (radialSegments + 1) + (j + 1);
        const d = i * (radialSegments + 1) + (j + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    // Cierre del extremo terminal de la ramita (preparado para recibir la futura hoja)
    const tipPoint = points[segments];
    const tipCenterIndex = vertices.length / 3;
    vertices.push(tipPoint.x, tipPoint.y, tipPoint.z);
    normals.push(frames.tangents[segments].x, frames.tangents[segments].y, frames.tangents[segments].z);
    uvs.push(0.5, 1.0);
    colorList.push(cTip.r, cTip.g, cTip.b);

    const tipRingStart = segments * (radialSegments + 1);
    for (let j = 0; j < radialSegments; j++) {
      indices.push(tipRingStart + j, tipCenterIndex, tipRingStart + j + 1);
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
    <group name="master-secondary-branch">
      {/* Ramita secundaria maestra con transición natural desde el tallo */}
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          vertexColors={true}
          roughness={BRANCH_CONFIG.roughness}
          metalness={BRANCH_CONFIG.metalness}
          flatShading={false}
        />
      </mesh>
    </group>
  );
}
