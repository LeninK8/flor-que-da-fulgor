import * as THREE from 'three';
import { BRANCH_CONFIG } from './branchConfig';
import { LEAF_ATTACH_CONFIG, getLeafAttachmentTransform } from './leafConfig';

export interface BranchLeafPlacement {
  id: string;
  branchT: number;         // Posición a lo largo de la ramita (0.35 a 1.0)
  sideAngle: number;       // Ángulo lateral en radianes (0 en punta, ~±0.4 a 0.55 rad para laterales)
  scaleMultiplier: number; // Factor de escala (0.72 a 1.00)
  tilt: number;            // Inclinación hacia la luz
  roll: number;            // Alabeo orgánico
  rotation: number;        // Variación de giro
  isTerminal?: boolean;    // Si es la hoja terminal en la punta
}

export interface FoliageInstanceSpec {
  id: string;
  stemAttachT: number;
  branchConfig: typeof BRANCH_CONFIG;
  leafAttachConfig: typeof LEAF_ATTACH_CONFIG;
  leaves: BranchLeafPlacement[];
}

/**
 * Configuración central del Sistema de Follaje y Ramificaciones.
 * Todos los parámetros están centralizados aquí para facilitar su calibración.
 */
export const FOLIAGE_CONFIG = {
  branchCount: 5,           // Cantidad moderada de ramitas (planta esbelta y elegante)
  minHeight: 0.23,          // Altura mínima en el tallo (por encima del montículo y pasto)
  maxHeight: 0.69,          // Altura máxima en el tallo (deja libre el tercio superior para la flor)
  sideVariation: 0.35,      // Variación angular lateral orgánica (evita simetría de escalera)
  rotationVariation: 0.18,  // Variación en inclinación y alabeo de hojas
  scaleVariation: 0.15,     // Variación progresiva de escala de la base al ápice
  leavesPerBranch: 4,       // 3 a 4 hojas por ramita
};

/**
 * Genera la lista de instancias de ramitas y sus 3 a 4 hojas según la configuración botánica.
 * Distribuye las ramas de forma irregular y alternada a ambos lados del tallo,
 * manteniendo el tallo visible y la zona superior despejada para la flor.
 */
export function generateFoliageLayout(
  customConfig?: Partial<typeof FOLIAGE_CONFIG>
): FoliageInstanceSpec[] {
  const config = { ...FOLIAGE_CONFIG, ...customConfig };
  const {
    branchCount,
    minHeight,
    maxHeight,
    sideVariation,
    rotationVariation,
    scaleVariation,
  } = config;

  // Distribución de alturas con separación irregular orgánica (no una escalera uniforme)
  const baseTList: number[] = [];
  if (branchCount === 1) {
    baseTList.push((minHeight + maxHeight) * 0.5);
  } else {
    for (let i = 0; i < branchCount; i++) {
      const progress = i / (branchCount - 1);
      const irregularOffset =
        Math.sin(progress * Math.PI) * 0.03 * (i % 2 === 0 ? 1 : -1);
      const t = minHeight + progress * (maxHeight - minHeight) + irregularOffset;
      baseTList.push(Math.max(minHeight, Math.min(maxHeight, t)));
    }
  }

  // Ángulos azimutales alternados entre lados con variación orgánica
  const baseAzimuths = [0.65, 2.85, -1.2, 1.65, -2.4];
  const baseAngles = [0.76, 0.73, 0.72, 0.68, 0.64];
  const baseLengths = [0.57, 0.54, 0.52, 0.48, 0.43];
  const baseLeafTilts = [0.17, 0.15, 0.16, 0.14, 0.12];
  const baseLeafRolls = [0.09, -0.1, -0.08, 0.08, -0.07];

  const instances: FoliageInstanceSpec[] = [];

  for (let i = 0; i < branchCount; i++) {
    const t = baseTList[i];
    const normalizedIndex = branchCount > 1 ? i / (branchCount - 1) : 0.5;

    // Alternancia de lados con variación orgánica
    const azBase = baseAzimuths[i % baseAzimuths.length];
    const azimuthJitter = Math.sin(i * 3.7) * sideVariation * 0.5;
    const azimuthAngle = azBase + azimuthJitter;

    // Ángulo de inclinación ascendente de la ramita
    const angleBase = baseAngles[i % baseAngles.length];
    const angle = angleBase + Math.cos(i * 2.3) * 0.03;

    // Ahusamiento de escala general de inferior a superior
    const scaleFactor = 1.0 - normalizedIndex * scaleVariation * 1.5;
    const length =
      (baseLengths[i % baseLengths.length] || 0.5) *
      (1.0 - normalizedIndex * 0.18);

    // Configuración de la ramita secundaria maestra
    const branchConfig: typeof BRANCH_CONFIG = {
      ...BRANCH_CONFIG,
      stemAttachT: t,
      azimuthAngle,
      angle,
      length,
      curvature: 0.12 - normalizedIndex * 0.02,
      radiusBase: BRANCH_CONFIG.radiusBase * scaleFactor,
      radiusTip: BRANCH_CONFIG.radiusTip * scaleFactor,
    };

    // Parámetros base de la hoja
    const leafScale = LEAF_ATTACH_CONFIG.scale * scaleFactor;
    const leafTilt =
      (baseLeafTilts[i % baseLeafTilts.length] || 0.15) +
      Math.sin(i * 1.7) * rotationVariation * 0.3;
    const leafRoll =
      (baseLeafRolls[i % baseLeafRolls.length] || -0.08) +
      Math.cos(i * 2.1) * rotationVariation * 0.3;
    const leafRotation = Math.sin(i * 4.1) * 0.06;

    const leafAttachConfig: typeof LEAF_ATTACH_CONFIG = {
      ...LEAF_ATTACH_CONFIG,
      scale: leafScale,
      leafTilt,
      leafRoll,
      leafRotation,
      leafOffsetX: 0,
      leafOffsetY: 0,
      leafOffsetZ: -0.016 * scaleFactor,
    };

    // Distribución de 3 o 4 hojas a lo largo de esta ramita:
    // Ramitas inferiores/medias (más largas): 4 hojas.
    // Ramitas superiores (más cortas): 3 hojas.
    const leavesCount = i < 3 ? 4 : 3;
    const leaves: BranchLeafPlacement[] = [];

    if (leavesCount === 4) {
      // 4 Hojas distribuidas a lo largo de la ramita
      leaves.push(
        {
          id: `leaf-${i}-1`,
          branchT: 0.38,
          sideAngle: 0.52, // Hacia el lado derecho
          scaleMultiplier: 0.74,
          tilt: leafTilt + 0.04,
          roll: 0.10,
          rotation: 0.04,
        },
        {
          id: `leaf-${i}-2`,
          branchT: 0.60,
          sideAngle: -0.48, // Hacia el lado izquierdo (alternando)
          scaleMultiplier: 0.83,
          tilt: leafTilt + 0.02,
          roll: -0.10,
          rotation: -0.04,
        },
        {
          id: `leaf-${i}-3`,
          branchT: 0.81,
          sideAngle: 0.38, // Hacia el lado derecho
          scaleMultiplier: 0.91,
          tilt: leafTilt,
          roll: 0.08,
          rotation: 0.03,
        },
        {
          id: `leaf-${i}-4-terminal`,
          branchT: 1.00,
          sideAngle: 0.00, // Hoja terminal en la punta
          scaleMultiplier: 1.00,
          tilt: leafTilt,
          roll: leafRoll,
          rotation: leafRotation,
          isTerminal: true,
        }
      );
    } else {
      // 3 Hojas distribuidas a lo largo de la ramita
      leaves.push(
        {
          id: `leaf-${i}-1`,
          branchT: 0.50,
          sideAngle: -0.48, // Hacia el lado izquierdo
          scaleMultiplier: 0.78,
          tilt: leafTilt + 0.03,
          roll: -0.09,
          rotation: -0.04,
        },
        {
          id: `leaf-${i}-2`,
          branchT: 0.77,
          sideAngle: 0.40, // Hacia el lado derecho
          scaleMultiplier: 0.89,
          tilt: leafTilt + 0.01,
          roll: 0.08,
          rotation: 0.03,
        },
        {
          id: `leaf-${i}-3-terminal`,
          branchT: 1.00,
          sideAngle: 0.00, // Hoja terminal en la punta
          scaleMultiplier: 1.00,
          tilt: leafTilt,
          roll: leafRoll,
          rotation: leafRotation,
          isTerminal: true,
        }
      );
    }

    instances.push({
      id: `foliage-branch-${i + 1}`,
      stemAttachT: t,
      branchConfig,
      leafAttachConfig,
      leaves,
    });
  }

  return instances;
}

/**
 * Calcula la transformación precisa de una hoja a lo largo de la ramita.
 * Mantiene la conexión biológica natural:
 * - Hojas terminales: acopladas en la punta de la ramita (idéntica a la integración aprobada).
 * - Hojas laterales: nacen de la corteza exterior a ambos lados de la ramita.
 */
export function getLeafTransformAlongBranch(
  placement: BranchLeafPlacement,
  curve: THREE.CatmullRomCurve3,
  branchConfig: typeof BRANCH_CONFIG,
  baseLeafConfig: typeof LEAF_ATTACH_CONFIG
) {
  const { branchT, sideAngle, scaleMultiplier, tilt, roll, rotation, isTerminal } =
    placement;

  const pt = curve.getPointAt(branchT);
  const tangent = curve.getTangentAt(branchT).normalize();
  const worldUp = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(worldUp, tangent).normalize();
  const up = new THREE.Vector3().crossVectors(tangent, right).normalize();

  // Radio de la ramita en branchT
  const taperFactor = Math.pow(branchT, branchConfig.taperExponent);
  let r = THREE.MathUtils.lerp(
    branchConfig.radiusBase,
    branchConfig.radiusTip,
    taperFactor
  );
  if (branchT < 0.15) {
    const collar = 1.0 - branchT / 0.15;
    r += branchConfig.radiusBase * 0.35 * Math.pow(collar, 1.8);
  }

  const effectiveScale = baseLeafConfig.scale * scaleMultiplier;

  if (isTerminal || branchT >= 0.98) {
    // Hoja terminal en la punta de la ramita (aprobada y bloqueada)
    return getLeafAttachmentTransform(
      {
        ...baseLeafConfig,
        scale: effectiveScale,
        leafTilt: tilt,
        leafRoll: roll,
        leafRotation: rotation || 0,
        leafOffsetZ: -0.016 * (effectiveScale / 0.36),
      },
      curve
    );
  }

  // Hoja lateral a lo largo de la ramita
  const yawQuat = new THREE.Quaternion().setFromAxisAngle(up, sideAngle);
  const leafForward = tangent.clone().applyQuaternion(yawQuat).normalize();
  const leafRight = right.clone().applyQuaternion(yawQuat).normalize();
  const leafUp = up.clone().applyQuaternion(yawQuat).normalize();

  const basisMat = new THREE.Matrix4().makeBasis(leafRight, leafUp, leafForward);
  const baseQuat = new THREE.Quaternion().setFromRotationMatrix(basisMat);

  const fineEuler = new THREE.Euler(tilt, rotation || 0, roll, 'YXZ');
  const fineQuat = new THREE.Quaternion().setFromEuler(fineEuler);
  const finalQuat = baseQuat.clone().multiply(fineQuat);
  const finalEuler = new THREE.Euler().setFromQuaternion(finalQuat);

  const sideSign = Math.sign(sideAngle) || 1;
  const sideOffset = leafRight.clone().multiplyScalar(sideSign * r * 0.72);
  const insertOffset = leafForward
    .clone()
    .multiplyScalar(-0.014 * (effectiveScale / 0.36));
  const finalPos = pt.clone().add(sideOffset).add(insertOffset);

  return {
    position: [finalPos.x, finalPos.y, finalPos.z] as [number, number, number],
    rotation: finalEuler,
    scale: effectiveScale,
  };
}
