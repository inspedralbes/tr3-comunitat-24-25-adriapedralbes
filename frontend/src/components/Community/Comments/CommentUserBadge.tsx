import React from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';

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
    return (
        <div className="flex items-center gap-2">
            <div className="relative inline-block flex-shrink-0">
                <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden">
                    {avatarUrl ? (
                        <Image
                            src={avatarUrl}
                            alt={username}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User className="text-zinc-400" size={16} />
                    )}
                </div>
                {level && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-zinc-900 z-10">
                        {level}
                    </div>
                )}
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{username}</span>
                    <span className="text-xs text-zinc-400">{timestamp}</span>
                </div>
            </div>
        </div>
    );
};