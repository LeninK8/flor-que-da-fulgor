/**
 * FLOWER PETAL SYSTEM — 6 INSTANCIAS DEL PETAL MASTER
 *
 * Construye la flor completa utilizando EXACTAMENTE 6 instancias del PETAL MASTER actual.
 * 
 * Reglas respetadas:
 * - NO modificar Petal.tsx.
 * - Utiliza exactamente 6 instancias del Petal Master mediante transformaciones.
 * - Distribución radial de 60° (360° / 6) con sutiles variaciones orgánicas.
 * - Flor ABIERTA: los pétalos nacen cerca del centro y se expanden hacia afuera y hacia arriba en arco ∩.
 * - La "pancita" (concavidad/convexidad aprobada) se conserva intacta sin invertirla.
 * - Inclinación en arco (1.15 rad / ~66°): puntas hacia afuera y abajo en forma ∩.
 * - La orientación global continúa el extremo superior del tallo.
 * - Centro visible y libre para la futura estructura interior (pistilo, estambres, etc.).
 * - Detalle púrpura conservado en la base de inserción (u=0) más cercana al centro/tallo.
 */

import { useMemo } from 'react';
import { Petal } from './Petal';
import { FlowerStamens } from './FlowerStamens';
import { FLOWER_CONFIG, FlowerConfig, getFlowerPetalTransforms } from '../config/flowerConfig';

export interface FlowerPetalSystemProps {
  config?: FlowerConfig;
}

export function FlowerPetalSystem({ config = FLOWER_CONFIG }: FlowerPetalSystemProps) {
  const transforms = useMemo(() => getFlowerPetalTransforms(config), [config]);

  return (
    <group
      name="flower-6-petals-system"
      position={transforms.basePosition}
      rotation={transforms.baseRotation}
    >
      {/* 
        EXACTAMENTE 6 PÉTALOS
        Cada pétalo es una instancia del Petal Master aprobada.
        Nace cerca del centro y se proyecta hacia afuera con inclinación intermedia.
      */}
      {transforms.petals.map((petal) => (
        <group
          key={`flower-petal-${petal.index}`}
          name={`petal-radial-slot-${petal.index}`}
          rotation={[0, petal.azimuth, 0]}
        >
          {/*
            1. Desplazamiento radial 'centerRadius': las bases se aproximan en el centro
               sin perforarse exageradamente y dejando el receptáculo central visible.
            2. Inclinación 'openTilt': expande el pétalo hacia afuera y arriba (\ /).
            3. Variaciones sutiles orgánicas: elevación, escala y leve roll para evitar
               la apariencia de estrella rígida matemática.
          */}
          <group
            name={`petal-anchor-${petal.index}`}
            position={[0, petal.elevation, -config.centerRadius]}
            rotation={[petal.tilt, Math.PI, petal.roll]}
            scale={[petal.scale, petal.scale, petal.scale]}
          >
            {/*
              Petal Master aprobado sin modificar.
              El position={petal.pivotOffset} sitúa el punto de nacimiento (u=0)
              exactamente en el anclaje central.
            */}
            <Petal position={petal.pivotOffset} showSparkles={false} />
          </group>
        </group>
      ))}

      {/*
        EXACTAMENTE 3 ESTRUCTURAS FLORALES TIPO ESTAMBRE BIOLUMINISCENTES
        Nacen en la zona central interior de la flor entre los 6 pétalos:
        BASE → TALLO CURVADO → CURVA MÁS PRONUNCIADA → PUNTA ENROLLADA EN ESPIRAL 🌀
        Diferenciadas: Estructura 1 (pequeña) → Estructura 2 (mediana) → Estructura 3 (grande)
      */}
      <FlowerStamens />
    </group>
  );
}

export default FlowerPetalSystem;
