import * as THREE from 'three';
import { createBranchCurve } from './branchConfig';

export const LEAF_CONFIG = {
  // Proporciones botánicas exactas: LONGITUD ≈ 2.0–2.5 × ANCHO MÁXIMO
  length: 2.35,      // Longitud total del limbo + peciolo corto
  maxWidth: 1.05,    // Ancho máximo en el cuerpo de la hoja (Ratio = 2.35 / 1.05 ≈ 2.24)
  
  // Posición del punto más ancho (en el tercio medio, ~38% de la longitud)
  widestPointT: 0.38,

  // Base y peciolo estrecho
  petioleLength: 0.22,  // Longitud de la base estrecha
  petioleWidth: 0.09,   // Ancho en la base de inserción
  
  // Transición longitudinal continua hacia la punta (sin cambios bruscos ni esquinas)
  taperExponent: 1.25,
  taperPower: 1.15,

  // Grosor tridimensional (cuerpo 3D real con volumen, no plano)
  thicknessMidrib: 0.038, // Grosor en la nervadura central
  thicknessBlade: 0.022,  // Grosor en el centro de la lámina
  thicknessEdge: 0.008,   // Grosor en el margen exterior

  // Curvatura tridimensional
  longitudinalArch: 0.18, // Arqueamiento continuo suave de la hoja
  transverseCup: 0.065,   // Concavidad transversal en 'V' suave (lámina acopada hacia la vena)
  tipCurveDown: 0.075,    // Caída sutil y continua de la punta (sin quiebre ni pliegue final)
  organicAsymmetry: 0.045,// Leve asimetría natural entre el lado izquierdo y derecho

  // Nervaduras (Central + Secundarias)
  veinReliefUpper: 0.016, // Relieve de la nervadura central en el haz
  veinReliefLower: 0.028, // Relieve prominente de la nervadura central en el envés
  secondaryVeinCount: 7,  // Pares de nervaduras laterales que nacen de la central
  secondaryVeinRelief: 0.008,

  // Resolución de la malla para curvas biológicas continuas
  lengthSegments: 48,
  widthSegments: 24,

  // Paleta de verde natural medio (tonos botánicos reales de desarrollo)
  colors: {
    petiole: '#2a4c19',       // Base del peciolo
    midrib: '#589332',        // Nervadura central clara y definida
    secondaryVein: '#4c822a', // Nervaduras secundarias sutiles
    bladeBase: '#335b1e',     // Haz de la hoja - verde natural medio
    bladeCenter: '#3b6823',   // Cuerpo ancho de la hoja
    bladeMargin: '#4a7d2c',   // Borde exterior fresco
    tip: '#5b9636',           // Ápice tierno
    underside: '#2c4f19',     // Envés (cara inferior, ligeramente más sobria)
  },

  roughness: 0.52,
  metalness: 0.03,
};

/**
 * Parámetros de Integración de la Hoja Maestra con la Ramita Maestra.
 * Permiten ajustar de forma directa la orientación, escala y posición fina del punto de nacimiento.
 */
export const LEAF_ATTACH_CONFIG = {
  // Proporción biológica respecto a la ramita (~36% para que el peciolo encaje con el radio terminal)
  scale: 0.36,

  // Offset milimétrico del punto de nacimiento (en el sistema local de la punta de la ramita)
  leafOffsetX: 0.0,
  leafOffsetY: 0.0,
  leafOffsetZ: -0.016, // Ligera penetración limpia (~1.6cm) en la punta de la ramita para sellar la unión

  // Rotaciones finas (en radianes) para encontrar la orientación orgánica óptima:
  // leafRotation (yaw): rotación azimutal lateral
  // leafTilt (pitch): inclinación natural hacia abajo/arriba siguiendo el arco de gravedad
  // leafRoll (roll): alabeo transversal de la lámina para orientar la superficie hacia la luz
  leafRotation: 0.0,
  leafTilt: 0.16,
  leafRoll: -0.08,
};

/**
 * Calcula la matriz de transformación exacta (posición, rotación y escala)
 * para acoplar la base de la hoja a la punta de la ramita en continuidad biológica perfecta.
 */
export function getLeafAttachmentTransform(
  overrideConfig?: Partial<typeof LEAF_ATTACH_CONFIG>,
  customBranchCurve?: THREE.CatmullRomCurve3
) {
  const cfg = { ...LEAF_ATTACH_CONFIG, ...overrideConfig };
  const curve = customBranchCurve || createBranchCurve().curve;

  // Punto y tangente exacta en el extremo terminal de la ramita
  const tipPoint = curve.getPointAt(1.0);
  const tangent = curve.getTangentAt(1.0).normalize();

  // Marco ortonormal en la punta de la ramita
  const worldUp = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(worldUp, tangent).normalize();
  const up = new THREE.Vector3().crossVectors(tangent, right).normalize();

  // Orientación base que continúa la dirección de la ramita
  const branchBasisMat = new THREE.Matrix4().makeBasis(right, up, tangent);
  const branchQuat = new THREE.Quaternion().setFromRotationMatrix(branchBasisMat);

  // Aplicación de rotaciones finas (leafTilt, leafRotation, leafRoll)
  const fineEuler = new THREE.Euler(cfg.leafTilt, cfg.leafRotation, cfg.leafRoll, 'YXZ');
  const fineQuat = new THREE.Quaternion().setFromEuler(fineEuler);

  // Cuaternión y Euler final
  const finalQuat = branchQuat.clone().multiply(fineQuat);
  const finalEuler = new THREE.Euler().setFromQuaternion(finalQuat);

  // Offset posicional relativo a la punta
  const offsetLocal = new THREE.Vector3(cfg.leafOffsetX, cfg.leafOffsetY, cfg.leafOffsetZ);
  offsetLocal.applyQuaternion(finalQuat);

  const finalPosition = tipPoint.clone().add(offsetLocal);

  return {
    position: [finalPosition.x, finalPosition.y, finalPosition.z] as [number, number, number],
    rotation: finalEuler,
    scale: cfg.scale,
    tipPoint,
    finalQuat,
  };
}

