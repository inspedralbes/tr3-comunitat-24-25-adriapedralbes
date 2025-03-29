"use client";

import { Award, Flag, MessageCircle, ThumbsUp, User } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { UserProfile } from '@/services/auth';
import { normalizeAvatarUrl } from '@/utils/imageUtils';


interface ProfileHeaderProps {
  userProfile: UserProfile;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userProfile }) => {
  // Función para obtener el color del badge según el nivel
  const getBadgeColor = (level: number) => {
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

  const level = userProfile.level || 1;
  
  const avatarUrl = normalizeAvatarUrl(userProfile.avatar_url);

  return (
    <div className="bg-[#323230] rounded-lg p-6 border border-white/10 mb-6">
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Avatar y Nivel */}
        <div className="flex-shrink-0 relative">
          <div className="w-24 h-24 bg-[#444442] rounded-full overflow-hidden border-2 border-white/10">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={userProfile.username}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                unoptimized={true} // Siempre unoptimized para los avatares subidos
                onError={(e) => {
                  console.error('Error loading avatar:', avatarUrl);
                  (e.target as HTMLImageElement).onerror = null; // Prevenir llamadas recursivas
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center text-zinc-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                  `;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-300">
                <User size={40} />
              </div>
            )}
          </div>
          <div className={`absolute -bottom-2 -right-2 w-8 h-8 ${getBadgeColor(level)} rounded-full flex items-center justify-center text-sm font-bold ${getTextColor(level)} border-2 border-[#323230]`}>
            {level}
          </div>
        </div>

        {/* Información del usuario */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white mb-1">{userProfile.username}</h1>
          <p className="text-zinc-400 mb-3">
            {userProfile.first_name && userProfile.last_name
              ? `${userProfile.first_name} ${userProfile.last_name}`
              : userProfile.email}
          </p>

          {userProfile.bio && (
            <p className="text-zinc-300 mb-4">{userProfile.bio}</p>
          )}

          {/* Estadísticas */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1 text-zinc-300">
              <Award size={18} className="text-amber-400" />
              <span>
                <span className="font-semibold">{userProfile.points}</span> puntos
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-zinc-300">
              <ThumbsUp size={16} />
              <span>
                <span className="font-semibold">{userProfile.likes_received || 0}</span> likes recibidos
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-zinc-300">
              <Flag size={16} />
              <span>
                <span className="font-semibold">{userProfile.posts_count || 0}</span> posts
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-zinc-300">
              <MessageCircle size={16} />
              <span>
                <span className="font-semibold">{userProfile.comments_count || 0}</span> comentarios
              </span>
            </div>
          </div>
        </div>

        {/* Posición en el ranking */}
        <div className="flex flex-col items-center bg-[#444442] p-4 rounded-lg border border-white/10">
          <div className="text-2xl font-bold text-white">#{userProfile.position || '-'}</div>
          <div className="text-sm text-zinc-400">Ranking</div>
        </div>
      </div>
    </div>
  );
};