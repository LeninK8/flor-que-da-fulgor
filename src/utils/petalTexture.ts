/**
 * GENERADOR DE MAPAS DE TEXTURA PARA EL PÉTALO 3D
 *
 * Basado estrictamente en la sección "MATERIALES Y TEXTURAS" y "REFERENCIA DE COLOR":
 * 1. Mapa de color base:
 *    - Centro / Base: magenta / rosa intenso con estrías radiales verticales.
 *    - Zona intermedia: amarillo dorado radiante.
 *    - Bordes: ámbar cálido / amarillo profundo.
 * 2. Mapa de normales: relieve físico de nervaduras, acanaladuras y microtextura celular.
 * 3. Mapa de emisión: nervaduras incandescentes (núcleo blanco/oro) y puntos bioluminiscentes.
 * 4. Mapa de rugosidad: zonas húmedas de bajo roughness y venas cristalinas reflectantes.
 */

import * as THREE from 'three';

export interface PetalTextureSet {
  colorMap: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  emissiveMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  backColorMap: THREE.CanvasTexture;
}

export interface PetalTextureOptions {
  baseColor?: string;
  midColor?: string;
  tipColor?: string;
  veinGlowColor?: string;
}

export function generatePetalTextures(
  resolution = 1024,
  options?: PetalTextureOptions
): PetalTextureSet {
  const width = resolution;
  const height = resolution * 2; // Ratio 1:2 para mayor fidelidad a lo largo del pétalo

  const optBaseColor = options?.baseColor || '#a21caf';
  const optMidColor = options?.midColor || '#facc15';
  const optTipColor = options?.tipColor || '#f97316';
  const optVeinColor = options?.veinGlowColor || '#fbbf24';

  // 1. Canvases
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = width;
  colorCanvas.height = height;
  const ctxC = colorCanvas.getContext('2d')!;

  const emissiveCanvas = document.createElement('canvas');
  emissiveCanvas.width = width;
  emissiveCanvas.height = height;
  const ctxE = emissiveCanvas.getContext('2d')!;

  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = width;
  heightCanvas.height = height;
  const ctxH = heightCanvas.getContext('2d')!;

  const roughnessCanvas = document.createElement('canvas');
  roughnessCanvas.width = width;
  roughnessCanvas.height = height;
  const ctxR = roughnessCanvas.getContext('2d')!;

  const backCanvas = document.createElement('canvas');
  backCanvas.width = width;
  backCanvas.height = height;
  const ctxB = backCanvas.getContext('2d')!;

  // ----------------------------------------------------
  // A. GRADIENTE DE COLOR BASE (Haz frontal)
  // Según ficha:
  // • Centro: magenta / rosa intenso
  // • Zona intermedia: amarillo dorado
  // • Bordes: amarillo más cálido / ámbar
  // ----------------------------------------------------

  const cBase = new THREE.Color(optBaseColor);
  const cMid = new THREE.Color(optMidColor);
  const cTip = new THREE.Color(optTipColor);
  const cVein = new THREE.Color(optVeinColor);

  const baseDeep = new THREE.Color(cBase).multiplyScalar(0.4).getStyle();
  const baseMid = new THREE.Color(cBase).getStyle();
  const baseBright = new THREE.Color(cBase).lerp(cMid, 0.45).getStyle();
  const midStyle = cMid.getStyle();
  const tipSoft = new THREE.Color(cMid).lerp(cTip, 0.5).getStyle();
  const tipStyle = cTip.getStyle();
  const veinStyle = cVein.getStyle();

  // Fondo base
  const baseGrad = ctxC.createLinearGradient(0, height, 0, 0);
  baseGrad.addColorStop(0.0, baseDeep); // base ultradeep
  baseGrad.addColorStop(0.12, baseMid); // color base de inserción
  baseGrad.addColorStop(0.28, baseBright); // transición suave
  baseGrad.addColorStop(0.60, midStyle); // color central radiante
  baseGrad.addColorStop(0.88, tipSoft); // transición a la punta
  baseGrad.addColorStop(1.0, tipStyle); // color apical/punta
  ctxC.fillStyle = baseGrad;
  ctxC.fillRect(0, 0, width, height);

  // Degradado transversal para bordes cálidos/vibrantes
  const edgeGrad = ctxC.createRadialGradient(
    width / 2,
    height * 0.55,
    width * 0.12,
    width / 2,
    height * 0.55,
    width * 0.52
  );
  edgeGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.25)'); // realce suave central
  edgeGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.05)');
  edgeGrad.addColorStop(0.85, cTip.clone().multiplyScalar(0.85).getStyle()); // borde
  edgeGrad.addColorStop(1.0, cTip.clone().multiplyScalar(0.6).getStyle()); // orilla profunda
  ctxC.fillStyle = edgeGrad;
  ctxC.fillRect(0, 0, width, height);

  // Centro de inserción basal que se proyecta en estrías verticales
  const centerBaseGrad = ctxC.createLinearGradient(0, height, 0, height * 0.35);
  centerBaseGrad.addColorStop(0.0, baseDeep);
  centerBaseGrad.addColorStop(0.3, baseMid);
  centerBaseGrad.addColorStop(0.7, baseBright);
  centerBaseGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

  // Flutes / estrías verticales en el tercio inferior
  const fluteCount = 9;
  for (let f = 0; f < fluteCount; f++) {
    const normF = (f - (fluteCount - 1) / 2) / ((fluteCount - 1) / 2);
    const fluteX = width / 2 + normF * (width * 0.22);
    const fluteGrad = ctxC.createLinearGradient(fluteX, height, fluteX, height * 0.32);
    fluteGrad.addColorStop(0.0, baseMid);
    fluteGrad.addColorStop(0.35, baseBright);
    fluteGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');

    ctxC.beginPath();
    ctxC.moveTo(fluteX - width * 0.035, height);
    ctxC.quadraticCurveTo(
      fluteX + normF * 15,
      height * 0.6,
      fluteX,
      height * 0.32
    );
    ctxC.quadraticCurveTo(
      fluteX - normF * 15,
      height * 0.6,
      fluteX + width * 0.035,
      height
    );
    ctxC.closePath();
    ctxC.fillStyle = fluteGrad;
    ctxC.fill();
  }

  // Fondo para mapa de emisión (negro)
  ctxE.fillStyle = '#000000';
  ctxE.fillRect(0, 0, width, height);

  // Base bioluminiscente en el mapa de emisión
  const baseEmissGrad = ctxE.createLinearGradient(0, height, 0, height * 0.40);
  baseEmissGrad.addColorStop(0.0, baseMid);
  baseEmissGrad.addColorStop(0.4, baseBright);
  baseEmissGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctxE.fillStyle = baseEmissGrad;
  ctxE.fillRect(width * 0.2, height * 0.4, width * 0.6, height * 0.6);

  // Fondo para mapa de relieve / altura (gris medio 128)
  ctxH.fillStyle = '#808080';
  ctxH.fillRect(0, 0, width, height);

  // Fondo para mapa de rugosidad (satén orgánico ~0.38)
  ctxR.fillStyle = '#606060';
  ctxR.fillRect(0, 0, width, height);

  // ----------------------------------------------------
  // B. RED DE NERVADURAS BRILLANTES (EMISIÓN + RELIEVE)
  // "Textura de la superficie (venas y microdetalles)"
  // ----------------------------------------------------

  const centerX = width / 2;
  const startY = height * 0.98;

  // Función para trazar venas luminosas con halo
  function drawVeinSegment(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    thickness: number,
    glowWidth: number,
    intensity: number
  ) {
    // 1. Color base
    ctxC.strokeStyle = `rgba(255, 255, 255, ${intensity * 0.85})`;
    ctxC.lineWidth = Math.max(1, thickness);
    ctxC.beginPath();
    ctxC.moveTo(x1, y1);
    ctxC.lineTo(x2, y2);
    ctxC.stroke();

    // 2. Emisión (halo bioluminiscente según optVeinColor + núcleo blanco)
    ctxE.shadowColor = veinStyle;
    ctxE.shadowBlur = glowWidth * 1.6;
    ctxE.strokeStyle = veinStyle;
    ctxE.lineWidth = Math.max(1.5, thickness * 1.5);
    ctxE.beginPath();
    ctxE.moveTo(x1, y1);
    ctxE.lineTo(x2, y2);
    ctxE.stroke();

    // Núcleo hiperbrillante blanco/oro
    ctxE.shadowBlur = 0;
    ctxE.strokeStyle = `rgba(255, 255, 255, ${intensity * 0.95})`;
    ctxE.lineWidth = Math.max(0.75, thickness * 0.6);
    ctxE.beginPath();
    ctxE.moveTo(x1, y1);
    ctxE.lineTo(x2, y2);
    ctxE.stroke();

    // 3. Relieve (altura)
    ctxH.strokeStyle = `rgba(255, 255, 255, ${intensity * 0.55})`;
    ctxH.lineWidth = Math.max(1.5, thickness * 1.8);
    ctxH.beginPath();
    ctxH.moveTo(x1, y1);
    ctxH.lineTo(x2, y2);
    ctxH.stroke();

    // 4. Rugosidad (venas pulidas y vítreas, valor bajo)
    ctxR.strokeStyle = `rgba(35, 35, 35, ${intensity})`;
    ctxR.lineWidth = Math.max(1, thickness * 1.5);
    ctxR.beginPath();
    ctxR.moveTo(x1, y1);
    ctxR.lineTo(x2, y2);
    ctxR.stroke();
  }

  // Trazado del tronco principal
  const spineSegments = 30;
  let currX = centerX;
  let currY = startY;

  for (let s = 0; s < spineSegments; s++) {
    const t = s / spineSegments;
    const nextY = startY - t * (height * 0.88);
    const wander = Math.sin(t * Math.PI * 4) * 8 - (t > 0.7 ? (t - 0.7) * 45 : 0);
    const nextX = centerX + wander;

    const thick = (1 - t * 0.65) * 5.5;
    const glow = (1 - t * 0.3) * 12;
    drawVeinSegment(currX, currY, nextX, nextY, thick, glow, 1.0);

    // Bifurcaciones primarias simétricas-onduladas
    if (s % 2 === 0 && s > 1 && s < spineSegments - 3) {
      for (const dir of [-1, 1]) {
        const sideT = t;
        const maxReach = width * (0.34 + Math.sin(sideT * Math.PI) * 0.12);
        const steps = 14;
        let bX = currX;
        let bY = currY;

        for (let b = 0; b < steps; b++) {
          const bt = b / steps;
          const outAngle = (Math.PI * 0.38) * dir;
          const upwardLift = -0.55 - (1 - bt) * 0.25;
          const segLen = (maxReach / steps) * (1 - bt * 0.4);

          const stepX = bX + Math.sin(outAngle) * segLen + Math.sin(b + s) * 2.5;
          const stepY = bY + upwardLift * segLen + Math.cos(b * 1.8) * 2;

          const branchThick = thick * 0.6 * (1 - bt * 0.7);
          const branchGlow = glow * 0.7 * (1 - bt * 0.5);

          drawVeinSegment(bX, bY, stepX, stepY, branchThick, branchGlow, 0.9 - bt * 0.35);

          // Ramificaciones capilares terciarias (red microdendrítica)
          if (b % 3 === 0 && bt < 0.75) {
            const capAngle = outAngle + (b % 2 === 0 ? 0.45 : -0.4) * dir;
            const capLen = segLen * 0.85;
            const capX = stepX + Math.sin(capAngle) * capLen;
            const capY = stepY - Math.abs(Math.cos(capAngle)) * capLen;
            drawVeinSegment(
              stepX,
              stepY,
              capX,
              capY,
              branchThick * 0.45,
              branchGlow * 0.45,
              0.65
            );
          }

          bX = stepX;
          bY = stepY;
        }
      }
    }

    currX = nextX;
    currY = nextY;
  }

  // ----------------------------------------------------
  // C. PUNTOS BIOLUMINISCENTES / POLVO ESTELAR ("stardust")
  // Según ficha: "Emisión (nervaduras y puntos)", "Base del pétalo"
  // ----------------------------------------------------
  const particleCount = 220;
  for (let p = 0; p < particleCount; p++) {
    // Concentrados en la mitad inferior (base y centro magenta)
    const pU = (Math.random() - 0.5) * 0.5;
    const pV = 0.35 + Math.pow(Math.random(), 1.7) * 0.62;
    const pX = centerX + pU * width * (1.1 - pV * 0.5);
    const pY = height * pV;
    const radius = 1.2 + Math.random() * 2.4;

    // Emisión en dorado incandescente y rosa brillante
    const isPink = Math.random() > 0.45;
    const moteColor = isPink ? '#f472b6' : '#fde047';

    ctxE.shadowColor = moteColor;
    ctxE.shadowBlur = radius * 3.5;
    ctxE.fillStyle = '#ffffff';
    ctxE.beginPath();
    ctxE.arc(pX, pY, radius, 0, Math.PI * 2);
    ctxE.fill();

    // En el color base
    ctxC.fillStyle = moteColor;
    ctxC.beginPath();
    ctxC.arc(pX, pY, radius * 0.8, 0, Math.PI * 2);
    ctxC.fill();
  }

  // ----------------------------------------------------
  // D. MAPA DE NORMALES A PARTIR DE LA ALTURA
  // Transforma el heightCanvas en un normal map estándar de espacio tangente (RGB)
  // ----------------------------------------------------
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = width;
  normalCanvas.height = height;
  const ctxN = normalCanvas.getContext('2d')!;

  const imgDataH = ctxH.getImageData(0, 0, width, height);
  const dataH = imgDataH.data;
  const normalImg = ctxN.createImageData(width, height);
  const dataN = normalImg.data;

  const bumpStrength = 2.4;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const xLeft = x > 0 ? (y * width + (x - 1)) * 4 : idx;
      const xRight = x < width - 1 ? (y * width + (x + 1)) * 4 : idx;
      const yUp = y > 0 ? ((y - 1) * width + x) * 4 : idx;
      const yDown = y < height - 1 ? ((y + 1) * width + x) * 4 : idx;

      const dX = (dataH[xRight] - dataH[xLeft]) / 255.0;
      const dY = (dataH[yDown] - dataH[yUp]) / 255.0;

      const nx = -dX * bumpStrength;
      const ny = -dY * bumpStrength;
      const nz = 1.0;

      // Normalizar vector [nx, ny, nz]
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      const r = Math.floor(((nx / len) * 0.5 + 0.5) * 255);
      const g = Math.floor(((ny / len) * 0.5 + 0.5) * 255);
      const b = Math.floor(((nz / len) * 0.5 + 0.5) * 255);

      dataN[idx] = r;
      dataN[idx + 1] = g;
      dataN[idx + 2] = b;
      dataN[idx + 3] = 255;
    }
  }
  ctxN.putImageData(normalImg, 0, 0);

  // ----------------------------------------------------
  // E. TEXTURA POSTERIOR (Envés / Vista Posterior)
  // Con quilla dorsal y brillo cálido transmitido
  // ----------------------------------------------------
  const backGrad = ctxB.createLinearGradient(0, height, 0, 0);
  backGrad.addColorStop(0.0, baseDeep); // base posterior
  backGrad.addColorStop(0.2, baseMid); // magenta/base tenue
  backGrad.addColorStop(0.5, cMid.clone().multiplyScalar(0.7).getStyle()); // cuerpo posterior
  backGrad.addColorStop(0.85, cMid.getStyle()); // oro/cuerpo
  backGrad.addColorStop(1.0, tipStyle); // punta
  ctxB.fillStyle = backGrad;
  ctxB.fillRect(0, 0, width, height);

  // Quilla dorsal central clara (nervadura prominente visible en vista posterior)
  const keelGrad = ctxB.createLinearGradient(centerX - 15, 0, centerX + 15, 0);
  keelGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  keelGrad.addColorStop(0.5, veinStyle);
  keelGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctxB.fillStyle = keelGrad;
  ctxB.fillRect(centerX - 18, height * 0.08, 36, height * 0.88);

  // Crear CanvasTextures con configuración de renderizado nítido
  const colorMap = new THREE.CanvasTexture(colorCanvas);
  colorMap.wrapS = THREE.ClampToEdgeWrapping;
  colorMap.wrapT = THREE.ClampToEdgeWrapping;
  colorMap.colorSpace = THREE.SRGBColorSpace;

  const normalMap = new THREE.CanvasTexture(normalCanvas);
  normalMap.wrapS = THREE.ClampToEdgeWrapping;
  normalMap.wrapT = THREE.ClampToEdgeWrapping;

  const emissiveMap = new THREE.CanvasTexture(emissiveCanvas);
  emissiveMap.wrapS = THREE.ClampToEdgeWrapping;
  emissiveMap.wrapT = THREE.ClampToEdgeWrapping;
  emissiveMap.colorSpace = THREE.SRGBColorSpace;

  const roughnessMap = new THREE.CanvasTexture(roughnessCanvas);
  roughnessMap.wrapS = THREE.ClampToEdgeWrapping;
  roughnessMap.wrapT = THREE.ClampToEdgeWrapping;

  const backColorMap = new THREE.CanvasTexture(backCanvas);
  backColorMap.wrapS = THREE.ClampToEdgeWrapping;
  backColorMap.wrapT = THREE.ClampToEdgeWrapping;
  backColorMap.colorSpace = THREE.SRGBColorSpace;

  return {
    colorMap,
    normalMap,
    emissiveMap,
    roughnessMap,
    backColorMap,
  };
}
