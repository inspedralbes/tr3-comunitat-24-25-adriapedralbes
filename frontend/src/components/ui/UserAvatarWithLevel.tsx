import React from 'react';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar-temp';
import UserLevelBadge from '@/components/ui/UserLevelBadge';
import { cn } from '@/lib/utils';

interface UserAvatarWithLevelProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showLevel?: boolean;
  levelPosition?: 'top-right' | 'bottom-right' | 'bottom-left';
}

export default function UserAvatarWithLevel({
  user,
  size = 'md',
  className,
  showLevel = true,
  levelPosition = 'bottom-right'
}: UserAvatarWithLevelProps) {
  // Determinar tamaños según la prop size
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-20 w-20'
  };

  const levelSizes = {
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'lg'
  } as const;

  // Posiciones del badge de nivel
  const positionClasses = {
    'top-right': '-top-1 -right-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1'
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <Avatar className={cn(sizeClasses[size])}>
        <AvatarImage src={user.avatar_url || undefined} alt={user.username || 'User'} />
        <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
          {user.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
        </AvatarFallback>
      </Avatar>
      
      {showLevel && (
        <div className={cn('absolute block', positionClasses[levelPosition])}>
          <UserLevelBadge
            user={user}
            size={levelSizes[size]}
          />
        </div>
      )}
    </div>
  );
}
