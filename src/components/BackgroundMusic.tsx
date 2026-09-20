/**
 * COMPONENTE BACKGROUND MUSIC — "VEO EN TI LA LUZ" (ENREDADOS / TANGLED)
 *
 * Integración mediante archivo de audio local descargado:
 * - Canción: "Veo en ti la luz" (/veo-en-ti-la-luz.mp3).
 * - Reproducción continua en bucle (loop infinito).
 * - Volumen inicial al máximo (100%).
 * - Manejo confiable de políticas de autoplay del navegador con interacción táctil/clic.
 * - Controles minimalistas: reproducir/pausar, silenciar/activar y ajuste de volumen.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, Sliders } from 'lucide-react';

interface BackgroundMusicProps {
  // Callback opcional de estado
  onPlayStateChange?: (isPlaying: boolean) => void;
}

// Ruta absoluta sincronizada con la base URL de Vite (resuelve /flor-que-da-fulgor/veo-en-ti-la-luz.mp3)
const baseUrl = ((import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/').replace(/\/$/, '');
const AUDIO_URL = `${baseUrl}/veo-en-ti-la-luz.mp3`;

export function BackgroundMusic({ onPlayStateChange }: BackgroundMusicProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(100); // 100% Volumen al máximo
  const [showVolumePopup, setShowVolumePopup] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef<boolean>(false);

  // Mantener ref sincronizada para eventos
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    onPlayStateChange?.(isPlaying);
  }, [isPlaying, onPlayStateChange]);

  // Sincronizar volumen y silencio en el elemento de audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Intentar reproducir automáticamente tan pronto el audio esté montado
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume / 100;
    audio.loop = true;

    const playAudio = () => {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.log('Autoplay inicial a la espera de interacción del usuario:', err);
            setIsPlaying(false);
          });
      }
    };

    playAudio();

    // Desbloquear en la primera interacción si el navegador requirió gesto del usuario
    const events = ['pointerdown', 'touchstart', 'mousedown', 'keydown', 'click'];
    const handleInteraction = () => {
      if (audio.paused) {
        audio.volume = isMuted ? 0 : volume / 100;
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => console.warn('Error al iniciar audio en interacción:', err));
      }
      events.forEach((ev) => window.removeEventListener(ev, handleInteraction));
    };

    events.forEach((ev) => window.addEventListener(ev, handleInteraction, { passive: true }));

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleInteraction));
    };
  }, []);

  // Alternar reproducción / pausa
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.volume = isMuted ? 0 : volume / 100;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((e) => {
            console.warn('Error al reproducir audio:', e);
            setIsPlaying(false);
          });
      }
    }
  };

  // Alternar silencio
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
      audioRef.current.volume = nextMuted ? 0 : volume / 100;
    }
  };

  // Cambiar volumen
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
      audioRef.current.muted = false;
    }
  };

  // Activación explícita mediante el botón si el navegador pausó el inicio
  const handleActivateMusic = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume / 100;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((e) => console.warn('Error al activar música:', e));
      }
    }
  };

  return (
    <>
      {/* Elemento de audio HTML5 con el archivo descargado servido bajo BASE_URL */}
      <audio
        ref={audioRef}
        id="native-audio-player"
        src={AUDIO_URL}
        preload="auto"
        loop
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={(e) => console.error('Error cargando audio desde', AUDIO_URL, e)}
        onEnded={() => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }
        }}
      />

      {/* Botón elegante de aviso si el navegador bloqueó el autoplay en frío */}
      {!isPlaying && (
        <div
          id="music-autoplay-prompt"
          className="fixed bottom-14 left-1/2 -translate-x-1/2 z-20 animate-fade-in"
        >
          <button
            id="btn-activate-music"
            onClick={handleActivateMusic}
            className="group flex items-center gap-2.5 px-4 py-2 rounded-full backdrop-blur-2xl bg-amber-950/80 border border-amber-500/40 text-amber-200 shadow-2xl shadow-amber-950/60 hover:bg-amber-900/90 hover:border-amber-400/70 hover:scale-105 active:scale-95 transition-all text-xs font-medium tracking-wide cursor-pointer"
          >
            <Music className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>🎵 Toca la pantalla para reproducir "Veo en ti la luz"</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          </button>
        </div>
      )}

      {/* Control Minimalista Integrado en Barra */}
      <div className="relative flex items-center">
        <div className="flex items-center gap-1">
          {/* Botón principal de Música: Reproducir / Pausar */}
          <button
            id="btn-music-toggle"
            onClick={togglePlay}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              isPlaying
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200'
                : 'text-amber-100/70 hover:text-amber-50 hover:bg-white/5'
            }`}
            title={isPlaying ? 'Pausar "Veo en ti la luz"' : 'Reproducir "Veo en ti la luz"'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Música</span>
                {/* Indicador visual de notas musicales animadas */}
                <span className="flex items-center gap-0.5 ml-0.5">
                  <span className="w-0.5 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-0.5 h-3 bg-amber-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-0.5 h-1.5 bg-amber-400 rounded-full animate-bounce" />
                </span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-amber-300/80" />
                <span className="hidden sm:inline">Música</span>
              </>
            )}
          </button>

          {/* Botón de Silencio / Volumen */}
          <button
            id="btn-music-mute"
            onClick={toggleMute}
            className="p-1.5 rounded-xl text-amber-100/70 hover:text-amber-50 hover:bg-white/5 text-xs transition-all"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-amber-300" />
            )}
          </button>

          {/* Botón para desplegar slider de volumen */}
          <button
            id="btn-music-volume-slider-toggle"
            onClick={() => setShowVolumePopup(!showVolumePopup)}
            className={`p-1.5 rounded-xl text-xs transition-all ${
              showVolumePopup
                ? 'bg-amber-500/30 text-amber-200'
                : 'text-amber-100/50 hover:text-amber-100 hover:bg-white/5'
            }`}
            title="Ajustar nivel de volumen"
          >
            <Sliders className="w-3 h-3" />
          </button>
        </div>

        {/* Popover ultracompacto para el control del volumen */}
        {showVolumePopup && (
          <div
            id="music-volume-popover"
            className="absolute right-0 top-full mt-2 p-2.5 rounded-2xl backdrop-blur-2xl bg-slate-950/90 border border-white/10 shadow-2xl flex flex-col gap-2 min-w-[170px] z-30 animate-fade-in"
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-amber-200/70">
              <span>Volumen</span>
              <span>{isMuted ? '0%' : `${volume}%`}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between items-center text-[10px] text-amber-100/40">
              <button
                onClick={() => handleVolumeChange(30)}
                className="hover:text-amber-300 transition-colors"
              >
                Suave (30%)
              </button>
              <button
                onClick={() => handleVolumeChange(70)}
                className="hover:text-amber-300 transition-colors"
              >
                Medio (70%)
              </button>
              <button
                onClick={() => handleVolumeChange(100)}
                className="hover:text-amber-300 transition-colors font-medium text-amber-300/90"
              >
                Máx (100%)
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default BackgroundMusic;
