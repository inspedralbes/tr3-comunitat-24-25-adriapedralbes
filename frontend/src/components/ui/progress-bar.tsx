"use client";

import React from 'react';

interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  height?: 'sm' | 'md' | 'lg';
  colorScheme?: 'blue' | 'green' | 'amber';
  animate?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showPercentage = true,
  height = 'sm',
  colorScheme = 'blue',
  animate = true,
  className = '',
}) => {
  // Asegurar que el progreso esté entre 0 y 100
  const safeProgress = Math.min(Math.max(progress || 0, 0), 100);
  
  // Mapear altura a clases
  const heightClass = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }[height];
  
  // Mapear esquema de color a clases
  const colorClass = {
    blue: 'bg-blue-600',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
  }[colorScheme];
  
  // Clases para animación
  const animationClass = animate ? 'transition-all duration-300 ease-out' : '';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex-1 bg-[#1F1F1E] rounded-full ${heightClass} overflow-hidden`}>
        <div
          className={`${colorClass} ${heightClass} rounded-full ${animationClass}`}
          style={{ width: `${safeProgress}%` }}
        ></div>
      </div>
      
      {showPercentage && (
        <div className="flex items-center gap-1">
          <span className="text-zinc-400 text-xs w-7 text-right">{safeProgress}</span>
          <span className="text-zinc-500 text-xs">%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
