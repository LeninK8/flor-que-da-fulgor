/**
 * COLECCIÓN DE 8 DISEÑOS DE LINTERNAS DE PAPEL FLOTANTES
 * 
 * Implementa las 8 variantes del sistema de linternas sobre la laguna:
 * 1. Clásico (Espirales sueltas, flor de tres lóbulos, papel de seda natural)
 * 2. Floral (Cuerpo acampanado ensanchado, flores de 5/6 pétalos y hojas)
 * 3. Espiral (Silueta ovalada con remolinos que crecen hacia el centro)
 * 4. Estrellado (Cuerpo facetado de 10 caras, estrellas tipo ventana translúcida)
 * 5. Mariposas (Silueta en campana con enjambre de mariposas ascendentes)
 * 6. Ondas (Silueta alargada y esbelta con bandas onduladas de agua y gotas)
 * 7. Artesanal (Asimétrica, pulso irregular, parches de papel y costura vertical)
 * 8. Mágico (Gota retorcida con 'twist', tinta dorada y destellos estelares)
 */

import * as THREE from 'three';

/* ─── UTILIDADES MATEMÁTICAS & RUIDO ─── */

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function sign1(v: number): number {
  return v < 0 ? -1 : 1;
}

export function makeRng(seed: number) {
  let a = seed >>> 0;
  return function rng(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rngRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

export function rngInt(rng: () => number, min: number, max: number): number {
  return Math.floor(min + rng() * (max - min + 1));
}

/* ─── CONFIGURACIÓN DE LOS 8 DISEÑOS ─── */

export interface LanternDesign8Config {
  id: 'classic' | 'floral' | 'spiral' | 'star' | 'butterfly' | 'wave' | 'handmade' | 'magic';
  name: string;
  tagline: string;
  seed: number;
  accent: string;
  scale: number;
  flatShading?: boolean;
  shape: {
    height: number;
    rBottom: number;
    rTop: number;
    squareness: number;
    ovality: number;
    bulge?: number;
    shoulder?: number;
    topRound?: number;
    rimFlare?: number;
    twist?: number;
    wobble?: number;
    lean?: number;
    seedAngle?: number;
    profilePower?: number;
    radialSegments?: number;
    heightSegments?: number;
    capSegments?: number;
  };
  paper: {
    base: string;
    top?: string;
    bottom?: string;
    ink: string;
    inkAlpha?: number;
    fiber?: number;
    creases?: number;
    creaseStrength?: number;
    glowTop?: string;
    glowMid?: string;
    glowCore?: string;
    glowBase?: string;
    blockAlpha?: number;
    opacity?: number;
    emissive?: number;
  };
  pattern: { type: string };
  wire: {
    type?: 'square' | 'round';
    stays?: number;
    thickness?: number;
    ribs?: number;
    color?: number;
    shadow?: boolean;
  };
  glow: {
    color: string;
    intensity: number;
    halo: number;
    haloScale: number;
  };
}

export const LANTERN_DESIGNS_8: LanternDesign8Config[] = [
  {
    id: 'classic',
    name: 'Clásico',
    tagline: 'Papel de seda, espirales sueltas y una llama serena.',
    seed: 1207,
    accent: '#ffb055',
    scale: 1.0,
    shape: {
      height: 1.45,
      rBottom: 0.5,
      rTop: 0.47,
      squareness: 3.2,
      ovality: 1,
      bulge: 0.05,
      shoulder: 0.2,
      topRound: 0.32,
      rimFlare: 0.03,
      radialSegments: 64,
      heightSegments: 40,
    },
    paper: {
      base: '#f7cb52',
      top: '#f3be42',
      bottom: '#fbdc6c',
      ink: '#6e4420',
      inkAlpha: 0.72,
      fiber: 1,
      creases: 6,
      creaseStrength: 0.9,
      glowTop: '#6b370d',
      glowMid: '#c56e18',
      glowCore: '#ffcd48',
      glowBase: '#ffe475',
      blockAlpha: 0.6,
      opacity: 0.97,
      emissive: 1.25,
    },
    pattern: { type: 'classic' },
    wire: { type: 'square', stays: 4, thickness: 0.008 },
    glow: { color: '#ffa825', intensity: 1.0, halo: 1.0, haloScale: 1.0 },
  },
  {
    id: 'floral',
    name: 'Floral',
    tagline: 'Se ensancha hacia arriba; las flores se leen desde dentro.',
    seed: 2231,
    accent: '#ffbe50',
    scale: 1.0,
    shape: {
      height: 1.4,
      rBottom: 0.41,
      rTop: 0.57,
      squareness: 2.4,
      ovality: 1,
      bulge: 0.02,
      shoulder: 0.23,
      topRound: 0.52,
      rimFlare: 0.05,
      profilePower: 1.25,
      radialSegments: 64,
      heightSegments: 40,
    },
    paper: {
      base: '#f8d462',
      top: '#f4c650',
      bottom: '#fbe07a',
      ink: '#614d1f',
      inkAlpha: 0.68,
      fiber: 1.1,
      creases: 5,
      creaseStrength: 0.7,
      glowTop: '#6d3914',
      glowMid: '#c87324',
      glowCore: '#ffd55c',
      glowBase: '#ffe885',
      blockAlpha: 0.55,
      opacity: 0.96,
      emissive: 1.2,
    },
    pattern: { type: 'floral' },
    wire: { type: 'round', stays: 5, thickness: 0.0075 },
    glow: { color: '#ffaa2b', intensity: 0.95, halo: 1.0, haloScale: 1.05 },
  },
  {
    id: 'spiral',
    name: 'Espiral',
    tagline: 'Silueta ovalada; los remolinos crecen hacia el centro.',
    seed: 3313,
    accent: '#ff9d4d',
    scale: 1.02,
    shape: {
      height: 1.5,
      rBottom: 0.47,
      rTop: 0.43,
      squareness: 2.2,
      ovality: 1.26,
      bulge: 0.13,
      shoulder: 0.24,
      topRound: 0.46,
      rimFlare: 0.02,
      radialSegments: 72,
      heightSegments: 44,
    },
    paper: {
      base: '#f5ca56',
      top: '#efb844',
      bottom: '#fad870',
      ink: '#7f3e1a',
      inkAlpha: 0.74,
      fiber: 0.9,
      creases: 7,
      creaseStrength: 1,
      glowTop: '#72340b',
      glowMid: '#cd6615',
      glowCore: '#ffc445',
      glowBase: '#ffde6a',
      blockAlpha: 0.62,
      opacity: 0.97,
      emissive: 1.3,
    },
    pattern: { type: 'spiral' },
    wire: { type: 'round', stays: 6, thickness: 0.008 },
    glow: { color: '#ff961e', intensity: 1.05, halo: 1.05, haloScale: 1.05 },
  },
  {
    id: 'star',
    name: 'Estrellado',
    tagline: 'Diez caras planas; las estrellas se abren como ventanas.',
    seed: 4409,
    accent: '#ffd9a0',
    scale: 1.0,
    flatShading: true,
    shape: {
      height: 1.58,
      rBottom: 0.46,
      rTop: 0.45,
      squareness: 2.0,
      ovality: 1,
      bulge: 0.0,
      shoulder: 0.15,
      topRound: 0.22,
      rimFlare: 0.015,
      radialSegments: 10,
      heightSegments: 26,
      capSegments: 8,
    },
    paper: {
      base: '#f6d25c',
      top: '#f1c248',
      bottom: '#fae075',
      ink: '#634015',
      inkAlpha: 0.7,
      fiber: 0.8,
      creases: 4,
      creaseStrength: 0.6,
      glowTop: '#733d0e',
      glowMid: '#bf761f',
      glowCore: '#ffd050',
      glowBase: '#ffe67a',
      blockAlpha: 0.52,
      opacity: 0.96,
      emissive: 1.35,
    },
    pattern: { type: 'star' },
    wire: { type: 'square', stays: 5, thickness: 0.0085, ribs: 10 },
    glow: { color: '#ffae2a', intensity: 1.0, halo: 0.95, haloScale: 1.0 },
  },
  {
    id: 'butterfly',
    name: 'Mariposas',
    tagline: 'Cuerpo de campana con un enjambre que sube en diagonal.',
    seed: 5507,
    accent: '#ffb8a0',
    scale: 0.98,
    shape: {
      height: 1.38,
      rBottom: 0.35,
      rTop: 0.56,
      squareness: 2.6,
      ovality: 1.05,
      bulge: 0.09,
      shoulder: 0.27,
      topRound: 0.58,
      rimFlare: 0.06,
      profilePower: 0.62,
      radialSegments: 64,
      heightSegments: 42,
    },
    paper: {
      base: '#f7cf5e',
      top: '#f3be4c',
      bottom: '#fbdc72',
      ink: '#6b3026',
      inkAlpha: 0.66,
      fiber: 1,
      creases: 5,
      creaseStrength: 0.8,
      glowTop: '#6d3115',
      glowMid: '#ca6823',
      glowCore: '#ffcc4c',
      glowBase: '#ffe576',
      blockAlpha: 0.52,
      opacity: 0.95,
      emissive: 1.2,
    },
    pattern: { type: 'butterfly' },
    wire: { type: 'round', stays: 4, thickness: 0.007 },
    glow: { color: '#ffa326', intensity: 0.95, halo: 1.0, haloScale: 1.05 },
  },
  {
    id: 'wave',
    name: 'Ondas',
    tagline: 'Alargada y estrecha, con el agua de la laguna dibujada.',
    seed: 6619,
    accent: '#f0c74f',
    scale: 1.0,
    shape: {
      height: 1.78,
      rBottom: 0.4,
      rTop: 0.37,
      squareness: 2.8,
      ovality: 1.02,
      bulge: 0.11,
      shoulder: 0.19,
      topRound: 0.4,
      rimFlare: 0.02,
      profilePower: 1.4,
      radialSegments: 64,
      heightSegments: 46,
    },
    paper: {
      base: '#f5d564',
      top: '#f0c44f',
      bottom: '#fbe278',
      ink: '#524515',
      inkAlpha: 0.68,
      fiber: 0.85,
      creases: 6,
      creaseStrength: 0.8,
      glowTop: '#6e3d10',
      glowMid: '#bd7520',
      glowCore: '#ffd255',
      glowBase: '#ffe77c',
      blockAlpha: 0.55,
      opacity: 0.96,
      emissive: 1.22,
    },
    pattern: { type: 'wave' },
    wire: { type: 'round', stays: 5, thickness: 0.0072 },
    glow: { color: '#ffb02d', intensity: 0.95, halo: 0.95, haloScale: 1.0 },
  },
  {
    id: 'handmade',
    name: 'Artesanal',
    tagline: 'Asimétrica, arrugada y remendada: se nota la mano.',
    seed: 7723,
    accent: '#e8a56a',
    scale: 0.99,
    shape: {
      height: 1.42,
      rBottom: 0.5,
      rTop: 0.45,
      squareness: 3.6,
      ovality: 1.06,
      bulge: 0.04,
      shoulder: 0.21,
      topRound: 0.3,
      rimFlare: 0.06,
      wobble: 0.055,
      lean: 0.035,
      seedAngle: 1.35,
      radialSegments: 56,
      heightSegments: 44,
    },
    paper: {
      base: '#f3c858',
      top: '#ecb442',
      bottom: '#f8d86e',
      ink: '#6b3f1c',
      inkAlpha: 0.72,
      fiber: 1.4,
      creases: 14,
      creaseStrength: 1.6,
      glowTop: '#6d330c',
      glowMid: '#c06316',
      glowCore: '#ffc244',
      glowBase: '#ffde68',
      blockAlpha: 0.68,
      opacity: 0.94,
      emissive: 1.18,
    },
    pattern: { type: 'handmade' },
    wire: { type: 'square', stays: 3, thickness: 0.0105, ribs: 4, color: 0xb09876 },
    glow: { color: '#ff921d', intensity: 1.0, halo: 0.9, haloScale: 0.95 },
  },
  {
    id: 'magic',
    name: 'Mágico',
    tagline: 'Gota retorcida, tinta dorada y más luz que ninguna.',
    seed: 8831,
    accent: '#ffd76a',
    scale: 1.05,
    shape: {
      height: 1.62,
      rBottom: 0.43,
      rTop: 0.51,
      squareness: 2.5,
      ovality: 1.04,
      bulge: 0.1,
      shoulder: 0.32,
      topRound: 0.8,
      rimFlare: 0.03,
      twist: 0.38,
      radialSegments: 72,
      heightSegments: 48,
    },
    paper: {
      base: '#fad866',
      top: '#f6c74e',
      bottom: '#fee680',
      ink: '#8c591c',
      inkAlpha: 0.72,
      fiber: 0.9,
      creases: 4,
      creaseStrength: 0.6,
      glowTop: '#7c430e',
      glowMid: '#d6831e',
      glowCore: '#ffdc5c',
      glowBase: '#ffee7e',
      blockAlpha: 0.42,
      opacity: 0.97,
      emissive: 1.7,
    },
    pattern: { type: 'magic' },
    wire: { type: 'round', stays: 6, thickness: 0.0068, ribs: 6, color: 0xd8b878 },
    glow: { color: '#ffba26', intensity: 1.55, halo: 1.7, haloScale: 1.35 },
  },
];

/* ─── GEOMETRÍA DEL CUERPO DE PAPEL ─── */

export function crossSection(theta: number, squareness: number, ovality: number): { x: number; z: number } {
  const k = 2 / squareness;
  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  const x = sign1(ct) * Math.pow(Math.abs(ct), k);
  const z = sign1(st) * Math.pow(Math.abs(st), k);
  return { x: x * ovality, z: z / ovality };
}

export function bodyRadius(t: number, shape: LanternDesign8Config['shape']): number {
  let r = lerp(shape.rBottom, shape.rTop, Math.pow(t, shape.profilePower || 1));
  r += (shape.bulge || 0) * Math.sin(Math.PI * t) * shape.rBottom;
  if (shape.rimFlare && t < 0.06) {
    r += shape.rimFlare * shape.rBottom * (1 - t / 0.06);
  }
  return r;
}

function wobbleFactor(theta: number, v: number, shape: LanternDesign8Config['shape']): number {
  if (!shape.wobble) return 1;
  const w =
    Math.sin(theta * 3 + (shape.seedAngle || 0)) * 0.55 +
    Math.sin(theta * 5.3 - 1.7) * 0.3 +
    Math.sin(theta * 1.7 + v * 5.1) * 0.35;
  const vMod = 0.7 + 0.3 * Math.sin(v * 9.3 + (shape.seedAngle || 0));
  return 1 + shape.wobble * w * vMod;
}

export function createLanternBodyGeometry8(shapeIn: LanternDesign8Config['shape']): THREE.BufferGeometry {
  const shape = {
    height: 1.45,
    rBottom: 0.5,
    rTop: 0.48,
    squareness: 3.2,
    ovality: 1.0,
    bulge: 0.05,
    shoulder: 0.2,
    topRound: 0.34,
    twist: 0.0,
    wobble: 0.0,
    lean: 0.0,
    rimFlare: 0.02,
    profilePower: 1,
    radialSegments: 64,
    heightSegments: 44,
    capSegments: 14,
    seedAngle: 0.0,
    ...shapeIn,
  };

  const R = shape.radialSegments;
  const Hb = shape.heightSegments;
  const Hc = shape.capSegments;
  const capH = shape.height * shape.shoulder;
  const bodyH = shape.height - capH;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  interface Ring {
    y: number;
    r: number;
    v: number;
  }
  const rings: Ring[] = [];
  for (let j = 0; j <= Hb; j++) {
    const t = j / Hb;
    rings.push({ y: t * bodyH, r: bodyRadius(t, shape), v: (t * bodyH) / shape.height });
  }
  const rEdge = bodyRadius(1, shape);
  for (let j = 1; j <= Hc; j++) {
    const u = j / Hc;
    const y = bodyH + capH * Math.sin((u * Math.PI) / 2);
    const r = rEdge * Math.pow(Math.max(0.0001, Math.cos((u * Math.PI) / 2)), shape.topRound);
    rings.push({ y: y, r: Math.max(r, u > 0.97 ? rEdge * 0.02 : r), v: y / shape.height });
  }

  for (let ri = 0; ri < rings.length; ri++) {
    const ring = rings[ri];
    for (let i = 0; i <= R; i++) {
      const u = i / R;
      const theta = u * Math.PI * 2 + (shape.twist || 0) * ring.v;
      const cs = crossSection(theta, shape.squareness, shape.ovality);
      const wob = wobbleFactor(theta, ring.v, shape);
      const r = ring.r * wob;
      const leanOffset = (shape.lean || 0) * ring.v * ring.v;
      positions.push(cs.x * r + leanOffset, ring.y, cs.z * r);
      uvs.push(u, ring.v);
    }
  }

  const rowSize = R + 1;
  for (let ri = 0; ri < rings.length - 1; ri++) {
    for (let i = 0; i < R; i++) {
      const a = ri * rowSize + i;
      const b = a + 1;
      const c = (ri + 1) * rowSize + i;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  // Vértice central del remate superior
  const apexIndex = positions.length / 3;
  const topRing = rings[rings.length - 1];
  positions.push(shape.lean || 0, topRing.y + topRing.r * 0.12, 0);
  uvs.push(0.5, 1);
  const lastRowStart = (rings.length - 1) * rowSize;
  for (let i = 0; i < R; i++) {
    indices.push(lastRowStart + i, apexIndex, lastRowStart + i + 1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  // Escalar y centrar a la caja unificada estándar (~3.2 de altura, centrada en Y = 0)
  const scaleFactor = 3.2 / shape.height;
  geo.scale(scaleFactor, scaleFactor, scaleFactor);
  geo.translate(0, -1.6, 0);
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  geo.computeBoundingBox();

  return geo;
}

/* ─── ESTRUCTURA DE ALAMBRE / BASE DE LA LINTERNA ─── */

function tubeFromPoints(points: THREE.Vector3[], radius: number, closed: boolean, segments = 40): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(points, closed, 'catmullrom', 0.25);
  return new THREE.TubeGeometry(curve, segments, radius, 5, closed);
}

export function createWireGeometry8(design: LanternDesign8Config): THREE.BufferGeometry {
  const shape = design.shape;
  const cfg = design.wire;
  const scaleFactor = 3.2 / shape.height;
  const rimRadius = (bodyRadius(0, shape) + (shape.rimFlare || 0) * shape.rBottom * 0.5) * scaleFactor;
  const thickness = (cfg.thickness || 0.008) * (shape.rBottom / 0.5) * scaleFactor * 1.5;

  const geometries: THREE.BufferGeometry[] = [];

  // 1. Aro exterior de la base
  const rimPts: THREE.Vector3[] = [];
  const rimSegs = 36;
  for (let i = 0; i < rimSegs; i++) {
    const th = (i / rimSegs) * Math.PI * 2;
    const cs = crossSection(th, shape.squareness, shape.ovality);
    rimPts.push(new THREE.Vector3(cs.x * rimRadius, -1.58, cs.z * rimRadius));
  }
  geometries.push(tubeFromPoints(rimPts, thickness * 1.2, true, 48));

  // 2. Marco interior cuadrado o redondo
  const frameY = -1.45;
  const frameR = rimRadius * 0.52;
  const framePts: THREE.Vector3[] = [];
  if (cfg.type === 'round') {
    for (let i = 0; i < 24; i++) {
      const th = (i / 24) * Math.PI * 2;
      framePts.push(new THREE.Vector3(Math.cos(th) * frameR, frameY, Math.sin(th) * frameR));
    }
  } else {
    for (let i = 0; i < 4; i++) {
      const th = (i / 4) * Math.PI * 2 + Math.PI / 4;
      framePts.push(new THREE.Vector3(Math.cos(th) * frameR * 1.18, frameY, Math.sin(th) * frameR * 1.18));
    }
  }
  geometries.push(tubeFromPoints(framePts, thickness, true, 32));

  // 3. Tirantes
  const stays = cfg.stays || 4;
  for (let i = 0; i < stays; i++) {
    const th = (i / stays) * Math.PI * 2 + Math.PI / 4;
    const cs = crossSection(th, shape.squareness, shape.ovality);
    const a = new THREE.Vector3(cs.x * rimRadius * 0.98, -1.58, cs.z * rimRadius * 0.98);
    const b = new THREE.Vector3(Math.cos(th) * frameR * 0.9, frameY, Math.sin(th) * frameR * 0.9);
    geometries.push(tubeFromPoints([a, a.clone().lerp(b, 0.5).setY(frameY * 0.9), b], thickness * 0.8, false, 12));
  }

  // 4. Travesaños hacia el centro
  for (let i = 0; i < 2; i++) {
    const th = (i / 2) * Math.PI + Math.PI / 4;
    const a = new THREE.Vector3(Math.cos(th) * frameR * 1.15, frameY, Math.sin(th) * frameR * 1.15);
    const b = a.clone().multiplyScalar(-1).setY(frameY);
    geometries.push(tubeFromPoints([a, new THREE.Vector3(0, frameY, 0), b], thickness * 0.75, false, 12));
  }

  // Fusionar geometrías
  // Usamos BufferGeometry simple combinada
  let totalPositions = 0;
  let totalIndices = 0;
  for (const g of geometries) {
    const nonIndexed = g.toNonIndexed();
    totalPositions += nonIndexed.getAttribute('position').array.length;
  }

  const mergedPos = new Float32Array(totalPositions);
  let offset = 0;
  for (const g of geometries) {
    const nonIndexed = g.toNonIndexed();
    const arr = nonIndexed.getAttribute('position').array;
    mergedPos.set(arr, offset);
    offset += arr.length;
    g.dispose();
    nonIndexed.dispose();
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(mergedPos, 3));
  merged.computeVertexNormals();
  return merged;
}

/* ─── DIBUJO DE PATRONES EN CANVAS 2D ─── */

function stroke(ctx: CanvasRenderingContext2D, color: string, width: number, alpha: number, fn: (c: CanvasRenderingContext2D) => void) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha * 0.28;
  ctx.lineWidth = width * 2.6;
  ctx.beginPath();
  fn(ctx);
  ctx.stroke();

  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.beginPath();
  fn(ctx);
  ctx.stroke();
  ctx.restore();
}

function fill(ctx: CanvasRenderingContext2D, color: string, alpha: number, fn: (c: CanvasRenderingContext2D) => void) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha * 0.3;
  ctx.beginPath();
  fn(ctx);
  ctx.fill();

  ctx.globalAlpha = alpha;
  ctx.beginPath();
  fn(ctx);
  ctx.fill();
  ctx.restore();
}

function wrapped(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, rot: number, scale: number, fn: (c: CanvasRenderingContext2D) => void) {
  const offsets = [0];
  if (x < w * 0.12) offsets.push(w);
  if (x > w * 0.88) offsets.push(-w);
  for (let i = 0; i < offsets.length; i++) {
    ctx.save();
    ctx.translate(x + offsets[i], y);
    ctx.rotate(rot);
    ctx.scale(scale, scale);
    fn(ctx);
    ctx.restore();
  }
}

function motifSpiral(ctx: CanvasRenderingContext2D, ink: string, alpha: number, turns = 2.1) {
  stroke(ctx, ink, 0.17, alpha, (c) => {
    let first = true;
    for (let i = 0; i <= 60; i++) {
      const p = i / 60;
      const a = p * Math.PI * 2 * turns;
      const r = 0.12 + p * 0.85;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (first) {
        c.moveTo(x, y);
        first = false;
      } else {
        c.lineTo(x, y);
      }
    }
  });
  stroke(ctx, ink, 0.15, alpha * 0.9, (c) => {
    c.moveTo(Math.cos(Math.PI * 2 * turns) * 0.97, Math.sin(Math.PI * 2 * turns) * 0.97);
    c.bezierCurveTo(1.35, 0.35, 1.2, -0.5, 0.55, -0.85);
  });
}

function motifSwirl(ctx: CanvasRenderingContext2D, ink: string, alpha: number) {
  stroke(ctx, ink, 0.15, alpha, (c) => {
    c.moveTo(-0.95, 0.5);
    c.bezierCurveTo(-0.2, 0.95, 0.35, 0.4, 0.05, -0.05);
    c.bezierCurveTo(-0.2, -0.45, -0.75, -0.2, -0.45, 0.2);
    c.moveTo(0.05, -0.05);
    c.bezierCurveTo(0.5, -0.5, 1.0, -0.2, 0.95, 0.35);
  });
}

function motifTrefoil(ctx: CanvasRenderingContext2D, ink: string, alpha: number) {
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
    stroke(ctx, ink, 0.14, alpha, (c) => {
      const cx = Math.cos(a), cy = Math.sin(a);
      const px = -Math.sin(a), py = Math.cos(a);
      c.moveTo(0, 0);
      c.bezierCurveTo(cx * 0.4 + px * 0.55, cy * 0.4 + py * 0.55, cx * 1.05 + px * 0.3, cy * 1.05 + py * 0.3, cx * 1.0, cy * 1.0);
      c.bezierCurveTo(cx * 1.05 - px * 0.3, cy * 1.05 - py * 0.3, cx * 0.4 - px * 0.55, cy * 0.4 - py * 0.55, 0, 0);
    });
  }
  fill(ctx, ink, alpha * 0.5, (c) => {
    c.arc(0, 0, 0.12, 0, Math.PI * 2);
  });
}

function motifFlower(ctx: CanvasRenderingContext2D, ink: string, alpha: number, petals = 5) {
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2;
    const cx = Math.cos(a), cy = Math.sin(a);
    const px = -Math.sin(a), py = Math.cos(a);
    stroke(ctx, ink, 0.12, alpha, (c) => {
      c.moveTo(0, 0);
      c.bezierCurveTo(cx * 0.35 + px * 0.42, cy * 0.35 + py * 0.42, cx * 0.95 + px * 0.2, cy * 0.95 + py * 0.2, cx, cy);
      c.bezierCurveTo(cx * 0.95 - px * 0.2, cy * 0.95 - py * 0.2, cx * 0.35 - px * 0.42, cy * 0.35 - py * 0.42, 0, 0);
    });
  }
  fill(ctx, ink, alpha * 0.55, (c) => {
    c.arc(0, 0, 0.16, 0, Math.PI * 2);
  });
}

function motifLeaf(ctx: CanvasRenderingContext2D, ink: string, alpha: number) {
  stroke(ctx, ink, 0.13, alpha, (c) => {
    c.moveTo(0, -1);
    c.bezierCurveTo(0.75, -0.35, 0.65, 0.55, 0, 1);
    c.bezierCurveTo(-0.65, 0.55, -0.75, -0.35, 0, -1);
  });
  stroke(ctx, ink, 0.08, alpha * 0.8, (c) => {
    c.moveTo(0, -0.9);
    c.lineTo(0, 0.95);
    for (let i = -2; i <= 2; i++) {
      const y = i * 0.3;
      c.moveTo(0, y);
      c.lineTo(0.38, y + 0.22);
      c.moveTo(0, y);
      c.lineTo(-0.38, y + 0.22);
    }
  });
}

function motifBranch(ctx: CanvasRenderingContext2D, ink: string, alpha: number) {
  stroke(ctx, ink, 0.12, alpha, (c) => {
    c.moveTo(-1, 0.7);
    c.bezierCurveTo(-0.3, 0.3, 0.2, -0.1, 1, -0.75);
  });
  for (let i = 0; i < 5; i++) {
    const t = 0.15 + i * 0.18;
    const x = -1 + t * 2;
    const y = 0.7 - t * 1.45;
    const s = 0.3 - i * 0.02;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(i % 2 === 0 ? -0.9 : 0.9);
    ctx.scale(s, s);
    motifLeaf(ctx, ink, alpha * 0.9);
    ctx.restore();
  }
}

function motifStar4(ctx: CanvasRenderingContext2D, ink: string, alpha: number) {
  fill(ctx, ink, alpha, (c) => {
    c.moveTo(0, -1);
    c.bezierCurveTo(0.14, -0.2, 0.2, -0.14, 1, 0);
    c.bezierCurveTo(0.2, 0.14, 0.14, 0.2, 0, 1);
    c.bezierCurveTo(-0.14, 0.2, -0.2, 0.14, -1, 0);
    c.bezierCurveTo(-0.2, -0.14, -0.14, -0.2, 0, -1);
  });
}

function motifStar5(ctx: CanvasRenderingContext2D, ink: string, alpha: number) {
  fill(ctx, ink, alpha, (c) => {
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 1 : 0.42;
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.closePath();
  });
}

function motifMoon(ctx: CanvasRenderingContext2D, ink: string, alpha: number) {
  fill(ctx, ink, alpha, (c) => {
    c.arc(0, 0, 1, Math.PI * 0.35, Math.PI * 1.65);
    c.bezierCurveTo(-0.15, 0.55, -0.15, -0.55, Math.cos(Math.PI * 0.35), Math.sin(Math.PI * 0.35) * -1);
    c.closePath();
  });
}

function motifConstellation(ctx: CanvasRenderingContext2D, ink: string, alpha: number, rng: () => number) {
  const n = 4 + Math.floor(rng() * 3);
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    pts.push([rngRange(rng, -1, 1), rngRange(rng, -1, 1)]);
  }
  stroke(ctx, ink, 0.05, alpha * 0.6, (c) => {
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
  });
  for (let i = 0; i < pts.length; i++) {
    fill(ctx, ink, alpha, (c) => {
      c.arc(pts[i][0], pts[i][1], 0.09 + rng() * 0.07, 0, Math.PI * 2);
    });
  }
}

function motifButterfly(ctx: CanvasRenderingContext2D, ink: string, alpha: number, open = 1) {
  const spread = open;
  for (let s = -1; s <= 1; s += 2) {
    fill(ctx, ink, alpha * 0.55, (c) => {
      c.moveTo(0, 0);
      c.bezierCurveTo(s * 0.35 * spread, -0.95, s * 1.15 * spread, -0.85, s * 0.98 * spread, -0.15);
      c.bezierCurveTo(s * 0.9 * spread, 0.1, s * 0.35 * spread, 0.08, 0, 0);
    });
    fill(ctx, ink, alpha * 0.45, (c) => {
      c.moveTo(0, 0.02);
      c.bezierCurveTo(s * 0.5 * spread, 0.25, s * 0.85 * spread, 0.6, s * 0.52 * spread, 0.95);
      c.bezierCurveTo(s * 0.22 * spread, 1.0, s * 0.08 * spread, 0.5, 0, 0.05);
    });
    stroke(ctx, ink, 0.07, alpha * 0.9, (c) => {
      c.moveTo(0, 0);
      c.bezierCurveTo(s * 0.35 * spread, -0.95, s * 1.15 * spread, -0.85, s * 0.98 * spread, -0.15);
      c.bezierCurveTo(s * 0.9 * spread, 0.1, s * 0.35 * spread, 0.08, 0, 0);
    });
    stroke(ctx, ink, 0.05, alpha * 0.8, (c) => {
      c.moveTo(0, -0.1);
      c.quadraticCurveTo(s * 0.35, -0.75, s * 0.55, -1.0);
    });
  }
  stroke(ctx, ink, 0.09, alpha, (c) => {
    c.moveTo(0, -0.18);
    c.lineTo(0, 0.62);
  });
}

function motifWave(ctx: CanvasRenderingContext2D, ink: string, alpha: number) {
  for (let i = 0; i < 3; i++) {
    const off = (i - 1) * 0.34;
    const len = 1 - Math.abs(i - 1) * 0.28;
    stroke(ctx, ink, 0.11, alpha * (1 - Math.abs(i - 1) * 0.2), (c) => {
      c.moveTo(-len, off);
      c.bezierCurveTo(-len * 0.4, off - 0.4, len * 0.4, off + 0.4, len, off);
    });
  }
}

function motifDrop(ctx: CanvasRenderingContext2D, ink: string, alpha: number) {
  stroke(ctx, ink, 0.12, alpha, (c) => {
    c.moveTo(0, -1);
    c.bezierCurveTo(0.7, -0.1, 0.62, 0.85, 0, 0.9);
    c.bezierCurveTo(-0.62, 0.85, -0.7, -0.1, 0, -1);
  });
  stroke(ctx, ink, 0.07, alpha * 0.55, (c) => {
    c.moveTo(-0.28, 0.2);
    c.quadraticCurveTo(-0.34, 0.6, -0.05, 0.68);
  });
}

function motifWhirl(ctx: CanvasRenderingContext2D, ink: string, alpha: number) {
  stroke(ctx, ink, 0.1, alpha, (c) => {
    let first = true;
    for (let i = 0; i <= 50; i++) {
      const p = i / 50;
      const a = p * Math.PI * 2 * 1.7;
      const r = 0.15 + p * 0.85;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r * 0.55;
      if (first) {
        c.moveTo(x, y);
        first = false;
      } else {
        c.lineTo(x, y);
      }
    }
  });
}

function motifDust(ctx: CanvasRenderingContext2D, ink: string, alpha: number, rng: () => number) {
  const n = 5 + Math.floor(rng() * 6);
  for (let i = 0; i < n; i++) {
    const x = rngRange(rng, -1, 1);
    const y = rngRange(rng, -1, 1);
    const r = 0.05 + rng() * 0.13;
    fill(ctx, ink, alpha * (0.4 + rng() * 0.6), (c) => {
      c.arc(x, y, r, 0, Math.PI * 2);
    });
  }
}

function makeSlots(w: number, h: number, cols: number, rows: number, rng: () => number, topMargin = 0.08, bottomMargin = 0.05) {
  const top = h * topMargin;
  const bottom = h * bottomMargin;
  const usable = h - top - bottom;
  const slots: { x: number; y: number; row: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cw = w / cols;
      const ch = usable / rows;
      slots.push({
        x: (c + 0.5) * cw + rngRange(rng, -0.33, 0.33) * cw,
        y: top + (r + 0.5) * ch + rngRange(rng, -0.33, 0.33) * ch,
        row: r,
      });
    }
  }
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = slots[i];
    slots[i] = slots[j];
    slots[j] = tmp;
  }
  return slots;
}

function paintPaperFibers(ctx: CanvasRenderingContext2D, w: number, h: number, rng: () => number, strength = 1) {
  ctx.save();
  ctx.globalAlpha = 0.05 * strength;
  for (let i = 0; i < 140; i++) {
    const y = rng() * h;
    const len = 30 + rng() * 240;
    const x = rng() * w;
    ctx.strokeStyle = rng() > 0.5 ? '#ffe885' : '#9b7b53';
    ctx.lineWidth = 0.6 + rng() * 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(
      x + len * 0.3,
      y + (rng() - 0.5) * 20,
      x + len * 0.7,
      y + (rng() - 0.5) * 20,
      x + len,
      y + (rng() - 0.5) * 10
    );
    ctx.stroke();
  }
  for (let i = 0; i < 40; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const r = 30 + rng() * 140;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const warm = rng() > 0.5;
    g.addColorStop(0, warm ? 'rgba(255,225,115,0.12)' : 'rgba(180,115,45,0.08)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.55 * strength;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function paintCreases(ctx: CanvasRenderingContext2D, w: number, h: number, rng: () => number, count = 6, strength = 1) {
  ctx.save();
  for (let i = 0; i < count; i++) {
    const x = rng() * w;
    const wobble = (rng() - 0.5) * 50;
    ctx.globalAlpha = (0.05 + rng() * 0.09) * strength;
    ctx.strokeStyle = rng() > 0.5 ? '#ffe885' : '#6d5233';
    ctx.lineWidth = 1 + rng() * 2.0;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + wobble, h * 0.33, x - wobble, h * 0.66, x + wobble * 0.4, h);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPatternSet(
  type: string,
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  seed: number,
  palette: { ink: string; inkAlpha: number; block: string; blockAlpha: number },
  mode: 'albedo' | 'emissive'
) {
  const rng = makeRng(seed);
  const ink = mode === 'emissive' ? palette.block : palette.ink;
  const alpha = mode === 'emissive' ? palette.blockAlpha : palette.inkAlpha;

  switch (type) {
    case 'floral': {
      const slots = makeSlots(w, h, 6, 6, rng, 0.06, 0.04);
      for (let i = 0; i < 30 && i < slots.length; i++) {
        const s = slots[i];
        const r = rng();
        const rot = rngRange(rng, -Math.PI, Math.PI);
        if (r < 0.34) {
          wrapped(ctx, s.x, s.y, w, rot, rngRange(rng, 0.05, 0.075) * h, (c) => motifFlower(c, ink, alpha, 5));
        } else if (r < 0.55) {
          wrapped(ctx, s.x, s.y, w, rot, rngRange(rng, 0.038, 0.055) * h, (c) => motifFlower(c, ink, alpha * 0.9, 6));
        } else if (r < 0.8) {
          wrapped(ctx, s.x, s.y, w, rot, rngRange(rng, 0.035, 0.06) * h, (c) => motifLeaf(c, ink, alpha * 0.85));
        } else {
          wrapped(ctx, s.x, s.y, w, rot * 0.3, rngRange(rng, 0.06, 0.09) * h, (c) => motifBranch(c, ink, alpha * 0.8));
        }
      }
      stroke(ctx, ink, h * 0.004, alpha * 0.5, (c) => {
        c.moveTo(0, h * 0.14);
        for (let x = 0; x <= w; x += w / 12) {
          c.quadraticCurveTo(x + w / 24, h * (0.14 + (Math.floor(x / (w / 12)) % 2 ? 0.035 : -0.035)), x + w / 12, h * 0.14);
        }
      });
      break;
    }
    case 'spiral': {
      const slots = makeSlots(w, h, 5, 7, rng, 0.05, 0.03);
      for (let i = 0; i < 28 && i < slots.length; i++) {
        const s = slots[i];
        const band = s.y / h;
        const bandFactor = 0.55 + Math.sin(band * Math.PI) * 0.75;
        const size = rngRange(rng, 0.032, 0.075) * h * bandFactor;
        const rot = rngRange(rng, -Math.PI, Math.PI);
        if (rng() < 0.62) {
          wrapped(ctx, s.x, s.y, w, rot, size, (c) => motifSpiral(c, ink, alpha, rngRange(rng, 1.5, 3.1)));
        } else {
          wrapped(ctx, s.x, s.y, w, rot, size * 1.1, (c) => motifSwirl(c, ink, alpha * 0.95));
        }
      }
      for (let i = 0; i < 3; i++) {
        const y0 = h * (0.2 + i * 0.25);
        stroke(ctx, ink, h * 0.0035, alpha * 0.35, (c) => {
          c.moveTo(0, y0);
          c.bezierCurveTo(w * 0.3, y0 - h * 0.09, w * 0.7, y0 + h * 0.09, w, y0);
        });
      }
      break;
    }
    case 'star': {
      const dust = 160;
      for (let i = 0; i < dust; i++) {
        const x = rng() * w;
        const y = h * 0.03 + rng() * h * 0.94;
        const r = rngRange(rng, 0.0012, 0.0045) * h;
        fill(ctx, ink, alpha * rngRange(rng, 0.3, 0.9), (c) => {
          c.arc(x, y, r, 0, Math.PI * 2);
        });
      }
      const slots = makeSlots(w, h, 5, 6, rng, 0.06, 0.04);
      for (let i = 0; i < 22 && i < slots.length; i++) {
        const s = slots[i];
        const r = rng();
        const rot = rngRange(rng, -0.6, 0.6);
        if (r < 0.45) {
          const bright = mode === 'emissive';
          wrapped(ctx, s.x, s.y, w, rot, rngRange(rng, 0.028, 0.055) * h, (c) =>
            motifStar4(c, bright ? '#ffe67e' : ink, bright ? 0.95 : alpha)
          );
        } else if (r < 0.62) {
          wrapped(ctx, s.x, s.y, w, rot, rngRange(rng, 0.03, 0.05) * h, (c) => motifStar5(c, ink, alpha * 0.9));
        } else if (r < 0.78) {
          wrapped(ctx, s.x, s.y, w, rngRange(rng, -0.4, 0.4), rngRange(rng, 0.045, 0.07) * h, (c) =>
            motifMoon(c, ink, alpha * 0.85)
          );
        } else {
          wrapped(ctx, s.x, s.y, w, 0, rngRange(rng, 0.06, 0.1) * h, (c) => motifConstellation(c, ink, alpha * 0.8, rng));
        }
      }
      break;
    }
    case 'butterfly': {
      const n = 24;
      for (let i = 0; i < n; i++) {
        const t = i / n;
        const swarm = Math.pow(rng(), 1.6);
        const x = (w * (0.15 + t * 0.9) + rngRange(rng, -w * 0.18, w * 0.18)) % w;
        const y = h * (0.9 - t * 0.78) + rngRange(rng, -h * 0.07, h * 0.07);
        const size = rngRange(rng, 0.03, 0.085) * h * (0.7 + swarm * 0.6);
        const rot = rngRange(rng, -0.9, 0.9);
        wrapped(ctx, x, Math.max(h * 0.04, Math.min(h * 0.97, y)), w, rot, size, (c) =>
          motifButterfly(c, ink, alpha * rngRange(rng, 0.7, 1), rngRange(rng, 0.45, 1.05))
        );
      }
      for (let i = 0; i < 4; i++) {
        const y0 = h * rngRange(rng, 0.15, 0.85);
        stroke(ctx, ink, h * 0.0025, alpha * 0.22, (c) => {
          c.moveTo(0, y0);
          c.bezierCurveTo(w * 0.35, y0 - h * 0.12, w * 0.65, y0 + h * 0.12, w, y0 - h * 0.04);
        });
      }
      break;
    }
    case 'wave': {
      const bands = 6;
      for (let b = 0; b < bands; b++) {
        const y = h * (0.1 + (b / (bands - 1)) * 0.82);
        const amp = h * rngRange(rng, 0.012, 0.028);
        const freq = rngInt(rng, 3, 5);
        stroke(ctx, ink, h * rngRange(rng, 0.003, 0.005), alpha * rngRange(rng, 0.5, 0.85), (c) => {
          c.moveTo(0, y);
          const step = w / (freq * 2);
          for (let i = 0; i < freq * 2; i++) {
            const x0 = i * step;
            c.quadraticCurveTo(x0 + step * 0.5, y + (i % 2 ? amp : -amp), x0 + step, y);
          }
        });
      }
      const slots = makeSlots(w, h, 5, 5, rng, 0.08, 0.06);
      for (let i = 0; i < 18 && i < slots.length; i++) {
        const s = slots[i];
        const r = rng();
        if (r < 0.4) {
          wrapped(ctx, s.x, s.y, w, rngRange(rng, -0.3, 0.3), rngRange(rng, 0.035, 0.06) * h, (c) => motifWave(c, ink, alpha * 0.9));
        } else if (r < 0.72) {
          wrapped(ctx, s.x, s.y, w, rngRange(rng, -0.25, 0.25), rngRange(rng, 0.022, 0.04) * h, (c) =>
            motifDrop(c, ink, alpha * 0.85)
          );
        } else {
          wrapped(ctx, s.x, s.y, w, 0, rngRange(rng, 0.03, 0.06) * h, (c) => motifWhirl(c, ink, alpha * 0.8));
        }
      }
      break;
    }
    case 'handmade': {
      const slots = makeSlots(w, h, 4, 4, rng, 0.1, 0.08);
      for (let i = 0; i < 12 && i < slots.length; i++) {
        const s = slots[i];
        const rot = rngRange(rng, -0.9, 0.9);
        const sx = rngRange(rng, 0.03, 0.07) * h;
        const r = rng();
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(rot);
        ctx.scale(sx * rngRange(rng, 0.85, 1.15), sx * rngRange(rng, 0.85, 1.2));
        if (r < 0.45) motifSpiral(ctx, ink, alpha * 0.85, rngRange(rng, 1.4, 2.4));
        else if (r < 0.75) motifTrefoil(ctx, ink, alpha * 0.8);
        else motifSwirl(ctx, ink, alpha * 0.8);
        ctx.restore();
      }
      for (let i = 0; i < 8; i++) {
        const x = rng() * w;
        const y = h * rngRange(rng, 0.08, 0.92);
        const pw = rngRange(rng, 0.03, 0.08) * h;
        const ph = rngRange(rng, 0.02, 0.05) * h;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rngRange(rng, -0.35, 0.35));
        ctx.globalAlpha = alpha * 0.16;
        ctx.fillStyle = ink;
        ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
        ctx.globalAlpha = alpha * 0.3;
        ctx.strokeStyle = ink;
        ctx.lineWidth = h * 0.0018;
        ctx.strokeRect(-pw / 2, -ph / 2, pw, ph);
        ctx.restore();
      }
      const seam = rng() * w;
      ctx.save();
      ctx.globalAlpha = alpha * 0.35;
      ctx.strokeStyle = ink;
      ctx.lineWidth = h * 0.0022;
      ctx.setLineDash([h * 0.012, h * 0.016]);
      ctx.beginPath();
      ctx.moveTo(seam, 0);
      ctx.bezierCurveTo(seam + h * 0.02, h * 0.35, seam - h * 0.02, h * 0.7, seam + h * 0.01, h);
      ctx.stroke();
      ctx.restore();
      break;
    }
    case 'magic': {
      const bright = mode === 'emissive';
      stroke(ctx, ink, h * 0.005, alpha * 0.45, (c) => {
        c.moveTo(0, h * 0.86);
        for (let i = 0; i <= 48; i++) {
          const p = i / 48;
          c.lineTo(p * w, h * (0.86 - p * 0.7) + Math.sin(p * Math.PI * 3) * h * 0.06);
        }
      });
      const slots = makeSlots(w, h, 6, 7, rng, 0.05, 0.04);
      for (let i = 0; i < 34 && i < slots.length; i++) {
        const s = slots[i];
        const r = rng();
        const rot = rngRange(rng, -Math.PI, Math.PI);
        const size = rngRange(rng, 0.028, 0.07) * h;
        if (r < 0.26) {
          wrapped(ctx, s.x, s.y, w, rot, size, (c) => motifSpiral(c, ink, alpha, rngRange(rng, 1.6, 2.8)));
        } else if (r < 0.48) {
          wrapped(ctx, s.x, s.y, w, rot * 0.2, size * 0.8, (c) => motifStar4(c, bright ? '#ffe67e' : ink, bright ? 0.9 : alpha));
        } else if (r < 0.68) {
          wrapped(ctx, s.x, s.y, w, rot, size, (c) => motifFlower(c, ink, alpha * 0.9, 6));
        } else if (r < 0.84) {
          wrapped(ctx, s.x, s.y, w, rot, size * 0.9, (c) => motifSwirl(c, ink, alpha * 0.85));
        } else {
          wrapped(ctx, s.x, s.y, w, 0, size * 1.2, (c) => motifDust(c, bright ? '#ffdf6b' : ink, bright ? 0.7 : alpha * 0.8, rng));
        }
      }
      for (let i = 0; i < 90; i++) {
        const x = rng() * w;
        const y = h * 0.04 + rng() * h * 0.92;
        const r = rngRange(rng, 0.001, 0.004) * h;
        fill(ctx, bright ? '#ffdf6b' : ink, (bright ? 0.6 : alpha) * rngRange(rng, 0.25, 0.9), (c) => {
          c.arc(x, y, r, 0, Math.PI * 2);
        });
      }
      break;
    }
    case 'classic':
    default: {
      const slots = makeSlots(w, h, 5, 5, rng);
      const plan = [
        { n: 4, size: 0.085, motif: 'spiral', turns: 2.2 },
        { n: 5, size: 0.062, motif: 'spiral', turns: 1.8 },
        { n: 6, size: 0.042, motif: 'swirl' },
        { n: 3, size: 0.055, motif: 'trefoil' },
      ];
      let k = 0;
      for (let p = 0; p < plan.length; p++) {
        for (let i = 0; i < plan[p].n && k < slots.length; i++, k++) {
          const s = slots[k];
          const size = plan[p].size * h;
          wrapped(ctx, s.x, s.y, w, rngRange(rng, -0.5, 0.5), size, (c) => {
            if (plan[p].motif === 'spiral') motifSpiral(c, ink, alpha, plan[p].turns);
            else if (plan[p].motif === 'swirl') motifSwirl(c, ink, alpha);
            else motifTrefoil(c, ink, alpha);
          });
        }
      }
      break;
    }
  }
}

/* ─── GENERACIÓN DE TEXTURAS DE PAPEL (ALBEDO + EMISSIVE) ─── */

const TEX_W = 768;
const TEX_H = 480;

export function buildPaperTextures8(design: LanternDesign8Config): {
  map: THREE.CanvasTexture;
  emissiveMap: THREE.CanvasTexture;
} {
  const paper = design.paper;
  const seed = design.seed;

  // 1. Albedo
  const albedo = document.createElement('canvas');
  albedo.width = TEX_W;
  albedo.height = TEX_H;
  const a = albedo.getContext('2d')!;
  const rngA = makeRng(seed + 991);

  const base = a.createLinearGradient(0, 0, 0, TEX_H);
  base.addColorStop(0, paper.top || paper.base);
  base.addColorStop(0.55, paper.base);
  base.addColorStop(1, paper.bottom || paper.base);
  a.fillStyle = base;
  a.fillRect(0, 0, TEX_W, TEX_H);

  paintPaperFibers(a, TEX_W, TEX_H, rngA, paper.fiber ?? 1);
  paintCreases(a, TEX_W, TEX_H, rngA, paper.creases || 6, paper.creaseStrength || 1);

  drawPatternSet(
    design.pattern.type,
    a,
    TEX_W,
    TEX_H,
    seed,
    {
      ink: paper.ink,
      inkAlpha: paper.inkAlpha ?? 0.72,
      block: '#000000',
      blockAlpha: 0.8,
    },
    'albedo'
  );

  // 2. Emissive Map
  const emissive = document.createElement('canvas');
  emissive.width = TEX_W;
  emissive.height = TEX_H;
  const e = emissive.getContext('2d')!;
  const rngE = makeRng(seed + 991);

  const glow = e.createLinearGradient(0, 0, 0, TEX_H);
  glow.addColorStop(0.0, paper.glowTop || '#4a2f14');
  glow.addColorStop(0.35, paper.glowMid || '#a8641f');
  glow.addColorStop(0.72, paper.glowCore || '#ffd79a');
  glow.addColorStop(0.9, paper.glowCore || '#ffd79a');
  glow.addColorStop(1.0, paper.glowBase || '#ffedc4');
  e.fillStyle = glow;
  e.fillRect(0, 0, TEX_W, TEX_H);

  e.save();
  e.globalAlpha = 0.5;
  paintPaperFibers(e, TEX_W, TEX_H, rngE, 0.7);
  e.restore();

  if (design.wire && design.wire.shadow !== false) {
    e.save();
    e.globalAlpha = 0.22;
    e.strokeStyle = '#000000';
    e.lineWidth = TEX_H * 0.006;
    e.beginPath();
    e.moveTo(0, TEX_H * 0.965);
    e.lineTo(TEX_W, TEX_H * 0.965);
    e.stroke();
    e.restore();
  }

  drawPatternSet(
    design.pattern.type,
    e,
    TEX_W,
    TEX_H,
    seed,
    {
      ink: paper.ink,
      inkAlpha: 0.72,
      block: '#140b03',
      blockAlpha: paper.blockAlpha ?? 0.62,
    },
    'emissive'
  );

  const map = new THREE.CanvasTexture(albedo);
  map.wrapS = THREE.RepeatWrapping;
  map.anisotropy = 8;

  const emissiveMap = new THREE.CanvasTexture(emissive);
  emissiveMap.wrapS = THREE.RepeatWrapping;
  emissiveMap.anisotropy = 8;

  return { map, emissiveMap };
}
