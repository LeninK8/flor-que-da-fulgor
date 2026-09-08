import { useMemo } from 'react';
import { Leaf } from './Leaf';
import { createStemCurve } from '../config/stemConfig';
import {
  DEFAULT_BASAL_LEAVES,
  computeBasalLeafTransform,
} from '../config/basalFoliageConfig';

/**
 * Sistema de Follaje Basal de la Planta.
 * Añade una corona orgánica de hojas en la base del tallo, justo encima
 * del montículo de tierra, utilizando exclusivamente la Leaf maestra aprobada.
 */
export function BasalFoliage() {
  const stemCurve = useMemo(() => createStemCurve(), []);

  const leafTransforms = useMemo(() => {
    return DEFAULT_BASAL_LEAVES.map((spec) =>
      computeBasalLeafTransform(spec, stemCurve)
    );
  }, [stemCurve]);

  return (
    <group name="basal-foliage-system">
      {leafTransforms.map((transform, index) => (
        <Leaf
          key={`basal-leaf-${index}`}
          position={transform.position}
          rotation={transform.rotation}
          scale={transform.scale}
          anchorAtBase={true}
        />
      ))}
    </group>
  );
}
