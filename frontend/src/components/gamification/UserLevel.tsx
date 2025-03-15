import React from 'react';
import { Progress } from "@/components/ui/progress";
import { useQuery } from 'react-query';
import { gamificationService } from '@/services/gamification';
import { User } from '@/types/user';

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
  // Si se pasa un usuario, mostrar su info de nivel directamente
  // Si no, consultar la info del usuario actual
  const { data: progression, isLoading } = useQuery(
    ['userProgression'],
    gamificationService.getUserProgression,
    { 
      enabled: !user,
      refetchOnWindowFocus: false
    }
  );

  const level = user?.level || progression?.current_level || 1;
  const points = user?.points || progression?.current_points || 0;
  const nextLevelPoints = progression?.next_level_points || 100;
  const pointsNeeded = progression?.points_needed || 100;
  const progressPercentage = progression?.progress_percentage || 0;
  const maxLevelReached = progression?.max_level_reached || false;

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

  if (isLoading && !user) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="h-2 w-16 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

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
