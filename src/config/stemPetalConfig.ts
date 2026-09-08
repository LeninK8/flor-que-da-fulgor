import * as THREE from 'three';
import { PETAL_CONFIG } from './petalConfig';

/**
 * CONFIGURACIÓN DE LA INSTANCIA ÚNICA: TALLO + 1 PETAL MASTER
 *
 * Parámetros de transformación ajustables para la colocación precisa del Pétalo Maestro
 * en la cúspide del tallo aprobado, sin alterar la geometría interna del pétalo:
 * - petalPosition: posición tridimensional de la conexión en el extremo superior del tallo
 * - petalRotation: rotación base [rx, ry, rz] alineada con la tangente del tallo
 * - petalTilt: inclinación suave (pitch) que continúa la curvatura biológica hacia arriba
 * - petalRoll: balanceo lateral (roll)
 * - petalScale: escala de la instancia (1.0 = escala actual aprobada del Petal Master)
 */

export interface StemPetalConfig {
  petalPosition: [number, number, number];
  petalRotation: [number, number, number];
  petalTilt: number;
  petalRoll: number;
  petalScale: number;
}

export const STEM_PETAL_CONFIG: StemPetalConfig = {
  // Cúspide del tallo (punto final de la spline en x: 0.231, y: 3.015, z: 0.042)
  // Anclaje a y: 3.012 (sellado 0.003 unidades dentro del disco terminal para una unión biológica sólida)
  petalPosition: [0.231, 3.012, 0.042],

  // Tangente del tallo en la cúspide (rotación base alineada con la dirección de crecimiento)
  petalRotation: [0.133, 0.0, 0.091],

  // Inclinación hacia afuera en arco ∩ que continúa la curvatura biológica
  petalTilt: 1.15,

  // Balanceo lateral (roll)
  petalRoll: 0.0,

  // Escala de referencia 1:1 del Petal Master aprobado
  petalScale: 1.0,
};

/**
 * Calcula la transformación final (posición, rotación Euler y escala)
 * anclando el pétalo exactamente en su base de inserción para que no flote ni se desplace al rotar.
 */
export function getStemPetalTransform(config: StemPetalConfig) {
  const { petalPosition, petalRotation, petalTilt, petalRoll, petalScale } = config;

  // Rotación combinada: tangente base + inclinación en arco (pitch) + volteo vertical (Math.PI) + balanceo (roll)
  const euler = new THREE.Euler(
    petalRotation[0] + petalTilt,
    petalRotation[1] + Math.PI,
    petalRotation[2] + petalRoll,
    'YXZ'
  );

  // Desplazamiento exacto para situar la base del pétalo (u = 0, v = 0.5) en el pivote (0, 0, 0)
  const curveSign = PETAL_CONFIG.invertCurvature ? -1 : 1;
  const baseOffsetZ = (0.4 * PETAL_CONFIG.cupTransverse + 1.6 * PETAL_CONFIG.veinRelief) * curveSign;
  const baseYOffset = 0.46 * PETAL_CONFIG.length;

  return {
    position: petalPosition,
    rotation: euler,
    scale: petalScale,
    basePivotOffset: [0, baseYOffset, -baseOffsetZ] as [number, number, number],
  };
}
