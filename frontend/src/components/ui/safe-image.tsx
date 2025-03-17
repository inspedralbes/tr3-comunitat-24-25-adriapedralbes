"use client";

import Image, { ImageProps } from 'next/image';
import React from 'react';

type SafeImageProps = ImageProps & {
  // Opcional: un flag para forzar unoptimized incluso en imágenes que no son locales
  forceUnoptimized?: boolean;
};

/**
 * Componente seguro de imágenes que desactiva automáticamente la optimización
 * para imágenes locales servidas desde el backend de Django
 */
export const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  alt, 
  forceUnoptimized = false,
  unoptimized,
  ...props 
}) => {
  // Si ya vino con unoptimized explícito, respetamos esa configuración
  if (unoptimized !== undefined) {
    return <Image src={src} alt={alt} unoptimized={unoptimized} {...props} />;
  }
  
  // Verificar si la URL es local (contiene localhost o 127.0.0.1)
  const srcString = typeof src === 'string' ? src : '';
  const isLocalBackendUrl = srcString.includes('127.0.0.1') || srcString.includes('localhost');
  
  // Desactivar la optimización si es una URL local o si se forzó explícitamente
  const shouldDisableOptimization = isLocalBackendUrl || forceUnoptimized;
  
  return (
    <Image
      src={src}
      alt={alt}
      unoptimized={shouldDisableOptimization}
      {...props}
    />
  );
};

export default SafeImage;