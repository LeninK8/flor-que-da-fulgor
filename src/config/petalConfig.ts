/**
 * CONFIGURACIÓN DEL PÉTALO 3D — ESPECIFICACIONES DE LA HOJA TÉCNICA DE REFERENCIA
 *
 * Basado en la ficha técnica: "PÉTALO - REFERENCIA DETALLADA (Modelo 3D)":
 * - Altura aprox.: 12 – 16 cm (nominal: 2.60 u)
 * - Ancho aprox.: 8 – 12 cm (nominal: 1.86 u, Ratio ≈ 1.40 : 1)
 * - Grosor variable: 0.5 – 2 cm (fleshy en base/nervio central, fino y translúcido en bordes)
 * - Deformación y curvatura:
 *   • Curvatura longitudinal en 'S' (arco continuo con gancho apical recurvado hacia atrás)
 *   • Curvatura transversal en cuenco/copa (cóncava hacia el haz)
 *   • Ondulaciones asimétricas orgánicas en el borde
 *   • Gancho apical terminal que se dobla hacia atrás y desciende en pico suave
 */

export interface PetalConfig {
  length: number;
  width: number;
  thicknessBase: number;
  thicknessEdge: number;
  curvatureS: number;
  cupTransverse: number;
  tipHookIntensity: number;
  tipHookAngle: number;
  edgeRuffles: number;
  veinRelief: number;
  segments: {
    length: number;
    width: number;
  };
  invertCurvature?: boolean; // Inversión de curvatura para pancita salida: ")" en lugar de "("
}

export const PETAL_CONFIG: PetalConfig = {
  // Calibración calibrada por el usuario:
  length: 1.60,
  width: 0.75,
  // Grosor variable tridimensional (0.5 – 2 cm a escala)
  thicknessBase: 0.052,
  thicknessEdge: 0.014,
  // Curvatura longitudinal en 'S'
  curvatureS: 0.50,
  // Curvatura transversal en copa cóncava
  cupTransverse: 0.16,
  // Gancho recurvado terminal ("Borde ondulado y curvado" en la punta)
  tipHookIntensity: 0.10,
  tipHookAngle: 0.88,
  // Ondulaciones orgánicas en los márgenes
  edgeRuffles: 0.032,
  // Relieve de venas y acanaladuras
  veinRelief: 0.024,
  // Subdivisión de malla densa para deformación continua
  segments: {
    length: 150,
    width: 64,
  },
  // Revertido a ")" con la pancita abombada hacia afuera:
  invertCurvature: true,
};
