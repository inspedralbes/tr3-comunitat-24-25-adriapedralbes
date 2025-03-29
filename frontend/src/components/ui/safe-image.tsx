"use client";

import Image, { ImageProps } from 'next/image';
import React from 'react';
import { normalizeImageUrl } from '@/utils/imageUtils';

type SafeImageProps = ImageProps & {
  // Opcional: un flag para forzar unoptimized incluso en imágenes que no son locales
  forceUnoptimized?: boolean;
};

/**
 * Componente seguro de imágenes que desactiva automáticamente la optimización
 * para imágenes locales servidas desde el backend de Django y normaliza las URLs
 */
export const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  alt, 
  forceUnoptimized = false,
  unoptimized,
  ...props 
}) => {
  // Normalizar la URL de la imagen
  const normalizedSrc = typeof src === 'string' ? normalizeImageUrl(src) || src : src;
  
  // Si ya vino con unoptimized explícito, respetamos esa configuración
  if (unoptimized !== undefined) {
    return <Image src={normalizedSrc} alt={alt} unoptimized={unoptimized} {...props} />;
  }
  
  // Verificar si la URL es local (contiene localhost o 127.0.0.1)
  const srcString = typeof normalizedSrc === 'string' ? normalizedSrc : '';
  const isLocalBackendUrl = srcString.includes('127.0.0.1') || srcString.includes('localhost');
  
  // Desactivar la optimización si es una URL local, si tiene dominio api.futurprive.com,
  // o si se forzó explícitamente
  const shouldDisableOptimization = 
    isLocalBackendUrl || 
    forceUnoptimized || 
    (typeof srcString === 'string' && (
      srcString.includes('api.futurprive.com') || 
      srcString.includes('/media/')
    ));
  
  return (
    <Image
      src={normalizedSrc}
      alt={alt}
      unoptimized={shouldDisableOptimization}
      {...props}
    />
  );
};

export default SafeImage;