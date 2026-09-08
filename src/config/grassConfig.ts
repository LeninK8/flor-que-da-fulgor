import * as THREE from 'three';
import { ISLAND_CONFIG } from './islandConfig';

/**
 * Calcula la altura exacta y la normal de la superficie del montículo
 * para cualquier punto (x, z), garantizando que las raíces del pasto
 * nazcan exactamente del terreno sin flotar ni quedar enterradas.
 */
export function getMoundSurface(x: number, z: number): { y: number; normal: THREE.Vector3 } {
  const {
    baseRadius,
    height,
    submergedDepth,
    irregularity,
    asymmetry,
    surfaceSoftness,
  } = ISLAND_CONFIG;

  const theta = Math.atan2(z, x);
  const dist = Math.hypot(x, z);

  const radiusFactor =
    1.0 +
    irregularity *
      (Math.sin(theta + 0.5) * 0.45 +
        Math.cos(theta * 2.0 - 0.7) * 0.35 +
        Math.sin(theta * 3.0 + 1.2) * 0.2);

  const u = dist / (baseRadius * radiusFactor);
  const uPlateau = 0.36;
  const uWater = 0.78;

  let profileY = 0;
  if (u <= uPlateau) {
    const t = u / uPlateau;
    profileY = height * (1.0 - 0.1 * t * t);
  } else if (u <= uWater) {
    const t = (u - uPlateau) / (uWater - uPlateau);
    const smoothDrop = 1.0 - (3 * t * t - 2 * t * t * t);
    const plateauEdgeY = height * 0.9;
    profileY = plateauEdgeY * smoothDrop;
  } else {
    const t = (u - uWater) / (1.0 - uWater);
    const smoothSubmerge = 3 * t * t - 2 * t * t * t;
    profileY = -submergedDepth * smoothSubmerge;
  }

  const falloff = Math.max(0, 1.0 - u * 1.1);
  const asym =
    asymmetry *
    (Math.sin(theta - 0.4) * 0.7 + Math.cos(theta * 2.0) * 0.3) *
    falloff;

  const microErosion =
    surfaceSoftness *
    (Math.sin(x * 1.3) * Math.cos(z * 1.2) * 0.6 +
      Math.cos(x * 2.0 + z * 1.8) * 0.4) *
    falloff;

  const y = profileY + asym + microErosion;

  // Cálculo aproximado de la normal de la superficie por diferencias finitas
  const eps = 0.02;
  const hx = getRawHeight(x + eps, z) - getRawHeight(x - eps, z);
  const hz = getRawHeight(x, z + eps) - getRawHeight(x, z - eps);
  const normal = new THREE.Vector3(-hx / (2 * eps), 1.0, -hz / (2 * eps)).normalize();

  return { y, normal };
}

function getRawHeight(x: number, z: number): number {
  const {
    baseRadius,
    height,
    submergedDepth,
    irregularity,
    asymmetry,
    surfaceSoftness,
  } = ISLAND_CONFIG;

  const theta = Math.atan2(z, x);
  const dist = Math.hypot(x, z);

  const radiusFactor =
    1.0 +
    irregularity *
      (Math.sin(theta + 0.5) * 0.45 +
        Math.cos(theta * 2.0 - 0.7) * 0.35 +
        Math.sin(theta * 3.0 + 1.2) * 0.2);

  const u = dist / (baseRadius * radiusFactor);
  const uPlateau = 0.36;
  const uWater = 0.78;

  let profileY = 0;
  if (u <= uPlateau) {
    const t = u / uPlateau;
    profileY = height * (1.0 - 0.1 * t * t);
  } else if (u <= uWater) {
    const t = (u - uPlateau) / (uWater - uPlateau);
    const smoothDrop = 1.0 - (3 * t * t - 2 * t * t * t);
    const plateauEdgeY = height * 0.9;
    profileY = plateauEdgeY * smoothDrop;
  } else {
    const t = (u - uWater) / (1.0 - uWater);
    const smoothSubmerge = 3 * t * t - 2 * t * t * t;
    profileY = -submergedDepth * smoothSubmerge;
  }

  const falloff = Math.max(0, 1.0 - u * 1.1);
  const asym =
    asymmetry *
    (Math.sin(theta - 0.4) * 0.7 + Math.cos(theta * 2.0) * 0.3) *
    falloff;

  const microErosion =
    surfaceSoftness *
    (Math.sin(x * 1.3) * Math.cos(z * 1.2) * 0.6 +
      Math.cos(x * 2.0 + z * 1.8) * 0.4) *
    falloff;

  return profileY + asym + microErosion;
}

export const GRASS_CONFIG = {
  // Cantidad de mechones distribuidos orgánicamente (duplicada x2 para mayor frondosidad)
  tuftCount: 440,

  // Dimensiones de briznas individuales
  bladeHeightMin: 0.12,
  bladeHeightMax: 0.24,
  bladeWidthBase: 0.024,
  bladeWidthTip: 0.004,
  bladesPerTuft: { min: 4, max: 7 },

  // Curvatura e inclinación
  maxTiltAngle: 0.38, // radianes de inclinación hacia el exterior
  curlAmount: 0.06,

  // Brisa suave en tiempo real
  windSpeed: 1.4,
  windStrength: 0.04,

  // Paleta de verdes naturales (sin fluorescencia, tonos botánicos reales)
  palette: {
    rootColor: '#1d2a17',      // Base oscura fundida con la tierra
    midGreen: '#3e6328',       // Verde pradera natural medio
    lightGreen: '#5b8539',     // Verde hoja iluminada
    oliveGreen: '#4d6930',     // Verde oliva
    goldenTip: '#739641',      // Puntas jóvenes tiernas
  },

  roughness: 0.72,
  metalness: 0.04,
};
