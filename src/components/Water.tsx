import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WATER_CONFIG } from '../config/waterConfig';
import { FloatingPlants } from './FloatingPlants';

export function Water() {
  const waterMeshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Shaders personalizados para agua de estanque natural y profunda
  const { uniforms, vertexShader, fragmentShader } = useMemo(() => {
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

          // Iluminación ambiental y solar suave diurna
          vec3 lightDir = normalize(uSunPosition);
          float diff = max(dot(normal, lightDir), 0.0);
          finalColor += uSurfaceColor * (diff * 0.2);

          // Reflejo especular satinado suave (sin brillos blancos puntuales)
          vec3 halfVector = normalize(lightDir + viewDir);
          float spec = pow(max(dot(normal, halfVector), 0.0), 28.0);
          finalColor += vec3(0.12, 0.18, 0.22) * spec * 0.35;

          gl_FragColor = vec4(finalColor, uTransparency);
        }
      `,
    };
  }, []);

  // Animación del tiempo del agua en cada frame
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
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

      {/* 3. Superficie del agua dinámica con ondas naturales */}
      <mesh
        ref={waterMeshRef}
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
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
