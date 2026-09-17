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
import { PetalConfig, PETAL_CONFIG } from './petalConfig';

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

  // Inclinación hacia afuera en arco: -1.08 rad, calibrada exactamente con las nuevas indicaciones
  openTilt: -1.08,

  // Radio basal: 0.038 unidades. Acerca las bases entre sí alrededor del centro para cerrar
  // los huecos centrales y permitir un ligero y elegante solapamiento orgánico entre pétalos vecinos.
  centerRadius: 0.038,

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

export interface IndividualPetalOverride {
  tiltOffset?: number; // Desfase angular de inclinación (-1.5 a +1.5 rad)
  azimuthOffset?: number; // Giro 360° individual (-Math.PI a +Math.PI o 0 a 2π)
  rollOffset?: number; // Balanceo lateral (-1.0 a +1.0 rad)
  elevationOffset?: number; // Desplazamiento vertical (-0.2 a +0.2)
  radiusOffset?: number; // Desplazamiento radial respecto a centerRadius (-0.03 a +0.1)
  scaleMultiplier?: number; // Multiplicador de escala individual (0.7 a 1.4)
  customConfig?: Partial<PetalConfig>; // Colores o parámetros PBR específicos de este pétalo
}

export interface PetalTransformData {
  index: number;
  azimuth: number;
  tilt: number;
  elevation: number;
  scale: number;
  roll: number;
  euler: THREE.Euler;
  centerRadius: number;
  pivotOffset: [number, number, number];
  petalConfig: PetalConfig;
}

/**
 * Calcula el offset de pivote para que la base del Petal Master (u=0)
 * quede exactamente en el punto de inserción (0, 0, 0) de cada pétalo.
 */
export function getPetalBasePivotOffset(petalConfig: PetalConfig = PETAL_CONFIG): [number, number, number] {
  const curveSign = petalConfig.invertCurvature ? -1 : 1;
  const baseOffsetZ = (0.4 * petalConfig.cupTransverse + 1.6 * petalConfig.veinRelief) * curveSign;
  const baseYOffset = 0.46 * petalConfig.length;
  return [0, baseYOffset, -baseOffsetZ];
}

/**
 * Calcula las transformaciones de cada uno de los 6 pétalos,
 * integrando variaciones orgánicas y personalización 360° individual por pétalo.
 */
export function getFlowerPetalTransforms(
  config: FlowerConfig,
  petalConfig: PetalConfig = PETAL_CONFIG,
  individualOverrides?: Record<number, IndividualPetalOverride>
) {
  const pivotOffset = getPetalBasePivotOffset(petalConfig);
  const petals: PetalTransformData[] = [];
  const baseTilt = petalConfig.tiltAngle !== undefined ? petalConfig.tiltAngle : config.openTilt;
  const globalAzimuth = (petalConfig.azimuthAngle ?? 0);
  const globalRoll = (petalConfig.rollAngle ?? 0);

  for (let i = 0; i < config.petalCount; i++) {
    const offset = DETERMINISTIC_ORGANIC_OFFSETS[i % DETERMINISTIC_ORGANIC_OFFSETS.length];
    const override = individualOverrides?.[i];
    
    // Ángulo radial base: 0°, 60°, 120°, 180°, 240°, 300° + variación orgánica + desfase global + override individual 360°
    const baseTheta = (i * config.radialSpacing * Math.PI) / 180 + config.azimuthOffset + globalAzimuth;
    const azimuth = baseTheta + offset.azimuthVar * config.rotationVariation * 10 + (override?.azimuthOffset ?? 0);

    // Inclinación hacia afuera (pitch) + variación + override individual
    const tilt = baseTilt + offset.tiltVar + (override?.tiltOffset ?? 0);

    // Elevación sutil vertical respecto al disco central
    const elevation = offset.elevVar * config.elevationVariation * 20 + (override?.elevationOffset ?? 0);

    // Escala del pétalo con variación orgánica y override individual
    const scale = config.baseScale * (1 + offset.scaleVar * config.scaleVariation * 20) * (override?.scaleMultiplier ?? 1.0);

    // Balanceo lateral (roll) sutil + override individual
    const roll = offset.rollVar + globalRoll + (override?.rollOffset ?? 0);

    // Radio central individual para calibrar la distancia al tallo
    const centerRadius = Math.max(0.005, config.centerRadius + (override?.radiusOffset ?? 0));

    // Rotación 'YXZ' para que la curvatura descienda en cascada paraguas idéntica a StemPetalInstance
    const euler = new THREE.Euler(tilt, Math.PI, roll, 'YXZ');

    // Configuración efectiva de pétalo (con colores/propiedades personalizadas si existen)
    const effectivePetalConfig: PetalConfig = override?.customConfig
      ? { ...petalConfig, ...override.customConfig }
      : petalConfig;

    petals.push({
      index: i,
      azimuth,
      tilt,
      elevation,
      scale,
      roll,
      euler,
      centerRadius,
      pivotOffset,
      petalConfig: effectivePetalConfig,
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
