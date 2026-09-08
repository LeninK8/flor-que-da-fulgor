/**
 * CONFIGURACIÓN Y GENERACIÓN DE LAS 3 ESTRUCTURAS FLORALES TIPO ESTAMBRE
 *
 * Especificación del usuario:
 * - Exactamente 3 estructuras tipo estambre en el centro INTERIOR de la flor.
 * - Salen desde la zona central entre los 6 pétalos.
 * - Secuencia de forma:
 *   BASE → TALLO CURVADO → CURVA MÁS PRONUNCIADA → PUNTA ENROLLADA EN ESPIRAL 🌀
 * - Estructura 1 (pequeña): más corta, tallo delgado, curva suave, espiral pequeña visible.
 * - Estructura 2 (mediana): intermedia, dirección distinta, curva más amplia, espiral mediana.
 * - Estructura 3 (grande): claramente la más alta y larga, curva final pronunciada, espiral grande definida.
 * - Diferenciación visible: pequeña → mediana → grande en altura, longitud y dirección.
 * - Aspecto orgánico, delgado, tridimensional y bioluminiscente.
 */

import * as THREE from 'three';

export interface StamenParamConfig {
  id: string;
  name: string;
  category: 'small' | 'medium' | 'large';
  baseAngle: number;       // Ángulo de inserción en el receptáculo (radianes)
  baseRadius: number;      // Distancia radial desde el centro exacto
  baseY: number;           // Altura basal de inserción
  height: number;          // Altura máxima alcanzada
  heading: number;         // Dirección azimutal hacia la que se proyecta el tallo
  leanOut: number;         // Desplazamiento radial hacia afuera
  sideArch: number;        // Desviación lateral orgánica (curvatura suave)
  spiralTurns: number;     // Número de vueltas de la espiral 🌀
  spiralRadius: number;    // Radio de la espiral
  spiralCurlAngle: number; // Inclinación 3D del plano de la espiral
  spiralInwardCurl: number;// Sentido del enrollamiento (+1 o -1)
  baseTubeRadius: number;  // Grosor en la base de inserción
  midTubeRadius: number;   // Grosor medio
  tipTubeRadius: number;   // Grosor en el extremo de la espiral
  pollenCount: number;     // Número de micro-nódulos/perlas de polen bioluminiscente
  glowColor: string;       // Color de bioluminiscencia en la espiral
  accentColor: string;     // Color de transición en la curva
}

export const STAMENS_CONFIG: StamenParamConfig[] = [
  // 1. Estructura 1 — pequeña
  {
    id: 'stamen-small',
    name: 'Estructura 1 (Pequeña)',
    category: 'small',
    baseAngle: (38 * Math.PI) / 180, // Entre pétalo 0 (0°) y pétalo 1 (60°)
    baseRadius: 0.022,
    baseY: 0.015,
    height: 0.44, // La más corta de las tres
    heading: (48 * Math.PI) / 180,
    leanOut: 0.11,
    sideArch: 0.038,
    spiralTurns: 1.20, // Pequeño enrollamiento/espiral claramente visible
    spiralRadius: 0.038,
    spiralCurlAngle: 0.22,
    spiralInwardCurl: 1,
    baseTubeRadius: 0.013,
    midTubeRadius: 0.0085,
    tipTubeRadius: 0.0042,
    pollenCount: 3,
    glowColor: '#fde047',
    accentColor: '#f472b6',
  },

  // 2. Estructura 2 — mediana
  {
    id: 'stamen-medium',
    name: 'Estructura 2 (Mediana)',
    category: 'medium',
    baseAngle: (158 * Math.PI) / 180, // Entre pétalo 2 (120°) y pétalo 3 (180°)
    baseRadius: 0.026,
    baseY: 0.018,
    height: 0.66, // Intermedia en longitud y altura
    heading: (168 * Math.PI) / 180,
    leanOut: 0.18,
    sideArch: -0.055, // Curvatura más amplia hacia la dirección opuesta
    spiralTurns: 1.50, // Espiral más grande y visible que la primera
    spiralRadius: 0.052,
    spiralCurlAngle: -0.25,
    spiralInwardCurl: -1,
    baseTubeRadius: 0.016,
    midTubeRadius: 0.010,
    tipTubeRadius: 0.0048,
    pollenCount: 4,
    glowColor: '#fde047',
    accentColor: '#ec4899',
  },

  // 3. Estructura 3 — grande
  {
    id: 'stamen-large',
    name: 'Estructura 3 (Grande)',
    category: 'large',
    baseAngle: (278 * Math.PI) / 180, // Entre pétalo 4 (240°) y pétalo 5 (300°)
    baseRadius: 0.024,
    baseY: 0.022,
    height: 0.96, // Claramente la más larga y alta de las tres
    heading: (288 * Math.PI) / 180,
    leanOut: 0.25,
    sideArch: 0.075, // Arco majestuoso y pronunciado
    spiralTurns: 1.85, // Enrollamiento/espiral claramente definido y mayor
    spiralRadius: 0.072,
    spiralCurlAngle: 0.35,
    spiralInwardCurl: 1,
    baseTubeRadius: 0.020,
    midTubeRadius: 0.012,
    tipTubeRadius: 0.0055,
    pollenCount: 5,
    glowColor: '#fbbf24',
    accentColor: '#d946ef',
  },
];

export interface StamenCurveData {
  points: THREE.Vector3[];
  tangents: THREE.Vector3[];
  p3Neck: THREE.Vector3;
  spiralCenter: THREE.Vector3;
  pollenPositions: { position: THREE.Vector3; scale: number }[];
}

/**
 * Genera el camino 3D continuo para una estructura estambril con la secuencia:
 * BASE → TALLO CURVADO → CURVA MÁS PRONUNCIADA → ESPIRAL ENROLLADA SOBRE SÍ MISMA 🌀
 */
export function generateStamenPath(config: StamenParamConfig, steps: number = 85): StamenCurveData {
  // Punto de partida en el receptáculo interior
  const p0 = new THREE.Vector3(
    Math.cos(config.baseAngle) * config.baseRadius,
    config.baseY,
    Math.sin(config.baseAngle) * config.baseRadius
  );

  // Vectores directores para el desarrollo del tallo
  const dirXZ = new THREE.Vector3(Math.cos(config.heading), 0, Math.sin(config.heading));
  const orthoXZ = new THREE.Vector3(-Math.sin(config.heading), 0, Math.cos(config.heading));

  // P1: Tallo bajo emergiendo verticalmente con suave inclinación orgánica
  const p1 = new THREE.Vector3()
    .copy(p0)
    .addScaledVector(new THREE.Vector3(0, 1, 0), config.height * 0.32)
    .addScaledVector(dirXZ, config.leanOut * 0.22)
    .addScaledVector(orthoXZ, config.sideArch * 0.15);

  // P2: Tallo medio con curvatura elegante
  const p2 = new THREE.Vector3()
    .copy(p0)
    .addScaledVector(new THREE.Vector3(0, 1, 0), config.height * 0.65)
    .addScaledVector(dirXZ, config.leanOut * 0.60)
    .addScaledVector(orthoXZ, config.sideArch * 0.35);

  // P3: Cuello donde la curvatura se vuelve visiblemente más pronunciada antes de la espiral
  const p3 = new THREE.Vector3()
    .copy(p0)
    .addScaledVector(new THREE.Vector3(0, 1, 0), config.height * 0.90)
    .addScaledVector(dirXZ, config.leanOut * 1.05)
    .addScaledVector(orthoXZ, config.sideArch * 0.55);

  // Spline para el tallo
  const stemCurve = new THREE.CatmullRomCurve3([p0, p1, p2, p3], false, 'centripetal');
  const stemPointsCount = Math.round(steps * 0.58);
  const stemPoints = stemCurve.getPoints(stemPointsCount);

  // Tangente en la unión tallo -> espiral
  const tangentAtEnd = new THREE.Vector3().subVectors(p3, p2).normalize();

  // Marco de referencia local para el plano de enrollamiento
  let normalCurl = new THREE.Vector3(0, 1, 0).cross(tangentAtEnd).normalize();
  if (normalCurl.lengthSq() < 0.01) normalCurl.set(1, 0, 0);

  // Aplicar inclinación tridimensional al plano de la espiral
  normalCurl.applyAxisAngle(tangentAtEnd, config.spiralCurlAngle);
  const binormalCurl = new THREE.Vector3().crossVectors(tangentAtEnd, normalCurl).normalize();

  // Centro de la espiral (desplazado en la dirección de curvatura)
  const spiralCenter = new THREE.Vector3()
    .copy(p3)
    .addScaledVector(binormalCurl, config.spiralRadius * config.spiralInwardCurl);

  const spiralPointsCount = Math.round(steps * 0.42);
  const totalAngle = config.spiralTurns * 2 * Math.PI;

  const allPoints = [...stemPoints];
  const spiralOnlyPoints: THREE.Vector3[] = [];

  for (let s = 1; s <= spiralPointsCount; s++) {
    const frac = s / spiralPointsCount;
    const phi = frac * totalAngle;

    // Enrollamiento espiral: el radio decrece progresivamente a medida que gira hacia el centro
    const currentR = config.spiralRadius * (1.0 - frac * 0.58);

    // Ecuación paramétrica de la espiral en el plano curvado
    const u = -Math.cos(phi) * config.spiralInwardCurl;
    const v = Math.sin(phi);

    // Torsión tridimensional sutil para que no se autocolisione y parezca un báculo floral orgánico
    const w = (frac - 0.4) * 0.16 * config.spiralRadius;

    const pt = new THREE.Vector3()
      .copy(spiralCenter)
      .addScaledVector(binormalCurl, currentR * u)
      .addScaledVector(tangentAtEnd, currentR * v)
      .addScaledVector(normalCurl, w);

    allPoints.push(pt);
    spiralOnlyPoints.push(pt);
  }

  // Cálculo de tangentes continuas en cada punto
  const tangents: THREE.Vector3[] = [];
  for (let i = 0; i < allPoints.length; i++) {
    const prev = allPoints[Math.max(0, i - 1)];
    const next = allPoints[Math.min(allPoints.length - 1, i + 1)];
    tangents.push(new THREE.Vector3().subVectors(next, prev).normalize());
  }

  // Posiciones para los micro-nódulos/perlas de polen bioluminiscentes anidados en el corazón de la espiral
  const pollenPositions: { position: THREE.Vector3; scale: number }[] = [];
  const startIdx = Math.floor(spiralOnlyPoints.length * 0.35);
  const endIdx = spiralOnlyPoints.length - 1;
  const stepIdx = Math.max(1, Math.floor((endIdx - startIdx) / config.pollenCount));

  for (let k = 0; k < config.pollenCount; k++) {
    const idx = Math.min(endIdx, startIdx + k * stepIdx);
    const p = spiralOnlyPoints[idx] || p3;
    // Ligeramente desviados hacia el interior del rizo de la espiral
    const offset = new THREE.Vector3()
      .subVectors(spiralCenter, p)
      .normalize()
      .multiplyScalar(config.spiralRadius * 0.14);
    pollenPositions.push({
      position: new THREE.Vector3().copy(p).add(offset),
      scale: (1.0 - k * 0.12) * (config.category === 'large' ? 0.012 : config.category === 'medium' ? 0.010 : 0.008),
    });
  }

  return {
    points: allPoints,
    tangents,
    p3Neck: p3,
    spiralCenter,
    pollenPositions,
  };
}

/**
 * Construye una malla tubular orgánica con grosor variable (tapered) y colores de vértice
 * bioluminiscentes (de púrpura basal a fucsia y oro resplandeciente en la espiral).
 */
export function buildOrganicStamenGeometry(
  config: StamenParamConfig,
  curveData: StamenCurveData,
  radialSegments: number = 16
): THREE.BufferGeometry {
  const points = curveData.points;
  const numPoints = points.length;

  // Cálculo de marcos de Frenet / Parallel Transport para evitar torsión abrupta
  const tangents = curveData.tangents;
  const normals: THREE.Vector3[] = [];
  const binormals: THREE.Vector3[] = [];

  // Normal inicial perpendicular a la primera tangente
  let n = new THREE.Vector3(0, 1, 0).cross(tangents[0]).normalize();
  if (n.lengthSq() < 0.01) n = new THREE.Vector3(1, 0, 0).cross(tangents[0]).normalize();
  normals.push(n);
  binormals.push(new THREE.Vector3().crossVectors(tangents[0], n).normalize());

  // Transporte paralelo a lo largo de toda la curva y la espiral
  for (let i = 1; i < numPoints; i++) {
    const tPrev = tangents[i - 1];
    const tCurr = tangents[i];
    const rotAxis = new THREE.Vector3().crossVectors(tPrev, tCurr);
    const rotAngle = Math.asin(Math.max(-1, Math.min(1, rotAxis.length())));

    let nextN = normals[i - 1].clone();
    if (rotAxis.lengthSq() > 1e-6) {
      rotAxis.normalize();
      nextN.applyAxisAngle(rotAxis, rotAngle);
    }
    // Ortogonalización de Gram-Schmidt
    nextN.addScaledVector(tCurr, -nextN.dot(tCurr)).normalize();
    normals.push(nextN);
    binormals.push(new THREE.Vector3().crossVectors(tCurr, nextN).normalize());
  }

  // Función de radio cónico orgánico: de base a cuello y a la punta de la espiral
  function getRadiusAt(u: number): number {
    if (u < 0.60) {
      // Tallo: se afina suavemente de base a cuello
      const t = u / 0.60;
      return THREE.MathUtils.lerp(config.baseTubeRadius, config.midTubeRadius, t);
    } else {
      // Curva pronunciada y espiral: se afina elegantemente hacia la punta enrollada
      const t = (u - 0.60) / 0.40;
      return THREE.MathUtils.lerp(config.midTubeRadius, config.tipTubeRadius, t);
    }
  }

  // Paleta de gradiente bioluminiscente fantástica
  const colBase = new THREE.Color('#3b0764');     // Púrpura profundo del receptáculo
  const colStem = new THREE.Color('#86198f');     // Magenta / orquídea aterciopelado
  const colAccent = new THREE.Color(config.accentColor); // Rosa fucsia vibrante en la curva
  const colSpiral = new THREE.Color(config.glowColor);   // Oro polen bioluminiscente
  const colTip = new THREE.Color('#ffffff');      // Núcleo brillante de la espiral

  function getVertexColor(u: number): THREE.Color {
    const c = new THREE.Color();
    if (u < 0.25) {
      c.lerpColors(colBase, colStem, u / 0.25);
    } else if (u < 0.60) {
      c.lerpColors(colStem, colAccent, (u - 0.25) / 0.35);
    } else if (u < 0.85) {
      c.lerpColors(colAccent, colSpiral, (u - 0.60) / 0.25);
    } else {
      c.lerpColors(colSpiral, colTip, (u - 0.85) / 0.15);
    }
    return c;
  }

  const vertices: number[] = [];
  const vertexNormals: number[] = [];
  const uvs: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < numPoints; i++) {
    const u = i / (numPoints - 1);
    const p = points[i];
    const r = getRadiusAt(u);
    const currN = normals[i];
    const currB = binormals[i];
    const col = getVertexColor(u);

    for (let j = 0; j <= radialSegments; j++) {
      const v = j / radialSegments;
      const angle = v * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const ringNormal = new THREE.Vector3()
        .copy(currN)
        .multiplyScalar(cosA)
        .addScaledVector(currB, sinA)
        .normalize();

      const pos = new THREE.Vector3().copy(p).addScaledVector(ringNormal, r);

      vertices.push(pos.x, pos.y, pos.z);
      vertexNormals.push(ringNormal.x, ringNormal.y, ringNormal.z);
      uvs.push(u, v);
      colors.push(col.r, col.g, col.b);
    }
  }

  // Caras triangulares del tubo
  for (let i = 0; i < numPoints - 1; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const row1 = i * (radialSegments + 1);
      const row2 = (i + 1) * (radialSegments + 1);

      const a = row1 + j;
      const b = row1 + j + 1;
      const c = row2 + j + 1;
      const d = row2 + j;

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  // Tapa esférica suave en la punta de la espiral
  const lastCenter = points[numPoints - 1];
  const lastIndex = (numPoints - 1) * (radialSegments + 1);
  const tipVertexIndex = vertices.length / 3;
  const tipTangent = tangents[numPoints - 1];
  const tipRadius = getRadiusAt(1.0);
  const tipPos = new THREE.Vector3().copy(lastCenter).addScaledVector(tipTangent, tipRadius * 1.6);
  const tipColor = getVertexColor(1.0);

  vertices.push(tipPos.x, tipPos.y, tipPos.z);
  vertexNormals.push(tipTangent.x, tipTangent.y, tipTangent.z);
  uvs.push(1.0, 0.5);
  colors.push(tipColor.r, tipColor.g, tipColor.b);

  for (let j = 0; j < radialSegments; j++) {
    indices.push(lastIndex + j, lastIndex + j + 1, tipVertexIndex);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(vertexNormals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();

  return geometry;
}
