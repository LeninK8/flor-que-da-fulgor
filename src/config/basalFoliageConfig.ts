import * as THREE from 'three';
import { createStemCurve, STEM_CONFIG } from './stemConfig';
import { LEAF_CONFIG } from './leafConfig';

export interface BasalLeafSpec {
  id: string;
  stemT: number;        // Altura de inserción en el tallo (0.05 a 0.14)
  azimuth: number;      // Ángulo radial en radianes alrededor del tallo
  pitch: number;        // Inclinación ascendente/hacia afuera
  roll: number;         // Alabeo de la lámina
  yawOffset: number;    // Desviación azimutal fina
  scale: number;        // Escala de la hoja (0.40 a 0.48)
}

export const BASAL_FOLIAGE_CONFIG = {
  leafCount: 6, // 5 a 7 hojas basales alrededor de la base
  baseScale: 0.45, // Ligeramente mayores que las hojas de las ramas superiores (~0.36)
};

/**
 * 6 Hojas basales maestras distribuidas orgánicamente en 360° alrededor
 * de donde el tallo emerge del montículo de tierra.
 * Presentan sutiles variaciones de altura, dirección, inclinación y escala,
 * evitando círculos matemáticos o coronas rígidas.
 */
export const DEFAULT_BASAL_LEAVES: BasalLeafSpec[] = [
  {
    id: 'basal-leaf-1',
    stemT: 0.06,
    azimuth: 0.28,
    pitch: 0.42,
    roll: 0.14,
    yawOffset: 0.05,
    scale: 0.46,
  },
  {
    id: 'basal-leaf-2',
    stemT: 0.09,
    azimuth: 1.34,
    pitch: 0.48,
    roll: -0.15,
    yawOffset: -0.04,
    scale: 0.44,
  },
  {
    id: 'basal-leaf-3',
    stemT: 0.05,
    azimuth: 2.46,
    pitch: 0.38,
    roll: 0.18,
    yawOffset: 0.06,
    scale: 0.48,
  },
  {
    id: 'basal-leaf-4',
    stemT: 0.11,
    azimuth: 3.56,
    pitch: 0.50,
    roll: -0.12,
    yawOffset: -0.05,
    scale: 0.42,
  },
  {
    id: 'basal-leaf-5',
    stemT: 0.07,
    azimuth: 4.68,
    pitch: 0.44,
    roll: 0.16,
    yawOffset: 0.04,
    scale: 0.47,
  },
  {
    id: 'basal-leaf-6',
    stemT: 0.13,
    azimuth: 5.76,
    pitch: 0.54,
    roll: -0.14,
    yawOffset: -0.03,
    scale: 0.43,
  },
];

/**
 * Calcula la matriz y vectores de transformación para colocar la hoja maestra en la base del tallo.
 */
export function computeBasalLeafTransform(
  spec: BasalLeafSpec,
  stemCurve: THREE.CatmullRomCurve3
) {
  const pt = stemCurve.getPointAt(spec.stemT);

  // Radio del tallo a la altura stemT
  const taperFactor = Math.pow(spec.stemT, STEM_CONFIG.taperExponent);
  const stemRadius = THREE.MathUtils.lerp(
    STEM_CONFIG.radiusBase,
    STEM_CONFIG.radiusTop,
    taperFactor
  );

  // Vector radial hacia afuera desde el eje del tallo
  const totalAzimuth = spec.azimuth + spec.yawOffset;
  const radialOut = new THREE.Vector3(
    Math.cos(totalAzimuth),
    0,
    Math.sin(totalAzimuth)
  ).normalize();

  // Inserción biológica sellada: la base de la hoja penetra ligeramente la corteza del tallo
  const attachPoint = pt
    .clone()
    .add(radialOut.clone().multiplyScalar(stemRadius * 0.70));

  // Dirección hacia adelante (crecimiento del pecíolo hacia la punta)
  const forward = new THREE.Vector3(
    radialOut.x * Math.cos(spec.pitch),
    Math.sin(spec.pitch),
    radialOut.z * Math.cos(spec.pitch)
  ).normalize();

  // Base ortonormal para la hoja (en su espacio local: +Z adelante, +Y haz superior, +X lateral)
  const worldUp = new THREE.Vector3(0, 1, 0);
  let right = new THREE.Vector3().crossVectors(worldUp, forward).normalize();
  if (right.lengthSq() < 0.001) {
    right = new THREE.Vector3(1, 0, 0);
  }
  const up = new THREE.Vector3().crossVectors(forward, right).normalize();

  // Alabeo orgánico de la lámina (roll alrededor del eje longitudinal de crecimiento)
  const rollQuat = new THREE.Quaternion().setFromAxisAngle(forward, spec.roll);
  const rolledRight = right.clone().applyQuaternion(rollQuat).normalize();
  const rolledUp = up.clone().applyQuaternion(rollQuat).normalize();

  const basisMat = new THREE.Matrix4().makeBasis(rolledRight, rolledUp, forward);
  const rotation = new THREE.Euler().setFromRotationMatrix(basisMat);

  return {
    position: [attachPoint.x, attachPoint.y, attachPoint.z] as [
      number,
      number,
      number
    ],
    rotation,
    scale: spec.scale,
  };
}
