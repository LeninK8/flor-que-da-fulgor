export const ISLAND_CONFIG = {
  // Proporciones del montículo: ANCHO Y BAJO (~5:1 a 8:1)
  baseRadius: 3.2,        // Radio total de la base sumergida (diámetro ~6.4)
  waterRadius: 2.5,       // Radio medio visible en la línea de agua (diámetro visible ~5.0)
  plateauRadius: 1.1,     // Radio de la meseta superior amplia y suave (diámetro ~2.2)
  
  height: 0.62,           // Altura máxima sobre el agua (bajo y suave, NO montaña)
  submergedDepth: 0.38,   // Profundidad de la falda sumergida bajo el agua

  // Deformación de baja frecuencia (suave, sin picos ni pirámides)
  irregularity: 0.22,     // Asimetría del contorno visto desde arriba
  asymmetry: 0.06,        // Muy leve desnivel natural entre un lado y otro
  surfaceSoftness: 0.03,  // Micro-ondulaciones muy tenues en la tierra

  // Resolución de la malla para curvas continuas
  radialSegments: 72,
  ringSegments: 52,

  // Paleta de tierra natural y rica (tonos marrones y terrosos)
  colors: {
    submergedSoil: '#150f0a', // Tierra húmeda profunda bajo el agua
    waterlineSoil: '#251a12', // Tierra saturada en la orilla
    slopeSoil: '#3a271b',     // Tierra fértil en las laderas suaves
    plateauSoil: '#4c3525',   // Tierra superior de la meseta central
    warmEarth: '#583f2e',     // Suaves matices cálidos de tierra expuesta
  },

  roughness: 0.95,
  metalness: 0.02,
};
