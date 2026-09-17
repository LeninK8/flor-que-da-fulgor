import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { SCENE_CONFIG } from '../config/sceneConfig';
import { Water } from '../components/Water';
import { Island } from '../components/Island';
import { Grass } from '../components/Grass';
import { Stem } from '../components/Stem';
import { Branch } from '../components/Branch';
import { Leaf } from '../components/Leaf';
import { BasalFoliage } from '../components/BasalFoliage';
import { PlantFoliageSystem } from '../components/PlantFoliageSystem';
import { Petal } from '../components/Petal';
import { StemPetalInstance } from '../components/StemPetalInstance';
import { FlowerPetalSystem } from '../components/FlowerPetalSystem';
import { FloatingLanterns } from '../components/FloatingLanterns';
import { Fireflies } from '../components/Fireflies';
import { FOLIAGE_CONFIG } from '../config/foliageConfig';
import { getLeafAttachmentTransform } from '../config/leafConfig';
import { PetalConfig } from '../config/petalConfig';
import { StemPetalConfig } from '../config/stemPetalConfig';
import { FLOWER_CONFIG, FlowerConfig, IndividualPetalOverride } from '../config/flowerConfig';

export type CameraViewPreset =
  | 'front'
  | 'side'
  | 'back'
  | 'perspective'
  | 'tip'
  | 'base'
  | 'stamens'
  | 'top'
  | 'bottom'
  | 'lanterns'
  | 'overview';

export type SceneMode =
  | 'flower'
  | 'flower-foliage'
  | 'stem-petal'
  | 'stem-petal-foliage'
  | 'isolated-petal'
  | 'foliage'
  | 'single-branch'
  | 'isolated-leaf';

interface SceneProps {
  mode?: SceneMode;
  cameraPreset?: CameraViewPreset;
  foliageConfigOverride?: Partial<typeof FOLIAGE_CONFIG>;
  petalConfigOverride?: Partial<PetalConfig>;
  individualPetalOverrides?: Record<number, IndividualPetalOverride>;
  selectedPetalIndex?: number | null;
  stemPetalConfigOverride?: Partial<StemPetalConfig>;
  flowerConfigOverride?: Partial<FlowerConfig>;
  isDarkStudio?: boolean;
  isNight?: boolean;
  showLanterns?: boolean;
  wireframe?: boolean;
  showSparkles?: boolean;
  showStemContext?: boolean; // Muestra el tallo y el bulto de tierra (isla) como base de referencia para el pétalo
}

export function Scene({
  mode = 'flower',
  cameraPreset = 'perspective',
  foliageConfigOverride,
  petalConfigOverride,
  individualPetalOverrides,
  selectedPetalIndex,
  stemPetalConfigOverride,
  flowerConfigOverride,
  isDarkStudio = true,
  isNight = true,
  showLanterns = true,
  wireframe = false,
  showSparkles = true,
  showStemContext = true,
}: SceneProps) {
  const env =
    SCENE_CONFIG.mode === 'DAY' ? SCENE_CONFIG.day : SCENE_CONFIG.night;

  const controlsRef = useRef<OrbitControlsImpl>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { gl } = useThree();

  // Centro exacto de la flor bioluminiscente
  const flowerCenter = useMemo(() => new THREE.Vector3(0.231, 3.25, 0.042), []);

  // Estado y referencias de temporización para la rotación automática tras 3 segundos de inactividad
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const idleTimerRef = useRef<number | null>(null);
  const isInteractingRef = useRef<boolean>(false);
  const wheelDebounceRef = useRef<number | null>(null);

  // Detiene inmediatamente la rotación automática ante cualquier interacción del usuario
  const stopAutoRotation = useCallback(() => {
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (controlsRef.current) {
      controlsRef.current.autoRotate = false;
    }
    setIsAutoRotating(false);
  }, []);

  // Inicia la espera de exactamente 3 segundos de inactividad antes de comenzar la rotación orbital
  const startIdleTimer = useCallback(() => {
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = window.setTimeout(() => {
      if (!isInteractingRef.current) {
        if (controlsRef.current) {
          controlsRef.current.autoRotate = true;
        }
        setIsAutoRotating(true);
      }
    }, 3000);
  }, []);

  // 1. Al cargar la escena: esperar exactamente 3 segundos de inactividad e iniciar rotación orbital
  useEffect(() => {
    startIdleTimer();
    return () => {
      if (idleTimerRef.current !== null) window.clearTimeout(idleTimerRef.current);
      if (wheelDebounceRef.current !== null) window.clearTimeout(wheelDebounceRef.current);
    };
  }, [startIdleTimer]);

  // 2. Callbacks de OrbitControls para detectar interacción directa
  const handleControlsStart = useCallback(() => {
    isInteractingRef.current = true;
    stopAutoRotation();
  }, [stopAutoRotation]);

  const handleControlsEnd = useCallback(() => {
    isInteractingRef.current = false;
    startIdleTimer();
  }, [startIdleTimer]);

  // 3. Listeners sobre el canvas/ventana para máxima receptividad al toque o scroll
  useEffect(() => {
    const domElement = gl.domElement;

    const handlePointerDown = () => {
      isInteractingRef.current = true;
      stopAutoRotation();
    };

    const handlePointerUp = () => {
      isInteractingRef.current = false;
      startIdleTimer();
    };

    const handleWheel = () => {
      isInteractingRef.current = true;
      stopAutoRotation();

      if (wheelDebounceRef.current !== null) {
        window.clearTimeout(wheelDebounceRef.current);
      }
      wheelDebounceRef.current = window.setTimeout(() => {
        isInteractingRef.current = false;
        startIdleTimer();
      }, 250);
    };

    domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    domElement.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      domElement.removeEventListener('wheel', handleWheel);
    };
  }, [gl, stopAutoRotation, startIdleTimer]);

  const singleBranchTransform = {
    position: [0.38, 1.96, -0.65] as [number, number, number],
    rotation: [-0.35, -1.05, 0.45] as [number, number, number],
    scale: 0.85,
  };

  const singleLeafTransform = getLeafAttachmentTransform();

  const mergedFlowerConfig = useMemo(
    () => ({ ...FLOWER_CONFIG, ...flowerConfigOverride }),
    [flowerConfigOverride]
  );

  // GESTIÓN DINÁMICA DE CÁMARA SEGÚN VISTAS DE LA FICHA TÉCNICA
  useEffect(() => {
    if (!controlsRef.current || !cameraRef.current) return;

    const curveSign = petalConfigOverride?.invertCurvature ? -1 : 1;

    if (mode === 'isolated-petal') {
      cameraRef.current.up.set(0, 1, 0);

      if (showStemContext) {
        // La cúspide del tallo y el anclaje del pétalo están en [0.231, 3.012, 0.042]
        // y el cuerpo del pétalo asciende hacia y ≈ 3.4 - 3.8
        const anchorX = 0.231;
        const anchorY = 3.35;
        const anchorZ = 0.042;

        if (cameraPreset === 'front') {
          controlsRef.current.target.set(anchorX, anchorY, anchorZ);
          cameraRef.current.position.set(anchorX, anchorY, anchorZ + 2.2);
        } else if (cameraPreset === 'side') {
          controlsRef.current.target.set(anchorX, anchorY, anchorZ);
          cameraRef.current.position.set(anchorX + 2.4, anchorY, anchorZ);
        } else if (cameraPreset === 'back') {
          controlsRef.current.target.set(anchorX, anchorY, anchorZ);
          cameraRef.current.position.set(anchorX, anchorY, anchorZ - 2.2);
        } else if (cameraPreset === 'tip') {
          // Enfoca la punta del pétalo sobre el tallo
          controlsRef.current.target.set(anchorX - 0.1, anchorY + 0.35, anchorZ);
          cameraRef.current.position.set(anchorX + 0.3, anchorY + 0.55, anchorZ + 0.8);
        } else if (cameraPreset === 'base') {
          // Enfoca el anclaje exacto del pétalo al tallo y la base
          controlsRef.current.target.set(anchorX, 3.05, anchorZ);
          cameraRef.current.position.set(anchorX + 0.5, 3.15, anchorZ + 0.9);
        } else if (cameraPreset === 'overview') {
          // Vista completa que abarca el montículo de tierra, el tallo y el pétalo
          controlsRef.current.target.set(0.12, 1.8, 0.0);
          cameraRef.current.position.set(anchorX, 2.4, 5.4);
        } else if (cameraPreset === 'top') {
          cameraRef.current.up.set(0, 0, -1);
          controlsRef.current.target.set(anchorX, anchorY, anchorZ);
          cameraRef.current.position.set(anchorX, anchorY + 2.4, anchorZ);
        } else {
          // Perspectiva 3D natural enfocando pétalo, cúspide y tallo
          controlsRef.current.target.set(anchorX, anchorY, anchorZ);
          cameraRef.current.position.set(anchorX + 1.5, anchorY + 0.6, anchorZ + 1.8);
        }
      } else {
        if (cameraPreset === 'front') {
          // VISTA FRONTAL de la ficha técnica
          controlsRef.current.target.set(0, 0, 0);
          cameraRef.current.position.set(0, 0, 1.65);
        } else if (cameraPreset === 'side') {
          // VISTA LATERAL de la ficha técnica (muestra perfil en S y gancho)
          controlsRef.current.target.set(0, 0, 0);
          cameraRef.current.position.set(1.65, 0, 0);
        } else if (cameraPreset === 'back') {
          // VISTA POSTERIOR de la ficha técnica (envés y quilla dorsal)
          controlsRef.current.target.set(0, 0, 0);
          cameraRef.current.position.set(0, 0, -1.65);
        } else if (cameraPreset === 'tip') {
          // DETALLE DE LA FORMA: Borde ondulado y curvado del gancho terminal
          controlsRef.current.target.set(-0.08, 0.52, -0.08 * curveSign);
          cameraRef.current.position.set(0.2, 0.65, 0.6 * curveSign);
        } else if (cameraPreset === 'base') {
          // DETALLE DE LA FORMA: Base del pétalo y venas magenta
          controlsRef.current.target.set(0, -0.42, 0.05 * curveSign);
          cameraRef.current.position.set(0, -0.32, 0.65 * curveSign);
        } else if (cameraPreset === 'perspective') {
          // Perspectiva 3/4 tridimensional
          controlsRef.current.target.set(0, 0, 0);
          cameraRef.current.position.set(0.95, 0.38, 1.1);
        } else if (cameraPreset === 'top') {
          cameraRef.current.up.set(0, 0, -1);
          controlsRef.current.target.set(0, 0, 0);
          cameraRef.current.position.set(0, 1.65, 0);
        } else if (cameraPreset === 'bottom') {
          // VISTA CENITAL INFERIOR (desde abajo hacia arriba)
          cameraRef.current.up.set(0, 0, 1);
          controlsRef.current.target.set(0, 0, 0);
          cameraRef.current.position.set(0, -1.65, 0);
        }
      }
    } else if (
      mode === 'flower' ||
      mode === 'flower-foliage' ||
      mode === 'stem-petal' ||
      mode === 'stem-petal-foliage'
    ) {
      if (cameraPreset === 'top') {
        // VISTA CENITAL (DESDE ARRIBA): comprueba los 6 pétalos y las 3 estructuras estambre centrales
        cameraRef.current.up.set(0, 0, -1);
        controlsRef.current.target.set(0.231, 3.25, 0.042);
        cameraRef.current.position.set(0.231, 5.5, 0.042);
      } else {
        cameraRef.current.up.set(0, 1, 0);

        if (cameraPreset === 'front') {
          // VISTA FRONTAL de la flor y extremo del tallo
          controlsRef.current.target.set(0.231, 3.65, 0.042);
          cameraRef.current.position.set(0.231, 3.65, 3.2);
        } else if (cameraPreset === 'side') {
          // VISTA LATERAL: silueta, curvatura, inclinación y perfil de unión
          controlsRef.current.target.set(0.231, 3.65, 0.042);
          cameraRef.current.position.set(3.4, 3.65, 0.042);
        } else if (cameraPreset === 'base' || cameraPreset === 'stamens') {
          // VISTA CENTRO / ESTAMBRES: encuadre de las 3 estructuras internas y sus espirales
          controlsRef.current.target.set(0.231, 3.48, 0.042);
          cameraRef.current.position.set(0.231 + 0.48, 4.12, 0.042 + 0.82);
        } else if (cameraPreset === 'overview') {
          // PLANTA COMPLETA (isla + tallo completo + flor)
          controlsRef.current.target.set(0.12, 1.8, 0.0);
          cameraRef.current.position.set(0.231, 2.4, 5.4);
        } else if (cameraPreset === 'lanterns') {
          // VISTA ENTORNO / LINTERNAS: encuadre cinematográfico amplio del campo de linternas flotando alrededor de la flor
          controlsRef.current.target.set(0.231, 3.25, 0.042);
          cameraRef.current.position.set(0.231 + 3.6, 4.4, 0.042 + 6.6);
        } else {
          // VISTA 3/4 (PERSPECTIVA): comprueba volumen, apertura y armonía
          controlsRef.current.target.set(0.231, 3.65, 0.042);
          cameraRef.current.position.set(2.0, 4.3, 2.3);
        }
      }
    }

    controlsRef.current.update();
  }, [mode, cameraPreset, petalConfigOverride?.invertCurvature]);

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        fov={42}
        position={[0, 0, 1.65]}
      />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.06}
        enablePan={mode === 'isolated-petal'}
        maxDistance={25}
        minDistance={mode === 'isolated-petal' ? 0.15 : 1.2}
        minPolarAngle={mode === 'isolated-petal' && !showStemContext ? 0 : 0.05}
        maxPolarAngle={mode === 'isolated-petal' ? (showStemContext ? Math.PI : Math.PI) : Math.PI / 2 - 0.03}
        target={mode === 'isolated-petal' ? (showStemContext ? [0.231, 3.35, 0.042] : [0, 0, 0]) : [0.231, 3.25, 0.042]}
        autoRotate={mode === 'isolated-petal' ? false : isAutoRotating}
        autoRotateSpeed={0.75}
        onStart={handleControlsStart}
        onEnd={handleControlsEnd}
      />

      {/* ILUMINACIÓN */}
      {mode === 'isolated-petal' && isDarkStudio ? (
        /* Iluminación de estudio oscuro especializada para bioluminiscencia y SSS */
        <group name="bioluminescent-studio-lights">
          {/* Luz ambiental sutil índigo */}
          <ambientLight color="#1e1b4b" intensity={showStemContext ? 0.65 : 0.4} />

          {/* Luz clave frontal suave para revelar volumen de copa y acanaladuras */}
          <directionalLight
            position={showStemContext ? [2.5, 5.0, 4.2] : [1.5, 2.0, 3.2]}
            color="#fffbeb"
            intensity={1.3}
          />

          {/* Luz de contraluz / Rim Light cálida para resaltar el gancho apical y bordes */}
          <directionalLight
            position={showStemContext ? [-3.6, 5.2, -3.6] : [-2.6, 2.2, -2.6]}
            color="#f59e0b"
            intensity={3.2}
          />

          {/* Luz de relleno posterior para translucidez (SSS) */}
          <directionalLight
            position={showStemContext ? [0.2, 3.5, -3.0] : [0.2, 0.5, -3.0]}
            color="#ea580c"
            intensity={2.0}
          />

          {/* Luz de acento púrpura para la base / caliz */}
          <directionalLight
            position={showStemContext ? [2.0, 1.0, 1.2] : [2.0, -2.0, 1.2]}
            color="#c026d3"
            intensity={2.4}
          />

          {/* Luz sutil para iluminar la isla / bulto de tierra */}
          {showStemContext && (
            <directionalLight
              position={[-4, 3, 5]}
              color="#38bdf8"
              intensity={0.4}
            />
          )}
        </group>
      ) : isNight ? (
        /* Iluminación mágica nocturna inspirada en Tangled / Enredados */
        <group name="tangled-night-lights">
          {/* Luz ambiental púrpura-índigo suave */}
          <ambientLight color="#201525" intensity={0.7} />

          {/* Luz hemisférica: cielo violáceo a suelo oscuro */}
          <hemisphereLight
            args={['#2e1538', '#0c0517', 0.65]}
          />

          {/* Luz de luna cenital cálida suave que resalta la flor y el agua */}
          <directionalLight
            position={[10, 20, 10]}
            color="#ffd0a0"
            intensity={0.55}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />

          {/* Contraluz suave para destacar la silueta y translucidez de los pétalos */}
          <directionalLight
            position={[-8, 12, -10]}
            color="#d946ef"
            intensity={0.45}
          />

          {/* Relleno frontal cálido tenue */}
          <directionalLight
            position={[0, 6, 12]}
            color="#fef08a"
            intensity={0.3}
          />
        </group>
      ) : (
        /* Iluminación de estudio diurna estándar */
        <group name="standard-day-lights">
          <hemisphereLight
            args={[
              env.hemisphereLight.skyColor,
              env.hemisphereLight.groundColor,
              env.hemisphereLight.intensity * 1.1,
            ]}
          />
          <ambientLight
            color={env.ambientLight.color}
            intensity={env.ambientLight.intensity * 1.15}
          />
          <directionalLight
            position={env.sunLight.position}
            color={env.sunLight.color}
            intensity={env.sunLight.intensity * 1.1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <directionalLight
            position={env.fillLight.position}
            color={env.fillLight.color}
            intensity={env.fillLight.intensity}
          />
          <directionalLight
            position={env.frontFillLight.position}
            color={env.frontFillLight.color}
            intensity={env.frontFillLight.intensity}
          />
        </group>
      )}

      {/* RENDERIZADO SEGÚN EL MODO */}
      {mode === 'flower' ? (
        <group name="flower-stage">
          <Water />
          <Island />
          <Grass />
          <Stem />
          <BasalFoliage />
          <PlantFoliageSystem config={foliageConfigOverride} />
          <FlowerPetalSystem
            config={mergedFlowerConfig}
            petalConfig={petalConfigOverride}
            individualOverrides={individualPetalOverrides}
            selectedPetalIndex={selectedPetalIndex}
          />
          {showLanterns && <FloatingLanterns />}
          <Fireflies />
        </group>
      ) : mode === 'flower-foliage' ? (
        <group name="flower-foliage-stage">
          <Water />
          <Island />
          <Grass />
          <Stem />
          <BasalFoliage />
          <PlantFoliageSystem config={foliageConfigOverride} />
          <FlowerPetalSystem
            config={mergedFlowerConfig}
            petalConfig={petalConfigOverride}
            individualOverrides={individualPetalOverrides}
            selectedPetalIndex={selectedPetalIndex}
          />
          {showLanterns && <FloatingLanterns />}
          <Fireflies />
        </group>
      ) : mode === 'isolated-petal' ? (
        <group name="isolated-petal-stage">
          {showStemContext ? (
            <>
              {/* Entorno base: agua, bulto de tierra (isla) y tallo para referencia espacial del anclaje */}
              <Water />
              <Island />
              <Grass />
              <Stem />
              <StemPetalInstance
                config={stemPetalConfigOverride}
                petalConfig={petalConfigOverride}
                wireframe={wireframe}
                showSparkles={showSparkles}
              />
            </>
          ) : (
            <group
              rotation={[
                (petalConfigOverride?.tiltAngle !== undefined ? petalConfigOverride.tiltAngle - 1.15 : 0),
                petalConfigOverride?.azimuthAngle ?? 0,
                petalConfigOverride?.rollAngle ?? 0,
              ]}
            >
              <Petal
                config={petalConfigOverride}
                showSparkles={showSparkles}
                wireframe={wireframe}
              />
            </group>
          )}
        </group>
      ) : mode === 'stem-petal' ? (
        <group name="stem-single-petal-stage">
          <Water />
          <Island />
          <Grass />
          <Stem />
          <StemPetalInstance
            config={stemPetalConfigOverride}
            petalConfig={petalConfigOverride}
            wireframe={wireframe}
            showSparkles={showSparkles}
          />
        </group>
      ) : mode === 'stem-petal-foliage' ? (
        <group name="stem-petal-full-stage">
          <Water />
          <Island />
          <Grass />
          <Stem />
          <BasalFoliage />
          <PlantFoliageSystem config={foliageConfigOverride} />
          <StemPetalInstance config={stemPetalConfigOverride} />
        </group>
      ) : mode === 'isolated-leaf' ? (
        <group name="isolated-leaf-stage">
          <Leaf />
        </group>
      ) : mode === 'single-branch' ? (
        <group name="single-branch-stage">
          <Water />
          <Island />
          <Grass />
          <Stem />
          <group
            position={singleBranchTransform.position}
            rotation={singleBranchTransform.rotation}
            scale={singleBranchTransform.scale}
          >
            <Branch />
          </group>
          <Leaf
            position={singleLeafTransform.position}
            rotation={singleLeafTransform.rotation}
            scale={singleLeafTransform.scale}
          />
        </group>
      ) : (
        <group name="foliage-system-stage">
          <Water />
          <Island />
          <Grass />
          <Stem />
          <BasalFoliage />
          <PlantFoliageSystem config={foliageConfigOverride} />
        </group>
      )}
    </>
  );
}
