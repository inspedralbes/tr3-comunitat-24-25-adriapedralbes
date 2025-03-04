import React, { useState } from 'react';
import Image from 'next/image';
import { ThumbsUp, CornerUpRight } from 'lucide-react';

import { Comment } from '@/types/Comment';

interface CommentItemProps {
    comment: Comment;
    onReply: (commentId: string, username: string) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, onReply }) => {
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(comment.likes || 0);

    // Manejar el like al comentario
    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLiked(!liked);
        setLikesCount(prevCount => liked ? prevCount - 1 : prevCount + 1);
    };

    // Manejar la respuesta a un comentario
    const handleReply = () => {
        onReply(comment.id, comment.author.username);
    };

    return (
        <div className="mb-4">
            <div className="flex gap-2">
                {/* Avatar y detalles del autor - CORREGIDO CON flex-shrink-0, self-start y z-10 */}
                <div className="relative flex-shrink-0 self-start">
                    <div className="w-8 h-8 bg-[#444442] rounded-full overflow-hidden border border-white/10">
                        {comment.author.avatarUrl ? (
                            <Image
                                src={comment.author.avatarUrl}
                                alt={comment.author.username}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                {comment.author.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    {comment.author.level && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-zinc-900 z-10">
                            {comment.author.level}
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    {/* Encabezado del comentario */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{comment.author.username}</span>
                        <span className="text-xs text-zinc-400">{comment.timestamp}</span>
                    </div>

                    {/* Contenido del comentario */}
                    <div className="bg-[#2a2a29] rounded-lg px-3 py-2 text-zinc-200 mb-1">
                        {comment.mentionedUser && (
                            <span className="text-blue-400">@{comment.mentionedUser} </span>
                        )}
                        {comment.content}
                    </div>

                    {/* Acciones del comentario */}
                    <div className="flex items-center gap-4 ml-1">
                        <div className="flex items-center gap-1">
                            <button
                                className={`p-1 rounded-full ${liked ? 'text-blue-400' : 'text-zinc-400 hover:text-zinc-300'}`}
                                onClick={handleLike}
                            >
                                <ThumbsUp size={14} />
                            </button>
                            {likesCount > 0 && (
                                <span className="text-xs text-zinc-400">{likesCount}</span>
                            )}
                        </div>
                        <button
                            className="text-zinc-400 hover:text-zinc-300 text-xs flex items-center gap-1"
                            onClick={handleReply}
                        >
                            <CornerUpRight size={14} />
                            Reply
                        </button>
                    </div>
                </div>
            </div>

            {/* Comentarios anidados (respuestas) */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="ml-10 mt-3">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            onReply={onReply}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};