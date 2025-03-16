"use client";

import { MessageCircle as _MessageCircle, ThumbsUp, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';


import { communityService } from '@/services/community';
import { formatAvatarUrl } from '@/utils/formatUtils';

interface UserActivity {
  id: string;
  type: 'comment' | 'like';
  content?: string;
  postId: string;
  postTitle: string;
  timestamp: string;
  author?: {
    username: string;
    level?: number;
    avatarUrl?: string;
    avatar_url?: string;
  };
  commentAuthor?: {
    username: string;
    level?: number;
    avatarUrl?: string;
    avatar_url?: string;
  };
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
          // Normalizar los datos de actividad para asegurar que los avatares están correctamente formateados
          const normalizedActivities = activityData.map(activity => {
            // Procesar el autor del comentario (usuario actual)
            if (activity.author) {
              activity.author = {
                ...activity.author,
                avatarUrl: activity.author.avatar_url || activity.author.avatarUrl
              };
            }
            
            // Procesar el autor del post comentado (si existe)
            if (activity.commentAuthor) {
              activity.commentAuthor = {
                ...activity.commentAuthor,
                avatarUrl: activity.commentAuthor.avatar_url || activity.commentAuthor.avatarUrl
              };
            }
            
            return activity;
          });
          
          setActivities(normalizedActivities);
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
            <div className="mt-1 relative">
              {activity.type === 'comment' ? (
                <Link 
                  href={`/perfil/${activity.author?.username || 'unknown'}`} 
                  onClick={(e) => e.stopPropagation()} 
                  className="relative flex-shrink-0 self-start group"
                >
                  <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden border border-zinc-800 transition-all duration-200 group-hover:border-blue-500">
                    {activity.author?.avatarUrl || activity.author?.avatar_url ? (
                      <Image
                        src={formatAvatarUrl(activity.author?.avatarUrl || activity.author?.avatar_url) || ''}
                        alt={activity.author?.username || 'Usuario'}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        unoptimized={true}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                  {activity.author?.level && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-zinc-900 z-10">
                      {activity.author.level}
                    </div>
                  )}
                </Link>
              ) : (
                <div className="relative w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center text-red-400">
                  <ThumbsUp size={16} />
                  {activity.author?.level && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-zinc-900 z-10">
                      {activity.author.level}
                    </div>
                  )}
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
              
              {/* Mostrar a quién pertenece el post que se dio like */}
              {activity.type === 'like' && activity.commentAuthor && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="relative w-6 h-6">
                    <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden border border-zinc-800">
                      {activity.commentAuthor.avatarUrl || activity.commentAuthor.avatar_url ? (
                        <Image
                          src={formatAvatarUrl(activity.commentAuthor.avatarUrl || activity.commentAuthor.avatar_url) || ''}
                          alt={activity.commentAuthor.username || 'Usuario'}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                          unoptimized={true}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <User size={12} />
                        </div>
                      )}
                    </div>
                    {activity.commentAuthor.level && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center text-[8px] font-bold text-white border border-zinc-900 z-10">
                        {activity.commentAuthor.level}
                      </div>
                    )}
                  </div>
                  <Link 
                    href={`/perfil/${activity.commentAuthor.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-zinc-400 hover:text-zinc-300"
                  >
                    Publicación de {activity.commentAuthor.username}
                  </Link>
                </div>
              )}
              
              {/* Mostrar autor del comentario cuando es un comentario */}
              {activity.type === 'comment' && activity.commentAuthor && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="relative w-6 h-6">
                    <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden border border-zinc-800">
                      {activity.commentAuthor.avatarUrl || activity.commentAuthor.avatar_url ? (
                        <Image
                          src={formatAvatarUrl(activity.commentAuthor.avatarUrl || activity.commentAuthor.avatar_url) || ''}
                          alt={activity.commentAuthor.username || 'Usuario'}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                          unoptimized={true}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <User size={12} />
                        </div>
                      )}
                    </div>
                    {activity.commentAuthor.level && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center text-[8px] font-bold text-white border border-zinc-900 z-10">
                        {activity.commentAuthor.level}
                      </div>
                    )}
                  </div>
                  <Link 
                    href={`/perfil/${activity.commentAuthor.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-zinc-400 hover:text-zinc-300"
                  >
                    Comentario en publicación de {activity.commentAuthor.username}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};