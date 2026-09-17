import { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Grid,
  ChevronDown,
  ChevronUp,
  Camera,
  Wind,
  Code2,
  X,
  Palette,
  Layers,
  Sparkle,
  Compass,
  RotateCw,
  Umbrella,
  Flower2,
} from 'lucide-react';
import { PetalConfig, PETAL_CONFIG } from '../config/petalConfig';
import { CameraViewPreset } from '../scene/Scene';

interface PetalEditorPanelProps {
  config: PetalConfig;
  onChange: (newConfig: PetalConfig) => void;
  cameraPreset: CameraViewPreset;
  onCameraChange: (preset: CameraViewPreset) => void;
  wireframe: boolean;
  onWireframeChange: (wireframe: boolean) => void;
  showSparkles: boolean;
  onSparklesChange: (show: boolean) => void;
  showStemContext: boolean;
  onStemContextChange: (show: boolean) => void;
  onClose?: () => void;
}

export function PetalEditorPanel({
  config,
  onChange,
  cameraPreset,
  onCameraChange,
  wireframe,
  onWireframeChange,
  showSparkles,
  onSparklesChange,
  showStemContext,
  onStemContextChange,
  onClose,
}: PetalEditorPanelProps) {
  const [copied, setCopied] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'roll' | 'shape' | 'tilt' | 'colors' | 'relief' | 'presets'>('tilt');

  const updateParam = <K extends keyof PetalConfig>(key: K, value: PetalConfig[K]) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  const handleReset = () => {
    onChange({ ...PETAL_CONFIG });
  };

  const configJsonString = useMemo(() => {
    return JSON.stringify(
      {
        length: Number(config.length.toFixed(2)),
        width: Number(config.width.toFixed(2)),
        baseWidthRatio: Number((config.baseWidthRatio ?? 0.22).toFixed(2)),
        curvatureS: Number(config.curvatureS.toFixed(2)),
        outerDescentMult: Number((config.outerDescentMult ?? 1.2).toFixed(2)),
        cupTransverse: Number(config.cupTransverse.toFixed(2)),
        tipRollTurns: Number((config.tipRollTurns ?? 0.65).toFixed(2)),
        tipRollStart: Number((config.tipRollStart ?? 0.78).toFixed(2)),
        tipRollDirection: config.tipRollDirection ?? -1,
        tipRollTwist: Number((config.tipRollTwist ?? -0.04).toFixed(2)),
        tipHookIntensity: Number(config.tipHookIntensity.toFixed(2)),
        tipHookAngle: Number(config.tipHookAngle.toFixed(2)),
        edgeRuffles: Number(config.edgeRuffles.toFixed(3)),
        veinRelief: Number(config.veinRelief.toFixed(3)),
        thicknessBase: Number(config.thicknessBase.toFixed(3)),
        thicknessEdge: Number(config.thicknessEdge.toFixed(3)),
        baseColor: config.baseColor ?? '#a21caf',
        midColor: config.midColor ?? '#facc15',
        tipColor: config.tipColor ?? '#f97316',
        veinGlowColor: config.veinGlowColor ?? '#fbbf24',
        emissiveIntensity: Number((config.emissiveIntensity ?? 0.9).toFixed(2)),
        roughness: Number((config.roughness ?? 0.34).toFixed(2)),
        transmission: Number((config.transmission ?? 0.18).toFixed(2)),
        clearcoat: Number((config.clearcoat ?? 0.3).toFixed(2)),
        tiltAngle: Number((config.tiltAngle ?? 2.35).toFixed(2)),
        azimuthAngle: Number((config.azimuthAngle ?? 0).toFixed(2)),
        rollAngle: Number((config.rollAngle ?? 0).toFixed(2)),
      },
      null,
      2
    );
  }, [config]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(configJsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const applyPreset = (preset: {
    tipRollTurns: number;
    tipRollDirection: number;
    tipRollStart: number;
    tipRollTwist: number;
    outerDescentMult?: number;
    curvatureS?: number;
  }) => {
    onChange({
      ...config,
      ...preset,
    });
    // Auto-focus camera to tip to preview the curl
    onCameraChange('tip');
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-24px)] w-full max-w-[420px] rounded-2xl backdrop-blur-2xl bg-slate-950/85 border border-amber-500/25 shadow-[0_12px_45px_rgba(0,0,0,0.65)] text-slate-100 overflow-hidden font-sans transition-all">
      {/* 1. Header con Título, Botones de Exportar y Colapso */}
      <div className="p-3.5 border-b border-white/10 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-amber-100 flex items-center gap-1.5">
              Taller de Pétalo 3D
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                Aislado
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 leading-tight">
              Ajusta libremente la punta y la silueta
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title={collapsed ? 'Expandir panel' : 'Minimizar panel'}
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition-colors"
              title="Volver a la Flor Completa"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <>
          {/* 2. Barra Superior de Control de Cámara Rápido */}
          <div className="px-3.5 py-2.5 bg-slate-900/60 border-b border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                Cámaras de Inspección:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onStemContextChange(!showStemContext)}
                  className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors flex items-center gap-1 ${
                    showStemContext
                      ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400/50 shadow-sm'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}
                  title="Mostrar el tallo y la isla de tierra para ver la base y anclaje real"
                >
                  <Layers className="w-3 h-3 text-emerald-400" />
                  Tallo + Tierra
                </button>
                <button
                  onClick={() => onWireframeChange(!wireframe)}
                  className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors flex items-center gap-1 ${
                    wireframe
                      ? 'bg-amber-500/30 text-amber-200 border-amber-400/60'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}
                  title="Activar malla de alambre"
                >
                  <Grid className="w-3 h-3" />
                  Malla
                </button>
                <button
                  onClick={() => onSparklesChange(!showSparkles)}
                  className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors flex items-center gap-1 ${
                    showSparkles
                      ? 'bg-amber-500/30 text-amber-200 border-amber-400/60'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}
                  title="Partículas bioluminiscentes"
                >
                  <Sparkles className="w-3 h-3" />
                  Brillo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {[
                { id: 'tip', label: '🔍 Punta', title: 'Zoom a la punta/rizo' },
                { id: 'base', label: '🌱 Base', title: 'Enfoque al anclaje con el tallo' },
                { id: 'side', label: '📐 Perfil', title: 'Vista lateral' },
                { id: 'front', label: '🖼️ Frente', title: 'Vista frontal' },
                { id: 'back', label: '🔙 Envés', title: 'Vista posterior / dorso' },
                { id: 'top', label: '⬇️ Arriba', title: 'Vista cenital desde arriba' },
                { id: 'bottom', label: '⬆️ Abajo', title: 'Vista cenital desde abajo' },
              ].map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => onCameraChange(cam.id as CameraViewPreset)}
                  className={`py-1 px-1 rounded text-[9.5px] font-medium text-center border transition-all truncate ${
                    cameraPreset === cam.id
                      ? 'bg-amber-500/25 text-amber-200 border-amber-400/50 shadow-sm'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-slate-200'
                  }`}
                  title={cam.title}
                >
                  {cam.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Pestañas de Edición */}
          <div className="flex border-b border-white/10 bg-slate-950/40 text-[11px] font-medium overflow-x-auto">
            <button
              onClick={() => setActiveTab('tilt')}
              className={`flex-1 py-2 px-2 text-center whitespace-nowrap transition-colors border-b-2 ${
                activeTab === 'tilt'
                  ? 'border-amber-400 text-amber-300 font-semibold bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              ☂️ Giro / Paraguas
            </button>
            <button
              onClick={() => setActiveTab('roll')}
              className={`flex-1 py-2 px-2 text-center whitespace-nowrap transition-colors border-b-2 ${
                activeTab === 'roll'
                  ? 'border-amber-400 text-amber-300 font-semibold bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              🌀 Punta
            </button>
            <button
              onClick={() => setActiveTab('shape')}
              className={`flex-1 py-2 px-2 text-center whitespace-nowrap transition-colors border-b-2 ${
                activeTab === 'shape'
                  ? 'border-amber-400 text-amber-300 font-semibold bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              📏 Curva
            </button>
            <button
              onClick={() => setActiveTab('colors')}
              className={`flex-1 py-2 px-2 text-center whitespace-nowrap transition-colors border-b-2 ${
                activeTab === 'colors'
                  ? 'border-amber-400 text-amber-300 font-semibold bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              🎨 Color & Luz
            </button>
            <button
              onClick={() => setActiveTab('relief')}
              className={`flex-1 py-2 px-2 text-center whitespace-nowrap transition-colors border-b-2 ${
                activeTab === 'relief'
                  ? 'border-amber-400 text-amber-300 font-semibold bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              🍃 Relieve
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-2 px-2 text-center whitespace-nowrap transition-colors border-b-2 ${
                activeTab === 'presets'
                  ? 'border-amber-400 text-amber-300 font-semibold bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚡ Presets
            </button>
          </div>

          {/* 4. Cuerpo de Parámetros con Scroll */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* PESTAÑA: ROTACIÓN LIBRE Y CAÍDA EN PARAGUAS */}
            {activeTab === 'tilt' && (
              <div className="space-y-4">
                {/* Cabecera explicativa */}
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/25 text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-xs">
                    <Umbrella className="w-4 h-4 text-amber-400" />
                    <span>Orientación Libre & Paraguas Floral</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Gira y rota libremente todo el pétalo respecto a su anclaje en el tallo. Permite que los pétalos caigan hacia abajo en forma de paraguas floral (como en flores péndulas / campanillas) o se mantengan erguidos.
                  </p>
                </div>

                {/* Accesos Rápidos de Inclinación */}
                <div className="space-y-2">
                  <label className="text-slate-300 font-semibold flex items-center justify-between">
                    <span>Posiciones Rápidas de Inclinación</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateParam('tiltAngle', 2.35)}
                      className={`p-2.5 rounded-xl text-[11px] font-medium border text-left flex flex-col gap-1 transition-all ${
                        Math.abs((config.tiltAngle ?? 2.35) - 2.35) < 0.1
                          ? 'bg-amber-500/25 border-amber-400/60 text-amber-200 shadow-md ring-1 ring-amber-400/30'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                        ☂️ Paraguas hacia Abajo
                      </span>
                      <span className="text-[10px] text-slate-400">135° (Caída envolvente)</span>
                    </button>

                    <button
                      onClick={() => updateParam('tiltAngle', 2.80)}
                      className={`p-2.5 rounded-xl text-[11px] font-medium border text-left flex flex-col gap-1 transition-all ${
                        Math.abs((config.tiltAngle ?? 2.35) - 2.80) < 0.1
                          ? 'bg-amber-500/25 border-amber-400/60 text-amber-200 shadow-md ring-1 ring-amber-400/30'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                        🔔 Péndulo / Campana
                      </span>
                      <span className="text-[10px] text-slate-400">160° (Caída vertical)</span>
                    </button>

                    <button
                      onClick={() => updateParam('tiltAngle', 1.57)}
                      className={`p-2.5 rounded-xl text-[11px] font-medium border text-left flex flex-col gap-1 transition-all ${
                        Math.abs((config.tiltAngle ?? 2.35) - 1.57) < 0.1
                          ? 'bg-amber-500/25 border-amber-400/60 text-amber-200 shadow-md ring-1 ring-amber-400/30'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                        🌸 Horizontal Abierto
                      </span>
                      <span className="text-[10px] text-slate-400">90° (Plano extendido)</span>
                    </button>

                    <button
                      onClick={() => updateParam('tiltAngle', 0.78)}
                      className={`p-2.5 rounded-xl text-[11px] font-medium border text-left flex flex-col gap-1 transition-all ${
                        Math.abs((config.tiltAngle ?? 2.35) - 0.78) < 0.1
                          ? 'bg-amber-500/25 border-amber-400/60 text-amber-200 shadow-md ring-1 ring-amber-400/30'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                        🌿 Erguido hacia Arriba
                      </span>
                      <span className="text-[10px] text-slate-400">45° (Copa ascendente)</span>
                    </button>
                  </div>
                </div>

                {/* Control 1: Inclinación / Caída Paraguas */}
                <div className="space-y-2 p-3 rounded-xl bg-slate-900/50 border border-white/5">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-200 font-semibold flex items-center gap-1.5">
                      <Umbrella className="w-3.5 h-3.5 text-amber-400" />
                      <span>Inclinación 360° (Pitch / Paraguas)</span>
                    </label>
                    <div className="flex items-center gap-1 font-mono">
                      <input
                        type="number"
                        min="-360"
                        max="360"
                        value={Math.round(((config.tiltAngle ?? 2.35) * 180) / Math.PI)}
                        onChange={(e) => {
                          const deg = parseFloat(e.target.value) || 0;
                          updateParam('tiltAngle', (deg * Math.PI) / 180);
                        }}
                        className="w-16 px-1.5 py-0.5 text-right font-bold text-amber-300 bg-slate-800 border border-white/10 rounded text-xs"
                      />
                      <span className="text-amber-400 font-bold text-xs">°</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-6.28"
                    max="6.28"
                    step="0.02"
                    value={config.tiltAngle ?? 2.35}
                    onChange={(e) => updateParam('tiltAngle', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>-360°</span>
                    <span>-180°</span>
                    <span>0°</span>
                    <span className="text-amber-400 font-semibold">135° (☂️)</span>
                    <span>+180°</span>
                    <span>+360°</span>
                  </div>
                  <div className="flex gap-1 pt-1">
                    {[
                      { label: '0° Arriba', val: 0 },
                      { label: '90° Plano', val: 1.57 },
                      { label: '135° Paraguas', val: 2.35 },
                      { label: '180° Péndulo', val: 3.14 },
                      { label: '-135° Invertido', val: -2.35 },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        onClick={() => updateParam('tiltAngle', btn.val)}
                        className="flex-1 py-0.5 px-1 rounded text-[9.5px] bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-all truncate"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Control 2: Giro Azimutal 360° (Yaw) */}
                <div className="space-y-2 p-3 rounded-xl bg-slate-900/50 border border-white/5">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-200 font-semibold flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span>Giro Azimutal 360° (Yaw / Brújula)</span>
                    </label>
                    <div className="flex items-center gap-1 font-mono">
                      <input
                        type="number"
                        min="-360"
                        max="360"
                        value={Math.round(((config.azimuthAngle ?? 0) * 180) / Math.PI)}
                        onChange={(e) => {
                          const deg = parseFloat(e.target.value) || 0;
                          updateParam('azimuthAngle', (deg * Math.PI) / 180);
                        }}
                        className="w-16 px-1.5 py-0.5 text-right font-bold text-amber-300 bg-slate-800 border border-white/10 rounded text-xs"
                      />
                      <span className="text-amber-400 font-bold text-xs">°</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-6.28"
                    max="6.28"
                    step="0.02"
                    value={config.azimuthAngle ?? 0}
                    onChange={(e) => updateParam('azimuthAngle', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>-360°</span>
                    <span>-180°</span>
                    <span>0°</span>
                    <span>+180°</span>
                    <span>+360°</span>
                  </div>
                  <div className="flex gap-1 pt-1">
                    {[
                      { label: '0° N', val: 0 },
                      { label: '90° E', val: 1.57 },
                      { label: '180° S', val: 3.14 },
                      { label: '270° O', val: 4.71 },
                      { label: '360°', val: 6.28 },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        onClick={() => updateParam('azimuthAngle', btn.val)}
                        className="flex-1 py-0.5 px-1 rounded text-[9.5px] bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-all truncate"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Control 3: Balanceo Lateral / Torsión Axial (Roll) */}
                <div className="space-y-2 p-3 rounded-xl bg-slate-900/50 border border-white/5">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-200 font-semibold flex items-center gap-1.5">
                      <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Balanceo Lateral / Torsión 360° (Roll)</span>
                    </label>
                    <div className="flex items-center gap-1 font-mono">
                      <input
                        type="number"
                        min="-360"
                        max="360"
                        value={Math.round(((config.rollAngle ?? 0) * 180) / Math.PI)}
                        onChange={(e) => {
                          const deg = parseFloat(e.target.value) || 0;
                          updateParam('rollAngle', (deg * Math.PI) / 180);
                        }}
                        className="w-16 px-1.5 py-0.5 text-right font-bold text-amber-300 bg-slate-800 border border-white/10 rounded text-xs"
                      />
                      <span className="text-amber-400 font-bold text-xs">°</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-6.28"
                    max="6.28"
                    step="0.02"
                    value={config.rollAngle ?? 0}
                    onChange={(e) => updateParam('rollAngle', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>-360°</span>
                    <span>-180°</span>
                    <span>0° Neutral</span>
                    <span>+180°</span>
                    <span>+360°</span>
                  </div>
                  <div className="flex gap-1 pt-1">
                    {[
                      { label: '-180°', val: -3.14 },
                      { label: '-90°', val: -1.57 },
                      { label: '0° Neutral', val: 0 },
                      { label: '+90°', val: 1.57 },
                      { label: '+180°', val: 3.14 },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        onClick={() => updateParam('rollAngle', btn.val)}
                        className="flex-1 py-0.5 px-1 rounded text-[9.5px] bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-all truncate"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botón de Reset de Orientación */}
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      updateParam('tiltAngle', 2.35);
                      updateParam('azimuthAngle', 0);
                      updateParam('rollAngle', 0);
                    }}
                    className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-amber-500/15 text-amber-200 border border-amber-400/30 hover:bg-amber-500/25 transition-all text-center flex items-center justify-center gap-1.5 shadow-sm truncate"
                  >
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                    <span>☂️ Paraguas (135°)</span>
                  </button>
                  <button
                    onClick={() => {
                      updateParam('tiltAngle', 0);
                      updateParam('azimuthAngle', 0);
                      updateParam('rollAngle', 0);
                    }}
                    className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-all text-center flex items-center justify-center gap-1.5 shadow-sm truncate"
                  >
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                    <span>0° Neutral (Erguido)</span>
                  </button>
                </div>
              </div>
            )}

            {/* PESTAÑA 1: ENROLLADO DE LA PUNTA */}
            {activeTab === 'roll' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-200 flex items-center gap-1.5">
                      <Wind className="w-4 h-4 text-amber-400" />
                      Enrollado Apical (Vueltas)
                    </span>
                    <span className="font-mono px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 font-bold border border-amber-400/40">
                      {(config.tipRollTurns ?? 0).toFixed(2)} vueltas
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="2.5"
                    step="0.05"
                    value={config.tipRollTurns ?? 0}
                    onChange={(e) => updateParam('tipRollTurns', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0 (Sin enrollar)</span>
                    <span>0.5 (Medio giro)</span>
                    <span>1.0 (Rizo completo)</span>
                    <span>2.0+ (Espiral)</span>
                  </div>
                </div>

                {/* Dirección del Enrollado */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Dirección del Giro / Rizo</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateParam('tipRollDirection', -1)}
                      className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                        (config.tipRollDirection ?? -1) === -1
                          ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      ⤵️ Hacia Abajo / Atrás
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        Caída floral natural
                      </span>
                    </button>
                    <button
                      onClick={() => updateParam('tipRollDirection', 1)}
                      className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                        (config.tipRollDirection ?? -1) === 1
                          ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      ⤴️ Hacia Arriba / Adentro
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        Copa recogida
                      </span>
                    </button>
                  </div>
                </div>

                {/* Inicio del Enrollado */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-300 font-medium">
                      Zona de Inicio del Rizo (u)
                    </label>
                    <span className="font-mono text-amber-300">
                      {((config.tipRollStart ?? 0.75) * 100).toFixed(0)}% de longitud
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.60"
                    max="0.92"
                    step="0.01"
                    value={config.tipRollStart ?? 0.75}
                    onChange={(e) => updateParam('tipRollStart', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <p className="text-[10px] text-slate-400">
                    Controla qué tan cerca del extremo comienza a enrollarse la punta.
                  </p>
                </div>

                {/* Torsión Lateral Orgánica */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-300 font-medium">Torsión Lateral Asimétrica</label>
                    <span className="font-mono text-amber-300">
                      {(config.tipRollTwist ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-0.25"
                    max="0.25"
                    step="0.01"
                    value={config.tipRollTwist ?? 0}
                    onChange={(e) => updateParam('tipRollTwist', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Gancho Clásico (cuando no hay enrollado activo) */}
                {(config.tipRollTurns ?? 0) <= 0.05 && (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-400/20 space-y-3">
                    <span className="font-medium text-purple-200 block">
                      Gancho Terminal Clásico (Activo cuando el enrollado es 0)
                    </span>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-300">Intensidad del Gancho</span>
                        <span className="font-mono text-purple-300">
                          {config.tipHookIntensity.toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.30"
                        step="0.01"
                        value={config.tipHookIntensity}
                        onChange={(e) =>
                          updateParam('tipHookIntensity', parseFloat(e.target.value))
                        }
                        className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PESTAÑA 2: FORMA & ARCO */}
            {activeTab === 'shape' && (
              <div className="space-y-4">
                {/* Longitud */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-300 font-medium">Longitud del Pétalo</label>
                    <span className="font-mono text-amber-300">{config.length.toFixed(2)} u</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="2.4"
                    step="0.05"
                    value={config.length}
                    onChange={(e) => updateParam('length', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Anchura */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-300 font-medium">Anchura Máxima</label>
                    <span className="font-mono text-amber-300">{config.width.toFixed(2)} u</span>
                  </div>
                  <input
                    type="range"
                    min="0.40"
                    max="1.20"
                    step="0.02"
                    value={config.width}
                    onChange={(e) => updateParam('width', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Anchura de la Base / Nacimiento (Relleno de corona central) */}
                <div className="space-y-1.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/25">
                  <div className="flex justify-between">
                    <label className="text-amber-200 font-medium flex items-center gap-1.5">
                      <span>Anchura de la Base (Nacimiento)</span>
                    </label>
                    <span className="font-mono text-amber-300 font-semibold">
                      {(config.baseWidthRatio ?? 0.22).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.10"
                    max="0.38"
                    step="0.01"
                    value={config.baseWidthRatio ?? 0.22}
                    onChange={(e) => updateParam('baseWidthRatio', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Estrecho (0.10)</span>
                    <span className="text-amber-300 font-medium">Recomendado (0.22)</span>
                    <span>Abundante (0.38)</span>
                  </div>
                </div>

                {/* Curvatura Cúpula ('∩') */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-300 font-medium">
                      Arco Cúpula Central (Forma en "∩")
                    </label>
                    <span className="font-mono text-amber-300">
                      {config.curvatureS.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.10"
                    max="0.90"
                    step="0.02"
                    value={config.curvatureS}
                    onChange={(e) => updateParam('curvatureS', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Caída hacia afuera */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-300 font-medium">Caída Exterior Pronunciada</label>
                    <span className="font-mono text-amber-300">
                      {(config.outerDescentMult ?? 1.25).toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.50"
                    max="2.20"
                    step="0.05"
                    value={config.outerDescentMult ?? 1.25}
                    onChange={(e) => updateParam('outerDescentMult', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <p className="text-[10px] text-slate-400">
                    Controla cuánto desciende el extremo del pétalo respecto a la corona central.
                  </p>
                </div>
              </div>
            )}

            {/* PESTAÑA 3: RELIEVE */}
            {activeTab === 'relief' && (
              <div className="space-y-4">
                {/* Curvatura Transversal */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-300 font-medium">
                      Copa Transversal (Cuenco/Sombrilla)
                    </label>
                    <span className="font-mono text-amber-300">
                      {config.cupTransverse.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.00"
                    max="0.35"
                    step="0.01"
                    value={config.cupTransverse}
                    onChange={(e) => updateParam('cupTransverse', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Relieve de Venas */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-300 font-medium">
                      Relieve de Nervadura & Acanaladuras
                    </label>
                    <span className="font-mono text-amber-300">
                      {config.veinRelief.toFixed(3)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.00"
                    max="0.05"
                    step="0.002"
                    value={config.veinRelief}
                    onChange={(e) => updateParam('veinRelief', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Ondulaciones de Borde */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-300 font-medium">Ondulaciones de Bordes</label>
                    <span className="font-mono text-amber-300">
                      {config.edgeRuffles.toFixed(3)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.00"
                    max="0.06"
                    step="0.002"
                    value={config.edgeRuffles}
                    onChange={(e) => updateParam('edgeRuffles', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* PESTAÑA 3: COLORES & MATERIAL */}
            {activeTab === 'colors' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-400/25 space-y-2">
                  <div className="flex items-center gap-1.5 text-purple-300 font-semibold text-xs">
                    <Palette className="w-3.5 h-3.5" />
                    Degradado Botánico del Pétalo
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Personaliza los tres tonos que recorren el pétalo desde su inserción en el cáliz hasta el gancho terminal:
                  </p>
                </div>

                {/* Color Base (Cáliz / Inserción) */}
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-200 block text-xs">
                        Color Base (Inserción)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Zona de unión al tallo (morado / magenta)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.baseColor ?? '#a21caf'}
                        onChange={(e) => updateParam('baseColor', e.target.value)}
                        className="w-8 h-8 rounded-lg border border-white/20 cursor-pointer bg-transparent"
                      />
                      <span className="font-mono text-xs text-amber-300 uppercase">
                        {config.baseColor ?? '#a21caf'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Color Medio (Cuerpo Luminoso) */}
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-200 block text-xs">
                        Color Medio (Vientre)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Zona central dorada solar translúcida
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.midColor ?? '#facc15'}
                        onChange={(e) => updateParam('midColor', e.target.value)}
                        className="w-8 h-8 rounded-lg border border-white/20 cursor-pointer bg-transparent"
                      />
                      <span className="font-mono text-xs text-amber-300 uppercase">
                        {config.midColor ?? '#facc15'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Color Punta (Gancho Apical) */}
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-200 block text-xs">
                        Color Punta (Rizo)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Extremo apical curvado / enrollado
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.tipColor ?? '#f97316'}
                        onChange={(e) => updateParam('tipColor', e.target.value)}
                        className="w-8 h-8 rounded-lg border border-white/20 cursor-pointer bg-transparent"
                      />
                      <span className="font-mono text-xs text-amber-300 uppercase">
                        {config.tipColor ?? '#f97316'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Color de Venas Bioluminiscentes */}
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-200 block text-xs">
                        Brillo de Venas
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Nervaduras fluorescentes internas
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.veinGlowColor ?? '#fbbf24'}
                        onChange={(e) => updateParam('veinGlowColor', e.target.value)}
                        className="w-8 h-8 rounded-lg border border-white/20 cursor-pointer bg-transparent"
                      />
                      <span className="font-mono text-xs text-amber-300 uppercase">
                        {config.veinGlowColor ?? '#fbbf24'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Intensidad Emisiva (Luminosidad Mágica) */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between">
                    <label className="text-slate-300 font-medium">Intensidad Emisiva (Glow)</label>
                    <span className="font-mono text-amber-300">
                      {(config.emissiveIntensity ?? 1.5).toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="4.0"
                    step="0.1"
                    value={config.emissiveIntensity ?? 1.5}
                    onChange={(e) => updateParam('emissiveIntensity', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Translucidez / Dispersión Subsuperficial (Transmission) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-300 font-medium">Translucidez Orgánica</label>
                    <span className="font-mono text-amber-300">
                      {(config.transmission ?? 0.18).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.8"
                    step="0.02"
                    value={config.transmission ?? 0.18}
                    onChange={(e) => updateParam('transmission', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Rugosidad / Suavidad de la Cutícula */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-300 font-medium">Rugosidad Superficial</label>
                    <span className="font-mono text-amber-300">
                      {(config.roughness ?? 0.34).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.9"
                    step="0.02"
                    value={config.roughness ?? 0.34}
                    onChange={(e) => updateParam('roughness', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Brillo Laca / Barniz Biológico (Clearcoat) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-300 font-medium">Brillo de Rocío / Clearcoat</label>
                    <span className="font-mono text-amber-300">
                      {(config.clearcoat ?? 0.38).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={config.clearcoat ?? 0.38}
                    onChange={(e) => updateParam('clearcoat', parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* PESTAÑA 5: PRESETS DE PUNTA */}
            {activeTab === 'presets' && (
              <div className="space-y-2.5">
                <p className="text-[11px] text-slate-400">
                  Haz clic en un estilo para aplicarlo al instante y probar variaciones:
                </p>

                <button
                  onClick={() =>
                    applyPreset({
                      tipRollTurns: 0,
                      tipRollDirection: -1,
                      tipRollStart: 0.75,
                      tipRollTwist: 0,
                    })
                  }
                  className="w-full text-left p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-400/40 transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-200 block">🌿 Punta Estándar</span>
                    <span className="text-[10px] text-slate-400">
                      Gancho apical clásico sin enrollar
                    </span>
                  </div>
                  <span className="text-xs text-amber-300 font-mono">0.0 vueltas</span>
                </button>

                <button
                  onClick={() =>
                    applyPreset({
                      tipRollTurns: 0.65,
                      tipRollDirection: -1,
                      tipRollStart: 0.78,
                      tipRollTwist: -0.04,
                    })
                  }
                  className="w-full text-left p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-400/40 transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-200 block">
                      🌸 Rizo Floral Suave
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Medio giro elegante cayendo hacia atrás
                    </span>
                  </div>
                  <span className="text-xs text-amber-300 font-mono">0.65 vueltas</span>
                </button>

                <button
                  onClick={() =>
                    applyPreset({
                      tipRollTurns: 1.05,
                      tipRollDirection: -1,
                      tipRollStart: 0.74,
                      tipRollTwist: -0.06,
                    })
                  }
                  className="w-full text-left p-2.5 rounded-xl border border-amber-400/30 bg-amber-500/10 hover:bg-amber-500/20 transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-amber-200 block">
                      🌀 Espiral Clásico (1 Vuelta)
                    </span>
                    <span className="text-[10px] text-slate-300">
                      Rulo completo descendente muy armónico
                    </span>
                  </div>
                  <span className="text-xs text-amber-300 font-mono">1.05 vueltas</span>
                </button>

                <button
                  onClick={() =>
                    applyPreset({
                      tipRollTurns: 1.6,
                      tipRollDirection: -1,
                      tipRollStart: 0.70,
                      tipRollTwist: -0.08,
                    })
                  }
                  className="w-full text-left p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-400/40 transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-200 block">
                      🐚 Espiral Cerrado Pronunciado
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Doble vuelta estilizada tipo helecho
                    </span>
                  </div>
                  <span className="text-xs text-amber-300 font-mono">1.60 vueltas</span>
                </button>

                <button
                  onClick={() =>
                    applyPreset({
                      tipRollTurns: 0.85,
                      tipRollDirection: 1,
                      tipRollStart: 0.74,
                      tipRollTwist: 0.04,
                    })
                  }
                  className="w-full text-left p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-400/40 transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-200 block">
                      ⤴️ Rizo Invertido (Hacia Arriba)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      La punta se enrolla hacia el interior
                    </span>
                  </div>
                  <span className="text-xs text-amber-300 font-mono">0.85 vueltas</span>
                </button>
              </div>
            )}
          </div>

          {/* 5. Footer con Botón de Copiar y Restablecer */}
          <div className="p-3.5 border-t border-white/10 bg-slate-900/90 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopy}
                className={`py-2 px-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md truncate ${
                  copied
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                    : 'bg-white/10 hover:bg-white/15 text-amber-200 border border-amber-400/30'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 shrink-0" />
                    <span>Copiar JSON</span>
                  </>
                )}
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25 truncate"
                >
                  <Flower2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Ver Flor Completa</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setShowJsonModal(!showJsonModal)}
                className="text-[11px] text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-1"
              >
                <Code2 className="w-3.5 h-3.5" />
                {showJsonModal ? 'Ocultar JSON' : 'Ver datos JSON'}
              </button>
              <button
                onClick={handleReset}
                className="text-[11px] text-slate-400 hover:text-red-300 transition-colors flex items-center gap-1"
                title="Volver a los valores por defecto"
              >
                <RotateCcw className="w-3 h-3" />
                Restablecer
              </button>
            </div>

            {showJsonModal && (
              <div className="mt-2 p-2.5 rounded-lg bg-black/60 border border-white/10 font-mono text-[10px] text-amber-200/90 max-h-32 overflow-y-auto whitespace-pre">
                {configJsonString}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
