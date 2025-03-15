interface UserAchievementsProps {
  userId?: string;
  limit?: number;
  showAll?: boolean;
  className?: string;
}import React from 'react';
import { formatDistanceToNow } from 'date-fns';

// Definimos nuestros propios tipos localmente
interface UserAchievementData {
  id: number;
  name: string;
  description: string;
  icon: string;
  badge_color: string;
  points_reward: number;
  unlocked_at: string;
}

const UserAchievements: React.FC<UserAchievementsProps> = ({
  userId,
  limit = 5,
  showAll = false,
  className = ''
}) => {
  // Datos mock de logros (en lugar de hacer fetch)
  const mockData = {
    achievements: [
      {
        id: 1,
        name: 'Primer Post',
        description: 'Has creado tu primer post en la comunidad',
        icon: 'chat-bubble',
        badge_color: 'bg-green-500',
        points_reward: 20,
        unlocked_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Primera Apreciación',
        description: 'Recibiste tu primer like',
        icon: 'thumb-up',
        badge_color: 'bg-yellow-500',
        points_reward: 10,
        unlocked_at: new Date(Date.now() - 86400000).toISOString() // 1 día atrás
      },
      {
        id: 3,
        name: 'Primer Comentario',
        description: 'Has dejado tu primer comentario',
        icon: 'chat',
        badge_color: 'bg-blue-500',
        points_reward: 15,
        unlocked_at: new Date(Date.now() - 172800000).toISOString() // 2 días atrás
      }
    ]
  };
  
  const data = mockData;
  const isLoading = false;
  const error = false;

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !data?.achievements) {
    return (
      <div className={`text-center p-4 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">No se pudieron cargar los logros</p>
      </div>
    );
  }

  // Si no hay logros
  if (data.achievements.length === 0) {
    return (
      <div className={`text-center p-4 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">No hay logros desbloqueados todavía</p>
      </div>
    );
  }

  // Filtrar y limitar logros si es necesario
  const achievements = showAll 
    ? data.achievements 
    : data.achievements.slice(0, limit);

  return (
    <div className={`space-y-3 ${className}`}>
      {achievements.map((achievement: UserAchievementData) => (
        <div key={achievement.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${achievement.badge_color}`}>
            <span className="text-lg">🏆</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{achievement.name}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">{achievement.description}</p>
            <div className="flex items-center mt-1">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                +{achievement.points_reward} puntos
              </span>
              <span className="mx-1 text-gray-300 dark:text-gray-600">•</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(achievement.unlocked_at), { 
                  addSuffix: true
                })}
              </span>
            </div>
          </div>
        </div>
      ))}
      
      {!showAll && data.achievements.length > limit && (
        <div className="text-center pt-2">
          <button 
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            onClick={() => {/* Implementar lógica para mostrar todos los logros */}}
          >
            Ver todos los logros ({data.achievements.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default UserAchievements;
