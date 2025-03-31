'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ width = 96, height = 96, className = "" }: LogoProps) {
  const [fallbackToImg, setFallbackToImg] = useState(false);
  
  // If the image fails to load with Next.js Image, fall back to regular img tag
  return fallbackToImg ? (
    <img 
      src="/logo_futurprive_sinfondo.png" 
      alt="FuturPrive Logo" 
      width={width}
      height={height}
      className={className}
    />
  ) : (
    <Image 
      src="/logo_futurprive_sinfondo.png" 
      alt="FuturPrive Logo" 
      width={width}
      height={height}
      className={className}
      priority
      unoptimized={true}
      onError={() => setFallbackToImg(true)}
    />
  );
}
