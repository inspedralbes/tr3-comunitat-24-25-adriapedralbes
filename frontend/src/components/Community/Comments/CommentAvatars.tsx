import Image from 'next/image';
import React from 'react';
import { normalizeAvatarUrl } from '@/utils/imageUtils';

interface Commenter {
    username: string;
    avatarUrl?: string;
    avatar_url?: string;
}

interface CommentAvatarsProps {
    commenters: Commenter[];
    maxAvatars?: number;
    showNewComment?: boolean;
    newCommentText?: string;
}

export const CommentAvatars: React.FC<CommentAvatarsProps> = ({
    commenters,
    maxAvatars = 4,
    showNewComment = false,
    newCommentText = 'Nuevo coment. just now'
}) => {
    // Si no hay comentarios, no mostramos nada
    if (!commenters || commenters.length === 0) return null;

    // Limitamos la cantidad de avatares a mostrar
    const displayCommenters = commenters.slice(0, maxAvatars);
    const remainingCommenters = Math.max(0, commenters.length - maxAvatars);

    return (
        <div className="flex items-center">
            {/* Avatares de comentadores */}
            <div className="flex -space-x-2">
                {displayCommenters.map((commenter, index) => (
                    <div
                        key={`${commenter.username}-${index}`}
                        className="w-6 h-6 rounded-full border border-zinc-900 overflow-hidden bg-[#444442]"
                    >
                        {(commenter.avatarUrl || commenter.avatar_url) ? (
                            <Image
                                src={normalizeAvatarUrl(commenter.avatarUrl || commenter.avatar_url) || ''}
                                alt={commenter.username}
                                width={24}
                                height={24}
                                className="w-full h-full object-cover"
                                unoptimized={true}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                {commenter.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                ))}

                {/* Badge para avatares adicionales */}
                {remainingCommenters > 0 && (
                    <div className="w-6 h-6 rounded-full border border-zinc-900 bg-[#444442] flex items-center justify-center text-xs text-zinc-300">
                        +{remainingCommenters}
                    </div>
                )}
            </div>
            
            {/* Texto de nuevo comentario con avatar al lado */}
            {showNewComment && (
                <div className="flex items-center ml-2">
                    <span className="text-xs text-blue-500 mr-1">{newCommentText}</span>
                </div>
            )}
        </div>
    );
};