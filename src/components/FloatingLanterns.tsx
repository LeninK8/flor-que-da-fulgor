/**
 * COMPONENTE FLOATING LANTERNS — LINTERNAS FLOTANTES MULTI-DISEÑO
 *
 * Mantiene exactamente 1 linterna con el diseño original emblemático (Sol de Rapunzel / Tangled)
 * y aleatoriza / distribuye todas las demás entre los 8 diseños únicos de la colección:
 * 1. Clásico (Papel de seda natural, espirales sueltas y flor de tres lóbulos)
 * 2. Floral (Cuerpo ensanchado hacia arriba, flores y hojas)
 * 3. Espiral (Silueta ovalada con remolinos centrados)
 * 4. Estrellado (Facetado de 10 caras planas con estrellas como ventanas translúcidas)
 * 5. Mariposas (Silueta en campana con enjambre ascendente)
 * 6. Ondas (Alargada y esbelta con bandas de agua onduladas y gotas)
 * 7. Artesanal (Asimétrica con parches de papel y costuras rústicas)
 * 8. Mágico (Gota retorcida con 'twist', tinta dorada y destellos estelares)
 */

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import {
  LANTERNS_DATA,
  LanternItemConfig,
  generateRapunzelLanternTextures,
  generateHaloTexture,
} from '../config/lanternsConfig';
import {
  LANTERN_DESIGNS_8,
  createLanternBodyGeometry8,
  createWireGeometry8,
  buildPaperTextures8,
} from '../config/lanternDesigns8';

export interface LanternPhysicsData {
  offset: THREE.Vector3;
  velocity: THREE.Vector3;
  rotOffset: THREE.Vector3;
  rotVelocity: THREE.Vector3;
  currentWorldPos: THREE.Vector3;
  collisionRadius: number;
  isActive: boolean;
  flash: number;
}

// Índice de la ÚNICA linterna que conserva el diseño original de Tangled / Rapunzel.
// Elegimos lantern-near-flower-4 (índice 9), situada en posición prominente frente a la cámara.
export const ORIGINAL_LANTERN_INDEX = 9;

/**
 * Función determinista para asignar diseño a cada linterna:
 * - Retorna -1 si es la linterna original conservada.
 * - Retorna 0..7 para una de las 8 variantes aleatorizadas de forma equilibrada.
 */
export function getLanternDesignIndex(index: number): number {
  if (index === ORIGINAL_LANTERN_INDEX) {
    return -1; // Diseño original Tangled / Rapunzel
  }
  return (index * 7 + 3) % 8; // Distribución pseudoaleatoria equilibrada (8-9 linternas por diseño)
}

interface SingleLanternProps {
  config: LanternItemConfig;
  index: number;
  designIndex: number;
  physicsRegistry: React.MutableRefObject<LanternPhysicsData[]>;
  // Recursos para los 8 nuevos diseños
  designsGeos: THREE.BufferGeometry[];
  designsWireGeos: THREE.BufferGeometry[];
  designsMats: THREE.MeshStandardMaterial[];
  designsWireMats: THREE.MeshStandardMaterial[];
  designsHaloMats: THREE.SpriteMaterial[];
  designsReflectionMats: THREE.MeshStandardMaterial[];
  designsReflectionHaloMats: THREE.SpriteMaterial[];
  // Recursos para la linterna original conservada (misma forma que las demás + Sol intacto)
  originalBodyGeo: THREE.BufferGeometry;
  originalWireGeo: THREE.BufferGeometry;
  originalMainMat: THREE.MeshStandardMaterial;
  originalWireMat: THREE.MeshStandardMaterial;
  originalHaloMat: THREE.SpriteMaterial;
  originalReflectionMat: THREE.MeshStandardMaterial;
  originalReflectionHaloMat: THREE.SpriteMaterial;
  // Llama interior compartida
  flameGeo: THREE.SphereGeometry;
  flameMaterial: THREE.MeshBasicMaterial;
  reflectionFlameMat: THREE.MeshBasicMaterial;
}

function SingleLantern({
  config,
  index,
  designIndex,
  physicsRegistry,
  designsGeos,
  designsWireGeos,
  designsMats,
  designsWireMats,
  designsHaloMats,
  designsReflectionMats,
  designsReflectionHaloMats,
  originalBodyGeo,
  originalWireGeo,
  originalMainMat,
  originalWireMat,
  originalHaloMat,
  originalReflectionMat,
  originalReflectionHaloMat,
  flameGeo,
  flameMaterial,
  reflectionFlameMat,
}: SingleLanternProps) {
  const groupRef = useRef<THREE.Group>(null);
  const flameMeshRef = useRef<THREE.Mesh>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);
  const spriteRef = useRef<THREE.Sprite>(null);

  // Referencias para el reflejo acuático invertido bajo la superficie del agua
  const reflectionGroupRef = useRef<THREE.Group>(null);
  const reflectionSpriteRef = useRef<THREE.Sprite>(null);
  const hasWaterReflection = config.position[1] <= 8.8; // Las linternas sobre el agua a cota visible proyectan reflejo acuático

  const isOriginal = designIndex === -1;
  const design8 = !isOriginal ? LANTERN_DESIGNS_8[designIndex] : null;

  const scaleMultiplier = design8 ? design8.scale : 1.0;
  const finalScale = config.scale * scaleMultiplier;

  const haloScaleMultiplier = design8 ? design8.glow.haloScale : 1.0;
  const pointLightColor = design8 ? design8.glow.color : '#ffaa33';
  const pointLightIntensityMultiplier = design8 ? design8.glow.intensity : 1.0;

  // Micro-animación orgánica combinada con física suave de gravedad cero y retorno
  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const dt = Math.min(delta, 0.05);
    const state = physicsRegistry.current[index];

    // 1. Animación ambiental de flotación original
    const dyEnv =
      Math.sin(t * config.floatSpeed + config.floatPhase) * config.floatAmplitude +
      Math.sin(t * (config.floatSpeed * 0.47) + config.floatPhase * 2.1) * (config.floatAmplitude * 0.35);

    const dxEnv =
      Math.sin(t * config.driftSpeedX + config.driftPhase) * config.driftAmpX +
      Math.cos(t * (config.driftSpeedX * 0.39) + config.driftPhase * 1.7) * (config.driftAmpX * 0.4);
    const dzEnv =
      Math.cos(t * config.driftSpeedZ + config.driftPhase * 1.3) * config.driftAmpZ +
      Math.sin(t * (config.driftSpeedZ * 0.43) + config.driftPhase * 0.8) * (config.driftAmpZ * 0.4);

    const rotXEnv =
      config.rotation[0] +
      Math.sin(t * config.swaySpeedX + config.swayPhase) * config.swayAmpX +
      Math.cos(t * (config.swaySpeedX * 0.58) + config.swayPhase * 1.4) * (config.swayAmpX * 0.35);
    const rotZEnv =
      config.rotation[2] +
      Math.cos(t * config.swaySpeedZ + config.swayPhase * 1.2) * config.swayAmpZ +
      Math.sin(t * (config.swaySpeedZ * 0.61) + config.swayPhase * 0.9) * (config.swayAmpZ * 0.35);

    const rotYEnv =
      config.rotation[1] +
      t * config.yawSpeed +
      Math.sin(t * (config.driftSpeedX * 0.6) + config.driftPhase) * config.yawWobble;

    // 2. Física interactiva de gravedad casi cero y retorno suave
    if (state.isActive) {
      const fx = -1.05 * state.offset.x - 1.15 * state.velocity.x;
      const fy = -1.05 * state.offset.y - 1.15 * state.velocity.y;
      const fz = -1.05 * state.offset.z - 1.15 * state.velocity.z;

      state.velocity.x += fx * dt;
      state.velocity.y += fy * dt;
      state.velocity.z += fz * dt;

      state.offset.x += state.velocity.x * dt;
      state.offset.y += state.velocity.y * dt;
      state.offset.z += state.velocity.z * dt;

      const dispLen = state.offset.length();
      if (dispLen > 1.5) {
        state.offset.multiplyScalar(1.5 / dispLen);
      }

      const rx = -2.1 * state.rotOffset.x - 1.7 * state.rotVelocity.x;
      const ry = -1.6 * state.rotOffset.y - 1.4 * state.rotVelocity.y;
      const rz = -2.1 * state.rotOffset.z - 1.7 * state.rotVelocity.z;

      state.rotVelocity.x += rx * dt;
      state.rotVelocity.y += ry * dt;
      state.rotVelocity.z += rz * dt;

      state.rotOffset.x += state.rotVelocity.x * dt;
      state.rotOffset.y += state.rotVelocity.y * dt;
      state.rotOffset.z += state.rotVelocity.z * dt;

      if (state.flash > 0) {
        state.flash = Math.max(0, state.flash - dt * 3.2);
      }

      if (
        dispLen < 0.0025 &&
        state.velocity.lengthSq() < 0.0003 &&
        state.rotOffset.lengthSq() < 0.0003 &&
        state.rotVelocity.lengthSq() < 0.0003 &&
        state.flash <= 0
      ) {
        state.offset.set(0, 0, 0);
        state.velocity.set(0, 0, 0);
        state.rotOffset.set(0, 0, 0);
        state.rotVelocity.set(0, 0, 0);
        state.flash = 0;
        state.isActive = false;
      }
    }

    // 3. Aplicar posición y rotación a la linterna real en el aire
    const finalX = config.position[0] + dxEnv + state.offset.x;
    const finalY = Math.max(0.6, config.position[1] + dyEnv + state.offset.y);
    const finalZ = config.position[2] + dzEnv + state.offset.z;

    const finalRotX = rotXEnv + state.rotOffset.x;
    const finalRotY = rotYEnv + state.rotOffset.y;
    const finalRotZ = rotZEnv + state.rotOffset.z;

    groupRef.current.position.set(finalX, finalY, finalZ);
    groupRef.current.rotation.set(finalRotX, finalRotY, finalRotZ);

    state.currentWorldPos.set(finalX, finalY, finalZ);

    // 4. Actualizar el reflejo físico en el agua (invertido en Y con sutil ondulación acuática)
    if (reflectionGroupRef.current) {
      const waveTime = t * 1.5;
      const waveDistortX = Math.sin(waveTime + finalZ * 0.45) * 0.045 + Math.sin(waveTime * 1.25 + finalX * 0.65) * 0.03;
      const waveDistortZ = Math.cos(waveTime + finalX * 0.45) * 0.045 + Math.cos(waveTime * 1.15 + finalZ * 0.65) * 0.03;
      const waveTiltX = Math.cos(waveTime + finalZ * 0.45) * 0.035;
      const waveTiltZ = Math.sin(waveTime + finalX * 0.45) * 0.035;

      reflectionGroupRef.current.position.set(
        finalX + waveDistortX,
        -finalY,
        finalZ + waveDistortZ
      );

      reflectionGroupRef.current.rotation.set(
        -finalRotX + waveTiltX,
        finalRotY,
        finalRotZ + waveTiltZ
      );

      reflectionGroupRef.current.scale.set(
        finalScale * 1.04,
        -finalScale * 1.04,
        finalScale * 1.04
      );
    }

    // 5. Colisiones suaves entre linternas
    if (state.isActive && state.velocity.lengthSq() > 0.001) {
      const all = physicsRegistry.current;
      for (let j = 0; j < all.length; j++) {
        if (j === index) continue;
        const other = all[j];

        const dx = other.currentWorldPos.x - finalX;
        const dy = other.currentWorldPos.y - finalY;
        const dz = other.currentWorldPos.z - finalZ;
        const distSq = dx * dx + dy * dy + dz * dz;
        const rSum = state.collisionRadius + other.collisionRadius;

        if (distSq < rSum * rSum && distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const overlap = rSum - dist;
          const nx = dx / dist;
          const ny = dy / dist;
          const nz = dz / dist;

          const sep = overlap * 0.45;
          state.offset.x -= nx * sep;
          state.offset.y -= ny * sep;
          state.offset.z -= nz * sep;
          other.offset.x += nx * sep;
          other.offset.y += ny * sep;
          other.offset.z += nz * sep;

          const vRel =
            (state.velocity.x - other.velocity.x) * nx +
            (state.velocity.y - other.velocity.y) * ny +
            (state.velocity.z - other.velocity.z) * nz;

          if (vRel > 0) {
            const impulse = vRel * 0.48;
            state.velocity.x -= nx * impulse;
            state.velocity.y -= ny * impulse;
            state.velocity.z -= nz * impulse;
            other.velocity.x += nx * impulse;
            other.velocity.y += ny * impulse;
            other.velocity.z += nz * impulse;

            other.rotVelocity.x += -nz * 0.35;
            other.rotVelocity.z += nx * 0.35;
            other.rotVelocity.y += (nx - nz) * 0.2;
            other.isActive = true;
          }
        }
      }
    }

    // 6. Parpadeo sutil de la vela interior y su reflejo
    const flashVal = state.flash;
    if (flameMeshRef.current) {
      const flicker =
        1.0 +
        Math.sin(t * 7.5 + index * 2.1) * 0.05 +
        Math.sin(t * 13.3 + index * 1.1) * 0.03;
      const flashScale = 1.0 + flashVal * 0.45;
      flameMeshRef.current.scale.set(
        1.1 * flicker * flashScale,
        2.0 * flicker * flashScale,
        1.1 * flicker * flashScale
      );
    }
    if (pointLightRef.current) {
      const lightFlicker =
        (0.42 + Math.sin(t * 6.2 + index * 2.3) * 0.05 + flashVal * 0.4) *
        pointLightIntensityMultiplier;
      pointLightRef.current.intensity = lightFlicker;
    }
    if (spriteRef.current && flashVal > 0) {
      const haloBoost = 1.0 + flashVal * 0.35;
      spriteRef.current.scale.set(
        config.haloScale * haloScaleMultiplier * 4.2 * haloBoost,
        config.haloScale * haloScaleMultiplier * 4.8 * haloBoost,
        1
      );
    }
    if (reflectionSpriteRef.current && flashVal > 0) {
      const haloBoost = 1.0 + flashVal * 0.35;
      reflectionSpriteRef.current.scale.set(
        config.haloScale * haloScaleMultiplier * 4.6 * haloBoost,
        config.haloScale * haloScaleMultiplier * 3.6 * haloBoost,
        1
      );
    }
  });

  // Manejador de click con impulso físico
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!groupRef.current) return;

    const hitPoint = e.point;
    const rayDir = e.ray.direction;
    const currentPos = groupRef.current.position;

    const pushDir = new THREE.Vector3()
      .subVectors(currentPos, hitPoint)
      .addScaledVector(rayDir, 0.48)
      .normalize();

    if (pushDir.lengthSq() < 0.001) {
      pushDir.copy(rayDir).normalize();
    }

    const state = physicsRegistry.current[index];
    const impulseSpeed = 1.15 + Math.random() * 0.25;
    state.velocity.addScaledVector(pushDir, impulseSpeed);

    if (state.velocity.length() > 2.0) {
      state.velocity.setLength(2.0);
    }

    const localHit = hitPoint.clone().sub(currentPos);
    state.rotVelocity.x += -localHit.z * 0.45;
    state.rotVelocity.z += localHit.x * 0.45;
    state.rotVelocity.y += (localHit.x - localHit.z) * 0.25;

    state.flash = 1.0;
    state.isActive = true;
  };

  return (
    <>
      {/* 1. LINTERNA FLOTANTE REAL EN EL AIRE */}
      <group
        ref={groupRef}
        name={`floating-lantern-${config.id}`}
        position={config.position}
        rotation={config.rotation}
        scale={[finalScale, finalScale, finalScale]}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {isOriginal ? (
          /* ──── LINTERNA ORIGINAL ÚNICA (MISMA FORMA ESCULTÓRICA QUE LAS DEMÁS + SOL DE RAPUNZEL INTACTO) ──── */
          <>
            {/* Cuerpo de papel translúcido con cúpula curva cerrada y Sol de Rapunzel intacto */}
            <mesh
              geometry={originalBodyGeo}
              material={originalMainMat}
              castShadow={false}
              receiveShadow={false}
              onClick={handleClick}
            />
            {/* Aro inferior de alambre para que coincida exactamente con la manufactura de las demás */}
            <mesh
              geometry={originalWireGeo}
              material={originalWireMat}
              castShadow={false}
              receiveShadow={false}
            />
          </>
        ) : (
          /* ──── UNA DE LAS 8 VARIANTES ALEATORIZADAS ──── */
          <>
            {/* Cuerpo escultórico con geometría y textura específicas del diseño */}
            <mesh
              geometry={designsGeos[designIndex]}
              material={designsMats[designIndex]}
              castShadow={false}
              receiveShadow={false}
              onClick={handleClick}
            />
            {/* Estructura artesanal interior de alambre y aro de base */}
            <mesh
              geometry={designsWireGeos[designIndex]}
              material={designsWireMats[designIndex]}
              castShadow={false}
              receiveShadow={false}
            />
          </>
        )}

        {/* Vela / Llama interior */}
        <mesh
          ref={flameMeshRef}
          geometry={flameGeo}
          material={flameMaterial}
          position={[0, -1.35, 0]}
          scale={[1, 1.9, 1]}
        />

        {/* Halo cálido luminoso con el color y escala específicos */}
        <sprite
          ref={spriteRef}
          material={isOriginal ? originalHaloMat : designsHaloMats[designIndex]}
          scale={[
            config.haloScale * haloScaleMultiplier * 4.2,
            config.haloScale * haloScaleMultiplier * 4.8,
            1,
          ]}
          position={[0, -0.1, 0]}
        />

        {/* Luz puntual suave para iluminar sutilmente la atmósfera */}
        {config.hasPointLight && (
          <pointLight
            ref={pointLightRef}
            color={pointLightColor}
            intensity={0.45 * pointLightIntensityMultiplier}
            distance={5.2}
            decay={2}
            position={[0, -0.4, 0]}
          />
        )}
      </group>

      {/* 2. REFLEJO EN EL AGUA (Invertido en Y, ondulación acuática y translúcido bajo el agua) */}
      {hasWaterReflection && (
        <group
          ref={reflectionGroupRef}
          name={`water-reflection-${config.id}`}
          renderOrder={1}
        >
          {isOriginal ? (
            <>
              {/* Cuerpo reflejado de la linterna original con Sol de Rapunzel */}
              <mesh
                geometry={originalBodyGeo}
                material={originalReflectionMat}
                castShadow={false}
                receiveShadow={false}
              />
              <mesh
                geometry={originalWireGeo}
                material={originalWireMat}
                castShadow={false}
                receiveShadow={false}
              />
            </>
          ) : (
            <>
              {/* Cuerpo reflejado de la variante */}
              <mesh
                geometry={designsGeos[designIndex]}
                material={designsReflectionMats[designIndex]}
                castShadow={false}
                receiveShadow={false}
              />
              <mesh
                geometry={designsWireGeos[designIndex]}
                material={designsWireMats[designIndex]}
                castShadow={false}
                receiveShadow={false}
              />
            </>
          )}

          {/* Llama reflejada orientada hacia la superficie */}
          <mesh
            geometry={flameGeo}
            material={reflectionFlameMat}
            position={[0, 1.35, 0]}
            scale={[1, -1.9, 1]}
          />

          {/* Halo luminoso reflejado en la profundidad acuática */}
          <sprite
            ref={reflectionSpriteRef}
            material={isOriginal ? originalReflectionHaloMat : designsReflectionHaloMats[designIndex]}
            scale={[
              config.haloScale * haloScaleMultiplier * 4.6,
              config.haloScale * haloScaleMultiplier * 3.6,
              1,
            ]}
            position={[0, 0.1, 0]}
          />
        </group>
      )}
    </>
  );
}

/**
 * COMPONENTE PRINCIPAL QUE GESTIONA EL CAMPO DE LINTERNAS FLOTANTES
 */
export function FloatingLanterns() {
  // Registro compartido de física ligera e inercia para todas las linternas
  const physicsRegistry = useRef<LanternPhysicsData[]>([]);
  if (physicsRegistry.current.length !== LANTERNS_DATA.length) {
    physicsRegistry.current = LANTERNS_DATA.map((lantern) => ({
      offset: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      rotOffset: new THREE.Vector3(),
      rotVelocity: new THREE.Vector3(),
      currentWorldPos: new THREE.Vector3(...lantern.position),
      collisionRadius: lantern.scale * 1.35,
      isActive: false,
      flash: 0,
    }));
  }

  // Restaurar cursor al desmontar
  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  // 1. Texturas y materiales de la linterna original (Misma forma que las demás + Sol de Rapunzel intacto)
  const { rapunzelMap, rapunzelEmissiveMap, haloTexture } = useMemo(() => {
    const rap = generateRapunzelLanternTextures();
    const halo = generateHaloTexture();
    return {
      rapunzelMap: rap.map,
      rapunzelEmissiveMap: rap.emissiveMap,
      haloTexture: halo,
    };
  }, []);

  const { originalBodyGeo, originalWireGeo, flameGeo } = useMemo(() => {
    // Usamos la misma forma escultórica con cúpula curva que las demás linternas
    const body = createLanternBodyGeometry8(LANTERN_DESIGNS_8[0].shape);
    const wire = createWireGeometry8(LANTERN_DESIGNS_8[0]);
    const flame = new THREE.SphereGeometry(0.18, 12, 12);
    return {
      originalBodyGeo: body,
      originalWireGeo: wire,
      flameGeo: flame,
    };
  }, []);

  const {
    originalMainMat,
    originalWireMat,
    flameMaterial,
    originalHaloMat,
    originalReflectionMat,
    originalReflectionHaloMat,
    reflectionFlameMat,
  } = useMemo(() => {
    // Material con sus colores originales del sol intactos
    const mainMat = new THREE.MeshStandardMaterial({
      map: rapunzelMap,
      emissiveMap: rapunzelEmissiveMap,
      emissive: new THREE.Color(0xffcc33), // Resplandor dorado/ámbar del Sol intacto
      emissiveIntensity: 1.15,
      roughness: 0.92,
      metalness: 0.0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.98,
      depthWrite: true,
    });

    // Aro de alambre interior a juego con la manufactura de las demás
    const wireMat = new THREE.MeshStandardMaterial({
      color: 0xb09876,
      metalness: 0.75,
      roughness: 0.45,
      transparent: true,
      opacity: 0.85,
    });

    // Llama interior cálida sol de atardecer
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xffdb66,
    });

    // Halo luminoso suave dorado de atardecer
    const haloMat = new THREE.SpriteMaterial({
      map: haloTexture,
      color: new THREE.Color(0xffb233),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.95,
    });

    // Material de reflejo acuático para la linterna original con Sol de Rapunzel intacto
    const reflMat = new THREE.MeshStandardMaterial({
      map: rapunzelMap,
      emissiveMap: rapunzelEmissiveMap,
      emissive: new THREE.Color(0xffcc33),
      emissiveIntensity: 1.35,
      color: new THREE.Color(0xffdb77),
      roughness: 0.9,
      metalness: 0.0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });

    const reflHaloMat = new THREE.SpriteMaterial({
      map: haloTexture,
      color: new THREE.Color(0xffb233),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.5,
    });

    const reflFlameMat = new THREE.MeshBasicMaterial({
      color: 0xffdb66,
      transparent: true,
      opacity: 0.8,
    });

    return {
      originalMainMat: mainMat,
      originalWireMat: wireMat,
      flameMaterial: flameMat,
      originalHaloMat: haloMat,
      originalReflectionMat: reflMat,
      originalReflectionHaloMat: reflHaloMat,
      reflectionFlameMat: reflFlameMat,
    };
  }, [rapunzelMap, rapunzelEmissiveMap, haloTexture]);

  // 2. Geometrías, texturas y materiales para los 8 diseños
  const {
    designsGeos,
    designsWireGeos,
    designsMats,
    designsWireMats,
    designsHaloMats,
    designsReflectionMats,
    designsReflectionHaloMats,
    designTextures,
  } = useMemo(() => {
    const geos: THREE.BufferGeometry[] = [];
    const wireGeos: THREE.BufferGeometry[] = [];
    const mats: THREE.MeshStandardMaterial[] = [];
    const wireMats: THREE.MeshStandardMaterial[] = [];
    const haloMats: THREE.SpriteMaterial[] = [];
    const reflMats: THREE.MeshStandardMaterial[] = [];
    const reflHaloMats: THREE.SpriteMaterial[] = [];
    const textures: { map: THREE.CanvasTexture; emissiveMap: THREE.CanvasTexture }[] = [];

    for (let i = 0; i < LANTERN_DESIGNS_8.length; i++) {
      const design = LANTERN_DESIGNS_8[i];

      // Geometría del cuerpo de papel
      const bodyGeo = createLanternBodyGeometry8(design.shape);
      geos.push(bodyGeo);

      // Geometría de alambre interior
      const wireGeo = createWireGeometry8(design);
      wireGeos.push(wireGeo);

      // Texturas de papel (albedo + emissive)
      const tex = buildPaperTextures8(design);
      textures.push(tex);

      // Material de papel translúcido - Emisión en tono amarillo atardecer (sin blancos)
      const paperMat = new THREE.MeshStandardMaterial({
        map: tex.map,
        emissiveMap: tex.emissiveMap,
        emissive: new THREE.Color(0xffc545),
        emissiveIntensity: design.paper.emissive ?? 1.25,
        roughness: 0.95,
        metalness: 0.0,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: design.paper.opacity ?? 0.97,
        flatShading: !!design.flatShading,
        depthWrite: true,
      });
      mats.push(paperMat);

      // Material de alambre
      const wireMat = new THREE.MeshStandardMaterial({
        color: design.wire.color ?? 0xb09876,
        metalness: 0.75,
        roughness: 0.45,
        transparent: true,
        opacity: 0.85,
      });
      wireMats.push(wireMat);

      // Halo tintado con el tono específico de luz amarillo atardecer
      const haloMat = new THREE.SpriteMaterial({
        map: haloTexture,
        color: new THREE.Color(design.glow.color),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.9 * design.glow.halo,
      });
      haloMats.push(haloMat);

      // Material de reflejo acuático bajo el agua
      const reflPaperMat = new THREE.MeshStandardMaterial({
        map: tex.map,
        emissiveMap: tex.emissiveMap,
        emissive: new THREE.Color(0xffc545),
        emissiveIntensity: 1.35,
        color: new THREE.Color(0xffdb77),
        roughness: 0.9,
        metalness: 0.0,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.68,
        flatShading: !!design.flatShading,
        depthWrite: false,
      });
      reflMats.push(reflPaperMat);

      const reflHalo = new THREE.SpriteMaterial({
        map: haloTexture,
        color: new THREE.Color(design.glow.color),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.5 * design.glow.halo,
      });
      reflHaloMats.push(reflHalo);
    }

    return {
      designsGeos: geos,
      designsWireGeos: wireGeos,
      designsMats: mats,
      designsWireMats: wireMats,
      designsHaloMats: haloMats,
      designsReflectionMats: reflMats,
      designsReflectionHaloMats: reflHaloMats,
      designTextures: textures,
    };
  }, [haloTexture]);

  // Limpieza completa de memoria al desmontar
  useEffect(() => {
    return () => {
      rapunzelMap.dispose();
      rapunzelEmissiveMap.dispose();
      haloTexture.dispose();
      originalBodyGeo.dispose();
      originalWireGeo.dispose();
      flameGeo.dispose();
      originalMainMat.dispose();
      originalWireMat.dispose();
      flameMaterial.dispose();
      originalHaloMat.dispose();
      originalReflectionMat.dispose();
      originalReflectionHaloMat.dispose();
      reflectionFlameMat.dispose();

      for (let i = 0; i < designsGeos.length; i++) {
        designsGeos[i].dispose();
        designsWireGeos[i].dispose();
        designsMats[i].dispose();
        designsWireMats[i].dispose();
        designsHaloMats[i].dispose();
        designsReflectionMats[i].dispose();
        designsReflectionHaloMats[i].dispose();
        designTextures[i].map.dispose();
        designTextures[i].emissiveMap.dispose();
      }
    };
  }, [
    rapunzelMap,
    rapunzelEmissiveMap,
    haloTexture,
    originalBodyGeo,
    originalWireGeo,
    flameGeo,
    originalMainMat,
    originalWireMat,
    flameMaterial,
    originalHaloMat,
    originalReflectionMat,
    originalReflectionHaloMat,
    reflectionFlameMat,
    designsGeos,
    designsWireGeos,
    designsMats,
    designsWireMats,
    designsHaloMats,
    designsReflectionMats,
    designsReflectionHaloMats,
    designTextures,
  ]);

  return (
    <group name="floating-lanterns-field">
      {LANTERNS_DATA.map((lantern, idx) => {
        const designIdx = getLanternDesignIndex(idx);
        return (
          <SingleLantern
            key={lantern.id}
            config={lantern}
            index={idx}
            designIndex={designIdx}
            physicsRegistry={physicsRegistry}
            designsGeos={designsGeos}
            designsWireGeos={designsWireGeos}
            designsMats={designsMats}
            designsWireMats={designsWireMats}
            designsHaloMats={designsHaloMats}
            designsReflectionMats={designsReflectionMats}
            designsReflectionHaloMats={designsReflectionHaloMats}
            originalBodyGeo={originalBodyGeo}
            originalWireGeo={originalWireGeo}
            originalMainMat={originalMainMat}
            originalWireMat={originalWireMat}
            originalHaloMat={originalHaloMat}
            originalReflectionMat={originalReflectionMat}
            originalReflectionHaloMat={originalReflectionHaloMat}
            flameGeo={flameGeo}
            flameMaterial={flameMaterial}
            reflectionFlameMat={reflectionFlameMat}
          />
        );
      })}
    </group>
  );
}

export default FloatingLanterns;
