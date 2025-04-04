import { User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import UserLevelBadge from '@/components/ui/UserLevelBadge';

import { formatPostDate } from '@/utils/dateUtils';
import { formatAvatarUrl } from '@/utils/formatUtils';

interface CommentUserBadgeProps {
    username: string;
    level?: number;
    avatarUrl?: string;
    timestamp: string;
}

export const CommentUserBadge: React.FC<CommentUserBadgeProps> = ({
    username,
    level,
    avatarUrl,
    timestamp
}) => {
    // Ya no necesitamos estas funciones, usaremos el componente UserLevelBadge
    return (
        <div className="flex items-center gap-2">
            <Link 
                href={`/perfil/${username}`} 
                onClick={(e) => e.stopPropagation()} 
                className="relative inline-block flex-shrink-0"
            >
                <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all">
                    {avatarUrl ? (
                        <Image
                            src={formatAvatarUrl(avatarUrl) || ''}
                            alt={username}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            unoptimized={true}
                        />
                    ) : (
                        <User className="text-zinc-400" size={16} />
                    )}
                </div>
                {level && (
                    <div className="absolute -bottom-1 -right-1 z-10">
                        <UserLevelBadge level={level} size="sm" showTooltip={true} />
                    </div>
                )}
            </Link>
            <div>
                <div className="flex items-center gap-2">
                    <Link 
                        href={`/perfil/${username}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium text-white hover:text-blue-400 transition-colors"
                    >
                        {username}
                    </Link>
                    <span className="text-xs text-zinc-400">{formatPostDate(timestamp)}</span>
                </div>
            </div>
        </div>
    );
};