export const WATER_CONFIG = {
  // Dimensiones de la superficie
  size: 90,
  subdivisions: 120,

  // Dinámica de ondas suaves y naturales
  waveAmplitude: 0.045,
  waveSpeed: 0.75,
  waveFrequency: 0.4,

  // Óptica y color del agua (tonos naturales de estanque, no piscina)
  deepColor: '#071520',     // Fondo profundo del estanque
  surfaceColor: '#122e3d',  // Tono base natural del agua limpia
  horizonColor: '#32586b',  // Reflejo al horizonte / ángulo rasante
  transparency: 0.88,
  roughness: 0.18,

  // Fondo / Cuenca del estanque (para dar profundidad física real)
  bed: {
    depth: 3.8,
    radius: 42,
    bedColor: '#050c12',
  },

  // Configuración de pequeñas plantas flotantes (lentejas de agua / nenúfares sutiles)
  floatingPlants: {
    enabled: true,
    clusterCount: 6,
    padsPerCluster: 7,
    minRadius: 0.15,
    maxRadius: 0.42,
  },
};
