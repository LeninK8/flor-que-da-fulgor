/**
 * CONFIGURACIÓN CENTRALIZADA DE LA FLOR DE 6 PÉTALOS
 * 
 * Basada en las especificaciones del usuario:
 * FLOWER_CONFIG = {
 *   petalCount: 6,
 *   radialSpacing: 60,
 *   scaleVariation: 0.03,
 *   rotationVariation: 0.03,
 *   elevationVariation: 0.04
 * }
 */

import * as THREE from 'three';
import { PETAL_CONFIG } from './petalConfig';

export interface FlowerConfig {
  petalCount: number; // Exactamente 6
  radialSpacing: number; // 60 grados (360° / 6)
  scaleVariation: number; // 0.03
  rotationVariation: number; // 0.03
  elevationVariation: number; // 0.04

  // Inclinación intermedia de apertura (hacia afuera y hacia arriba, ~39° respecto a vertical)
  openTilt: number;

  // Radio del centro común (deja el centro visible y permite solapamiento suave)
  centerRadius: number;

  // Anclaje en la cúspide del tallo
  basePosition: [number, number, number];

  // Tangente del tallo en la cúspide (continuación de la curvatura orgánica)
  baseRotation: [number, number, number];

  // Escala base de las instancias del Petal Master
  baseScale: number;

  // Rotación azimutal global
  azimuthOffset: number;
}

export const FLOWER_CONFIG: FlowerConfig = {
  petalCount: 6,
  radialSpacing: 60,
  scaleVariation: 0.03,
  rotationVariation: 0.03,
  elevationVariation: 0.04,

  // Inclinación hacia afuera en arco ∩: 1.15 rad (~66°). Los pétalos nacen en el centro/tallo,
  // se arquean hacia arriba y proyectan sus puntas hacia afuera y abajo (forma ∩).
  openTilt: 1.15,

  // Radio basal: 0.065 unidades. Permite que las bases se toquen suavemente sin colisionar
  // y deja el espacio central visible para la futura estructura púrpura/pistilo.
  centerRadius: 0.065,

  // Cúspide del tallo (disco apical: x: 0.231, y: 3.012, z: 0.042)
  basePosition: [0.231, 3.012, 0.042],

  // Continuación suave de la tangente del tallo
  baseRotation: [0.133, 0.0, 0.091],

  // Escala 1:1 del Petal Master aprobado
  baseScale: 1.0,

  // Orientación azimutal inicial
  azimuthOffset: 0.0,
};

/**
 * Variaciones sutiles deterministas para romper la rigidez matemática
 * de una estrella geométrica manteniendo armonía orgánica natural.
 * Ahora calibrada para exactamente 6 pétalos (360° / 6 = 60°).
 */
export interface PetalOrganicOffset {
  azimuthVar: number;
  tiltVar: number;
  elevVar: number;
  scaleVar: number;
  rollVar: number;
}

export const DETERMINISTIC_ORGANIC_OFFSETS: PetalOrganicOffset[] = [
  { azimuthVar:  0.000, tiltVar:  0.015, elevVar:  0.000, scaleVar:  0.000, rollVar:  0.006 },
  { azimuthVar:  0.020, tiltVar: -0.016, elevVar:  0.010, scaleVar: -0.012, rollVar: -0.008 },
  { azimuthVar: -0.016, tiltVar:  0.018, elevVar: -0.008, scaleVar:  0.015, rollVar:  0.010 },
  { azimuthVar:  0.018, tiltVar: -0.010, elevVar:  0.014, scaleVar: -0.010, rollVar: -0.006 },
  { azimuthVar: -0.020, tiltVar:  0.016, elevVar: -0.012, scaleVar:  0.012, rollVar:  0.012 },
  { azimuthVar:  0.015, tiltVar: -0.014, elevVar:  0.008, scaleVar: -0.008, rollVar: -0.010 },
];

/**
 * Calcula el offset de pivote para que la base del Petal Master (u=0)
 * quede exactamente en el punto de inserción (0, 0, 0) de cada pétalo.
 */
export function getPetalBasePivotOffset(): [number, number, number] {
  const curveSign = PETAL_CONFIG.invertCurvature ? -1 : 1;
  const baseOffsetZ = (0.4 * PETAL_CONFIG.cupTransverse + 1.6 * PETAL_CONFIG.veinRelief) * curveSign;
  const baseYOffset = 0.46 * PETAL_CONFIG.length;
  return [0, baseYOffset, -baseOffsetZ];
}

/**
 * Calcula las transformaciones de cada uno de los 6 pétalos.
 */
export function getFlowerPetalTransforms(config: FlowerConfig) {
  const pivotOffset = getPetalBasePivotOffset();
  const petals = [];

  for (let i = 0; i < config.petalCount; i++) {
    const offset = DETERMINISTIC_ORGANIC_OFFSETS[i % DETERMINISTIC_ORGANIC_OFFSETS.length];
    
    // Ángulo radial base: 0°, 60°, 120°, 180°, 240°, 300° + variación orgánica
    const baseTheta = (i * config.radialSpacing * Math.PI) / 180 + config.azimuthOffset;
    const azimuth = baseTheta + offset.azimuthVar * config.rotationVariation * 10;

    // Inclinación hacia afuera (pitch) + variación
    const tilt = config.openTilt + offset.tiltVar;

    // Elevación sutil vertical respecto al disco central
    const elevation = offset.elevVar * config.elevationVariation * 20;

    // Escala del pétalo con variación orgánica mínima
    const scale = config.baseScale * (1 + offset.scaleVar * config.scaleVariation * 20);

    // Balanceo lateral (roll) sutil
    const roll = offset.rollVar;

    petals.push({
      index: i,
      azimuth,
      tilt,
      elevation,
      scale,
      roll,
      pivotOffset,
    });
  }

  return {
    basePosition: config.basePosition,
    baseRotation: new THREE.Euler(
      config.baseRotation[0],
      config.baseRotation[1],
      config.baseRotation[2],
      'YXZ'
    ),
    petals,
  };
}
