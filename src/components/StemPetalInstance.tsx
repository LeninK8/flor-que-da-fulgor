import { useMemo } from 'react';
import { Petal } from './Petal';
import { StemPetalConfig, STEM_PETAL_CONFIG, getStemPetalTransform } from '../config/stemPetalConfig';
import { PetalConfig, PETAL_CONFIG } from '../config/petalConfig';

export interface StemPetalInstanceProps {
  config?: Partial<StemPetalConfig>;
  petalConfig?: Partial<PetalConfig>;
  wireframe?: boolean;
  showSparkles?: boolean;
}

/**
 * Instancia Única del Pétalo Maestro colocada en la cúspide del tallo
 *
 * - No altera la geometría de Petal.jsx (completamente bloqueada)
 * - Pivota exactamente desde la base de inserción del pétalo
 * - Conexión natural con el tallo: sin flotar, sin hueco, sin penetración excesiva
 * - Orientado hacia arriba, siguiendo la curvatura orgánica del tallo con inclinación suave
 */
export function StemPetalInstance({
  config,
  petalConfig: petalConfigOverride,
  wireframe = false,
  showSparkles = false,
}: StemPetalInstanceProps) {
  const mergedStemConfig = useMemo(() => {
    return { ...STEM_PETAL_CONFIG, ...config };
  }, [config]);

  const mergedPetalConfig = useMemo(() => {
    return { ...PETAL_CONFIG, ...petalConfigOverride };
  }, [petalConfigOverride]);

  const transform = useMemo(() => {
    return getStemPetalTransform(mergedStemConfig, mergedPetalConfig);
  }, [mergedStemConfig, mergedPetalConfig]);

  return (
    <group
      position={transform.position}
      rotation={transform.rotation}
      scale={transform.scale}
      name="stem-single-petal-master"
    >
      {/* 
        El offset basePivotOffset sitúa la base de inserción del pétalo 
        exactamente en el punto de anclaje (0, 0, 0) del grupo en la cúspide del tallo.
      */}
      <Petal
        position={transform.basePivotOffset}
        config={mergedPetalConfig}
        wireframe={wireframe}
        showSparkles={showSparkles}
      />
    </group>
  );
}
