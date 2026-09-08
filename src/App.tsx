/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './scene/Scene';
import { BackgroundMusic } from './components/BackgroundMusic';

export default function App() {
  const [messageVisible, setMessageVisible] = useState(false);

  // Animación suave de aparición (fade-in) para el mensaje poético definitivo
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessageVisible(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main
      id="app-root"
      className="relative w-screen h-screen overflow-hidden bg-[#0c0517] select-none font-sans text-slate-100"
    >
      {/* 1. Lienzo 3D en pantalla completa: Escena Cinematográfica Definitiva */}
      <Canvas
        id="three-canvas"
        gl={{
          antialias: true,
          alpha: false,
          toneMappingExposure: 1.25,
        }}
        className="w-full h-full"
      >
        <color attach="background" args={['#0c0517']} />
        <Scene
          mode="flower"
          cameraPreset="lanterns"
          isDarkStudio={false}
          isNight={true}
          showLanterns={true}
        />
      </Canvas>

      {/* 2. Control de Música Minimalista y Discreto en la esquina superior */}
      <aside
        id="music-control-wrapper"
        className="absolute top-5 right-5 z-20 flex items-center p-1 rounded-2xl backdrop-blur-xl bg-slate-950/40 border border-white/10 shadow-2xl hover:bg-slate-950/60 transition-colors"
      >
        <BackgroundMusic />
      </aside>

      {/* 3. Único Mensaje en Pantalla — Elegante, Poético y Cinematográfico */}
      <div
        id="magical-dedication-message"
        className={`absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10 px-6 max-w-xl transition-all duration-1000 ease-out select-none ${
          messageVisible ? 'opacity-90 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        <p className="font-serif italic text-base sm:text-lg md:text-xl text-amber-100/90 tracking-wide leading-relaxed drop-shadow-[0_2px_16px_rgba(245,158,11,0.4)]">
          “Flor que da fulgor, con tu brillo fiel...
          <br />
          <span className="not-italic font-normal tracking-widest text-amber-200/95 block mt-1.5 text-sm sm:text-base md:text-lg drop-shadow-[0_2px_12px_rgba(245,158,11,0.35)]">
            Feliz 21 de septiembre”
          </span>
        </p>
      </div>
    </main>
  );
}
