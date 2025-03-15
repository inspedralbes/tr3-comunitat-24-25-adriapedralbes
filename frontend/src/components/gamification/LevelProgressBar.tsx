import React, { useState, useEffect } from 'react';
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

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Nivel {data.current_level}</span>
          <span className="text-gray-500 dark:text-gray-400">{data.current_points} pts</span>
        </div>
        
        {showNextLevel && data.next_level && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-gray-400">{data.next_level_points} pts</span>
            <span className="font-medium">Nivel {data.next_level}</span>
          </div>
        )}
      </div>
      
      <Progress 
        value={data.progress_percentage} 
        max={100} 
        className="h-2 w-full bg-gray-200 dark:bg-gray-700"
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
