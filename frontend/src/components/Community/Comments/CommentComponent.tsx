import { ThumbsUp, Reply } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import UserLevelBadge from '@/components/ui/UserLevelBadge';

interface CommentComponentProps {
    username: string;
    timestamp: string;
    content: string;
    level?: number;
    avatarUrl?: string;
    likesCount: number;
    onReply: () => void;
    onLike: () => void;
}

export const CommentComponent: React.FC<CommentComponentProps> = ({
    username,
    timestamp,
    content,
    level,
    avatarUrl,
    likesCount,
    onReply,
    onLike
}) => {
    return (
        <div className="border-b border-white/10 bg-[#1e1e1e] py-4 px-4">
            <div className="flex items-start">
                {/* Avatar con badge de nivel correctamente posicionado */}
                <div className="relative flex-shrink-0 mr-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-700">
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt={username}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                                unoptimized={avatarUrl.includes('127.0.0.1') || avatarUrl.includes('localhost')}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                {username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Badge de nivel con UserLevelBadge para consistencia de colores */}
                    {level && (
                        <div className="absolute -bottom-1 -right-1 z-10">
                            <UserLevelBadge level={level} size="sm" showTooltip={true} />
                        </div>
                    )}
                </div>

                {/* Contenido del comentario */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{username}</span>
                        <span className="text-xs text-zinc-400">{timestamp}</span>
                    </div>
                    <p className="text-zinc-200 mb-2">{content}</p>

                    {/* Acciones (like, reply) */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center">
                            <button
                                className="flex items-center text-zinc-400 hover:text-zinc-300"
                                onClick={onLike}
                            >
                                <ThumbsUp size={16} className="mr-1" />
                            </button>
                            {likesCount > 0 && (
                                <span className="text-xs text-zinc-400 ml-1">{likesCount}</span>
                            )}
                        </div>
                        <button
                            className="flex items-center text-zinc-400 hover:text-zinc-300"
                            onClick={onReply}
                            aria-label={`Reply to ${username}`}
                        >
                            <Reply size={16} className="mr-1" /> Reply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};