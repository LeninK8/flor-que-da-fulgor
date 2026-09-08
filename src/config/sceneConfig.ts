export type EnvironmentMode = 'DAY' | 'NIGHT';

export const ENVIRONMENT_MODE: EnvironmentMode = 'DAY';

export const SCENE_CONFIG = {
  mode: ENVIRONMENT_MODE,

  camera: {
    fov: 45,
    position: [0, 6, 12] as [number, number, number],
    target: [0, 0.2, 0] as [number, number, number],
  },

  // Ajustes según modo de entorno (DÍA para inspección técnica / NOCHE para producción futura)
  day: {
    skyColor: '#bae6fd',       // Cielo azul claro y diurno de día despejado
    fogColor: '#bae6fd',
    fogNear: 35,
    fogFar: 100,
    ambientLight: {
      color: '#ffffff',
      intensity: 1.1,         // Iluminación difusa amplia para erradicar zonas negras
    },
    hemisphereLight: {
      skyColor: '#ffffff',
      groundColor: '#cbd5e1',
      intensity: 1.3,         // Luz envolvente de cielo y rebote
    },
    sunLight: {
      position: [14, 24, 14] as [number, number, number],
      color: '#ffffff',
      intensity: 2.5,         // Sol cenital directo y potente para modelado 3D claro
    },
    fillLight: {
      position: [-16, 16, -14] as [number, number, number],
      color: '#e0f2fe',
      intensity: 1.4,         // Luz de relleno contra-lateral para apreciar pendientes y bordes
    },
    frontFillLight: {
      position: [0, 10, 16] as [number, number, number],
      color: '#ffffff',
      intensity: 0.8,         // Relleno frontal adicional de estudio
    },
  },

  night: {
    skyColor: '#050c18',
    fogColor: '#050c18',
    fogNear: 25,
    fogFar: 85,
    ambientLight: {
      color: '#1a273b',
      intensity: 0.3,
    },
    hemisphereLight: {
      skyColor: '#1e3a5f',
      groundColor: '#0b1320',
      intensity: 0.4,
    },
    sunLight: {
      position: [12, 18, 12] as [number, number, number],
      color: '#93c5fd',
      intensity: 0.6,
    },
    fillLight: {
      position: [-12, 10, -10] as [number, number, number],
      color: '#3b82f6',
      intensity: 0.25,
    },
    frontFillLight: {
      position: [0, 8, 14] as [number, number, number],
      color: '#60a5fa',
      intensity: 0.2,
    },
  },
};
