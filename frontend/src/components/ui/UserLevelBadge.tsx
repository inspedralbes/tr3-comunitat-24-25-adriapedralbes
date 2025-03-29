import React, { useState } from 'react';

import { cn } from '@/lib/utils';
import { User } from '@/types';

interface UserLevelBadgeProps {
  user?: User;
  level?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTooltip?: boolean;
}

export default function UserLevelBadge({
  user,
  level,
  size = 'md',
  className,
  showTooltip = true
}: UserLevelBadgeProps) {
  // Estado para controlar el tooltip
  const [isHovering, setIsHovering] = useState(false);
  
  // Si no se proporciona directamente el nivel, usar del usuario o el valor por defecto 1
  const userLevel = level || user?.level || 1;
  
  // Datos de niveles simplificados (en lugar de fetchearlos)
  const levels = {
    1: { title: 'Novato', badge_color: 'bg-gray-500' },
    2: { title: 'Aprendiz', badge_color: 'bg-green-500' },
    3: { title: 'Participante', badge_color: 'bg-blue-500' },
    4: { title: 'Contribuidor', badge_color: 'bg-indigo-500' },
    5: { title: 'Experto', badge_color: 'bg-purple-500' },
    6: { title: 'Especialista', badge_color: 'bg-pink-500' },
    7: { title: 'Maestro', badge_color: 'bg-red-500' },
    8: { title: 'Gurú', badge_color: 'bg-yellow-500' },
    9: { title: 'Leyenda', badge_color: 'bg-amber-500' },
    10: { title: 'Visionario', badge_color: 'bg-orange-500' }
  };

  // Tamaño del badge según la prop
  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-7 h-7 text-sm',
    lg: 'w-9 h-9 text-base font-bold'
  };

  // Obtener el color del badge según el nivel
  const getBadgeColor = (level: number) => {
    return levels[level as keyof typeof levels]?.badge_color || 'bg-blue-500';
  };

  // Obtener el título del nivel
  const getLevelTitle = (level: number) => {
    return levels[level as keyof typeof levels]?.title || `Nivel ${level}`;
  };

  // Si no hay nivel disponible, mostrar un placeholder
  if (!userLevel) {
    return (
      <div
        className={cn(
          'rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
          sizeClasses[size],
          className
        )}
      >
        ?
      </div>
    );
  }

  const badge = (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-white shadow-sm',
        getBadgeColor(userLevel),
        sizeClasses[size],
        'border-2 border-white dark:border-gray-800',
        'transition-transform hover:scale-110',
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {userLevel}
      
      {/* Simple tooltip */}
      {showTooltip && isHovering && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/75 text-white text-xs rounded whitespace-nowrap z-50">
          <p className="font-medium">{getLevelTitle(userLevel)}</p>
        </div>
      )}
    </div>
  );

  // Si no quiere mostrar el tooltip, retornar solo el badge
  if (!showTooltip) {
    return badge;
  }

  // Con el tooltip simple
  return badge;
}
