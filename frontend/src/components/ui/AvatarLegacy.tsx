import Image from 'next/image';
import React from 'react';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt, 
  size = 32,
  className = ''
}) => {
  // Crear una URL para un avatar generado si no hay src
  const avatarUrl = src || `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=random&size=${size}`;
  
  // Determinar si es una URL externa (comienza con http o https)
  const isExternalUrl = avatarUrl.startsWith('http');
  
  return (
    <div 
      className={`overflow-hidden ${className}`}
      style={{ width: size, height: size, borderRadius: '50%' }}
    >
      <Image
        src={avatarUrl}
        alt={alt}
        width={size}
        height={size}
        className="w-full h-full object-cover"
        unoptimized={process.env.NODE_ENV === 'development' && isExternalUrl}
      />
    </div>
  );
};

export default Avatar;