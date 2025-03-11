import { User } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

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
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-shrink-0 self-start">
        <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={username}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="text-zinc-400" size={20} />
          )}
        </div>
        {level && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white border border-zinc-900 z-10">
            {level}
          </div>
        )}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium">{username}</span>
          <span className="text-xs text-zinc-400">{timestamp}</span>
          {category && (
            <>
              <span className="text-zinc-400 text-xs">in</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColor}`}>
                {category}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};