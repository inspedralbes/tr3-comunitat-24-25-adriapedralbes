import React from 'react';

import { Progress } from "@/components/ui/progress";
import { User } from '@/types/User';

interface UserLevelProps {
  user?: User;
  showPoints?: boolean;
  className?: string;
}

const UserLevel: React.FC<UserLevelProps> = ({ 
  user, 
  showPoints = false,
  className = ''
}) => {
  // Valores mock para demostración
  const mockProgression = {
    current_level: 3,
    current_points: 250,
    next_level_points: 400,
    points_needed: 150,
    progress_percentage: 60,
    max_level_reached: false
  };

  const level = user?.level || mockProgression.current_level || 1;
  const points = user?.points || mockProgression.current_points || 0;
  const _nextLevelPoints = mockProgression.next_level_points || 100;
  const pointsNeeded = mockProgression.points_needed || 100;
  const progressPercentage = mockProgression.progress_percentage || 0;
  const maxLevelReached = mockProgression.max_level_reached || false;

  // Aplicar colores según el nivel
  const getBadgeColor = (level: number) => {
    const colors: Record<number, string> = {
      1: 'bg-gray-500 text-white',
      2: 'bg-green-500 text-white',
      3: 'bg-blue-500 text-white',
      4: 'bg-indigo-500 text-white',
      5: 'bg-purple-500 text-white',
      6: 'bg-pink-500 text-white',
      7: 'bg-red-500 text-white',
      8: 'bg-yellow-500 text-black',
      9: 'bg-amber-500 text-black',
      10: 'bg-orange-500 text-white',
    };
    return colors[level] || 'bg-blue-500 text-white';
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center space-x-2 mb-1">
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${getBadgeColor(level)}`}>
          {level}
        </span>
        
        {showPoints && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {points} pts 
            {!maxLevelReached && ` • ${pointsNeeded} para nivel ${level + 1}`}
          </span>
        )}
      </div>
      
      {showPoints && !maxLevelReached && (
        <Progress 
          value={progressPercentage} 
          max={100} 
          className="h-1 w-full bg-gray-200 dark:bg-gray-700"
        />
      )}
    </div>
  );
};

export default UserLevel;
