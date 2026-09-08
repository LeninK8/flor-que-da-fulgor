import * as THREE from 'three';

export const STEM_CONFIG = {
  // Proporción basada en el diámetro estimado de la futura flor (~1.4 a 1.6 unidades)
  estimatedFlowerDiameter: 1.5,
  heightToDiameterRatio: 1.65, // En el rango solicitado 1.5 - 1.8

  // Altura total del tallo (~2.5 unidades)
  get height() {
    return this.estimatedFlowerDiameter * this.heightToDiameterRatio;
  },

  // Punto de anclaje: penetra la tierra en el centro de la meseta (superficie del terreno ~0.62)
  basePosition: [0, 0.54, 0] as [number, number, number],

  // Grosor biológico con ahusamiento progresivo
  radiusBase: 0.085, // Ligeramente más grueso en el arraigo con la tierra
  radiusTop: 0.042,  // Más delgado y delicado en la cúspide que sostendrá la flor
  taperExponent: 0.85, // Caída suave y continua del grosor

  // Curvatura elegante inspirada en la flor Sun Drop de Tangled
  curvature: 0.42,      // Amplitud del arqueo suave
  curveDirection: 0.35, // Ángulo en radianes en el plano XZ para una orientación estética
  organicWiggle: 0.016, // Micro-variación biológica muy sutil (no es un tubo artificial)

  // Calidad de la malla
  heightSegments: 64,
  radialSegments: 24,

  // Color y material de desarrollo (verde botánico natural y profundo)
  colors: {
    baseColor: '#243b18',   // Base terrosa que emerge de la tierra
    midColor: '#2e521e',    // Verde tallo natural saludable
    topColor: '#3d6c26',    // Verde más fresco y tierno cerca de la cúspide
  },

  roughness: 0.65,
  metalness: 0.05,
};

/**
 * Genera la curva 3D central del tallo utilizando spline suave
 */
export function createStemCurve(): THREE.CatmullRomCurve3 {
  const { height, basePosition, curvature } = STEM_CONFIG;
  const [bx, by, bz] = basePosition;

  // Puntos clave de control para la curva continua y elegante (sin cambios bruscos)
  const points = [
    new THREE.Vector3(bx, by, bz),                                        // 0%: Enraizado en la tierra
    new THREE.Vector3(bx + 0.02, by + height * 0.18, bz - 0.02),          // 18%: Emerge verticalmente con leve inclinación inicial
    new THREE.Vector3(bx + curvature * 0.45, by + height * 0.45, bz - curvature * 0.25), // 45%: Curvatura suave hacia el cuadrante lateral
    new THREE.Vector3(bx + curvature * 0.70, by + height * 0.72, bz - curvature * 0.12), // 72%: Vértice del arqueo orgánico
    new THREE.Vector3(bx + curvature * 0.55, by + height * 1.0, bz + curvature * 0.10),  // 100%: Cúspide orientada para sostener la flor
  ];

  return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
}
