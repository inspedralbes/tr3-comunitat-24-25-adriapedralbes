import { ThumbsUp, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';


import { CommentAvatars } from '@/components/Community/Comments/CommentAvatars';
import { PostAuthor } from '@/components/Community/Posts/PostAuthor';
import { communityService } from '@/services/community';
import { Comment } from '@/types/Comment';
import { formatRelativeTime, isNewComment, parseDjangoTimestamp } from '@/utils/dateUtils';

interface PostCardProps {
    id: string;
    author: {
        username: string;
        level?: number;
        avatarUrl?: string;
        avatar_url?: string;
    };
    timestamp: string;
    category?: string;
    categoryColor?: string;
    title?: string;
    content: string;
    likes: number;
    comments: number;
    isPinned?: boolean;
    imageUrl?: string;
    isLiked?: boolean;
    onPostClick: (id: string) => void;
    postComments?: Comment[];
    isViewed?: boolean;
    lastViewedAt?: string | null;
}

interface Commenter {
    username: string;
    avatarUrl?: string;
    avatar_url?: string;
}

// Tipo para comentarios con anidación
// interface CommentWithReplies {
//     author: { 
//         username: string; 
//         avatarUrl?: string;
//     };
//     timestamp: string;
//     replies?: CommentWithReplies[];
// }

export const PostCard: React.FC<PostCardProps> = ({
    id,
    author,
    timestamp,
    category,
    categoryColor,
    title,
    content,
    likes,
    comments,
    isPinned = false,
    imageUrl,
    isLiked = false,
    onPostClick,
    postComments = [],
    isViewed = false,
    lastViewedAt = null
}) => {
    // Estado local para controlar el like
    const [isPostLiked, setIsPostLiked] = useState(isLiked);
    const [likesCount, setLikesCount] = useState(likes);

    // Si no se proporciona un título explícito, extraerlo de la primera línea del contenido
    const contentLines = content.split('\n');
    const displayTitle = title || contentLines[0];
    const body = title ? content : contentLines.slice(1).join('\n');

    // Extraer los comentadores únicos de los comentarios reales
    const uniqueCommenters: Commenter[] = [];
    const commenterSet = new Set<string>();

    // Función recursiva para extraer comentadores de comentarios y respuestas
    const extractCommenters = (comments: Comment[]) => {
        comments.forEach(comment => {
            if (comment.author) {
                const username = comment.author.username;
                if (!commenterSet.has(username)) {
                    commenterSet.add(username);
                    uniqueCommenters.push({
                        username: username,
                        avatarUrl: comment.author.avatarUrl || comment.author.avatar_url
                    });
                }

                // Procesar respuestas si existen
                if (comment.replies && comment.replies.length > 0) {
                    extractCommenters(comment.replies as Comment[]);
                }
            }
        });
    };

    // Extraer todos los comentadores
    extractCommenters(postComments);

    // Obtener la timestamp del comentario más reciente
    let lastCommentTime = '';
    let isNewestComment = false;

    if (postComments.length > 0) {
        // Buscar el comentario más reciente (asumiendo que están ordenados por tiempo)
        const lastComment = postComments[postComments.length - 1];

        // Usar timestamp o created_at, dependiendo de cuál esté disponible
        const commentTime = lastComment?.timestamp || lastComment?.created_at || '';
        if (commentTime) {
            lastCommentTime = commentTime;

            // Verificar que el formato de fecha es válido
            try {
                const date = parseDjangoTimestamp(commentTime);
                if (isNaN(date.getTime())) {
                    // Formato de fecha inválido
                }
            } catch {
                // Silenciamos el error
                // Error al analizar la fecha
            }
        }

        // También revisar en las respuestas
        postComments.forEach(comment => {
            if (comment.replies && comment.replies.length > 0) {
                const lastReply = comment.replies[comment.replies.length - 1];
                const replyTime = lastReply?.timestamp || lastReply?.created_at || '';

                if (replyTime) {
                    try {
                        const replyDate = parseDjangoTimestamp(replyTime);
                        const currentLastDate = parseDjangoTimestamp(lastCommentTime);

                        if (!isNaN(replyDate.getTime()) && !isNaN(currentLastDate.getTime()) &&
                            replyDate > currentLastDate) {
                            lastCommentTime = replyTime;
                        }
                    } catch {
                        // Silenciamos el error
                        // Error al comparar fechas
                    }
                }
            }
        });

        // Depurar el timestamp y el formato resultante
        if (lastCommentTime) {
            // console.log('Post:', id, 'Last comment time:', lastCommentTime);
            // console.log('Formatted as:', formatRelativeTime(lastCommentTime));

            if (lastViewedAt) {
                // console.log('Last viewed at:', lastViewedAt);
                // console.log('Is newest comment:', isNewComment(lastViewedAt, lastCommentTime));
            }
        }

        // Determinar si el comentario es nuevo (no visto por el usuario)
        isNewestComment = isNewComment(lastViewedAt, lastCommentTime);
    }

    const handleClick = () => {
        onPostClick(id);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onPostClick(id);
        }
    };

    return (
        <div
            className={`bg-[#323230] rounded-lg p-4 my-3 mx-4 sm:mx-2 md:mx-0 ${isPinned ? 'border-l-4 border-amber-500' : 'border border-white/10'} cursor-pointer hover:bg-[#3a3a38] transition-colors`}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`Post: ${title}`}
        >
            <PostAuthor
                username={author.username}
                level={author.level}
                avatarUrl={author.avatarUrl}
                timestamp={timestamp}
                category={category}
                categoryColor={categoryColor}
            />

            {/* Título del post */}
            {displayTitle && (
                <h3 className="mt-3 mb-2 font-medium text-white">{displayTitle}</h3>
            )}

            {/* Contenido del post */}
            <div className="mb-3">
                <p className="text-zinc-200 text-sm">{body}</p>
            </div>

            {/* Imagen adjunta */}
            {imageUrl && (
                <div className="mt-2 mb-3">
                    <div className="cursor-pointer hover:opacity-95 transition-all">
                        <Image
                            src={imageUrl.startsWith('http') ? imageUrl : `http://127.0.0.1:8000${imageUrl}`}
                            alt={`Contenido de ${title}`}
                            width={500}
                            height={300}
                            className="rounded-lg max-h-28 object-cover border border-white/10"
                            priority={true}
                            unoptimized={true}
                        />
                    </div>
                </div>
            )}

            {/* Interacciones y Avatares de comentadores */}
            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-4 text-zinc-300">
                    <div className="flex items-center gap-1">
                        <button
                            className={`p-1 hover:bg-[#444442] rounded-full ${isPostLiked ? 'text-blue-400' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation(); // Evitar que se abra el modal al dar like
                                // Llamar a la API para dar/quitar like
                                communityService.likePost(id)
                                    .then(response => {
                                        setIsPostLiked(response.status === 'liked');
                                        setLikesCount(response.likes);
                                    })
                                    .catch(() => {
                                        // Capturamos el error
                                        console.error('Error al dar/quitar like');
                                    });
                            }}
                        >
                            <ThumbsUp size={16} />
                        </button>
                        <span className="text-sm">{likesCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            className="p-1 hover:bg-[#444442] rounded-full"
                            onClick={(e) => {
                                e.stopPropagation(); // Evitar que se abra el modal al comentar
                                // Aquí iría la lógica para ir directamente a comentar
                            }}
                            aria-label="Comment on this post"
                        >
                            <MessageCircle size={16} />
                        </button>
                        <span className="text-sm">{comments}</span>
                    </div>
                </div>

                {/* Avatares de comentadores y tiempo del último comentario */}
                <div className="flex items-center">
                    {uniqueCommenters.length > 0 && (
                        <CommentAvatars commenters={uniqueCommenters} />
                    )}
                    {/* Siempre mostrar el tiempo de comentario si hay comentarios */}
                    {Number(comments) > 0 && (
                        <span className="text-xs ml-2" style={{ color: isNewestComment ? '#3b82f6' : '#9ca3af' }}>
                            {isNewestComment ? 'New' : 'Last'} comment {formatRelativeTime(lastCommentTime)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};