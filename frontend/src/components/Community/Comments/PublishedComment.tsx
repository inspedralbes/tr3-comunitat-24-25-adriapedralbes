import React from 'react';
import { ThumbsUp } from 'lucide-react';
import Image from 'next/image';

interface PublishedCommentProps {
    username: string;
    avatarUrl?: string;
    level?: number;
    timestamp: string;
    content: string;
    onReply?: () => void;
    likes?: number;
    isLiked?: boolean;
    onLike?: () => void;
}

export const PublishedComment: React.FC<PublishedCommentProps> = ({
    username,
    avatarUrl,
    level,
    timestamp,
    content,
    onReply,
    likes = 0,
    isLiked = false,
    onLike,
}) => {
    return (
        <div className="py-3 border-b border-white/10">
            <div className="flex gap-2">
                {/* Avatar con nivel - CORRECCIÓN APLICADA */}
                <div className="relative flex-shrink-0 self-start">
                    <div className="w-8 h-8 bg-[#444442] rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt={username}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                {username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    {level !== undefined && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-zinc-900 z-10">
                            {level}
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

                    {/* Acciones */}
                    <div className="flex items-center gap-4">
                        <button
                            className={`flex items-center gap-1 ${isLiked ? 'text-blue-400' : 'text-zinc-400 hover:text-zinc-300'}`}
                            onClick={onLike}
                        >
                            <ThumbsUp size={14} />
                            {likes > 0 && <span className="text-xs">{likes}</span>}
                        </button>

                        {onReply && (
                            <button
                                className="text-zinc-400 hover:text-zinc-300 text-xs"
                                onClick={onReply}
                            >
                                Reply
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};