/**
 * COMPONENTE REPRODUCTOR DE YOUTUBE — MÚSICA DE FONDO
 *
 * Mantiene la apariencia idéntica de la píldora original:
 * [ ▶ Música ]  [ 🔊 ]  [ 🎚️ ]  +  [ 🔗 Botoncito plegable para poner el URL ]
 *
 * Permite:
 * 1. Poner cualquier URL de YouTube mediante un botón plegable.
 * 2. Darle a Reproducir (Play) / Pausar.
 * 3. Ajustar el volumen (con el botón 🎚️ Sliders y dentro del panel desplegable).
 * 4. Silenciar / Activar sonido (con el botón 🔊).
 * 5. Bucle infinito para música ambiental.
 * 6. Sin almacenar archivos protegidos por derechos de autor (reproducción legítima vía YouTube IFrame API).
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Sliders,
  Youtube,
  Link2,
  X,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Check,
} from 'lucide-react';

interface YouTubePlayerProps {
  onPlayStateChange?: (isPlaying: boolean) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

// Extrae el ID de 11 caracteres de cualquier URL o ID de YouTube
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i
  );
  return match ? match[1] : null;
}

const STORAGE_KEY_URL = 'magical_flower_yt_url';
const STORAGE_KEY_VOL = 'magical_flower_yt_volume';
const STORAGE_KEY_LOOP = 'magical_flower_yt_loop';

export function YouTubePlayer({ onPlayStateChange }: YouTubePlayerProps) {
  // URL por defecto (Versión instrumental de "Veo en ti la luz" / Tangled)
  const defaultUrl = 'https://www.youtube.com/watch?v=fZSZMp32XaA';

  const [inputUrl, setInputUrl] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_URL) || defaultUrl;
  });
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_URL) || defaultUrl;
    return extractYouTubeId(saved);
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_VOL);
    return saved !== null ? Math.max(0, Math.min(100, Number(saved))) : 90;
  });
  const [isLoop, setIsLoop] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LOOP);
    return saved !== null ? saved === 'true' : true;
  });

  // Estados plegables de interfaz
  const [isUrlPanelOpen, setIsUrlPanelOpen] = useState<boolean>(false);
  const [isVolumePopupOpen, setIsVolumePopupOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  const playerRef = useRef<any>(null);
  const isApiReadyRef = useRef<boolean>(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Notificar cambio de estado
  useEffect(() => {
    onPlayStateChange?.(isPlaying);
  }, [isPlaying, onPlayStateChange]);

  // Persistir configuración
  useEffect(() => {
    if (inputUrl) localStorage.setItem(STORAGE_KEY_URL, inputUrl);
  }, [inputUrl]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VOL, String(volume));
  }, [volume]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOOP, String(isLoop));
  }, [isLoop]);

  // Cerrar paneles al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsVolumePopupOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar YouTube IFrame API de Google
  useEffect(() => {
    const loadIframeApi = () => {
      if (window.YT && window.YT.Player) {
        isApiReadyRef.current = true;
        initPlayer();
        return;
      }

      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevReady) prevReady();
        isApiReadyRef.current = true;
        initPlayer();
      };

      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.head.appendChild(tag);
      }
    };

    loadIframeApi();

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Inicializar reproductor de YouTube
  const initPlayer = useCallback(() => {
    if (!window.YT || !window.YT.Player) return;
    const initialId = currentVideoId || 'fZSZMp32XaA';

    try {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player('yt-hidden-audio-embed', {
        height: '100%',
        width: '100%',
        videoId: initialId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(volume);
            if (isMuted) event.target.mute();
            try {
              const data = event.target.getVideoData?.();
              if (data && data.title) {
                setVideoTitle(data.title);
              }
            } catch {
              // ignore
            }
          },
          onStateChange: (event: any) => {
            if (event.data === 1) {
              // Playing
              setIsPlaying(true);
              setIsBuffering(false);
              setErrorMessage(null);
              try {
                const data = playerRef.current?.getVideoData?.();
                if (data && data.title) setVideoTitle(data.title);
              } catch {}
            } else if (event.data === 2) {
              // Paused
              setIsPlaying(false);
              setIsBuffering(false);
            } else if (event.data === 3) {
              // Buffering
              setIsBuffering(true);
            } else if (event.data === 0) {
              // Ended
              if (isLoop && playerRef.current) {
                playerRef.current.seekTo(0);
                playerRef.current.playVideo();
              } else {
                setIsPlaying(false);
              }
            }
          },
          onError: (event: any) => {
            setIsBuffering(false);
            setIsPlaying(false);
            console.warn('YouTube error:', event.data);
            if (event.data === 101 || event.data === 150) {
              setErrorMessage('Este video no permite ser reproducido en segundo plano. Prueba con otro enlace de YouTube.');
            } else if (event.data === 2) {
              setErrorMessage('Enlace o ID de YouTube no válido.');
            } else if (event.data === 100) {
              setErrorMessage('El video de YouTube no fue encontrado o es privado.');
            } else {
              setErrorMessage('No se pudo reproducir el video de YouTube.');
            }
          },
        },
      });
    } catch (err) {
      console.error('Error inicializando reproductor de YouTube:', err);
    }
  }, [currentVideoId, volume, isMuted, isLoop]);

  // Cargar y reproducir nueva URL
  const handleLoadAndPlay = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const extractedId = extractYouTubeId(inputUrl);
    if (!extractedId) {
      setErrorMessage('Por favor pega un enlace válido (ejemplo: https://www.youtube.com/watch?v=...)');
      return;
    }

    setCurrentVideoId(extractedId);

    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      try {
        playerRef.current.loadVideoById({
          videoId: extractedId,
          startSeconds: 0,
        });
        playerRef.current.setVolume(volume);
        if (isMuted) playerRef.current.mute();
        else playerRef.current.unMute();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Error al cargar video:', err);
      }
    } else {
      initPlayer();
    }
  };

  // Alternar Play / Pause
  const togglePlay = () => {
    setErrorMessage(null);
    if (!playerRef.current || typeof playerRef.current.playVideo !== 'function') {
      handleLoadAndPlay();
      return;
    }

    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.setVolume(isMuted ? 0 : volume);
        if (isMuted) playerRef.current.mute();
        else playerRef.current.unMute();
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch (err) {
      console.warn('Error al alternar música:', err);
      handleLoadAndPlay();
    }
  };

  // Alternar Silencio (Mute)
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (playerRef.current) {
      try {
        if (nextMuted) {
          playerRef.current.mute();
        } else {
          playerRef.current.unMute();
          playerRef.current.setVolume(volume);
        }
      } catch (err) {
        console.warn('Error cambiando mute:', err);
      }
    }
  };

  // Ajustar nivel de volumen
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
    if (playerRef.current) {
      try {
        if (isMuted && newVolume > 0) {
          playerRef.current.unMute();
        }
        playerRef.current.setVolume(newVolume);
      } catch (err) {
        console.warn('Error ajustando volumen:', err);
      }
    }
  };

  // Pegar desde portapapeles si está disponible
  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputUrl(text);
          setCopiedNotification(true);
          setTimeout(() => setCopiedNotification(false), 2000);
        }
      }
    } catch {
      // Ignorar si el navegador restringe permisos de portapapeles
    }
  };

  return (
    <div ref={panelRef} className="relative select-none text-slate-100">
      {/* 
        iFrame de YouTube invisible para reproducción continua de audio:
        Se mantiene montado con dimensiones mínimas fuera del área visible,
        garantizando que el navegador no suspenda el audio.
      */}
      <div
        id="yt-audio-container"
        className="fixed -bottom-[800px] -right-[800px] w-48 h-32 opacity-[0.001] pointer-events-none"
      >
        <div id="yt-hidden-audio-embed" className="w-full h-full" />
      </div>

      {/* 
        PÍLDORA PRINCIPAL (IDÉNTICA A LA IMAGEN):
        [ ▶ Música ]  [ 🔊 ]  [ 🎚️ ]  +  [ 🔗 Botoncito plegable ]
      */}
      <div
        id="music-pill-container"
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-full backdrop-blur-md bg-stone-900/80 hover:bg-stone-900/90 border border-amber-500/25 hover:border-amber-500/40 shadow-xl transition-all duration-200"
      >
        {/* 1. Botón Música (Play / Pause) */}
        <button
          id="btn-music-toggle"
          onClick={togglePlay}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-amber-200/95 hover:text-amber-100 transition-colors cursor-pointer group"
          title={isPlaying ? 'Pausar música' : 'Reproducir música'}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
              <span>Música</span>
              {/* Animación sutil de barritas de ecualizador */}
              <span className="flex items-end gap-0.5 h-3 ml-0.5">
                <span className="w-0.5 bg-amber-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-2" />
                <span className="w-0.5 bg-amber-300 rounded-full animate-[pulse_0.9s_ease-in-out_infinite] h-3" />
                <span className="w-0.5 bg-amber-400 rounded-full animate-[pulse_0.75s_ease-in-out_infinite] h-1.5" />
              </span>
            </>
          ) : isBuffering ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Cargando...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
              <span>Música</span>
            </>
          )}
        </button>

        {/* 2. Botón de Silencio / Volumen (Ícono de bocina) */}
        <button
          id="btn-mute-toggle"
          onClick={toggleMute}
          className="p-1 rounded-full text-amber-400 hover:text-amber-300 hover:bg-white/10 transition-colors cursor-pointer"
          title={isMuted ? 'Activar sonido' : 'Silenciar'}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : volume < 50 ? (
            <Volume1 className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

        {/* 3. Botón de Ajuste de Volumen (Ícono Sliders 🎚️) */}
        <button
          id="btn-volume-sliders"
          onClick={() => {
            setIsVolumePopupOpen(!isVolumePopupOpen);
            setIsUrlPanelOpen(false);
          }}
          className={`p-1 rounded-full transition-colors cursor-pointer ${
            isVolumePopupOpen
              ? 'text-amber-300 bg-amber-500/20'
              : 'text-amber-200/80 hover:text-amber-100 hover:bg-white/10'
          }`}
          title="Ajustar volumen"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        {/* 
          4. NUEVO BOTONCITO PLEGABLE PARA PONER EL URL:
          Botoncito elegante con ícono de enlace / YouTube que se pliega y despliega
        */}
        <button
          id="btn-foldable-url-toggle"
          onClick={() => {
            setIsUrlPanelOpen(!isUrlPanelOpen);
            setIsVolumePopupOpen(false);
          }}
          className={`flex items-center gap-1 px-1.5 py-1 rounded-full transition-all cursor-pointer ${
            isUrlPanelOpen
              ? 'bg-amber-500/30 text-amber-200 ring-1 ring-amber-400/50'
              : 'text-amber-200/80 hover:text-amber-100 hover:bg-white/10'
          }`}
          title={isUrlPanelOpen ? 'Cerrar panel de enlace' : 'Poner URL de YouTube'}
        >
          <Youtube className="w-3.5 h-3.5 text-red-500" />
          <Link2 className="w-3 h-3 text-amber-300" />
        </button>
      </div>

      {/* POPUP DE VOLUMEN (DESPLEGADO DESDE EL BOTÓN SLIDERS 🎚️) */}
      {isVolumePopupOpen && (
        <div
          id="volume-popup"
          className="absolute top-11 right-6 z-30 p-3 rounded-2xl backdrop-blur-xl bg-stone-900/95 border border-amber-500/30 shadow-2xl animate-fade-in w-48 space-y-2 text-xs"
        >
          <div className="flex items-center justify-between text-amber-200/90 font-medium">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Sliders className="w-3 h-3 text-amber-400" />
              Volumen
            </span>
            <span className="font-mono text-amber-300 font-semibold text-[11px]">
              {isMuted ? '0%' : `${volume}%`}
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={toggleMute}
              className="text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              id="input-volume-slider"
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="flex-1 h-1.5 rounded-lg appearance-none bg-stone-800 accent-amber-400 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* 
        PANEL PLEGABLE PARA PONER EL URL DE YOUTUBE:
        Se abre suavemente justo debajo del botón plegable con un diseño oscuro, cálido y elegante.
      */}
      {isUrlPanelOpen && (
        <div
          id="url-foldable-panel"
          className="absolute top-11 right-0 z-30 w-80 sm:w-88 p-3.5 rounded-2xl backdrop-blur-2xl bg-stone-950/95 border border-amber-500/30 shadow-2xl shadow-black/80 animate-fade-in text-xs space-y-3"
        >
          {/* Cabecera del panel plegable */}
          <div className="flex items-center justify-between border-b border-amber-500/15 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400">
                <Youtube className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-100 text-xs">
                  Poner música de YouTube
                </h4>
                <p className="text-[10px] text-amber-200/60">
                  Pega cualquier canción o video de YouTube
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsUrlPanelOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
              title="Plegar / Cerrar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Formulario con campo para URL */}
          <form onSubmit={handleLoadAndPlay} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-amber-200/90 flex items-center gap-1">
                <Link2 className="w-3 h-3 text-amber-400" />
                URL del video:
              </label>
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="text-[10px] text-amber-300 hover:underline cursor-pointer flex items-center gap-1"
                title="Pegar enlace copiado"
              >
                {copiedNotification ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-300">¡Pegado!</span>
                  </>
                ) : (
                  <span>Pegar enlace</span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                id="input-youtube-url"
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 px-3 py-2 rounded-xl bg-stone-900/90 border border-amber-500/25 focus:border-amber-400 focus:outline-none text-amber-100 placeholder:text-stone-500 text-xs transition-colors"
              />
              {inputUrl && (
                <button
                  type="button"
                  onClick={() => setInputUrl('')}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white cursor-pointer"
                  title="Borrar texto"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Error si la URL no es válida */}
            {errorMessage && (
              <div className="flex items-start gap-1.5 p-2 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-[11px]">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Título de la pista activa */}
            {videoTitle && !errorMessage && (
              <div className="p-2 rounded-xl bg-amber-950/20 border border-amber-500/15 text-[11px] text-amber-200/90 truncate flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">{videoTitle}</span>
              </div>
            )}

            {/* Fila de Acciones: Dar Play / Cargar + Bucle */}
            <div className="flex items-center gap-2 pt-1">
              <button
                id="btn-submit-play-url"
                type="submit"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-semibold shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer text-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isPlaying ? 'Actualizar y Reproducir' : 'Darle Play'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsLoop(!isLoop)}
                className={`flex items-center gap-1 px-2.5 py-2 rounded-xl border text-[11px] transition-colors cursor-pointer ${
                  isLoop
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                    : 'bg-stone-900 border-white/10 text-stone-400 hover:text-stone-200'
                }`}
                title={isLoop ? 'Bucle infinito activado' : 'Bucle desactivado'}
              >
                <RotateCcw className={`w-3 h-3 ${isLoop ? 'text-amber-400' : ''}`} />
                <span>Bucle {isLoop ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Slider de volumen rápido dentro del panel */}
            <div className="pt-2 border-t border-amber-500/15 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-amber-200/80">
                <span className="flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-amber-400" />
                  Volumen:
                </span>
                <span className="font-mono text-amber-300 font-semibold">
                  {isMuted ? '0%' : `${volume}%`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none bg-stone-800 accent-amber-400 cursor-pointer"
              />
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default YouTubePlayer;
