import { useState, useMemo } from 'react';
import {
  Flower2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Copy,
  Check,
  Code2,
  X,
  Palette,
  Compass,
  Sliders,
  Maximize2,
} from 'lucide-react';
import { PetalConfig, PETAL_CONFIG } from '../config/petalConfig';
import {
  FlowerConfig,
  FLOWER_CONFIG,
  IndividualPetalOverride,
} from '../config/flowerConfig';
import { CameraViewPreset } from '../scene/Scene';

interface FlowerPetalEditorPanelProps {
  petalConfig: PetalConfig;
  onPetalConfigChange: (newConfig: PetalConfig) => void;
  flowerConfig: FlowerConfig;
  onFlowerConfigChange: (newConfig: FlowerConfig) => void;
  individualOverrides: Record<number, IndividualPetalOverride>;
  onIndividualOverridesChange: (
    overrides: Record<number, IndividualPetalOverride>
  ) => void;
  selectedPetalIndex: number | null;
  onSelectPetalIndex: (index: number | null) => void;
  cameraPreset: CameraViewPreset;
  onCameraChange: (preset: CameraViewPreset) => void;
  onClose?: () => void;
}

export function FlowerPetalEditorPanel({
  petalConfig,
  onPetalConfigChange,
  flowerConfig,
  onFlowerConfigChange,
  individualOverrides,
  onIndividualOverridesChange,
  selectedPetalIndex,
  onSelectPetalIndex,
  cameraPreset,
  onCameraChange,
  onClose,
}: FlowerPetalEditorPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'transform' | 'colors' | 'shape' | 'presets'>('transform');

  // Helper para modificar configuración global de pétalos
  const updateGlobalParam = <K extends keyof PetalConfig>(
    key: K,
    value: PetalConfig[K]
  ) => {
    onPetalConfigChange({
      ...petalConfig,
      [key]: value,
    });
  };

  // Helper para modificar configuración de la flor
  const updateFlowerParam = <K extends keyof FlowerConfig>(
    key: K,
    value: FlowerConfig[K]
  ) => {
    onFlowerConfigChange({
      ...flowerConfig,
      [key]: value,
    });
  };

  // Helper para modificar el override de un pétalo específico
  const updatePetalOverride = (
    petalIdx: number,
    patch: Partial<IndividualPetalOverride>
  ) => {
    const current = individualOverrides[petalIdx] || {};
    const updated = {
      ...current,
      ...patch,
    };
    onIndividualOverridesChange({
      ...individualOverrides,
      [petalIdx]: updated,
    });
  };

  // Reset de un pétalo individual
  const resetIndividualPetal = (petalIdx: number) => {
    const next = { ...individualOverrides };
    delete next[petalIdx];
    onIndividualOverridesChange(next);
  };

  // Reset total
  const handleResetAll = () => {
    onPetalConfigChange({ ...PETAL_CONFIG });
    onFlowerConfigChange({ ...FLOWER_CONFIG });
    onIndividualOverridesChange({});
  };

  const activeOverride =
    selectedPetalIndex !== null ? individualOverrides[selectedPetalIndex] || {} : null;

  const fullExportJson = useMemo(() => {
    return JSON.stringify(
      {
        globalPetalConfig: {
          length: Number(petalConfig.length.toFixed(2)),
          width: Number(petalConfig.width.toFixed(2)),
          baseWidthRatio: Number((petalConfig.baseWidthRatio ?? 0.22).toFixed(2)),
          curvatureS: Number(petalConfig.curvatureS.toFixed(2)),
          outerDescentMult: Number((petalConfig.outerDescentMult ?? 1.35).toFixed(2)),
          cupTransverse: Number(petalConfig.cupTransverse.toFixed(2)),
          tipRollTurns: Number((petalConfig.tipRollTurns ?? 0.85).toFixed(2)),
          tipRollStart: Number((petalConfig.tipRollStart ?? 0.77).toFixed(2)),
          tipRollDirection: petalConfig.tipRollDirection ?? -1,
          tipRollTwist: Number((petalConfig.tipRollTwist ?? 0.03).toFixed(2)),
          tipHookIntensity: Number((petalConfig.tipHookIntensity ?? 0.1).toFixed(2)),
          tipHookAngle: Number((petalConfig.tipHookAngle ?? 0.88).toFixed(2)),
          edgeRuffles: Number((petalConfig.edgeRuffles ?? 0.028).toFixed(3)),
          veinRelief: Number((petalConfig.veinRelief ?? 0.022).toFixed(3)),
          thicknessBase: Number((petalConfig.thicknessBase ?? 0.052).toFixed(3)),
          thicknessEdge: Number((petalConfig.thicknessEdge ?? 0.014).toFixed(3)),
          baseColor: petalConfig.baseColor,
          midColor: petalConfig.midColor,
          tipColor: petalConfig.tipColor,
          veinGlowColor: petalConfig.veinGlowColor,
          emissiveIntensity: Number((petalConfig.emissiveIntensity ?? 0.8).toFixed(2)),
          roughness: Number((petalConfig.roughness ?? 0.34).toFixed(2)),
          transmission: Number((petalConfig.transmission ?? 0.18).toFixed(2)),
          clearcoat: Number((petalConfig.clearcoat ?? 0.3).toFixed(2)),
          tiltAngle: Number((petalConfig.tiltAngle ?? -1.08).toFixed(2)),
          azimuthAngle: Number((petalConfig.azimuthAngle ?? 0.22).toFixed(2)),
          rollAngle: Number((petalConfig.rollAngle ?? -0.14).toFixed(2)),
        },
        flowerConfig: {
          centerRadius: Number(flowerConfig.centerRadius.toFixed(3)),
          baseScale: Number(flowerConfig.baseScale.toFixed(2)),
          openTilt: Number(flowerConfig.openTilt.toFixed(2)),
        },
        individualOverrides,
      },
      null,
      2
    );
  }, [petalConfig, flowerConfig, individualOverrides]);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(fullExportJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="flower-petal-editor-panel"
      className="fixed top-20 right-4 z-40 w-96 max-h-[calc(100vh-6rem)] flex flex-col bg-slate-900/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl shadow-2xl shadow-black/80 text-slate-200 overflow-hidden transition-all duration-300"
    >
      {/* 1. Barra de Título y Controles de Ventana */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-500/20 via-fuchsia-500/10 to-transparent border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Flower2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-1.5">
              <span>Editor de Pétalos</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Flor 360°
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              {selectedPetalIndex === null
                ? 'Modo: Todos los pétalos (Global)'
                : `Modo: Pétalo ${selectedPetalIndex + 1} (${selectedPetalIndex * 60}°)`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title={collapsed ? 'Desplegar' : 'Minimizar'}
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition-colors"
              title="Cerrar panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <>
          {/* 2. Selector de Pétalos: Todos vs Pétalo 1..6 */}
          <div className="p-3 bg-slate-950/60 border-b border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-medium flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Pétalo a Editar:</span>
              </span>
              {selectedPetalIndex !== null && (
                <button
                  onClick={() => resetIndividualPetal(selectedPetalIndex)}
                  className="text-[10px] text-amber-400/80 hover:text-amber-300 underline"
                  title="Restablecer este pétalo a los valores globales"
                >
                  Restablecer este pétalo
                </button>
              )}
            </div>

            <div className="grid grid-cols-7 gap-1">
              <button
                onClick={() => onSelectPetalIndex(null)}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-semibold border transition-all text-center ${
                  selectedPetalIndex === null
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
                title="Editar los 6 pétalos de forma simultánea"
              >
                🌸 Todos
              </button>

              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const hasOverride = !!individualOverrides[idx];
                const isSelected = selectedPetalIndex === idx;

                return (
                  <button
                    key={`petal-select-${idx}`}
                    onClick={() => onSelectPetalIndex(idx)}
                    className={`py-1.5 px-0.5 rounded-lg text-[10px] font-semibold border transition-all text-center relative ${
                      isSelected
                        ? 'bg-fuchsia-600 text-white border-fuchsia-300 shadow-md shadow-fuchsia-500/20'
                        : hasOverride
                        ? 'bg-amber-500/15 text-amber-200 border-amber-400/40 hover:bg-amber-500/25'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-200'
                    }`}
                    title={`Pétalo ${idx + 1} (${idx * 60}°)${hasOverride ? ' [Personalizado]' : ''}`}
                  >
                    P{idx + 1}
                    {hasOverride && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 border border-slate-900" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Presets de Cámaras para inspeccionar la flor completa */}
            <div className="pt-1 flex items-center justify-between gap-1">
              <span className="text-[10px] text-slate-400 whitespace-nowrap">Vistas 360°:</span>
              <div className="grid grid-cols-5 gap-1 flex-1">
                {[
                  { id: 'top', label: '⬇️ Cenital', title: 'Vista cenital desde arriba para ver huecos y corona circular' },
                  { id: 'front', label: '🖼️ Frente', title: 'Vista frontal de la flor' },
                  { id: 'side', label: '📐 Perfil', title: 'Vista de perfil de caída de pétalos' },
                  { id: 'base', label: '🌱 Centro', title: 'Vista cercana al centro y estambres' },
                  { id: 'perspective', label: '💎 3/4', title: 'Vista en perspectiva' },
                ].map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => onCameraChange(cam.id as CameraViewPreset)}
                    className={`py-1 px-1 rounded text-[9.5px] font-medium text-center border transition-all truncate ${
                      cameraPreset === cam.id
                        ? 'bg-amber-500/30 text-amber-200 border-amber-400/50'
                        : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-slate-200'
                    }`}
                    title={cam.title}
                  >
                    {cam.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Pestañas de Edición */}
          <div className="flex border-b border-white/10 bg-slate-950/40 text-[11px] font-medium">
            <button
              onClick={() => setActiveTab('transform')}
              className={`flex-1 py-2 px-2 text-center transition-colors border-b-2 flex items-center justify-center gap-1 ${
                activeTab === 'transform'
                  ? 'border-amber-400 text-amber-300 font-semibold bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Giro 360°</span>
            </button>
            <button
              onClick={() => setActiveTab('colors')}
              className={`flex-1 py-2 px-2 text-center transition-colors border-b-2 flex items-center justify-center gap-1 ${
                activeTab === 'colors'
                  ? 'border-amber-400 text-amber-300 font-semibold bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Colores</span>
            </button>
            <button
              onClick={() => setActiveTab('shape')}
              className={`flex-1 py-2 px-2 text-center transition-colors border-b-2 flex items-center justify-center gap-1 ${
                activeTab === 'shape'
                  ? 'border-amber-400 text-amber-300 font-semibold bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Forma</span>
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-2 px-2 text-center transition-colors border-b-2 flex items-center justify-center gap-1 ${
                activeTab === 'presets'
                  ? 'border-amber-400 text-amber-300 font-semibold bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>

          {/* 4. Cuerpo de Parámetros con Scroll */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[50vh] text-xs">
            {/* ================= PESTAÑA: GIRO & POSICIÓN 360° ================= */}
            {activeTab === 'transform' && (
              <div className="space-y-4">
                {selectedPetalIndex === null ? (
                  /* MODIFICACIÓN GLOBAL PARA TODOS LOS PÉTALOS */
                  <>
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/25 space-y-1">
                      <div className="text-[11px] font-semibold text-amber-200">
                        Modificando: TODOS los pétalos juntos
                      </div>
                      <p className="text-[10px] text-slate-300">
                        Los deslizadores rotan y ajustan los 6 pétalos de forma sincronizada con precisión milimétrica.
                      </p>
                    </div>

                    {/* Giro Azimutal 360° Global */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-300 font-medium">Giro Azimutal 360° (Rotación Corona)</label>
                        <span className="font-mono text-amber-300 font-semibold">
                          {(((petalConfig.azimuthAngle ?? 0.22) * 180) / Math.PI).toFixed(1)}°
                          <span className="text-[10px] text-slate-400 ml-1">
                            ({(petalConfig.azimuthAngle ?? 0.22).toFixed(2)} rad)
                          </span>
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={Math.PI * 2}
                        step="0.01"
                        value={petalConfig.azimuthAngle ?? 0.22}
                        onChange={(e) => updateGlobalParam('azimuthAngle', parseFloat(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>0°</span>
                        <span>180°</span>
                        <span>360°</span>
                      </div>
                    </div>

                    {/* Inclinación / Caída Paraguas Global */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-300 font-medium">Inclinación / Caída Paraguas (Tilt)</label>
                        <span className="font-mono text-amber-300 font-semibold">
                          {(petalConfig.tiltAngle ?? -1.08).toFixed(2)} rad
                          <span className="text-[10px] text-slate-400 ml-1">
                            ({(((petalConfig.tiltAngle ?? -1.08) * 180) / Math.PI).toFixed(0)}°)
                          </span>
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-2.20"
                        max="-0.40"
                        step="0.01"
                        value={petalConfig.tiltAngle ?? -1.08}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          updateGlobalParam('tiltAngle', val);
                          updateFlowerParam('openTilt', val);
                        }}
                        className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Cerrado / Péndulo (-2.20)</span>
                        <span className="text-amber-300">Aprobado (-1.08)</span>
                        <span>Abierto plano (-0.40)</span>
                      </div>
                    </div>

                    {/* Balanceo Lateral Global (Roll) */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-300 font-medium">Balanceo Lateral (Roll)</label>
                        <span className="font-mono text-amber-300 font-semibold">
                          {(petalConfig.rollAngle ?? -0.14).toFixed(2)} rad
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-0.80"
                        max="0.80"
                        step="0.01"
                        value={petalConfig.rollAngle ?? -0.14}
                        onChange={(e) => updateGlobalParam('rollAngle', parseFloat(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Izquierda (-0.80)</span>
                        <span>Neutro (0)</span>
                        <span>Derecha (+0.80)</span>
                      </div>
                    </div>

                    {/* Radio Basal al Centro (centerRadius) */}
                    <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-950/50 border border-white/5">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-200 font-medium">Radio al Centro (Apertura central)</label>
                        <span className="font-mono text-amber-300 font-semibold">
                          {flowerConfig.centerRadius.toFixed(3)} u
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.015"
                        max="0.080"
                        step="0.001"
                        value={flowerConfig.centerRadius}
                        onChange={(e) => updateFlowerParam('centerRadius', parseFloat(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Cerrado sin huecos (0.015)</span>
                        <span className="text-amber-300 font-medium">Actual ({flowerConfig.centerRadius.toFixed(3)})</span>
                        <span>Separado (0.080)</span>
                      </div>
                    </div>

                    {/* Escala Base */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-300 font-medium">Escala General de la Flor</label>
                        <span className="font-mono text-amber-300 font-semibold">
                          {flowerConfig.baseScale.toFixed(2)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.75"
                        max="1.30"
                        step="0.01"
                        value={flowerConfig.baseScale}
                        onChange={(e) => updateFlowerParam('baseScale', parseFloat(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                    </div>
                  </>
                ) : (
                  /* MODIFICACIÓN INDIVIDUAL DEL PÉTALO SELECCIONADO */
                  <>
                    <div className="p-2.5 rounded-xl bg-fuchsia-500/10 border border-fuchsia-400/25 space-y-1">
                      <div className="text-[11px] font-semibold text-fuchsia-200 flex items-center justify-between">
                        <span>Editando individualmente: Pétalo {selectedPetalIndex + 1}</span>
                        <span className="text-[10px] bg-fuchsia-500/30 px-1.5 py-0.5 rounded text-fuchsia-200">
                          Base: {selectedPetalIndex * 60}°
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300">
                        Los cambios aquí se aplican exclusivamente a este pétalo. Para editar todos juntos, pulsa "🌸 Todos".
                      </p>
                    </div>

                    {/* Giro Azimutal Individual 360° */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-300 font-medium">Giro Azimut Individual 360°</label>
                        <span className="font-mono text-fuchsia-300 font-semibold">
                          {((((activeOverride?.azimuthOffset ?? 0) * 180) / Math.PI)).toFixed(1)}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min={-Math.PI}
                        max={Math.PI}
                        step="0.01"
                        value={activeOverride?.azimuthOffset ?? 0}
                        onChange={(e) =>
                          updatePetalOverride(selectedPetalIndex, {
                            azimuthOffset: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-fuchsia-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>-180°</span>
                        <span>0° (Alineado)</span>
                        <span>+180°</span>
                      </div>
                    </div>

                    {/* Inclinación / Caída Individual (Tilt Offset) */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-300 font-medium">Inclinación Individual (Tilt)</label>
                        <span className="font-mono text-fuchsia-300 font-semibold">
                          {(activeOverride?.tiltOffset ?? 0) > 0 ? '+' : ''}
                          {(activeOverride?.tiltOffset ?? 0).toFixed(2)} rad
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-0.60"
                        max="0.60"
                        step="0.01"
                        value={activeOverride?.tiltOffset ?? 0}
                        onChange={(e) =>
                          updatePetalOverride(selectedPetalIndex, {
                            tiltOffset: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-fuchsia-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Más colgante (-0.60)</span>
                        <span>0.00</span>
                        <span>Más erguido (+0.60)</span>
                      </div>
                    </div>

                    {/* Balanceo Lateral Individual (Roll Offset) */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-300 font-medium">Balanceo Lateral (Roll)</label>
                        <span className="font-mono text-fuchsia-300 font-semibold">
                          {(activeOverride?.rollOffset ?? 0) > 0 ? '+' : ''}
                          {(activeOverride?.rollOffset ?? 0).toFixed(2)} rad
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-0.50"
                        max="0.50"
                        step="0.01"
                        value={activeOverride?.rollOffset ?? 0}
                        onChange={(e) =>
                          updatePetalOverride(selectedPetalIndex, {
                            rollOffset: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-fuchsia-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                    </div>

                    {/* Distancia Individual al Centro (Radius Offset) */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-300 font-medium">Distancia al Centro (Radio)</label>
                        <span className="font-mono text-fuchsia-300 font-semibold">
                          {(activeOverride?.radiusOffset ?? 0) > 0 ? '+' : ''}
                          {(activeOverride?.radiusOffset ?? 0).toFixed(3)} u
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-0.025"
                        max="0.040"
                        step="0.001"
                        value={activeOverride?.radiusOffset ?? 0}
                        onChange={(e) =>
                          updatePetalOverride(selectedPetalIndex, {
                            radiusOffset: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-fuchsia-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Hacia adentro (-0.025)</span>
                        <span>Estándar (0.000)</span>
                        <span>Hacia afuera (+0.040)</span>
                      </div>
                    </div>

                    {/* Elevación Vertical Individual */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-300 font-medium">Elevación Vertical (Altura)</label>
                        <span className="font-mono text-fuchsia-300 font-semibold">
                          {(activeOverride?.elevationOffset ?? 0) > 0 ? '+' : ''}
                          {(activeOverride?.elevationOffset ?? 0).toFixed(3)} u
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-0.050"
                        max="0.050"
                        step="0.001"
                        value={activeOverride?.elevationOffset ?? 0}
                        onChange={(e) =>
                          updatePetalOverride(selectedPetalIndex, {
                            elevationOffset: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-fuchsia-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                    </div>

                    {/* Escala Individual de este pétalo */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-300 font-medium">Escala de este pétalo</label>
                        <span className="font-mono text-fuchsia-300 font-semibold">
                          {(activeOverride?.scaleMultiplier ?? 1.0).toFixed(2)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.80"
                        max="1.20"
                        step="0.01"
                        value={activeOverride?.scaleMultiplier ?? 1.0}
                        onChange={(e) =>
                          updatePetalOverride(selectedPetalIndex, {
                            scaleMultiplier: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-fuchsia-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ================= PESTAÑA: COLORES & LUZ ================= */}
            {activeTab === 'colors' && (
              <div className="space-y-4">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/25 space-y-1">
                  <div className="text-[11px] font-semibold text-amber-200">
                    Paleta PBR Bioluminiscente
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Gradiente longitudinal cálido calibrado de alta definición y resplandor nocturno.
                  </p>
                </div>

                {/* Color Base */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-white/5">
                  <div>
                    <label className="text-slate-300 font-medium block">Color Base (Cáliz)</label>
                    <span className="font-mono text-[10px] text-slate-400">{petalConfig.baseColor}</span>
                  </div>
                  <input
                    type="color"
                    value={petalConfig.baseColor}
                    onChange={(e) => updateGlobalParam('baseColor', e.target.value)}
                    className="w-9 h-9 rounded cursor-pointer border border-white/20 bg-transparent"
                  />
                </div>

                {/* Color Medio */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-white/5">
                  <div>
                    <label className="text-slate-300 font-medium block">Color Medio (Cuerpo)</label>
                    <span className="font-mono text-[10px] text-slate-400">{petalConfig.midColor}</span>
                  </div>
                  <input
                    type="color"
                    value={petalConfig.midColor}
                    onChange={(e) => updateGlobalParam('midColor', e.target.value)}
                    className="w-9 h-9 rounded cursor-pointer border border-white/20 bg-transparent"
                  />
                </div>

                {/* Color Punta */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-white/5">
                  <div>
                    <label className="text-slate-300 font-medium block">Color Punta (Ápice)</label>
                    <span className="font-mono text-[10px] text-slate-400">{petalConfig.tipColor}</span>
                  </div>
                  <input
                    type="color"
                    value={petalConfig.tipColor}
                    onChange={(e) => updateGlobalParam('tipColor', e.target.value)}
                    className="w-9 h-9 rounded cursor-pointer border border-white/20 bg-transparent"
                  />
                </div>

                {/* Color Nervaduras */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-white/5">
                  <div>
                    <label className="text-slate-300 font-medium block">Color Nervaduras (Brillo)</label>
                    <span className="font-mono text-[10px] text-slate-400">{petalConfig.veinGlowColor}</span>
                  </div>
                  <input
                    type="color"
                    value={petalConfig.veinGlowColor}
                    onChange={(e) => updateGlobalParam('veinGlowColor', e.target.value)}
                    className="w-9 h-9 rounded cursor-pointer border border-white/20 bg-transparent"
                  />
                </div>

                {/* Intensidad Emisiva */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-300 font-medium">Intensidad Bioluminiscente</label>
                    <span className="font-mono text-amber-300 font-semibold">
                      {(petalConfig.emissiveIntensity ?? 0.8).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.10"
                    max="2.00"
                    step="0.05"
                    value={petalConfig.emissiveIntensity ?? 0.8}
                    onChange={(e) => updateGlobalParam('emissiveIntensity', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Transmisión / Subsuperficie */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-300 font-medium">Translucidez Orgánica (Transmisión)</label>
                    <span className="font-mono text-amber-300 font-semibold">
                      {(petalConfig.transmission ?? 0.18).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.00"
                    max="0.60"
                    step="0.02"
                    value={petalConfig.transmission ?? 0.18}
                    onChange={(e) => updateGlobalParam('transmission', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Rugosidad PBR */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-300 font-medium">Rugosidad Superficial</label>
                    <span className="font-mono text-amber-300 font-semibold">
                      {(petalConfig.roughness ?? 0.34).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.10"
                    max="0.80"
                    step="0.02"
                    value={petalConfig.roughness ?? 0.34}
                    onChange={(e) => updateGlobalParam('roughness', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* ================= PESTAÑA: FORMA & BASE ================= */}
            {activeTab === 'shape' && (
              <div className="space-y-4">
                {/* Anchura Basal (Relleno corona central) */}
                <div className="space-y-1.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/25">
                  <div className="flex justify-between items-center">
                    <label className="text-amber-200 font-medium">Anchura de la Base (Relleno)</label>
                    <span className="font-mono text-amber-300 font-semibold">
                      {(petalConfig.baseWidthRatio ?? 0.22).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.10"
                    max="0.38"
                    step="0.01"
                    value={petalConfig.baseWidthRatio ?? 0.22}
                    onChange={(e) => updateGlobalParam('baseWidthRatio', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Estrecho (0.10)</span>
                    <span className="text-amber-300 font-medium">Recomendado (0.22)</span>
                    <span>Abundante (0.38)</span>
                  </div>
                </div>

                {/* Longitud */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-300 font-medium">Longitud del Pétalo</label>
                    <span className="font-mono text-amber-300 font-semibold">
                      {petalConfig.length.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.00"
                    max="2.40"
                    step="0.02"
                    value={petalConfig.length}
                    onChange={(e) => updateGlobalParam('length', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Anchura Máxima */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-300 font-medium">Anchura Máxima</label>
                    <span className="font-mono text-amber-300 font-semibold">
                      {petalConfig.width.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.40"
                    max="1.10"
                    step="0.02"
                    value={petalConfig.width}
                    onChange={(e) => updateGlobalParam('width', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Curvatura Cúpula ('∩') */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-300 font-medium">Curvatura Cúpula (Arco ∩)</label>
                    <span className="font-mono text-amber-300 font-semibold">
                      {petalConfig.curvatureS.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.20"
                    max="1.00"
                    step="0.02"
                    value={petalConfig.curvatureS}
                    onChange={(e) => updateGlobalParam('curvatureS', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Caída Exterior */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-300 font-medium">Caída Exterior (Arco descendente)</label>
                    <span className="font-mono text-amber-300 font-semibold">
                      {(petalConfig.outerDescentMult ?? 1.35).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.80"
                    max="2.00"
                    step="0.05"
                    value={petalConfig.outerDescentMult ?? 1.35}
                    onChange={(e) => updateGlobalParam('outerDescentMult', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Vueltas de la Espiral Apical */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-300 font-medium">Vueltas Espiral Apical</label>
                    <span className="font-mono text-amber-300 font-semibold">
                      {(petalConfig.tipRollTurns ?? 0.85).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.20"
                    max="1.80"
                    step="0.05"
                    value={petalConfig.tipRollTurns ?? 0.85}
                    onChange={(e) => updateGlobalParam('tipRollTurns', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* ================= PESTAÑA: PRESETS & JSON ================= */}
            {activeTab === 'presets' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 space-y-2">
                  <h4 className="text-xs font-semibold text-white flex items-center justify-between">
                    <span>Exportar / Copiar Configuración</span>
                    {copied && <span className="text-[10px] text-green-400 font-normal">¡Copiado!</span>}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Copia el objeto JSON completo con las orientaciones 360°, colores PBR y ajustes individuales.
                  </p>
                  <button
                    onClick={handleCopyJson}
                    className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar JSON al Portapapeles</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 space-y-2">
                  <h4 className="text-xs font-semibold text-red-200">Restablecer Todo</h4>
                  <p className="text-[11px] text-slate-400">
                    Restaura los valores por defecto tanto en la flor global como en los 6 pétalos individuales.
                  </p>
                  <button
                    onClick={handleResetAll}
                    className="w-full py-2 px-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restablecer Toda la Flor</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default FlowerPetalEditorPanel;
