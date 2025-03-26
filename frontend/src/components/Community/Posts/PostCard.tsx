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
    likes?: number;
    comments?: number;
    isPinned?: boolean;
    imageUrl?: string;
    image2Url?: string;
    image3Url?: string;
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

export const PostCard: React.FC<PostCardProps> = ({
    id,
    author,
    timestamp,
    category,
    categoryColor,
    title,
    content,
    likes = 0,
    comments = 0,
    isPinned = false,
    imageUrl,
    isLiked = false,
    onPostClick,
    postComments = [],
    lastViewedAt = null
}) => {
    // Estado local para controlar el like
    const [isPostLiked, setIsPostLiked] = useState(isLiked);
    const [likesCount, setLikesCount] = useState(likes || 0);

    // Extraer contenido enriquecido si el contenido es JSON
    const getEnrichedContent = (content: string) => {
        try {
            const parsedContent = JSON.parse(content);
            if (parsedContent.text && parsedContent.features) {
                return parsedContent;
            }
            return null;
        } catch (e) {
            return null; // No es JSON o no tiene la estructura esperada
        }
    };
    
    // Si no se proporciona un título explícito, extraerlo de la primera línea del contenido
    const contentToDisplay = typeof content === 'string' ? content : JSON.stringify(content);
    
    // Verificar si hay contenido enriquecido
    const enrichedContent = getEnrichedContent(contentToDisplay);
    const plainContent = enrichedContent ? enrichedContent.text : contentToDisplay;
    const features = enrichedContent ? enrichedContent.features : null;
    
    const contentLines = plainContent.split('\n');
    const displayTitle = title || contentLines[0];
    const body = title ? plainContent : contentLines.slice(1).join('\n');

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

            {/* Enlace si existe */}
            {features && features.link && (
                <div className="mb-3 bg-[#2a2a29] p-3 rounded-lg border border-white/10">
                    <a 
                        href={features.link.startsWith('http') ? features.link : `https://${features.link}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline text-sm flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()} // Evitar que se abra el post al clicar en el enlace
                    >
                        <div className="bg-blue-500/20 p-1 rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                            </svg>
                        </div>
                        {features.link}
                    </a>
                </div>
            )}

            {/* Video si existe */}
            {features && features.video && (
                <div className="mb-3 rounded-lg border border-white/10 overflow-hidden">
                    {(() => {
                        // Función para extraer el ID de video de YouTube
                        const getYoutubeVideoId = (url: string) => {
                            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                            const match = url.match(regExp);
                            return match && match[2].length === 11 ? match[2] : null;
                        };
                        
                        // Función para extraer el ID de video de Vimeo
                        const getVimeoVideoId = (url: string) => {
                            const regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
                            const match = url.match(regExp);
                            return match ? match[5] : null;
                        };
                        
                        const videoUrl = features.video.startsWith('http') ? features.video : `https://${features.video}`;
                        
                        // Detectar tipo de video
                        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                            const videoId = getYoutubeVideoId(videoUrl);
                            if (videoId) {
                                return (
                                    <div className="relative pt-[56.25%] w-full">
                                        <iframe 
                                            className="absolute top-0 left-0 w-full h-full"
                                            src={`https://www.youtube.com/embed/${videoId}`}
                                            title="YouTube video"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                );
                            }
                        } else if (videoUrl.includes('vimeo.com')) {
                            const videoId = getVimeoVideoId(videoUrl);
                            if (videoId) {
                                return (
                                    <div className="relative pt-[56.25%] w-full">
                                        <iframe 
                                            className="absolute top-0 left-0 w-full h-full"
                                            src={`https://player.vimeo.com/video/${videoId}`}
                                            title="Vimeo video"
                                            frameBorder="0"
                                            allow="autoplay; fullscreen; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                );
                            }
                        }
                        
                        // Si no se reconoce el formato o no se pudo extraer el ID, mostrar enlace
                        return (
                            <div className="p-3 bg-[#2a2a29] flex items-center gap-2">
                                <div className="bg-red-500/20 p-1 rounded">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <a 
                                    href={videoUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-red-400 hover:underline text-sm"
                                    onClick={(e) => e.stopPropagation()} // Evitar que se abra el post al clicar en el enlace de video
                                >
                                    Ver video
                                </a>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* Imágenes para el post */}
            {imageUrl && (
                <div className="mt-2 mb-3">
                    {/* Verificar si hay información de imágenes múltiples en el contenido del post */}
                    {(() => {
                        try {
                            // Tratar de parsear el contenido como JSON para verificar múltiples imágenes
                            if (typeof content === 'string' && content.includes('multi_image')) {
                                const contentObj = JSON.parse(content);
                                if (contentObj.features && contentObj.features.multi_image) {
                                    // Hay múltiples imágenes, mostrarlas según su cantidad
                                    const imagesCount = contentObj.features.images_count || 1;
                                    
                                    // Por defecto, mostrar solo la imagen principal en un botón
                                    return (
                                        <button
                                            className="cursor-pointer hover:opacity-95 transition-all w-full"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Detener la propagación para que no se abra el post completo
                                                onPostClick(id); // Pero abrir el post de todos modos
                                            }}
                                            aria-label="Ver imágenes del post"
                                        >
                                            <Image
                                                src={imageUrl.startsWith('http') ? imageUrl : `http://127.0.0.1:8000${imageUrl}`}
                                                alt={`Imagen de ${title || 'post'}`}
                                                width={500}
                                                height={300}
                                                className="rounded-lg max-h-28 object-cover border border-white/10"
                                                priority={true}
                                                unoptimized={true}
                                            />
                                        </button>
                                    );
                                }
                            }
                        } catch (e) {
                            console.error("Error parsing post content for multiple images", e);
                        }
                        
                        // Por defecto, mostrar solo la imagen principal en un botón
                        return (
                            <button
                                className="cursor-pointer hover:opacity-95 transition-all w-full"
                                onClick={(e) => {
                                    e.stopPropagation(); // Detener la propagación para que no se abra el post completo
                                    onPostClick(id); // Pero abrir el post de todos modos
                                }}
                                aria-label="Ver imagen del post"
                            >
                                <Image
                                    src={imageUrl.startsWith('http') ? imageUrl : `http://127.0.0.1:8000${imageUrl}`}
                                    alt={`Imagen de ${title || 'post'}`}
                                    width={500}
                                    height={300}
                                    className="rounded-lg max-h-28 object-cover border border-white/10"
                                    priority={true}
                                    unoptimized={true}
                                />
                            </button>
                        );
                    })()}
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
                            aria-label={isPostLiked ? "Quitar like" : "Dar like"}
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
                                onPostClick(id);
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