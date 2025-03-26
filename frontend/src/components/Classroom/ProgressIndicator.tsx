"use client";

import React from 'react';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';
import ProgressBar from '../ui/progress-bar';

interface ProgressIndicatorProps {
  progress: number;
  lessonsCount: number;
  completedLessons: number;
  estimatedHours?: number;
  variant?: 'compact' | 'detailed';
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  lessonsCount,
  completedLessons,
  estimatedHours = 0,
  variant = 'compact',
  className = '',
}) => {
  // Asegurarnos de que tenemos valores válidos
  const safeProgress = progress || 0;
  const safeLessonsCount = lessonsCount || 0;
  const safeCompletedLessons = completedLessons || 0;
  
  // Determinar colores según el progreso
  const getProgressColor = (): 'blue' | 'green' | 'amber' => {
    if (safeProgress >= 100) return 'green';
    if (safeProgress >= 50) return 'blue';
    return 'amber';
  };

  if (variant === 'compact') {
    return (
      <div className={`${className}`}>
        <ProgressBar 
          progress={safeProgress} 
          colorScheme={getProgressColor()} 
          height="sm" 
          animate={true} 
        />
      </div>
    );
  }

  return (
    <div className={`bg-[#272726] rounded-lg p-4 ${className}`}>
      <div className="mb-3">
        <ProgressBar 
          progress={safeProgress} 
          colorScheme={getProgressColor()} 
          height="md" 
          animate={true} 
        />
      </div>
      
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-zinc-400" />
          <span className="text-zinc-300">{safeLessonsCount} lecciones</span>
        </div>
        
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-green-500" />
          <span className="text-zinc-300">
            {safeCompletedLessons} de {safeLessonsCount} completadas
          </span>
        </div>
        
        {estimatedHours > 0 && (
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-zinc-400" />
            <span className="text-zinc-300">{estimatedHours}h estimadas</span>
          </div>
        )}
      </div>
      
      {safeProgress === 100 ? (
        <div className="mt-3 text-sm text-green-400">
          ¡Completaste todas las lecciones de este curso!
        </div>
      ) : safeProgress > 0 ? (
        <div className="mt-3 text-sm text-blue-400">
          ¡Continúa con tu progreso!
        </div>
      ) : (
        <div className="mt-3 text-sm text-zinc-400">
          Comienza con este curso
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;
