import React from 'react';

import { Progress } from "@/components/ui/progress";

interface LevelProgressBarProps {
  showNextLevel?: boolean;
  className?: string;
}

const LevelProgressBar: React.FC<LevelProgressBarProps> = ({
  showNextLevel = true,
  className = ''
}) => {
  // En lugar de fetch, usamos datos estáticos de ejemplo
  const mockData = {
    current_level: 3,
    current_points: 245,
    next_level: 4,
    next_level_points: 400,
    points_needed: 155,
    progress_percentage: 61,
    next_level_info: {
      title: 'Contribuidor',
      description: 'Has alcanzado el nivel 4',
      badge_color: 'bg-indigo-500',
      icon: 'rocket'
    },
    max_level_reached: false
  };
  
  const data = mockData;
  const isLoading = false;
  const error = false;

  if (isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex justify-between items-center">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`text-center py-2 ${className}`}>
        <p className="text-sm text-gray-500">No se pudo cargar la información de nivel</p>
      </div>
    );
  }

  // Si el usuario ha alcanzado el nivel máximo
  if (data.max_level_reached) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-yellow-100 dark:bg-yellow-900 rounded-md">
              <span className="text-yellow-500 dark:text-yellow-300">🏆</span>
            </div>
            <span className="text-sm font-medium">¡Nivel máximo alcanzado!</span>
          </div>
        </div>
        <Progress value={100} max={100} className="h-2" />
      </div>
    );
  }

  // Función para obtener el color según el nivel
  const getLevelColor = (level: number) => {
    const colors: Record<number, string> = {
      1: 'bg-gray-500',
      2: 'bg-green-500',
      3: 'bg-blue-500',
      4: 'bg-indigo-500',
      5: 'bg-purple-500',
      6: 'bg-pink-500',
      7: 'bg-red-500',
      8: 'bg-yellow-500',
      9: 'bg-amber-500',
      10: 'bg-orange-500',
    };
    return colors[level] || 'bg-blue-500';
  };

  // Determinar si el texto debe ser negro (para fondos claros)
  const getTextColor = (level: number) => {
    return level === 8 || level === 9 ? 'text-black' : 'text-white';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <div className="flex items-center space-x-2">
          <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${getLevelColor(data.current_level)} ${getTextColor(data.current_level)}`}>
            {data.current_level}
          </div>
          <span className="text-gray-500 dark:text-gray-400">{data.current_points} pts</span>
        </div>
        
        {showNextLevel && data.next_level && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-gray-400">{data.next_level_points} pts</span>
            <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${getLevelColor(data.next_level)} ${getTextColor(data.next_level)} opacity-60`}>
              {data.next_level}
            </div>
          </div>
        )}
      </div>
      
      <Progress 
        value={data.progress_percentage} 
        max={100} 
        className={`h-2 w-full bg-gray-200 dark:bg-gray-700 ${getLevelColor(data.current_level).replace('bg-', 'text-')}`}
      />
      
      {showNextLevel && data.next_level_info && (
        <div className="text-xs text-center text-gray-500 dark:text-gray-400">
          {data.points_needed} puntos para alcanzar <span className="font-medium">{data.next_level_info.title}</span>
        </div>
      )}
    </div>
  );
};

export default LevelProgressBar;
