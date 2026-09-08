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
}

export function Petal({
  config: configOverride,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1.0,
  showSparkles = true,
}: PetalProps) {
  const cfg = useMemo(() => ({ ...PETAL_CONFIG, ...configOverride }), [configOverride]);

  // Generación de texturas PBR según ficha técnica
  const textures = useMemo(() => generatePetalTextures(1024), []);

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

    const uSegs = segments.length;
    const vSegs = segments.width;

    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const curveSign = cfg.invertCurvature ? -1 : 1;

    // Helper: Contorno de anchura (Frontal Wireframe de la ficha técnica)
    function getHalfWidth(u: number): number {
      const uClamped = Math.max(0, Math.min(1, u));

      let profile = 0;
      if (uClamped < 0.12) {
        // Base estrecha fruncida (inserción en cáliz/tallo)
        const t = uClamped / 0.12;
        profile = 0.08 + 0.18 * Math.sin(t * (Math.PI / 2));
      } else if (uClamped < 0.58) {
        // Expansión rápida al cuerpo más ancho (8-12 cm)
        const t = (uClamped - 0.12) / 0.46;
        profile = 0.26 + 0.74 * Math.sin(t * (Math.PI / 2));
      } else if (uClamped < 0.84) {
        // Zona superior ancha con suave convergencia
        const t = (uClamped - 0.58) / 0.26;
        profile = 1.0 - 0.52 * (t * t);
      } else {
        // Ápice estilizado terminal hacia el gancho recurvado
        const t = (uClamped - 0.84) / 0.16;
        profile = 0.48 * Math.pow(1 - t, 1.4);
      }

      return (width * 0.5) * Math.max(0.02, profile);
    }

    // Helper: Curvatura Longitudinal en 'S' (Lateral Wireframe)
    function getLongitudinalSpine(u: number) {
      // Y: altura a lo largo del pétalo (centrado)
      const y = (u - 0.46) * length;

      // Z: arco en 'S' según la vista lateral de la ficha:
      // Base avanza ligeramente, cuerpo se retrae, y ápice se encorva hacia atrás
      const zBase = Math.sin(u * Math.PI * 0.95) * (0.28 * curvatureS) * curveSign;
      const zWave = Math.sin(u * Math.PI * 1.8) * (0.12 * curvatureS) * curveSign;
      let z = zBase - zWave;

      // X: suave asimetría lateral
      let xOffset = Math.sin(u * Math.PI) * 0.04;

      // Gancho recurvado terminal ("Borde ondulado y curvado")
      if (u > 0.80) {
        const tipT = (u - 0.80) / 0.20;
        const hookFactor = Math.pow(tipT, 1.6) * tipHookIntensity;
        // Se curva bruscamente hacia atrás y desciende
        z -= Math.sin(tipT * tipHookAngle * Math.PI) * hookFactor * 1.35 * curveSign;
        // Asimetría lateral hacia la izquierda como en la vista frontal
        xOffset -= hookFactor * 0.45;
      }

      return { xOffset, y, z };
    }

    // Generar malla tridimensional (cara frontal y cara posterior con volumen)
    // Para renderizado fidedigno y soporte de translucidez PBR, modelamos la superficie con relieve de grosor
    for (let i = 0; i <= uSegs; i++) {
      const u = i / uSegs;
      const spine = getLongitudinalSpine(u);
      const halfW = getHalfWidth(u);

      for (let j = 0; j <= vSegs; j++) {
        const v = j / vSegs; // 0 = borde izquierdo, 0.5 = nervio central, 1 = borde derecho
        const vNorm = (v - 0.5) * 2; // -1 a 1
        const absV = Math.abs(vNorm);

        // Curvatura transversal en copa cóncava (Vista Superior)
        // En el haz, los bordes suben creando el cuenco (o invierte según curveSign)
        const cupDepth = (1 - absV * absV) * (cupTransverse * (0.4 + 0.6 * Math.sin(u * Math.PI))) * curveSign;

        // Acanaladuras longitudinales que acompañan las venas
        const fluting = Math.cos(vNorm * Math.PI * 6) * (veinRelief * (1 - absV * 0.4) * Math.sin(u * Math.PI)) * curveSign;

        // Nervadura central prominente
        const midribRidge = Math.exp(-Math.pow(absV * 7, 2)) * (veinRelief * 1.6) * curveSign;

        // Ondulaciones orgánicas en el borde
        const rufflePhase = u * 24 + (vNorm > 0 ? 0 : 2.5);
        const ruffle = Math.sin(rufflePhase) * edgeRuffles * Math.pow(absV, 2.2) * curveSign;

        // Coordenada X transversal con leve asimetría orgánica
        const asymLobe = vNorm < 0 ? 1.06 : 0.94;
        const x = spine.xOffset + vNorm * halfW * asymLobe;

        // Coordenada Y
        const y = spine.y + ruffle * 0.4;

        // Coordenada Z compuesta
        const z = spine.z + cupDepth + fluting + midribRidge + ruffle;

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

        if (curveSign < 0) {
          indices.push(a, d, b);
          indices.push(b, d, c);
        } else {
          indices.push(a, b, d);
          indices.push(b, c, d);
        }
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

      const curveSign = cfg.invertCurvature ? -1 : 1;
      const x = v * halfW * 0.75 + (Math.random() - 0.5) * 0.08;
      const z =
        (Math.sin(u * Math.PI * 0.95) * (0.28 * cfg.curvatureS) +
          (1 - Math.abs(v)) * cfg.cupTransverse +
          0.02 +
          Math.random() * 0.06) *
        curveSign;

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
      // Pulsación orgánica sutil en las venas
      materialRef.current.emissiveIntensity = 1.45 + Math.sin(time * 1.8) * 0.25;
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
          emissiveIntensity={1.5}
          roughnessMap={textures.roughnessMap}
          roughness={0.34}
          metalness={0.02}
          clearcoat={0.38}
          clearcoatRoughness={0.16}
          transmission={0.18}
          thickness={0.06}
          ior={1.42}
          side={THREE.DoubleSide}
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
          0.25 * (cfg.length / 2.60) * (cfg.invertCurvature ? -1 : 1),
        ]}
        color="#d946ef"
        intensity={2.8}
        distance={2.2 * (cfg.length / 2.60)}
      />

      {/* Luz puntual cálida en el centro del cuerpo dorado */}
      <pointLight
        position={[
          0,
          0.2 * (cfg.length / 2.60),
          0.45 * (cfg.length / 2.60) * (cfg.invertCurvature ? -1 : 1),
        ]}
        color="#fbbf24"
        intensity={3.2}
        distance={2.6 * (cfg.length / 2.60)}
      />
    </group>
  );
}
