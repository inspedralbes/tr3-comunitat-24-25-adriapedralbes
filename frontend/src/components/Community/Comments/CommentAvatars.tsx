import React from 'react';
import Image from 'next/image';

interface Commenter {
    username: string;
    avatarUrl?: string;
}

interface CommentAvatarsProps {
    commenters: Commenter[];
    maxAvatars?: number;
    lastCommentTime?: string | null;
}

export const CommentAvatars: React.FC<CommentAvatarsProps> = ({
    commenters,
    maxAvatars = 4,
    lastCommentTime
}) => {
    // Si no hay comentarios, no mostramos nada
    if (!commenters || commenters.length === 0) return null;

    // Limitamos la cantidad de avatares a mostrar
    const displayCommenters = commenters.slice(0, maxAvatars);
    const remainingCommenters = Math.max(0, commenters.length - maxAvatars);

    return (
        <div className="flex items-center">
            {/* Avatares de comentadores */}
            <div className="flex -space-x-2 mr-2">
                {displayCommenters.map((commenter, index) => (
                    <div
                        key={`${commenter.username}-${index}`}
                        className="w-6 h-6 rounded-full border border-zinc-900 overflow-hidden bg-[#444442]"
                    >
                        {commenter.avatarUrl ? (
                            <Image
                                src={commenter.avatarUrl}
                                alt={commenter.username}
                                width={24}
                                height={24}
                                className="w-full h-full object-cover"
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

            {/* Tiempo del último comentario */}
            {lastCommentTime && (
                <span className="text-xs text-zinc-500">
                    Last comment {lastCommentTime}
                </span>
            )}
        </div>
    );
};