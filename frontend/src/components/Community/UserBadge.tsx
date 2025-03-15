import { User } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import Link from 'next/link';
import UserLevelBadge from '@/components/ui/UserLevelBadge';

interface UserBadgeProps {
  username: string;
  level?: number;
  avatarUrl?: string;
  timestamp: string;
  category?: string;
  categoryColor?: string;
}

export const UserBadge: React.FC<UserBadgeProps> = ({
  username,
  level,
  avatarUrl,
  timestamp,
  category,
  categoryColor = 'bg-zinc-700'
}) => {
  // Formatear la URL del avatar
  const formattedAvatarUrl = avatarUrl && !avatarUrl.startsWith('http') 
    ? `http://127.0.0.1:8000${avatarUrl}` 
    : avatarUrl;

  return (
    <div className="flex items-center gap-2">
      <Link 
        href={`/profile/${username}`} 
        onClick={(e) => e.stopPropagation()} 
        className="relative flex-shrink-0 self-start group"
      >
        <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden border-2 border-zinc-800 transition-all duration-200 group-hover:border-blue-500 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.4)]">
          {formattedAvatarUrl ? (
            <Image
              src={formattedAvatarUrl}
              alt={username}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              unoptimized={true}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400">
              <User size={20} />
            </div>
          )}
        </div>
        
        {/* Badge de nivel con efecto de brillo en hover */}
        <div className="absolute -bottom-1 -right-1 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12">
          <UserLevelBadge level={level} size="sm" showTooltip={true} />
        </div>
      </Link>
      
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link 
            href={`/profile/${username}`}
            onClick={(e) => e.stopPropagation()}
            className="font-medium hover:text-blue-400 transition-colors"
          >
            {username}
          </Link>
          
          <span className="text-xs text-zinc-400">{timestamp}</span>
          
          {category && (
            <div className="flex items-center gap-1">
              <span className="text-zinc-400 text-xs">in</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColor} font-medium`}>
                {category}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};