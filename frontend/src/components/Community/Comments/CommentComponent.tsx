import React from 'react';
import { ThumbsUp, Reply } from 'lucide-react';
import Image from 'next/image';

interface CommentComponentProps {
    username: string;
    timestamp: string;
    content: string;
    level?: number;
    avatarUrl?: string;
    likes: number;
    onReply: () => void;
    onLike: () => void;
}

export const CommentComponent: React.FC<CommentComponentProps> = ({
    username,
    timestamp,
    content,
    level,
    avatarUrl,
    likes,
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
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                {username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Badge de nivel con z-index para asegurar que aparezca por encima */}
                    {level && (
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

                    {/* Acciones (like, reply) */}
                    <div className="flex items-center gap-4">
                        <button
                            className="flex items-center text-zinc-400 hover:text-zinc-300"
                            onClick={onLike}
                        >
                            <ThumbsUp size={16} className="mr-1" />
                        </button>
                        <button
                            className="flex items-center text-zinc-400 hover:text-zinc-300"
                            onClick={onReply}
                        >
                            <Reply size={16} className="mr-1" /> Reply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};