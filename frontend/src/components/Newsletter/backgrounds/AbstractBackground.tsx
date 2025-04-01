"use client";

import { useEffect, useRef } from 'react';

interface GradientBlob {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
  speedX: number;
  speedY: number;
}

export function AbstractBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<GradientBlob[]>([]);
  const animationRef = useRef<number | null>(null);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initBlobs();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  };

  const initBlobs = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const blobsCount = 5; // Número de gradientes difuminados
    const blobs: GradientBlob[] = [];
    
    // Colores en formato RGB (sin alfa) basados en el esquema de color dorado/sepia de la plataforma
    const colors = [
      { r: 201, g: 168, b: 128 }, // Dorado claro
      { r: 167, g: 131, b: 85 },  // Dorado medio
      { r: 120, g: 100, b: 70 },  // Dorado oscuro
      { r: 120, g: 60, b: 20 },   // Ámbar oscuro
      { r: 50, g: 30, b: 10 }     // Marrón muy oscuro
    ];

    for (let i = 0; i < blobsCount; i++) {
      const colorObj = colors[Math.floor(Math.random() * colors.length)];
      const baseOpacity = 0.05 + Math.random() * 0.05;
      const color = `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${baseOpacity})`;
      
      const radius = Math.random() * (canvas.width / 3) + (canvas.width / 5);
      blobs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: radius,
        color: color,
        opacity: baseOpacity,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15
      });
    }

    blobsRef.current = blobs;
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const blobs = blobsRef.current;

    // Limpia el canvas con un fondo transparente
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibuja cada gradiente difuminado
    blobs.forEach(blob => {
      // Actualiza posición
      blob.x += blob.speedX;
      blob.y += blob.speedY;

      // Rebota en los bordes
      if (blob.x < -blob.radius || blob.x > canvas.width + blob.radius) {
        blob.speedX *= -1;
      }
      if (blob.y < -blob.radius || blob.y > canvas.height + blob.radius) {
        blob.speedY *= -1;
      }

      // Dibuja el gradiente radial
      const gradient = ctx.createRadialGradient(
        blob.x, blob.y, 0,
        blob.x, blob.y, blob.radius
      );
      
      // Color del centro a transparente en los bordes
      gradient.addColorStop(0, blob.color); // Ya tiene la opacidad correcta
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
      ctx.fill();
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
    />
  );
}
