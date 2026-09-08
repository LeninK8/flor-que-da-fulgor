import { useMemo } from 'react';
import * as THREE from 'three';
import { LEAF_CONFIG } from '../config/leafConfig';

export interface LeafProps {
  position?: [number, number, number];
  rotation?: [number, number, number] | THREE.Euler;
  scale?: number | [number, number, number];
  anchorAtBase?: boolean;
}

export function Leaf({
  position = [0, 0.4, 0],
  rotation = [0, 0, 0],
  scale = 1,
  anchorAtBase = false,
}: LeafProps = {}) {
  const { geometry } = useMemo(() => {
    const {
      length,
      maxWidth,
      widestPointT,
      petioleLength,
      petioleWidth,
      taperExponent,
      taperPower,
      thicknessMidrib,
      thicknessBlade,
      thicknessEdge,
      longitudinalArch,
      transverseCup,
      tipCurveDown,
      organicAsymmetry,
      veinReliefUpper,
      veinReliefLower,
      secondaryVeinCount,
      secondaryVeinRelief,
      lengthSegments,
      widthSegments,
      colors,
    } = LEAF_CONFIG;

    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const colorList: number[] = [];
    const indices: number[] = [];

    const cPetiole = new THREE.Color(colors.petiole);
    const cMidrib = new THREE.Color(colors.midrib);
    const cSecVein = new THREE.Color(colors.secondaryVein);
    const cBladeBase = new THREE.Color(colors.bladeBase);
    const cBladeCenter = new THREE.Color(colors.bladeCenter);
    const cBladeMargin = new THREE.Color(colors.bladeMargin);
    const cTip = new THREE.Color(colors.tip);
    const cUnderside = new THREE.Color(colors.underside);

    // Función que define el contorno botánico ancho y vegetal de la hoja
    // u va de 0 (base del peciolo) a 1 (punta del ápice)
    const getHalfWidth = (u: number, isRightSide: boolean): number => {
      const asymFactor = isRightSide
        ? 1.0 + organicAsymmetry
        : 1.0 - organicAsymmetry;

      const pT = petioleLength / length; // ~0.09
      const wBase = petioleWidth * 0.5;

      if (u < pT) {
        // Peciolo estrecho cilíndrico
        const t = u / pT;
        return THREE.MathUtils.lerp(wBase, wBase * 1.25, t);
      }

      const tBody = (u - pT) / (1.0 - pT);

      // Curva de ensanchamiento progresivo hacia el tercio medio
      let bodyFactor = 0;
      const peakT = (widestPointT - pT) / (1.0 - pT); // ~0.32 dentro del cuerpo

      if (tBody < peakT) {
        // Desde el peciolo hasta el ancho máximo (expansión orgánica enérgica)
        const t = tBody / peakT;
        const smooth = Math.sin((t * Math.PI) / 2);
        bodyFactor = THREE.MathUtils.lerp(wBase / (maxWidth * 0.5), 1.0, smooth);
      } else {
        // Reducción longitudinal continua y progresiva desde el cuerpo ancho hasta la punta
        // Sin quiebres, sin esquinas ni pliegues: transición suave continua C^1
        // Comienza con reducción muy lenta en la zona central-ancha y se estrecha gradualmente hacia el ápice
        const t = (u - widestPointT) / (1.0 - widestPointT);
        bodyFactor = Math.pow(
          Math.cos((Math.PI / 2) * Math.pow(t, taperExponent)),
          taperPower
        );
      }

      return Math.max(0.004, (maxWidth * 0.5) * bodyFactor * asymFactor);
    };

    // Cuadrícula 3D de dos capas (haz y envés) cerradas en el margen
    const rowStride = widthSegments + 1;
    const pointsTop: number[][] = [];
    const pointsBottom: number[][] = [];
    const colorsTop: THREE.Color[][] = [];
    const colorsBottom: THREE.Color[][] = [];

    // Centrar la hoja longitudinalmente respecto al origen para fácil inspección orbital
    const zOffset = -length * 0.45;

    for (let i = 0; i <= lengthSegments; i++) {
      const u = i / lengthSegments;
      const zLocal = u * length + zOffset;

      // 1. Curvatura longitudinal continua y natural (arco suave en continuidad perfecta con el cuerpo)
      const longitudinalY =
        Math.sin(u * Math.PI) * longitudinalArch -
        Math.pow(u, 2.0) * tipCurveDown;

      // 2. Micro-ondulación botánica suave en los márgenes
      const edgeFlutter =
        Math.sin(u * Math.PI * 4.5) * 0.012 * Math.sin(u * Math.PI);

      const rowTop: number[] = [];
      const rowBottom: number[] = [];
      const colRowTop: THREE.Color[] = [];
      const colRowBottom: THREE.Color[] = [];

      for (let j = 0; j <= widthSegments; j++) {
        // v va de -1 (margen izquierdo) pasando por 0 (nervadura central) a +1 (margen derecho)
        const v = (j / widthSegments) * 2.0 - 1.0;
        const absV = Math.abs(v);
        const isRight = v >= 0;

        const hw = getHalfWidth(u, isRight);
        const xLocal = v * hw * (1.0 + (absV > 0.65 ? edgeFlutter : 0));

        // 3. Concavidad transversal (lámina en 'V' suave con nervadura central como eje)
        const transverseY =
          Math.pow(absV, 1.45) * transverseCup * Math.sin(u * Math.PI * 0.95);

        // 4. Nervadura central (cordón tridimensional visible a lo largo del eje central)
        const veinSpan = Math.max(0, 1.0 - absV / 0.14);
        const midribProfile = Math.cos((1.0 - veinSpan) * (Math.PI / 2));
        const midribStrength = Math.pow(1.0 - u * 0.85, 0.85);

        const yMidribUpper = veinReliefUpper * midribProfile * midribStrength;
        const yMidribLower = veinReliefLower * midribProfile * midribStrength;

        // 5. Nervaduras secundarias sutiles (relieve de venas laterales que nacen de la central)
        let secondaryVeinWave = 0;
        if (u > 0.12 && u < 0.88 && absV > 0.12) {
          const veinAngleFactor = u * secondaryVeinCount * 1.8 - absV * 0.75;
          const wave = Math.cos(veinAngleFactor * Math.PI * 2);
          secondaryVeinWave =
            Math.max(0, wave) *
            secondaryVeinRelief *
            (1.0 - absV * 0.5) *
            Math.sin(u * Math.PI);
        }

        // 6. Grosor físico real (sólido 3D, no papel bidimensional)
        const currentThickness =
          THREE.MathUtils.lerp(
            thicknessBlade,
            thicknessEdge,
            Math.pow(absV, 1.5)
          ) *
            (1.0 - u * 0.45) +
          (absV < 0.14 ? thicknessMidrib * midribProfile * (1.0 - u * 0.6) : 0);

        const halfThick = currentThickness * 0.5;

        // Coordenadas Y finales para haz (superior) y envés (inferior)
        const yTop =
          longitudinalY +
          transverseY +
          yMidribUpper +
          secondaryVeinWave +
          halfThick;

        const yBottom =
          longitudinalY +
          transverseY -
          yMidribLower -
          halfThick;

        rowTop.push(xLocal, yTop, zLocal);
        rowBottom.push(xLocal, yBottom, zLocal);

        // Coloración botánica del haz (superior)
        const cTop = new THREE.Color();
        if (u < petioleLength / length) {
          // Base del peciolo
          cTop.copy(cPetiole);
        } else if (u > 0.86) {
          // Punta tierna en gradiente orgánico suave
          const tTip = (u - 0.86) / 0.14;
          cTop.copy(cBladeMargin).lerp(cTip, tTip * 0.8);
        } else if (veinSpan > 0.15) {
          // Nervadura central clara
          const tV = (veinSpan - 0.15) / 0.85;
          cTop.copy(cBladeBase).lerp(cMidrib, tV * 0.9);
        } else if (secondaryVeinWave > secondaryVeinRelief * 0.25) {
          // Nervaduras secundarias sutiles
          cTop.copy(cBladeCenter).lerp(cSecVein, 0.45);
        } else {
          // Lámina verde natural medio con transición sutil hacia márgenes frescos
          cTop.copy(cBladeCenter).lerp(cBladeMargin, absV * 0.7);
        }
        colRowTop.push(cTop);

        // Coloración del envés (cara inferior, ligeramente más mate/agrisada)
        const cBottom = cTop.clone().lerp(cUnderside, 0.38);
        colRowBottom.push(cBottom);
      }

      pointsTop.push(rowTop);
      pointsBottom.push(rowBottom);
      colorsTop.push(colRowTop);
      colorsBottom.push(colRowBottom);
    }

    // 1. Vértices de la cara superior (Haz)
    for (let i = 0; i <= lengthSegments; i++) {
      for (let j = 0; j <= widthSegments; j++) {
        const idx = j * 3;
        vertices.push(
          pointsTop[i][idx],
          pointsTop[i][idx + 1],
          pointsTop[i][idx + 2]
        );
        uvs.push(j / widthSegments, i / lengthSegments);
        const c = colorsTop[i][j];
        colorList.push(c.r, c.g, c.b);
      }
    }

    // Caras de la cara superior
    for (let i = 0; i < lengthSegments; i++) {
      for (let j = 0; j < widthSegments; j++) {
        const a = i * rowStride + j;
        const b = (i + 1) * rowStride + j;
        const c = (i + 1) * rowStride + (j + 1);
        const d = i * rowStride + (j + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    // 2. Vértices de la cara inferior (Envés)
    const bottomOffset = vertices.length / 3;
    for (let i = 0; i <= lengthSegments; i++) {
      for (let j = 0; j <= widthSegments; j++) {
        const idx = j * 3;
        vertices.push(
          pointsBottom[i][idx],
          pointsBottom[i][idx + 1],
          pointsBottom[i][idx + 2]
        );
        uvs.push(j / widthSegments, i / lengthSegments);
        const c = colorsBottom[i][j];
        colorList.push(c.r, c.g, c.b);
      }
    }

    // Caras de la cara inferior (orden invertido para normales correctas hacia abajo)
    for (let i = 0; i < lengthSegments; i++) {
      for (let j = 0; j < widthSegments; j++) {
        const a = bottomOffset + i * rowStride + j;
        const b = bottomOffset + (i + 1) * rowStride + j;
        const c = bottomOffset + (i + 1) * rowStride + (j + 1);
        const d = bottomOffset + i * rowStride + (j + 1);

        indices.push(a, d, b);
        indices.push(b, d, c);
      }
    }

    // 3. Cierre perimétrico lateral (costura física entre el haz y el envés)
    // Margen izquierdo (j = 0)
    for (let i = 0; i < lengthSegments; i++) {
      const topA = i * rowStride;
      const topB = (i + 1) * rowStride;
      const botA = bottomOffset + i * rowStride;
      const botB = bottomOffset + (i + 1) * rowStride;

      indices.push(topA, topB, botA);
      indices.push(topB, botB, botA);
    }

    // Margen derecho (j = widthSegments)
    for (let i = 0; i < lengthSegments; i++) {
      const topA = i * rowStride + widthSegments;
      const topB = (i + 1) * rowStride + widthSegments;
      const botA = bottomOffset + i * rowStride + widthSegments;
      const botB = bottomOffset + (i + 1) * rowStride + widthSegments;

      indices.push(topA, botA, topB);
      indices.push(topB, botA, botB);
    }

    // Base del peciolo (i = 0)
    for (let j = 0; j < widthSegments; j++) {
      const topA = j;
      const topB = j + 1;
      const botA = bottomOffset + j;
      const botB = bottomOffset + j + 1;

      indices.push(topA, botA, topB);
      indices.push(topB, botA, botB);
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colorList, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    return { geometry: geom };
  }, []);

  return (
    <group
      name="master-leaf-instance"
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <group position={anchorAtBase ? [0, 0, LEAF_CONFIG.length * 0.45] : [0, 0, 0]}>
        {/* Hoja Maestra 3D Aislada con cuerpo vegetal ancho, nervaduras integradas y volumen real */}
        <mesh geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial
            vertexColors={true}
            roughness={LEAF_CONFIG.roughness}
            metalness={LEAF_CONFIG.metalness}
            side={THREE.DoubleSide}
            shadowSide={THREE.DoubleSide}
            flatShading={false}
          />
        </mesh>
      </group>
    </group>
  );
}
