/**
 * COMPONENTE FLOATING LANTERNS — LINTERNAS FLOTANTES ESTILO RAPUNZEL / TANGLED
 *
 * Añade múltiples linternas de papel flotantes alrededor de la flor:
 * - Distribuidas en un campo circular/semicircular amplio alrededor de la flor.
 * - Zona despejada y libre claramente visible alrededor de los 6 pétalos (R > 2.6).
 * - Profundidad 3D (cercanas, medias y de fondo elevado).
 * - Movimiento ambiental muy sutil (flotación vertical, suave balanceo y deriva tranquila).
 * - Textura procedural idéntica al diseño de Rapunzel (sol de 16 rayos con borde dorado y cenefas de filigrana).
 * - Halo cálido luminoso alrededor de cada linterna.
 */

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import {
  LANTERNS_DATA,
  LanternItemConfig,
  generateProceduralLanternTexture,
  generateHaloTexture,
} from '../config/lanternsConfig';

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

interface SingleLanternProps {
  config: LanternItemConfig;
  index: number;
  physicsRegistry: React.MutableRefObject<LanternPhysicsData[]>;
  cylinderGeo: THREE.CylinderGeometry;
  topCapGeo: THREE.CircleGeometry;
  topRimGeo: THREE.TorusGeometry;
  bottomRimGeo: THREE.TorusGeometry;
  flameGeo: THREE.SphereGeometry;
  mainMaterial: THREE.MeshStandardMaterial;
  topMaterial: THREE.MeshStandardMaterial;
  rimMaterial: THREE.MeshStandardMaterial;
  flameMaterial: THREE.MeshBasicMaterial;
  haloMaterial: THREE.SpriteMaterial;
}

function SingleLantern({
  config,
  index,
  physicsRegistry,
  cylinderGeo,
  topCapGeo,
  topRimGeo,
  bottomRimGeo,
  flameGeo,
  mainMaterial,
  topMaterial,
  rimMaterial,
  flameMaterial,
  haloMaterial,
}: SingleLanternProps) {
  const groupRef = useRef<THREE.Group>(null);
  const flameMeshRef = useRef<THREE.Mesh>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);
  const spriteRef = useRef<THREE.Sprite>(null);

  // Micro-animación orgánica combinada con física suave de gravedad cero y retorno
  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const dt = Math.min(delta, 0.05);
    const state = physicsRegistry.current[index];

    // 1. Animación ambiental de flotación original (preservada exactamente)
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
      // Fuerza amortiguada de restauración hacia la posición original (k = 1.05, c = 1.15)
      // Produce una fase de desplazamiento (0-1.5s), desaceleración (1.5-3.5s) y retorno suave (3.5-5.5s)
      const fx = -1.05 * state.offset.x - 1.15 * state.velocity.x;
      const fy = -1.05 * state.offset.y - 1.15 * state.velocity.y;
      const fz = -1.05 * state.offset.z - 1.15 * state.velocity.z;

      state.velocity.x += fx * dt;
      state.velocity.y += fy * dt;
      state.velocity.z += fz * dt;

      state.offset.x += state.velocity.x * dt;
      state.offset.y += state.velocity.y * dt;
      state.offset.z += state.velocity.z * dt;

      // Limitar desplazamiento físico máximo a 1.5 metros para evitar cualquier exceso
      const dispLen = state.offset.length();
      if (dispLen > 1.5) {
        state.offset.multiplyScalar(1.5 / dispLen);
      }

      // Restauración angular suave para la rotación/inclinación
      const rx = -2.1 * state.rotOffset.x - 1.7 * state.rotVelocity.x;
      const ry = -1.6 * state.rotOffset.y - 1.4 * state.rotVelocity.y;
      const rz = -2.1 * state.rotOffset.z - 1.7 * state.rotVelocity.z;

      state.rotVelocity.x += rx * dt;
      state.rotVelocity.y += ry * dt;
      state.rotVelocity.z += rz * dt;

      state.rotOffset.x += state.rotVelocity.x * dt;
      state.rotOffset.y += state.rotVelocity.y * dt;
      state.rotOffset.z += state.rotVelocity.z * dt;

      // Atenuación del destello sutil de click
      if (state.flash > 0) {
        state.flash = Math.max(0, state.flash - dt * 3.2);
      }

      // Detección de reposo exacto: cuando el movimiento residual es insignificante, asentamos a 0
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

    // 3. Aplicar posición y rotación combinadas (ambiental + física)
    const finalX = config.position[0] + dxEnv + state.offset.x;
    // Asegurar que las linternas sobre el agua no penetren bajo la superficie líquida (Y >= 0.6)
    const finalY = Math.max(0.6, config.position[1] + dyEnv + state.offset.y);
    const finalZ = config.position[2] + dzEnv + state.offset.z;

    groupRef.current.position.set(finalX, finalY, finalZ);
    groupRef.current.rotation.set(
      rotXEnv + state.rotOffset.x,
      rotYEnv + state.rotOffset.y,
      rotZEnv + state.rotOffset.z
    );

    // Actualizar posición mundial en el registro físico
    state.currentWorldPos.set(finalX, finalY, finalZ);

    // 4. Sistema de colisión suave entre linternas (objetos ligeros flotando en el aire)
    // Solo se evalúa cuando la linterna está en movimiento activo
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

          // Separación posicional elástica suave (evita que se atraviesen físicamente)
          const sep = overlap * 0.45;
          state.offset.x -= nx * sep;
          state.offset.y -= ny * sep;
          state.offset.z -= nz * sep;
          other.offset.x += nx * sep;
          other.offset.y += ny * sep;
          other.offset.z += nz * sep;

          // Velocidad relativa a lo largo de la normal de colisión
          const vRel =
            (state.velocity.x - other.velocity.x) * nx +
            (state.velocity.y - other.velocity.y) * ny +
            (state.velocity.z - other.velocity.z) * nz;

          // Si se están aproximando, transferir impulso amortiguado sin violencia
          if (vRel > 0) {
            const impulse = vRel * 0.48;
            state.velocity.x -= nx * impulse;
            state.velocity.y -= ny * impulse;
            state.velocity.z -= nz * impulse;
            other.velocity.x += nx * impulse;
            other.velocity.y += ny * impulse;
            other.velocity.z += nz * impulse;

            // Inclinación y balanceo suave en la linterna impactada
            other.rotVelocity.x += -nz * 0.35;
            other.rotVelocity.z += nx * 0.35;
            other.rotVelocity.y += (nx - nz) * 0.2;
            other.isActive = true;
          }
        }
      }
    }

    // 5. Parpadeo sutil y respiración de la vela con destello temporal al hacer click
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
        0.42 + Math.sin(t * 6.2 + index * 2.3) * 0.05 + flashVal * 0.4;
      pointLightRef.current.intensity = lightFlicker;
    }
    if (spriteRef.current && flashVal > 0) {
      const haloBoost = 1.0 + flashVal * 0.35;
      spriteRef.current.scale.set(
        config.haloScale * 4.2 * haloBoost,
        config.haloScale * 4.8 * haloBoost,
        1
      );
    }
  });

  // Manejador de click directo sobre la linterna
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!groupRef.current) return;

    const hitPoint = e.point;
    const rayDir = e.ray.direction;
    const currentPos = groupRef.current.position;

    // Dirección de alejamiento: vector desde el impacto hacia el centro + proyección suave del rayo
    const pushDir = new THREE.Vector3()
      .subVectors(currentPos, hitPoint)
      .addScaledVector(rayDir, 0.48)
      .normalize();

    if (pushDir.lengthSq() < 0.001) {
      pushDir.copy(rayDir).normalize();
    }

    const state = physicsRegistry.current[index];

    // Impulso controlado: produce un desplazamiento suave de ~0.6 a 1.2 m
    const impulseSpeed = 1.15 + Math.random() * 0.25;
    state.velocity.addScaledVector(pushDir, impulseSpeed);

    // Limitar velocidad máxima acumulada ante clicks repetitivos rápidos
    if (state.velocity.length() > 2.0) {
      state.velocity.setLength(2.0);
    }

    // Torque físico producido por impacto excéntrico
    const localHit = hitPoint.clone().sub(currentPos);
    state.rotVelocity.x += -localHit.z * 0.45;
    state.rotVelocity.z += localHit.x * 0.45;
    state.rotVelocity.y += (localHit.x - localHit.z) * 0.25;

    // Destello mágico tenue y activación del bucle físico
    state.flash = 1.0;
    state.isActive = true;
  };

  return (
    <group
      ref={groupRef}
      name={`floating-lantern-${config.id}`}
      position={config.position}
      rotation={config.rotation}
      scale={[config.scale, config.scale, config.scale]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* 1. Cuerpo cilíndrico de papel translúcido con Sol de Rapunzel y cenefas */}
      <mesh
        geometry={cylinderGeo}
        material={mainMaterial}
        castShadow={false}
        receiveShadow={false}
        onClick={handleClick}
      />

      {/* 2. Tapa superior de papel liso para atrapar el aire caliente */}
      <mesh
        geometry={topCapGeo}
        material={topMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 1.6, 0]}
        onClick={handleClick}
      />

      {/* 3. Aros de refuerzo de madera (superior e inferior) */}
      <mesh
        geometry={topRimGeo}
        material={rimMaterial}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 1.6, 0]}
      />
      <mesh
        geometry={bottomRimGeo}
        material={rimMaterial}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, -1.6, 0]}
      />

      {/* 4. Vela / Llama interior */}
      <mesh
        ref={flameMeshRef}
        geometry={flameGeo}
        material={flameMaterial}
        position={[0, -1.35, 0]}
        scale={[1, 1.9, 1]}
      />

      {/* 5. Halo cálido luminoso alrededor de la linterna (Sprite translúcido aditivo) */}
      <sprite
        ref={spriteRef}
        material={haloMaterial}
        scale={[config.haloScale * 4.2, config.haloScale * 4.8, 1]}
        position={[0, -0.1, 0]}
      />

      {/* 6. Luz puntual suave para iluminar sutilmente la atmósfera circundante */}
      {config.hasPointLight && (
        <pointLight
          ref={pointLightRef}
          color="#ffaa33"
          intensity={0.45}
          distance={5.2}
          decay={2}
          position={[0, -0.4, 0]}
        />
      )}
    </group>
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

  // Generación única y compartida de texturas procedurales en memoria
  const { mainTexture, plainTexture, haloTexture } = useMemo(() => {
    const main = generateProceduralLanternTexture(true);
    const plain = generateProceduralLanternTexture(false);
    const halo = generateHaloTexture();
    return { mainTexture: main, plainTexture: plain, haloTexture: halo };
  }, []);

  // Geometrías compartidas para máximo rendimiento (cero duplicación de mallas en GPU)
  const { cylinderGeo, topCapGeo, topRimGeo, bottomRimGeo, flameGeo } = useMemo(() => {
    return {
      cylinderGeo: new THREE.CylinderGeometry(1.2, 1.05, 3.2, 48, 1, true),
      topCapGeo: new THREE.CircleGeometry(1.2, 48),
      topRimGeo: new THREE.TorusGeometry(1.2, 0.035, 12, 48),
      bottomRimGeo: new THREE.TorusGeometry(1.05, 0.045, 12, 48),
      flameGeo: new THREE.SphereGeometry(0.18, 12, 12),
    };
  }, []);

  // Materiales compartidos
  const { mainMaterial, topMaterial, rimMaterial, flameMaterial, haloMaterial } = useMemo(() => {
    const mainMat = new THREE.MeshStandardMaterial({
      map: mainTexture,
      emissiveMap: mainTexture,
      emissive: new THREE.Color(0xffcc33),
      emissiveIntensity: 0.88,
      roughness: 0.78,
      metalness: 0.0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.98,
    });

    const topMat = new THREE.MeshStandardMaterial({
      map: plainTexture,
      emissiveMap: plainTexture,
      emissive: new THREE.Color(0xffcc33),
      emissiveIntensity: 0.85,
      roughness: 0.78,
      metalness: 0.0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.98,
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x4d2d14,
      roughness: 0.9,
      metalness: 0.05,
    });

    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    const haloMat = new THREE.SpriteMaterial({
      map: haloTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return {
      mainMaterial: mainMat,
      topMaterial: topMat,
      rimMaterial: rimMat,
      flameMaterial: flameMat,
      haloMaterial: haloMat,
    };
  }, [mainTexture, plainTexture, haloTexture]);

  // Limpieza de memoria en desmontaje
  React.useEffect(() => {
    return () => {
      mainTexture.dispose();
      plainTexture.dispose();
      haloTexture.dispose();
      cylinderGeo.dispose();
      topCapGeo.dispose();
      topRimGeo.dispose();
      bottomRimGeo.dispose();
      flameGeo.dispose();
      mainMaterial.dispose();
      topMaterial.dispose();
      rimMaterial.dispose();
      flameMaterial.dispose();
      haloMaterial.dispose();
    };
  }, [
    mainTexture,
    plainTexture,
    haloTexture,
    cylinderGeo,
    topCapGeo,
    topRimGeo,
    bottomRimGeo,
    flameGeo,
    mainMaterial,
    topMaterial,
    rimMaterial,
    flameMaterial,
    haloMaterial,
  ]);

  return (
    <group name="floating-lanterns-field">
      {LANTERNS_DATA.map((lantern, idx) => (
        <SingleLantern
          key={lantern.id}
          config={lantern}
          index={idx}
          physicsRegistry={physicsRegistry}
          cylinderGeo={cylinderGeo}
          topCapGeo={topCapGeo}
          topRimGeo={topRimGeo}
          bottomRimGeo={bottomRimGeo}
          flameGeo={flameGeo}
          mainMaterial={mainMaterial}
          topMaterial={topMaterial}
          rimMaterial={rimMaterial}
          flameMaterial={flameMaterial}
          haloMaterial={haloMaterial}
        />
      ))}
    </group>
  );
}

export default FloatingLanterns;
