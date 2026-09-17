/**
 * PÉTALO MAESTRO 3D — MODELADO SEGÚN HOJA TÉCNICA DE ESPECIFICACIONES
 *
 * Reproduce exactamente:
 * 1. ESTRUCTURA DE LA MALLA:
 *    - Vista Frontal: base estrecha fruncida, cuerpo ancho tipo pala/cáparro (ratio 1.4:1),
 *      ápice con gancho recurvado estilizado asimétrico.
 *    - Vista Lateral: curvatura longitudinal en 'S' continua (base erguida, caída y gancho terminal hacia atrás).
 *    - Vista Superior: curvatura transversal cóncava (copa hacia afuera).
 * 2. GROSOR VARIABLE: volumen 3D real (fleshy en base y quilla central, fino en bordes).
 * 3. PROPIEDADES DEL MATERIAL:
 *    - MeshPhysicalMaterial con Clearcoat (efecto húmedo), Roughness bajo, IOR 1.42,
 *      mapas PBR (Color, Normales, Emisión, Rugosidad) y partículas bioluminiscentes.
 */

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PETAL_CONFIG, PetalConfig } from '../config/petalConfig';
import { generatePetalTextures } from '../utils/petalTexture';

export interface PetalProps {
  config?: Partial<PetalConfig>;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  showSparkles?: boolean;
  wireframe?: boolean;
}

export function Petal({
  config: configOverride,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1.0,
  showSparkles = true,
  wireframe = false,
}: PetalProps) {
  const cfg = useMemo(() => ({ ...PETAL_CONFIG, ...configOverride }), [configOverride]);

  // Generación de texturas PBR según ficha técnica y colores configurables
  const textures = useMemo(
    () =>
      generatePetalTextures(1024, {
        baseColor: cfg.baseColor,
        midColor: cfg.midColor,
        tipColor: cfg.tipColor,
        veinGlowColor: cfg.veinGlowColor,
      }),
    [cfg.baseColor, cfg.midColor, cfg.tipColor, cfg.veinGlowColor]
  );

  // Generación de la geometría 3D
  const geometry = useMemo(() => {
    const {
      length,
      width,
      thicknessBase,
      thicknessEdge,
      curvatureS,
      cupTransverse,
      tipHookIntensity,
      tipHookAngle,
      edgeRuffles,
      veinRelief,
      segments,
    } = cfg;

    const outerDescentMult = cfg.outerDescentMult ?? 1.25;
    const tipRollTurns = cfg.tipRollTurns ?? 0;
    const tipRollStart = cfg.tipRollStart ?? 0.75;
    const tipRollDirection = cfg.tipRollDirection ?? -1;
    const tipRollTwist = cfg.tipRollTwist ?? 0;

    const uSegs = segments.length;
    const vSegs = segments.width;

    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const baseRatio = cfg.baseWidthRatio ?? 0.22;

    // Helper: Contorno de anchura (Frontal Wireframe con suficiente anchura en la cinta enrollada)
    function getHalfWidth(u: number): number {
      const uClamped = Math.max(0, Math.min(1, u));

      let profile = 0;
      if (uClamped < 0.16) {
        // Base ensanchada de forma orgánica y controlada para cubrir los huecos centrales
        const t = uClamped / 0.16;
        profile = baseRatio + (0.42 - baseRatio) * Math.sin(t * (Math.PI / 2));
      } else if (uClamped < 0.58) {
        // Transición progresiva y suave hacia el cuerpo principal
        const t = (uClamped - 0.16) / 0.42;
        profile = 0.42 + 0.58 * Math.sin(t * (Math.PI / 2));
      } else if (uClamped < 0.74) {
        // Zona superior ancha con suave convergencia
        const t = (uClamped - 0.58) / 0.16;
        profile = 1.0 - 0.32 * (t * t);
      } else {
        // Ápice estilizado terminal: se estrecha elegantemente pero conserva cuerpo de cinta
        // para que la espiral 3D de la punta enrollada tenga presencia, volumen y textura visibles
        const t = (uClamped - 0.74) / 0.26;
        profile = 0.68 * (1.0 - 0.64 * Math.pow(t, 0.85));
      }

      return (width * 0.5) * Math.max(0.14, profile);
    }

    // Funciones base de elevación Z y Y para la espina longitudinal
    function getZBase(uVal: number): number {
      const domeArch = Math.sin(Math.pow(uVal, 0.70) * Math.PI) * (0.42 * curvatureS);
      const outerDescent = -Math.pow(uVal, 1.40) * (outerDescentMult * curvatureS);
      const organicWave = Math.sin(uVal * Math.PI * 2.0) * (0.05 * curvatureS);
      return domeArch + outerDescent + organicWave;
    }

    function getYBase(uVal: number): number {
      return (uVal - 0.46) * length;
    }

    // Helper: Curvatura Longitudinal en '∩' (Paraguas Invertido Orgánico) + Enrollado Apical
    function getLongitudinalSpine(u: number) {
      const yBase = getYBase(u);
      let zBase = getZBase(u);
      let xOffset = Math.sin(u * Math.PI) * 0.04;

      // CASO 1: Sin enrollado activo (modo gancho apical clásico)
      if (tipRollTurns <= 0.001) {
        if (u > 0.80) {
          const tipT = (u - 0.80) / 0.20;
          const hookFactor = Math.pow(tipT, 1.6) * tipHookIntensity;
          zBase -= Math.sin(tipT * tipHookAngle * Math.PI) * hookFactor * 0.95;
          xOffset -= hookFactor * 0.35;
        }
        const eps = 0.002;
        const dy = getYBase(Math.min(1, u + eps)) - getYBase(Math.max(0, u - eps));
        const dz = getZBase(Math.min(1, u + eps)) - getZBase(Math.max(0, u - eps));
        const tangentAngle = Math.atan2(dz, dy);
        return { xOffset, y: yBase, z: zBase, tangentAngle };
      }

      // CASO 2: Antes del inicio del enrollado apical
      if (u <= tipRollStart) {
        const eps = 0.002;
        const dy = getYBase(Math.min(1, u + eps)) - getYBase(Math.max(0, u - eps));
        const dz = getZBase(Math.min(1, u + eps)) - getZBase(Math.max(0, u - eps));
        const tangentAngle = Math.atan2(dz, dy);
        return { xOffset, y: yBase, z: zBase, tangentAngle };
      }

      // CASO 3: Enrollado apical activo (espiral paramétrica continua de curvatura C1/C2)
      const u0 = tipRollStart;
      const y0 = getYBase(u0);
      const z0 = getZBase(u0);

      const eps = 0.002;
      const dy0 = getYBase(u0) - getYBase(u0 - eps);
      const dz0 = getZBase(u0) - getZBase(u0 - eps);
      const initialAngle = Math.atan2(dz0, dy0);

      const t = (u - u0) / (1 - u0); // [0, 1]
      const tipSegmentLength = (1 - u0) * length * 1.15;
      const totalAngle = tipRollTurns * 2 * Math.PI * tipRollDirection;

      // Integración diferencial a lo largo de la espiral
      const steps = Math.max(6, Math.round(t * 36));
      const dt = t / steps;
      const ds = dt * tipSegmentLength;
      let curY = y0;
      let curZ = z0;
      let currentTangent = initialAngle;

      for (let s = 0; s < steps; s++) {
        const midT = (s + 0.5) * dt;
        // Crecimiento progresivo y suave de la curvatura en espiral
        const rollProgress = Math.pow(midT, 1.25);
        const theta = initialAngle + totalAngle * rollProgress;
        currentTangent = theta;
        curY += Math.cos(theta) * ds;
        curZ += Math.sin(theta) * ds;
      }

      const finalTangent = initialAngle + totalAngle * Math.pow(t, 1.25);
      xOffset += Math.sin(t * Math.PI) * tipRollTwist;

      return { xOffset, y: curY, z: curZ, tangentAngle: finalTangent };
    }

    // Generar malla tridimensional (cara frontal y cara posterior con volumen)
    for (let i = 0; i <= uSegs; i++) {
      const u = i / uSegs;
      const spine = getLongitudinalSpine(u);
      const halfW = getHalfWidth(u);
      const ny = -Math.sin(spine.tangentAngle);
      const nz = Math.cos(spine.tangentAngle);

      // Suave amortiguación de acanaladuras en el ápice para un rizo limpio y libre de colisiones
      const rollDamp = u > tipRollStart ? Math.max(0.25, 1.0 - ((u - tipRollStart) / (1.0 - tipRollStart)) * 0.6) : 1.0;

      for (let j = 0; j <= vSegs; j++) {
        const v = j / vSegs; // 0 = borde izquierdo, 0.5 = nervio central, 1 = borde derecho
        const vNorm = (v - 0.5) * 2; // -1 a 1
        const absV = Math.abs(vNorm);

        // Curvatura transversal en arco convexo / sombrilla (Vista Superior)
        const cupDepth = (1 - absV * absV) * (cupTransverse * (0.4 + 0.6 * Math.sin(u * Math.PI)));

        // Acanaladuras longitudinales que acompañan las venas
        const fluting = Math.cos(vNorm * Math.PI * 6) * (veinRelief * (1 - absV * 0.4) * Math.sin(u * Math.PI));

        // Nervadura central prominente
        const midribRidge = Math.exp(-Math.pow(absV * 7, 2)) * (veinRelief * 1.6);

        // Ondulaciones orgánicas en el borde
        const rufflePhase = u * 24 + (vNorm > 0 ? 0 : 2.5);
        const ruffle = Math.sin(rufflePhase) * edgeRuffles * Math.pow(absV, 2.2);

        // Desplazamiento normal combinado amortiguado suavemente en la punta enrollada
        const normalDisplacement = (cupDepth + fluting + midribRidge + ruffle) * rollDamp;

        // Coordenada X transversal con leve asimetría orgánica
        const asymLobe = vNorm < 0 ? 1.06 : 0.94;
        const x = spine.xOffset + vNorm * halfW * asymLobe;

        // Coordenadas Y y Z orientadas rigurosamente según el vector normal exacto (ny, nz)
        const y = spine.y + normalDisplacement * ny;
        const z = spine.z + normalDisplacement * nz;

        vertices.push(x, y, z);

        // UVs continuos: u=0 en la base (morado) y u=1 en la punta (dorado)
        uvs.push(v, u);
      }
    }

    // Índices de triángulos con orientación de normales consistente
    const stride = vSegs + 1;
    for (let i = 0; i < uSegs; i++) {
      for (let j = 0; j < vSegs; j++) {
        const a = i * stride + j;
        const b = (i + 1) * stride + j;
        const c = (i + 1) * stride + (j + 1);
        const d = i * stride + (j + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    return geom;
  }, [cfg]);

  // Partículas bioluminiscentes (polvo estelar / "stardust")
  const sparklesGeometry = useMemo(() => {
    if (!showSparkles) return null;
    const count = 160;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const cGold = new THREE.Color('#fbbf24');
    const cPink = new THREE.Color('#f472b6');
    const cWhite = new THREE.Color('#ffffff');

    for (let i = 0; i < count; i++) {
      const u = 0.08 + Math.pow(Math.random(), 1.6) * 0.85;
      const v = (Math.random() - 0.5) * 2;
      const y = (u - 0.46) * cfg.length;
      const halfW = (cfg.width * 0.5) * Math.sin(u * Math.PI * 0.85);

      const domeArch = Math.sin(Math.pow(u, 0.70) * Math.PI) * (0.42 * cfg.curvatureS);
      const outerDescent = -Math.pow(u, 1.40) * (1.25 * cfg.curvatureS);
      const organicWave = Math.sin(u * Math.PI * 2.0) * (0.05 * cfg.curvatureS);
      const spineZ = domeArch + outerDescent + organicWave;

      const x = v * halfW * 0.75 + (Math.random() - 0.5) * 0.08;
      const z =
        spineZ +
        (1 - Math.abs(v)) * cfg.cupTransverse * (0.4 + 0.6 * Math.sin(u * Math.PI)) +
        0.02 +
        Math.random() * 0.06;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      const pick = Math.random();
      const pColor = pick > 0.6 ? cGold : pick > 0.25 ? cPink : cWhite;
      col[i * 3] = pColor.r;
      col[i * 3 + 1] = pColor.g;
      col[i * 3 + 2] = pColor.b;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return geom;
  }, [showSparkles, cfg]);

  // Animación sutil de respiración en la bioluminiscencia
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      const time = state.clock.getElapsedTime();
      const baseIntensity = cfg.emissiveIntensity ?? 1.5;
      // Pulsación orgánica sutil en las venas
      materialRef.current.emissiveIntensity = baseIntensity + Math.sin(time * 1.8) * (baseIntensity * 0.16);
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Malla del Pétalo con MeshPhysicalMaterial de alta fidelidad */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          ref={materialRef}
          map={textures.colorMap}
          normalMap={textures.normalMap}
          normalScale={new THREE.Vector2(0.85, 0.85)}
          emissiveMap={textures.emissiveMap}
          emissive={new THREE.Color('#ffffff')}
          emissiveIntensity={cfg.emissiveIntensity ?? 1.5}
          roughnessMap={textures.roughnessMap}
          roughness={cfg.roughness ?? 0.34}
          metalness={0.02}
          clearcoat={cfg.clearcoat ?? 0.38}
          clearcoatRoughness={0.16}
          transmission={cfg.transmission ?? 0.18}
          thickness={0.06}
          ior={1.42}
          side={THREE.DoubleSide}
          wireframe={wireframe}
        />
      </mesh>

      {/* Partículas de polvo estelar bioluminiscente */}
      {showSparkles && sparklesGeometry && (
        <points geometry={sparklesGeometry}>
          <pointsMaterial
            size={0.038 * (cfg.length / 2.60)}
            vertexColors
            transparent
            opacity={0.88}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}

      {/* Luz puntual localizada en el cáliz/base magenta */}
      <pointLight
        position={[
          0,
          -0.65 * (cfg.length / 2.60),
          0.25 * (cfg.length / 2.60),
        ]}
        color={cfg.baseColor ?? '#d946ef'}
        intensity={2.8}
        distance={2.2 * (cfg.length / 2.60)}
      />

      {/* Luz puntual cálida en el centro del cuerpo dorado */}
      <pointLight
        position={[
          0,
          0.2 * (cfg.length / 2.60),
          0.45 * (cfg.length / 2.60),
        ]}
        color={cfg.veinGlowColor ?? '#fbbf24'}
        intensity={3.2}
        distance={2.6 * (cfg.length / 2.60)}
      />
    </group>
  );
}
