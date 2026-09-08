import { useMemo } from 'react';
import { Branch } from './Branch';
import { Leaf } from './Leaf';
import { createBranchCurve } from '../config/branchConfig';
import {
  FOLIAGE_CONFIG,
  generateFoliageLayout,
  getLeafTransformAlongBranch,
  FoliageInstanceSpec,
} from '../config/foliageConfig';

interface FoliageBranchNodeProps {
  spec: FoliageInstanceSpec;
}

/**
 * Nodo de ramificación: Ramita Maestra + 3 a 4 Hojas Maestras a lo largo de su extensión.
 * Utiliza exclusivamente las piezas maestras aprobadas de Leaf y Branch.
 */
function FoliageBranchNode({ spec }: FoliageBranchNodeProps) {
  // Curva 3D de la ramita secundaria
  const { curve } = useMemo(
    () => createBranchCurve(spec.branchConfig),
    [spec.branchConfig]
  );

  // Calcula las transformaciones de las 3 a 4 hojas a lo largo de esta ramita
  const leafTransforms = useMemo(() => {
    return spec.leaves.map((leafSpec) =>
      getLeafTransformAlongBranch(
        leafSpec,
        curve,
        spec.branchConfig,
        spec.leafAttachConfig
      )
    );
  }, [spec.leaves, curve, spec.branchConfig, spec.leafAttachConfig]);

  return (
    <group name={`foliage-branch-node-${spec.id}`}>
      {/* Ramita secundaria maestra */}
      <Branch branchConfig={spec.branchConfig} />

      {/* 3 a 4 hojas maestras distribuidas a lo largo de la ramita */}
      {leafTransforms.map((transform, idx) => (
        <Leaf
          key={`leaf-${spec.id}-${idx}`}
          position={transform.position}
          rotation={transform.rotation}
          scale={transform.scale}
          anchorAtBase={true}
        />
      ))}
    </group>
  );
}

export interface PlantFoliageSystemProps {
  config?: Partial<typeof FOLIAGE_CONFIG>;
}

/**
 * Sistema Completo de Ramificaciones y Follaje.
 * Cada ramita contiene 3 a 4 hojas maestras distribuidas orgánicamente.
 * El tallo central permanece visible y la zona apical despejada para la futura flor.
 */
export function PlantFoliageSystem({ config }: PlantFoliageSystemProps = {}) {
  const instances = useMemo(() => generateFoliageLayout(config), [config]);

  return (
    <group name="plant-foliage-system">
      {instances.map((spec) => (
        <FoliageBranchNode key={spec.id} spec={spec} />
      ))}
    </group>
  );
}
