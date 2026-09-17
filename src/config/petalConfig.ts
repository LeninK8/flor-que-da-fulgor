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

  // Parámetros de enrollado apical (punta del pétalo)
  tipRollTurns?: number; // Vueltas completas o fraccionales de giro (0 = sin rollo, 0.5 = medio giro, 1.0 = vuelta completa, 2.0 = espiral)
  tipRollStart?: number; // Posición longitudinal u donde comienza el enrollado (0.60 a 0.95)
  tipRollDirection?: number; // -1 = Hacia abajo/atrás (curva floral descendente), 1 = Hacia arriba/adentro
  tipRollRadius?: number; // Radio de holgura / apriete del enrollado
  tipRollTwist?: number; // Torsión lateral orgánica del rollo
  outerDescentMult?: number; // Factor de caída vertical hacia el exterior

  // Personalización de color y apariencia PBR
  baseColor?: string; // Color de inserción basal (púrpura / magenta)
  midColor?: string; // Color del cuerpo central (dorado / amarillo)
  tipColor?: string; // Color de la punta / borde (ámbar / naranja cálido)
  veinGlowColor?: string; // Color de emisión bioluminiscente de las venas
  emissiveIntensity?: number; // Intensidad del brillo bioluminiscente (0 a 4)
  roughness?: number; // Rugosidad del material (0.05 sedoso/vítreo a 0.8 mate)
  transmission?: number; // Translucidez orgánica / subsurface scattering (0 a 0.6)
  clearcoat?: number; // Capa de barniz brillante / rocío húmedo (0 a 1)

  // Orientación y giro libre del pétalo (inclinación en paraguas, azimut 360° y balanceo)
  tiltAngle?: number; // Inclinación en radianes (0 = erguido arriba, 1.57 = horizontal, ~2.35 = paraguas hacia abajo, 3.14 = péndulo)
  azimuthAngle?: number; // Giro horizontal / azimutal 360° alrededor del tallo (0 a 2π rad)
  rollAngle?: number; // Balanceo axial sobre el nervio central (-π a +π rad)

  // Anchura basal (nacimiento del pétalo para rellenar la corona floral sin huecos centrales)
  baseWidthRatio?: number; // Proporción de anchura en el nacimiento del pétalo (0.10 estrecho a 0.35 abundante)
}

export const PETAL_CONFIG: PetalConfig = {
  // Calibración exacta aprobada y definitiva por el usuario:
  length: 1.84,
  width: 0.92,
  baseWidthRatio: 0.19,
  curvatureS: 0.48,
  outerDescentMult: 1.3,
  cupTransverse: 0.18,
  tipRollTurns: 0.7,
  tipRollStart: 0.77,
  tipRollDirection: -1,
  tipRollTwist: 0.03,
  tipHookIntensity: 0.1,
  tipHookAngle: 0.88,
  edgeRuffles: 0.028,
  veinRelief: 0.022,
  thicknessBase: 0.052,
  thicknessEdge: 0.014,

  // Subdivisión de malla densa para deformación continua
  segments: {
    length: 150,
    width: 64,
  },
  invertCurvature: false,
  tipRollRadius: 0.12,

  // Color y apariencia PBR calibrados por el usuario
  baseColor: '#56095d',
  midColor: '#eea205',
  tipColor: '#ffa500',
  veinGlowColor: '#eea505',
  emissiveIntensity: 2.95,
  roughness: 0.34,
  transmission: 0.18,
  clearcoat: 0.3,

  // Orientación y caída aprobada por el usuario
  tiltAngle: -1.08,
  azimuthAngle: 0.22,
  rollAngle: -0.14,
};
