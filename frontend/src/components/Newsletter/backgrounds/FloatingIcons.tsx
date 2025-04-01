"use client";

import { useEffect, useRef } from 'react';

interface FloatingObject {
  x: number;
  y: number;
  size: number;
  speed: number;
  shape: 'circle' | 'square' | 'triangle' | 'diamond';
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export function FloatingIcons() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const objectsRef = useRef<FloatingObject[]>([]);
  const animationRef = useRef<number | null>(null);
  
  // Lista de formas simples para mejor rendimiento
  const shapes = ['circle', 'square', 'triangle', 'diamond'];

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initObjects();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  };

  const initObjects = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const objectsCount = 15; // Número de iconos flotantes
    const objects: FloatingObject[] = [];

    for (let i = 0; i < objectsCount; i++) {
      objects.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 25 + Math.random() * 40, // Tamaño entre 25 y 65px
        speed: 0.2 + Math.random() * 0.3, // Velocidad entre 0.2 y 0.5
        shape: shapes[Math.floor(Math.random() * shapes.length)] as 'circle' | 'square' | 'triangle' | 'diamond',
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 0.5,
        opacity: 0.1 + Math.random() * 0.15 // Opacidad entre 0.1 y 0.25
      });
    }

    objectsRef.current = objects;
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const objects = objectsRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibuja cada icono flotante
    objects.forEach(obj => {
      ctx.save();
      
      // Mueve el objeto
      obj.y -= obj.speed;
      if (obj.y < -obj.size) {
        obj.y = canvas.height + obj.size;
        obj.x = Math.random() * canvas.width;
      }

      // Aplica rotación
      obj.rotation += obj.rotationSpeed;
      ctx.translate(obj.x, obj.y);
      ctx.rotate((obj.rotation * Math.PI) / 180);
      
      // Aplica opacidad
      ctx.globalAlpha = obj.opacity;
      ctx.fillStyle = '#C9A880'; // Color dorado para los iconos (similar al de la plataforma)
      
      // Dibuja la forma según el tipo
      switch(obj.shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, obj.size / 3, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'square':
          const size = obj.size / 3;
          ctx.fillRect(-size / 2, -size / 2, size, size);
          break;
          
        case 'triangle':
          const triangleSize = obj.size / 3;
          ctx.beginPath();
          ctx.moveTo(0, -triangleSize / 2);
          ctx.lineTo(triangleSize / 2, triangleSize / 2);
          ctx.lineTo(-triangleSize / 2, triangleSize / 2);
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'diamond':
          const diamondSize = obj.size / 3;
          ctx.beginPath();
          ctx.moveTo(0, -diamondSize / 2);
          ctx.lineTo(diamondSize / 2, 0);
          ctx.lineTo(0, diamondSize / 2);
          ctx.lineTo(-diamondSize / 2, 0);
          ctx.closePath();
          ctx.fill();
          break;
      }

      ctx.restore();
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const cleanup = initCanvas();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cleanup?.();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  );
}
