import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WATER_CONFIG } from '../config/waterConfig';
import { LANTERNS_DATA } from '../config/lanternsConfig';
import { FloatingPlants } from './FloatingPlants';

export function Water() {
  const waterMeshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Shaders personalizados para agua de estanque natural con reflejos de linternas flotantes
  const { uniforms, vertexShader, fragmentShader } = useMemo(() => {
    // Tomamos las 20 linternas más representativas y cercanas al agua
    const lanternVectors: THREE.Vector4[] = [];
    for (let i = 0; i < 20; i++) {
      const cfg = LANTERNS_DATA[i];
      lanternVectors.push(
        new THREE.Vector4(
          cfg ? cfg.position[0] : 0,
          cfg ? cfg.position[1] : 2,
          cfg ? cfg.position[2] : 0,
          cfg ? cfg.emissiveIntensity : 1.0
        )
      );
    }

    return {
      uniforms: {
        uTime: { value: 0 },
        uWaveSpeed: { value: WATER_CONFIG.waveSpeed },
        uWaveAmplitude: { value: WATER_CONFIG.waveAmplitude },
        uWaveFrequency: { value: WATER_CONFIG.waveFrequency },
        uDeepColor: { value: new THREE.Color(WATER_CONFIG.deepColor) },
        uSurfaceColor: { value: new THREE.Color(WATER_CONFIG.surfaceColor) },
        uHorizonColor: { value: new THREE.Color(WATER_CONFIG.horizonColor) },
        uSunPosition: { value: new THREE.Vector3(15, 25, 15) },
        uTransparency: { value: WATER_CONFIG.transparency },
        uLanterns: { value: lanternVectors },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uWaveSpeed;
        uniform float uWaveAmplitude;
        uniform float uWaveFrequency;

        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vElevation;

        void main() {
          vUv = uv;
          vec3 pos = position;
          float t = uTime * uWaveSpeed;

          // Ondas compuestas suaves, orgánicas y naturales
          float w1 = sin(pos.x * uWaveFrequency + t) * cos(pos.y * (uWaveFrequency * 0.85) + t * 0.9);
          float w2 = sin((pos.x + pos.y) * (uWaveFrequency * 1.4) + t * 1.1) * 0.35;
          float w3 = cos(pos.x * 0.2 - pos.y * 0.3 + t * 0.5) * 0.2;
          float elevation = (w1 + w2 + w3) * uWaveAmplitude;

          pos.z += elevation;
          vElevation = elevation;

          // Cálculo analítico de gradientes para normales suaves en tiempo real
          float dx = (cos(pos.x * uWaveFrequency + t) * uWaveFrequency * cos(pos.y * (uWaveFrequency * 0.85) + t * 0.9)
                    + cos((pos.x + pos.y) * (uWaveFrequency * 1.4) + t * 1.1) * (uWaveFrequency * 1.4) * 0.35) * uWaveAmplitude;
          float dy = (-sin(pos.x * uWaveFrequency + t) * sin(pos.y * (uWaveFrequency * 0.85) + t * 0.9) * (uWaveFrequency * 0.85)
                    + cos((pos.x + pos.y) * (uWaveFrequency * 1.4) + t * 1.1) * (uWaveFrequency * 1.4) * 0.35) * uWaveAmplitude;

          vec3 calculatedNormal = normalize(vec3(-dx, -dy, 1.0));

          vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
          vWorldPosition = worldPosition.xyz;
          vNormal = normalize(mat3(modelMatrix) * calculatedNormal);

          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uDeepColor;
        uniform vec3 uSurfaceColor;
        uniform vec3 uHorizonColor;
        uniform vec3 uSunPosition;
        uniform float uTransparency;
        uniform vec4 uLanterns[20];

        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vElevation;

        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          vec3 normal = normalize(vNormal);

          // Coeficiente Fresnel natural de agua
          float fresnel = clamp(1.0 - dot(viewDir, normal), 0.0, 1.0);
          float fresnelTerm = pow(fresnel, 2.5);

          // Gradiente de agua profunda de estanque
          vec3 waterTone = mix(uDeepColor, uSurfaceColor, clamp(vElevation * 3.5 + 0.45, 0.0, 1.0));
          vec3 finalColor = mix(waterTone, uHorizonColor, fresnelTerm * 0.72);

          // Iluminación ambiental y solar suave
          vec3 lightDir = normalize(uSunPosition);
          float diff = max(dot(normal, lightDir), 0.0);
          finalColor += uSurfaceColor * (diff * 0.15);

          // Reflejo especular satinado suave
          vec3 halfVector = normalize(lightDir + viewDir);
          float spec = pow(max(dot(normal, halfVector), 0.0), 28.0);
          finalColor += vec3(0.12, 0.18, 0.22) * spec * 0.25;

          // ──── REFLEJOS REALISTAS DE LAS LINTERNAS FLOTANTES EN EL AGUA (TANGLED STYLE) ────
          vec3 lanternGlowTotal = vec3(0.0);
          vec3 warmGold = vec3(1.0, 0.78, 0.32);   // Tono amarillo atardecer / dorado
          vec3 deepAmber = vec3(0.98, 0.52, 0.15); // Tono ámbar fuego de vela

          for (int i = 0; i < 20; i++) {
            vec4 lData = uLanterns[i];
            if (lData.w <= 0.01) continue;

            vec3 lPos = lData.xyz;
            vec3 toL = lPos - vWorldPosition;
            float dist3D = length(toL);
            float distXZ = length(toL.xz);

            vec3 lDir = toL / dist3D;
            vec3 h = normalize(lDir + viewDir);
            float nDotH = max(dot(normal, h), 0.0);

            // Estela alargada característica de reflejos sobre agua ondulada
            // Se estira y vibra orgánicamente con las olas hacia la cámara
            float specSharp = pow(nDotH, 44.0) * 2.2;
            float specSpread = pow(nDotH, 12.0) * 0.45;
            float atten = 1.0 / (1.0 + dist3D * 0.16 + dist3D * dist3D * 0.009);

            // Resplandor cálido directo sobre el agua debajo de cada linterna baja
            float underGlow = exp(-distXZ * 0.65) * (1.25 / (lPos.y + 0.45));

            vec3 col = mix(deepAmber, warmGold, clamp(specSharp, 0.0, 1.0));
            lanternGlowTotal += col * (specSharp + specSpread + underGlow * 0.4) * atten * lData.w;
          }

          // Los reflejos en el agua se intensifican naturalmente con el ángulo Fresnel
          finalColor += lanternGlowTotal * (fresnelTerm * 0.65 + 0.45);

          gl_FragColor = vec4(finalColor, uTransparency);
        }
      `,
    };
  }, []);

  // Animación del tiempo del agua y actualización continua de las linternas reflejadas
  useFrame(({ clock }) => {
    if (materialRef.current) {
      const t = clock.getElapsedTime();
      materialRef.current.uniforms.uTime.value = t;

      // Actualizar dinámicamente las posiciones de las linternas para el cálculo de reflejos
      const lanternsArray = materialRef.current.uniforms.uLanterns.value as THREE.Vector4[];
      for (let i = 0; i < 20; i++) {
        const cfg = LANTERNS_DATA[i];
        if (!cfg) break;
        const dy = Math.sin(t * cfg.floatSpeed + cfg.floatPhase) * cfg.floatAmplitude;
        const dx = Math.sin(t * cfg.driftSpeedX + cfg.driftPhase) * cfg.driftAmpX;
        const dz = Math.cos(t * cfg.driftSpeedZ + cfg.driftPhase * 1.3) * cfg.driftAmpZ;
        lanternsArray[i].set(
          cfg.position[0] + dx,
          Math.max(0.6, cfg.position[1] + dy),
          cfg.position[2] + dz,
          cfg.emissiveIntensity
        );
      }
    }
  });

  // Generar geometría cóncava para el lecho / fondo del estanque
  const bedGeometry = useMemo(() => {
    const geom = new THREE.CylinderGeometry(
      WATER_CONFIG.bed.radius,
      WATER_CONFIG.bed.radius * 0.7,
      WATER_CONFIG.bed.depth,
      48,
      12,
      true
    );
    return geom;
  }, []);

  return (
    <group name="pond-system">
      {/* 1. Fondo físico y lecho profundo del estanque (profundidad real) */}
      <mesh
        position={[0, -WATER_CONFIG.bed.depth / 2 - 0.1, 0]}
        geometry={bedGeometry}
        receiveShadow
      >
        <meshStandardMaterial
          color={WATER_CONFIG.bed.bedColor}
          roughness={0.95}
          metalness={0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 2. Suelo del lecho profundo */}
      <mesh
        position={[0, -WATER_CONFIG.bed.depth - 0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[WATER_CONFIG.bed.radius * 0.75, 48]} />
        <meshStandardMaterial
          color={WATER_CONFIG.bed.bedColor}
          roughness={0.98}
          metalness={0.02}
        />
      </mesh>

      {/* 3. Superficie del agua dinámica con ondas y reflejos de linternas */}
      <mesh
        ref={waterMeshRef}
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        renderOrder={2}
      >
        <planeGeometry
          args={[
            WATER_CONFIG.size,
            WATER_CONFIG.size,
            WATER_CONFIG.subdivisions,
            WATER_CONFIG.subdivisions,
          ]}
        />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent={true}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 4. Vegetación flotante sutil (lentejas de agua / nenúfares discretos) */}
      {WATER_CONFIG.floatingPlants.enabled && <FloatingPlants />}
    </group>
  );
}
