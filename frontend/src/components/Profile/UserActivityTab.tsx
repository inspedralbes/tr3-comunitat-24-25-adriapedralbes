"use client";

import { MessageCircle, ThumbsUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { communityService } from '@/services/community';

interface UserActivity {
  id: string;
  type: 'comment' | 'like';
  content?: string;
  postId: string;
  postTitle: string;
  timestamp: string;
}

interface UserActivityTabProps {
  userId: string;
}

export const UserActivityTab: React.FC<UserActivityTabProps> = ({ userId }) => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserActivity = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Intentar obtener la actividad del usuario
        const activityData = await communityService.getUserActivity(userId);
        if (Array.isArray(activityData)) {
          setActivities(activityData);
        } else {
          // Si no hay datos o hay un error, usar datos de ejemplo
          console.warn('No se pudieron obtener datos de actividad, usando datos de ejemplo');
          setActivities([
            {
              id: '1',
              type: 'comment',
              content: 'Este es un comentario de ejemplo',
              postId: 'post1',
              postTitle: 'Título del post 1',
              timestamp: 'hace 2 días'
            },
            {
              id: '2',
              type: 'like',
              postId: 'post2',
              postTitle: 'Título del post 2',
              timestamp: 'hace 3 días'
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching user activity:', err);
        setError('No se pudo cargar la actividad del usuario.');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserActivity();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#323230] rounded-lg p-4 border border-white/10 h-16" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-[#323230] rounded-lg p-6 border border-white/10 text-center">
        <p className="text-zinc-400">No hay actividad reciente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="bg-[#323230] rounded-lg p-4 border border-white/10">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              {activity.type === 'comment' ? (
                <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-400">
                  <MessageCircle size={16} />
                </div>
              ) : (
                <div className="w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center text-red-400">
                  <ThumbsUp size={16} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <span className="text-zinc-300 font-medium">
                  {activity.type === 'comment' ? 'Comentaste en' : 'Te gustó el post'}
                </span>
                <span className="mx-1 text-zinc-500">·</span>
                <span className="text-zinc-400 text-sm">{activity.timestamp}</span>
              </div>
              <div className="text-white font-medium mb-1">
                {activity.postTitle}
              </div>
              {activity.type === 'comment' && activity.content && (
                <div className="bg-[#252524] rounded-lg p-2 text-sm text-zinc-300 mt-2">
                  {activity.content}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};