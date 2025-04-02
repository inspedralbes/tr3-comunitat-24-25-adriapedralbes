"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";

import { Logo } from "@/components/Logo";
import { AnimatedBackground } from "@/components/Newsletter/backgrounds";
import { NewsletterAvatarCircles } from "@/components/Newsletter/newsletter-avatar-circles";
import { RainbowButtonDemo } from "@/components/rainbowButton";
import { SmoothScrollLink } from "@/components/SmoothScroll";
import { Input } from "@/components/ui/input";

export function NewsletterHero() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Función para cerrar el menú de ajustes al hacer clic fuera
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (showSettings) {
      setShowSettings(false);
    }
  }, [showSettings]);

  // Efecto para manejar clics fuera del menú de ajustes
  useEffect(() => {
    if (showSettings) {
      // Añadir un pequeño delay para evitar que el mismo clic que abre
      // el menú lo cierre inmediatamente
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside, { capture: true });
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleClickOutside, { capture: true });
      };
    }
  }, [showSettings, handleClickOutside]);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Manejar la reproducción del video
  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(error => {
        console.error("Error al reproducir el video:", error);
      });
    }

    setIsPlaying(!isPlaying);
  };

  // Formatear el tiempo en formato m:ss
  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Manejar clic en la barra de progreso
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!videoRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = offsetX / rect.width;

    // Asegurarse de que el percentage esté entre 0 y 1
    const clampedPercentage = Math.max(0, Math.min(1, percentage));

    // Actualizar tiempo del video
    videoRef.current.currentTime = clampedPercentage * videoRef.current.duration;
    setCurrentTime(videoRef.current.currentTime);
  };

  // Manejar silencio/sonido
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se propague al documento
    if (!videoRef.current) return;

    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  // Manejar cambio de volumen
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;

    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);

    // Si el volumen es 0, silenciar; de lo contrario, activar sonido
    if (newVolume === 0) {
      videoRef.current.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

  // Manejar el clic en el icono de volumen
  const handleVolumeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se propague al documento
    setShowVolumeControl(!showVolumeControl);
    // Cerrar otros menús abiertos
    if (showSettings) setShowSettings(false);
  };

  // Efecto para manejar clics fuera del control de volumen
  useEffect(() => {
    if (showVolumeControl) {
      const handleClickOutside = (e: MouseEvent) => {
        setShowVolumeControl(false);
      };

      // Añadir un pequeño delay para evitar que el mismo clic lo cierre
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside, { capture: true });
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleClickOutside, { capture: true });
      };
    }
  }, [showVolumeControl]);

  // Manejar subtítulos
  const toggleCaptions = () => {
    setShowCaptions(!showCaptions);

    // Si el video tiene pistas de texto (subtítulos)
    if (videoRef.current && videoRef.current.textTracks.length > 0) {
      for (let i = 0; i < videoRef.current.textTracks.length; i++) {
        videoRef.current.textTracks[i].mode = showCaptions ? 'hidden' : 'showing';
      }
    }
  };

  // Manejar pantalla completa
  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;

    if (!document.fullscreenElement) {
      // Entrar en pantalla completa
      if (videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen()
          .then(() => {
            setIsFullscreen(true);
          })
          .catch(err => {
            console.error(`Error al intentar mostrar pantalla completa: ${err.message}`);
          });
      }
    } else {
      // Salir de pantalla completa
      document.exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
        })
        .catch(err => {
          console.error(`Error al intentar salir de pantalla completa: ${err.message}`);
        });
    }
  };

  // Manejar configuración
  const toggleSettings = (e: React.MouseEvent) => {
    // Detener la propagación para que el clic no llegue al documento
    // y evitar que el listener de clickOutside cierre el menú inmediatamente
    e.stopPropagation();
    setShowSettings(!showSettings);
  };

  // Actualizar la barra de progreso y el tiempo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Establecer tiempo inicial y duración cuando se carga el video
    const handleLoaded = () => {
      console.log("Video cargado. Duración:", video.duration);
      setDuration(video.duration || 0);
      setCurrentTime(0);
    };

    // Actualizar tiempo actual mientras se reproduce
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime || 0);
    };

    // Cuando el video termina
    const handleEnded = () => {
      setIsPlaying(false);
      video.currentTime = 0;
      setCurrentTime(0);
    };

    // Manejar pausa y reproducción
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    // Asegurarnos de cargar metadata al principio
    const handleMetadataLoaded = () => {
      console.log("Metadatos cargados. Duración:", video.duration);
      setDuration(video.duration || 0);
    };

    // Cargar duración si el video ya está cargado
    if (video.readyState >= 2) {
      setDuration(video.duration || 0);
    }

    // Agregar eventos
    video.addEventListener('loadeddata', handleLoaded);
    video.addEventListener('loadedmetadata', handleMetadataLoaded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('pause', handlePause);
    video.addEventListener('play', handlePlay);

    // Limpiar eventos
    return () => {
      video.removeEventListener('loadeddata', handleLoaded);
      video.removeEventListener('loadedmetadata', handleMetadataLoaded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('play', handlePlay);
    };
  }, []);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email) {
      setErrorMessage("DEBES introducir tu email para poder continuar");
      return;
    }

    if (!accepted) {
      setErrorMessage("¡OJO! Es OBLIGATORIO aceptar la política de privacidad para continuar");
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

      const response = await fetch(`${apiUrl}/newsletter/subscribe/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Comprobar el mensaje específico de error
        if (data.message && data.message.includes('ya está suscrito')) {
          setErrorMessage("Los datos proporcionados ya están registrados");
          setIsSubmitting(false);
          return;
        }
        
        // Comprobar si es error de validación de datos
        if (data.errors) {
          setErrorMessage("Los datos proporcionados no son válidos");
          setIsSubmitting(false);
          return;
        }
        
        throw new Error(data.message || 'Ha ocurrido un error al procesar la suscripción');
      }

      // Redireccionar a la página de agradecimiento en lugar de mostrar el mensaje de éxito
      window.location.href = "/thank-you";
      
      // Limpiar formulario (aunque se redirige, por si acaso)
      setName("");
      setEmail("");
      setAccepted(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      console.error("Error:", error);
      setErrorMessage(errorMessage || "Ha ocurrido un error. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero Section with full-height layout */}
      <section className="relative w-full bg-black min-h-screen flex items-center">
        {/* Animated Background */}
        <AnimatedBackground />
        {/* El botón superior de reserva ha sido eliminado para una experiencia más limpia */}

        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row px-8 md:px-12 pb-12 pt-24 md:pt-20">
          {/* Left Section - Made larger */}
          <div className="w-full md:w-1/2 flex flex-col justify-center md:pr-12 lg:pr-16 z-10">
            <div className="flex items-center mb-8">
              <Logo width={70} height={70} className="h-16 w-auto" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-7 text-white leading-tight">
              <span className="bg-gradient-to-r from-[#C9A880] to-[#A78355] bg-clip-text text-transparent">Domina la IA:</span><br />
              Tu Ventaja Definitiva<br />
              <span className="text-[#C9A880]">Sobre los Demás</span>
            </h1>

            <p className="text-white/90 text-lg mb-10 max-w-xl">
              Únete a la comunidad #1 para pioneros de la IA donde aprenderás
              a dominar la Inteligencia Artificial y los Agentes IA para
              transformar por completo tu negocio y carrera profesional.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 mb-8 md:mb-0">
              <SmoothScrollLink href="#newsletter-form">
                <div className="w-full sm:w-auto">
                  <RainbowButtonDemo className="px-7 py-3 text-base">
                    <span className="flex items-center">
                      QUIERO UNIRME
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </RainbowButtonDemo>
                </div>
              </SmoothScrollLink>

              <Link href="#benefits">
                <button className="border border-[#C9A880]/50 hover:border-[#C9A880] text-white font-medium py-3 px-7 rounded-xl text-base transition-all duration-300">
                  Ver los beneficios
                </button>
              </Link>
            </div>
          </div>

          {/* Right Section - Video/Image (positioned lower) */}
          <div className="w-full md:w-1/2 mt-12 md:mt-0 flex items-center z-10">
            <div
              ref={videoContainerRef}
              className="rounded-2xl overflow-hidden shadow-xl bg-black/30 border border-white/10 relative w-full h-0 pb-[56.25%]"
            >
              {/* Video Background with Fallback */}
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover cursor-pointer"
                muted
                playsInline
                preload="metadata"
                onClick={togglePlayPause}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setDuration(videoRef.current.duration);
                    console.log("Duración establecida:", videoRef.current.duration);
                  }
                }}
              >
                <source src="/hero-video.mp4" type="video/mp4" />
              </video>

              {/* Video Controls - Central play button, exactly like the reference */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                {!isPlaying && (
                  <button
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#C9A880] flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95"
                    aria-label="Play video"
                    onClick={togglePlayPause}
                  >
                    <svg className="w-7 h-7 md:w-8 md:h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Video Controls - Custom style matching the reference */}
              <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/60 to-transparent pt-10">
                <div className="flex items-center px-3 py-2 w-full">
                  {/* Play button */}
                  <button
                    className="mr-2 flex items-center justify-center h-8 w-8 text-white"
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>

                  {/* Current time */}
                  <span className="text-white text-xs mr-2 font-medium">
                    {formatTime(currentTime)}
                  </span>

                  {/* Progress bar */}
                  <div
                    className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer relative"
                    onClick={handleProgressBarClick}
                    role="progressbar"
                    tabIndex={0}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={(currentTime / (duration || 1)) * 100}
                  >
                    <div
                      className="h-full bg-[#C9A880]"
                      style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                    />
                  </div>

                  {/* Duration */}
                  <span className="text-white text-xs ml-2 mr-2 font-medium">
                    {formatTime(duration)}
                  </span>

                  {/* Control buttons on the right */}
                  <div className="flex items-center ml-2">
                    {/* Subtítulos - con icono más reconocible */}
                    <button
                      className={`text-white mx-1 transition-opacity ${showCaptions ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                      onClick={toggleCaptions}
                      aria-label={showCaptions ? "Desactivar subtítulos" : "Activar subtítulos"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect>
                        <path d="M7 12h2"></path>
                        <path d="M11 12h6"></path>
                        <path d="M7 16h10"></path>
                      </svg>
                    </button>

                    {/* Volumen con control deslizante */}
                    <div className="relative flex items-center justify-center mx-1">
                      <button
                        className={`flex items-center justify-center text-white h-8 w-8 transition-opacity ${!isMuted ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                        onClick={handleVolumeClick}
                        aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                      >
                        {isMuted ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <line x1="23" y1="9" x2="17" y2="15"></line>
                            <line x1="17" y1="9" x2="23" y2="15"></line>
                          </svg>
                        ) : volume > 0.5 ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                          </svg>
                        )}
                      </button>

                      {/* Control deslizante de volumen - Perfectamente alineado */}
                      <AnimatePresence>
                        {showVolumeControl && (
                          <motion.div
                            className="absolute bottom-10 left-1/2 -translate-x-1/2"
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            transition={{ duration: 0.15 }}
                          >
                            {/* Barra simple sin fondo ni bordes */}
                            <div className="relative h-16 flex items-center justify-center">
                              {/* Línea vertical */}
                              <div className="w-[2px] h-16 bg-[#C9A880]/20 rounded-full overflow-hidden">
                                {/* Nivel de volumen */}
                                <div
                                  className="absolute bottom-0 left-0 right-0 w-[2px] bg-[#C9A880]"
                                  style={{ height: `${volume * 100}%` }}
                                ></div>
                              </div>

                              {/* Slider invisible pero funcional */}
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="absolute inset-0 opacity-0 cursor-pointer w-8 -left-4"
                                style={{
                                  WebkitAppearance: 'slider-vertical',
                                  writingMode: 'vertical-rl',
                                }}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Ajustes */}
                    <button
                      className={`text-white mx-1 transition-opacity ${showSettings ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                      onClick={toggleSettings}
                      aria-label="Ajustes"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Pantalla completa - con icono mejorado */}
                    <button
                      className={`text-white mx-1 transition-opacity ${isFullscreen ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                      onClick={toggleFullscreen}
                      aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                    >
                      {isFullscreen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Menú de ajustes */}
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      className="absolute bottom-12 right-3 bg-black/90 border border-[#C9A880]/20 rounded-lg p-3 shadow-lg w-48"
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      transition={{ duration: 0.2 }}
                      onClick={(e) => e.stopPropagation()} // Evitar que clics dentro del menú lo cierren
                    >
                      <div className="text-white text-xs font-medium mb-2">Ajustes</div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-white/80 text-xs">Velocidad</span>
                          <select
                            className="bg-[#333] text-white text-xs rounded px-2 py-1"
                            onChange={(e) => {
                              if (videoRef.current) {
                                videoRef.current.playbackRate = parseFloat(e.target.value);
                              }
                            }}
                            defaultValue="1"
                          >
                            <option value="0.5">0.5x</option>
                            <option value="0.75">0.75x</option>
                            <option value="1">Normal</option>
                            <option value="1.25">1.25x</option>
                            <option value="1.5">1.5x</option>
                            <option value="2">2x</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/80 text-xs">Calidad</span>
                          <select
                            className="bg-[#333] text-white text-xs rounded px-2 py-1"
                            defaultValue="auto"
                          >
                            <option value="auto">Auto</option>
                            <option value="1080p">1080p</option>
                            <option value="720p">720p</option>
                            <option value="480p">480p</option>
                            <option value="360p">360p</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/80 text-xs">Subtítulos</span>
                          <button
                            className={`text-xs px-2 py-1 rounded ${showCaptions ? 'bg-[#C9A880] text-black' : 'bg-[#333] text-white'}`}
                            onClick={toggleCaptions}
                          >
                            {showCaptions ? "Activados" : "Desactivados"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Form - larger and with more impact */}
      <section id="newsletter-form" className="relative pt-32 pb-16 mt-0 bg-[#080604] border-t border-[#C9A880]/15">
        {/* Fondo con degradado sutil basado en el color principal pero muy oscurecido */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0806] to-[#050302] z-10"></div>

        {/* Efecto de iluminación del color principal */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#C9A880]/8 blur-[120px] z-5"></div>

        {/* Contenido */}
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          {/* Banner de "Spots limitados" destacado - Con estilo de la plataforma */}
          <div className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-[#C9A880] to-[#A78355] text-black rounded-full font-medium text-sm mb-8 mx-auto shadow-lg border border-[#C9A880]/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            ¡OJO! SOLO 200 PLAZAS PARA MIEMBROS FUNDADORES
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Únete a la <span className="bg-gradient-to-r from-[#C9A880] to-[#A78355] bg-clip-text text-transparent">waitlist</span>
          </h1>

          <p className="text-white/80 max-w-2xl mx-auto mb-10">
            <span className="text-[#C9A880] font-medium">Conviértete en miembro fundador</span> de nuestra Comunidad de Maestría en IA y bloquea tu precio especial de early adopter ¡para siempre! 🔥

            <br /><br />

            Apúntate <span className="text-[#C9A880] font-medium">gratis a la lista de espera</span>, reserva tu plaza y te avisaré personalmente cuando abramos las puertas. Las plazas son limitadas y los primeros tienen ventajas exclusivas.

            <br /><br />

            Conmigo aprenden arquitectos, programadores, empresarios, diseñadores, médicos, abogados...
            Personas que buscan <span className="text-[#C9A880] font-medium">resultados REALES con la IA</span>, no teorías vacías.
          </p>

          {/* Subscription Form - Elegante con color principal muy oscuro */}
          <div className="bg-gradient-to-b from-[#161310]/90 to-[#0c0a06]/95 backdrop-blur-md p-8 rounded-3xl border border-[#C9A880]/25 hover:border-[#C9A880]/40 shadow-lg max-w-2xl mx-auto space-y-6 transition-all duration-300">
            <NewsletterAvatarCircles className="mb-2" />

            {errorMessage && (
              <div className="text-red-400 bg-red-500/10 p-4 rounded-lg text-sm border border-red-500/20 text-center animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto mb-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errorMessage}
              </div>
            )}

            <Input
              type="text"
              placeholder="Tu nombre aquí"
              className="w-full p-5 h-14 rounded-lg bg-[#13110d] text-white border-[#C9A880]/30 focus:border-[#C9A880]/70 focus:ring-[#C9A880]/15 placeholder:text-[#C9A880]/40 text-base transition-all duration-300"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              type="email"
              placeholder="Tu MEJOR email"
              className="w-full p-5 h-14 rounded-lg bg-[#13110d] text-white border-[#C9A880]/30 focus:border-[#C9A880]/70 focus:ring-[#C9A880]/15 placeholder:text-[#C9A880]/40 text-base transition-all duration-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="flex items-start space-x-3 text-left p-3">
              <div className="relative flex mt-1">
                <input
                  type="checkbox"
                  className="sr-only"
                  id="privacy"
                  checked={accepted}
                  onChange={() => setAccepted(!accepted)}
                />
                <div className={`w-5 h-5 rounded border transition-all duration-300 ${accepted ? 'bg-[#C9A880] border-[#C9A880]' : 'border-[#C9A880]/40 bg-black/30'} flex items-center justify-center`}>
                  {accepted && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-black" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <label htmlFor="privacy" className="text-base text-white/90 cursor-pointer">
                He leído y acepto la <Link href="#" className="text-[#C9A880] hover:underline font-medium">política de cookies</Link> y <Link href="#" className="text-[#C9A880] hover:underline font-medium">privacidad</Link>.
              </label>
            </div>

            <div className="pt-2">
              {isSuccess ? (
                <div className="text-green-400 bg-green-500/10 p-5 rounded-lg border border-green-500/30 flex items-center flex-col">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-base font-medium">¡PERFECTO! Hemos guardado tu email. Te avisaremos cuando abramos las puertas de la comunidad. Pasa un gran día.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <RainbowButtonDemo
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full py-3.5 transform transition-transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span className="text-lg font-medium flex items-center justify-center">
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          ENVIANDO...
                        </>
                      ) : (
                        <>
                          ¡QUIERO SER MIEMBRO FUNDADOR!
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </>
                      )}
                    </span>
                  </RainbowButtonDemo>
                  <div className="px-4 py-3 bg-[#C9A880]/10 rounded-lg border border-[#C9A880]/20">
                    <p className="text-xs text-[#C9A880] text-center font-medium">
                      Acceso prioritario · Recursos EXCLUSIVOS · Precio especial GARANTIZADO para siempre
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
