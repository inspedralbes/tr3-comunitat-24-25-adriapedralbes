import React, { useEffect } from 'react';

interface ConfettiExplosionProps {
  force?: number;
  duration?: number;
  particleCount?: number;
  width?: number;
  colors?: string[];
}

export function ConfettiExplosion({
  force = 0.8,
  duration = 3000,
  particleCount = 80,
  width = 1000,
  colors = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d']
}: ConfettiExplosionProps) {
  // Implementación CSS simplificada de confeti
  useEffect(() => {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Crear partículas
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      
      // Propiedades de la partícula
      const size = Math.random() * 10 + 5; // 5-15px
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100; // 0-100%
      const animDuration = Math.random() * 3 + 2; // 2-5s
      
      // Posicionamiento y estilo
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        top: 0;
        left: ${left}%;
        transform: rotate(${Math.random() * 360}deg);
        opacity: 1;
        animation: confetti-fall ${animDuration}s linear forwards;
      `;
      
      container.appendChild(particle);
    }
    
    // Agregar animación al head si no existe
    if (!document.getElementById('confetti-style')) {
      const style = document.createElement('style');
      style.id = 'confetti-style';
      style.textContent = `
        @keyframes confetti-fall {
          0% {
            top: 0;
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            top: 100%;
            transform: translateY(0) rotate(720deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Limpiar después del tiempo especificado
    const timer = setTimeout(() => {
      if (container) container.innerHTML = '';
    }, duration);
    
    return () => {
      clearTimeout(timer);
      if (container) container.innerHTML = '';
    };
  }, [particleCount, colors, duration]);

  return (
    <div 
      id="confetti-container" 
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 10
      }}
    />
  );
}
