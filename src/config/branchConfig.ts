import * as THREE from 'three';
import { createStemCurve, STEM_CONFIG } from './stemConfig';

export const BRANCH_CONFIG = {
  // Posición de inserción a lo largo del tallo principal (t entre 0 y 1)
  // ~42% de la altura visible, zona óptima donde brotan las primeras ramas de soporte
  stemAttachT: 0.42,

  // Proporción respecto a la altura del tallo (15–30% de la altura visible)
  // Altura del tallo ≈ 2.47 -> longitud ≈ 0.54 (22%)
  length: 0.54,

  // Grosor botánico con ahusamiento progresivo (significativamente menor que el tallo)
  radiusBase: 0.038,  // Base que nace del tallo (~60% del radio del tallo en ese punto)
  radiusTip: 0.016,   // Punta fina y delicada preparada para sostener la futura hoja
  taperExponent: 0.88,

  // Orientación y curvatura orgánica
  angle: 0.72,          // Ángulo de inclinación respecto a la vertical (~41 grados, lateral y hacia arriba)
  azimuthAngle: -1.2,   // Orientación en el plano horizontal XZ hacia un cuadrante despejado
  curvature: 0.12,      // Curvatura suave y natural (sin formar 'S' ni espirales)

  // Resolución de la malla
  segments: 36,
  radialSegments: 16,

  // Paleta en armonía con el tallo principal
  colors: {
    junctionColor: '#264219', // Unión axilar ligeramente más oscura fundida con el tallo
    baseColor: '#2b4d1d',     // Verde tallo natural
    midColor: '#345e22',      // Verde medio vegetal
    tipColor: '#3d6c26',      // Verde tierno en el extremo que recibirá la hoja
  },

  roughness: 0.65,
  metalness: 0.05,
};

/**
 * Genera la curva 3D continua de la ramita secundaria partiendo
 * desde el interior del tallo para lograr una unión biológica perfecta.
 */
export function createBranchCurve(customConfig?: Partial<typeof BRANCH_CONFIG>): {
  curve: THREE.CatmullRomCurve3;
  attachPoint: THREE.Vector3;
  stemRadiusAtAttach: number;
} {
  const config = { ...BRANCH_CONFIG, ...customConfig };
  const { stemAttachT, length, angle, azimuthAngle, curvature } = config;

  const stemCurve = createStemCurve();
  const stemPoint = stemCurve.getPointAt(stemAttachT);
  const stemTangent = stemCurve.getTangentAt(stemAttachT).normalize();

  // Calcular el radio del tallo en el punto de inserción para que nazca desde dentro
  const stemTaper = Math.pow(stemAttachT, STEM_CONFIG.taperExponent);
  const stemRadiusAtAttach = THREE.MathUtils.lerp(
    STEM_CONFIG.radiusBase,
    STEM_CONFIG.radiusTop,
    stemTaper
  );

  // Vector director horizontal según el ángulo azimutal
  const outDir = new THREE.Vector3(
    Math.cos(azimuthAngle),
    0,
    Math.sin(azimuthAngle)
  );

  // Ortogonalizar respecto a la tangente del tallo para una salida perpendicular/inclinada limpia
  outDir.sub(stemTangent.clone().multiplyScalar(outDir.dot(stemTangent))).normalize();

  // Vector de despegue: combinación de proyección exterior y ascenso natural hacia la luz
  const growthDir = new THREE.Vector3()
    .copy(outDir)
    .multiplyScalar(Math.sin(angle))
    .add(new THREE.Vector3(0, Math.cos(angle), 0))
    .normalize();

  // Punto inicial: situado ligeramente dentro del cortex del tallo para fusión total
  const p0 = stemPoint.clone().add(outDir.clone().multiplyScalar(stemRadiusAtAttach * 0.2));

  // Punto de emergencia en la corteza exterior
  const p1 = stemPoint.clone().add(outDir.clone().multiplyScalar(stemRadiusAtAttach * 1.05));

  // Punto intermedio: arco ascendente suave
  const p2 = p1.clone().add(
    growthDir.clone().multiplyScalar(length * 0.52).add(new THREE.Vector3(0, curvature * 0.4, 0))
  );

  // Extremo terminal: se extiende lateralmente buscando luz con leve curvatura de gravedad
  const p3 = p1.clone().add(
    growthDir.clone().multiplyScalar(length).add(new THREE.Vector3(0, -curvature * 0.15, 0))
  );

  const curve = new THREE.CatmullRomCurve3([p0, p1, p2, p3], false, 'centripetal', 0.5);

  return { curve, attachPoint: stemPoint, stemRadiusAtAttach };
}
