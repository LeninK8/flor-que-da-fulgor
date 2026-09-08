/**
 * COMPONENTE BACKGROUND MUSIC — "VEO EN TI LA LUZ" (ENREDADOS / TANGLED)
 *
 * Integración oficial mediante YouTube IFrame API:
 * - Canción: "Veo en ti la luz" (Video ID: fZSZMp32XaA).
 * - Reproducción continua en bucle (loop infinito).
 * - Volumen inicial moderado: 40% (rango 35-45%).
 * - Manejo elegante de políticas de autoplay del navegador:
 *   botón discreto "🎵 Activar música" si el navegador requiere interacción.
 * - Controles minimalistas: reproducir/pausar, silenciar/activar y ajuste de volumen.
 * - Cero impacto visual negativo: reproductor de YouTube completamente oculto fuera de pantalla.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, Sliders } from 'lucide-react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface BackgroundMusicProps {
  // Callback opcional de estado
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export function BackgroundMusic({ onPlayStateChange }: BackgroundMusicProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(40); // 40% inicial según solicitado
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);
  const [hasUserActivated, setHasUserActivated] = useState<boolean>(false);
  const [showVolumePopup, setShowVolumePopup] = useState<boolean>(false);

  const playerRef = useRef<any>(null);
  const isPlayingRef = useRef<boolean>(false);

  // Mantener ref sincronizada para eventos
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    onPlayStateChange?.(isPlaying);
  }, [isPlaying, onPlayStateChange]);

  // Carga e inicialización de la API oficial de YouTube IFrame
  useEffect(() => {
    const videoId = 'fZSZMp32XaA';

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      // Evitar recreación si ya existe
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player('youtube-audio-player', {
        height: '1',
        width: '1',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          loop: 1,
          playlist: videoId, // Requerido por YouTube para el bucle continuo
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true);
            try {
              event.target.setVolume(40);
              // Intentar reproducción automática
              event.target.playVideo();
            } catch (err) {
              console.log('Autoplay bloqueado hasta interacción del usuario:', err);
            }
          },
          onStateChange: (event: any) => {
            // 1: PLAYING, 2: PAUSED, 0: ENDED
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setHasUserActivated(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              // Bucle garantizado: volver al inicio y reiniciar
              event.target.seekTo(0, true);
              event.target.playVideo();
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Registrar callback global si aún no está cargado
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };

      // Inyectar el script oficial si no existe en el DOM
      if (!document.getElementById('yt-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (e) {
          // ignore cleanup error
        }
      }
    };
  }, []);

  // Alternar reproducción / pausa
  const togglePlay = () => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
        setHasUserActivated(true);
      }
    } catch (e) {
      console.warn('Error al alternar reproducción', e);
    }
  };

  // Alternar silencio
  const toggleMute = () => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch (e) {
      console.warn('Error al alternar silencio', e);
    }
  };

  // Cambiar volumen
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (playerRef.current) {
      try {
        if (isMuted && newVolume > 0) {
          playerRef.current.unMute();
          setIsMuted(false);
        }
        playerRef.current.setVolume(newVolume);
      } catch (e) {
        console.warn('Error al cambiar volumen', e);
      }
    }
  };

  // Activación explícita si el navegador bloquea el autoplay inicial
  const handleActivateMusic = () => {
    setHasUserActivated(true);
    if (playerRef.current) {
      try {
        playerRef.current.setVolume(volume);
        playerRef.current.playVideo();
      } catch (e) {
        console.warn('Error al activar música', e);
      }
    }
  };

  return (
    <>
      {/* Contenedor IFrame de YouTube completamente oculto fuera de pantalla */}
      <div
        id="youtube-audio-container"
        className="absolute -top-[9999px] -left-[9999px] w-1 h-1 pointer-events-none opacity-0 overflow-hidden"
        aria-hidden="true"
      >
        <div id="youtube-audio-player" />
      </div>

      {/* Botón elegante de aviso inicial para activar música si el navegador bloqueó el autoplay */}
      {!isPlaying && !hasUserActivated && (
        <div
          id="music-autoplay-prompt"
          className="fixed bottom-14 left-1/2 -translate-x-1/2 z-20 animate-fade-in"
        >
          <button
            id="btn-activate-music"
            onClick={handleActivateMusic}
            className="group flex items-center gap-2.5 px-4 py-2 rounded-full backdrop-blur-2xl bg-amber-950/80 border border-amber-500/40 text-amber-200 shadow-2xl shadow-amber-950/60 hover:bg-amber-900/90 hover:border-amber-400/70 hover:scale-105 active:scale-95 transition-all text-xs font-medium tracking-wide"
          >
            <Music className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>🎵 Activar música: "Veo en ti la luz"</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
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
                onClick={() => handleVolumeChange(20)}
                className="hover:text-amber-300 transition-colors"
              >
                Suave (20%)
              </button>
              <button
                onClick={() => handleVolumeChange(40)}
                className="hover:text-amber-300 transition-colors font-medium text-amber-300/80"
              >
                Ideal (40%)
              </button>
              <button
                onClick={() => handleVolumeChange(70)}
                className="hover:text-amber-300 transition-colors"
              >
                Alto (70%)
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default BackgroundMusic;
