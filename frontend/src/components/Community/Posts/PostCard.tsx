import { ThumbsUp, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';

import { CommentAvatars } from '@/components/Community/Comments/CommentAvatars';
import { PostAuthor } from '@/components/Community/Posts/PostAuthor';
import { communityService } from '@/services/community';
import { Comment } from '@/types/Comment';
import { formatRelativeTime, isNewComment, parseDjangoTimestamp } from '@/utils/dateUtils';
import { normalizeImageUrl } from '@/utils/imageUtils';

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
    image2Url?: string; // Note: These might not be directly used if relying on naming convention
    image3Url?: string; // Note: These might not be directly used if relying on naming convention
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
    likes,
    comments,
    isPinned = false,
    imageUrl,
    image2Url,
    image3Url,
    isLiked = false,
    onPostClick,
    postComments = [],
    isViewed = false,
    lastViewedAt = null
}) => {
    // Estado local para controlar el like
    const [isPostLiked, setIsPostLiked] = useState(isLiked);
    const [likesCount, setLikesCount] = useState(likes);
    
    // Estado para el contador de comentarios
    const [commentsCount, setCommentsCount] = useState(comments);
    
    // Listen for like updates and comment updates from other components (e.g., PostDetailModal)
    useEffect(() => {
        const handleLikeUpdate = (event: Event) => {
            const detail = (event as CustomEvent).detail;
            if (detail && detail.postId === id) {
                setIsPostLiked(detail.isLiked);
                setLikesCount(detail.likesCount);
            }
        };
        
        const handleCommentUpdate = (event: Event) => {
            // Usar setTimeout para asegurar que la actualización no ocurra durante el renderizado
            setTimeout(() => {
                const detail = (event as CustomEvent).detail;
                if (detail && detail.postId === id) {
                    setCommentsCount(detail.commentCount);
                }
            }, 0);
        };
        
        window.addEventListener('post-like-update', handleLikeUpdate);
        window.addEventListener('post-comment-update', handleCommentUpdate);
        
        return () => {
            window.removeEventListener('post-like-update', handleLikeUpdate);
            window.removeEventListener('post-comment-update', handleCommentUpdate);
        };
    }, [id]);

    // Extraer contenido enriquecido si el contenido es JSON
    const getEnrichedContent = (content: string) => {
        try {
            const parsedContent = JSON.parse(content);
            // Check for expected structure
            if (typeof parsedContent === 'object' && parsedContent !== null) {
                return parsedContent; // Return the parsed object
            }
            return null;
        } catch (e) {
            return null; // Not valid JSON
        }
    };

    // Si no se proporciona un título explícito, extraerlo de la primera línea del contenido
    const contentToDisplay = typeof content === 'string' ? content : JSON.stringify(content);

    // Verificar si hay contenido enriquecido
    const enrichedContent = getEnrichedContent(contentToDisplay);
    const plainTextContent = enrichedContent?.text ?? contentToDisplay; // Use text field if available, else fallback
    const features = enrichedContent?.features ?? null; // Use features if available

    const contentLines = plainTextContent.split('\n');
    const displayTitle = title || contentLines[0]; // Use provided title or first line
    const body = title ? plainTextContent : contentLines.slice(1).join('\n'); // Use full text if title exists, else skip first line

    // Extraer los comentadores únicos de los comentarios reales
    const uniqueCommenters: Commenter[] = [];
    const commenterSet = new Set<string>();

    // Función recursiva para extraer comentadores de comentarios y respuestas
    const extractCommenters = (commentsList: Comment[]) => {
        commentsList.forEach(comment => {
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
                if (comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0) {
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
        // Function to safely parse and compare dates
        const getLatestTime = (currentTime: string, newTime: string | undefined): string => {
            if (!newTime) return currentTime;
            if (!currentTime) return newTime;

            try {
                const currentDate = parseDjangoTimestamp(currentTime);
                const newDate = parseDjangoTimestamp(newTime);

                if (!isNaN(newDate.getTime()) && (isNaN(currentDate.getTime()) || newDate > currentDate)) {
                    return newTime;
                }
            } catch {
                // Ignore parsing errors, keep current time
            }
            return currentTime;
        };

        // Find the latest timestamp among all comments and replies
        const findLastCommentTime = (commentsList: Comment[]): string => {
            let latestTime = '';
            commentsList.forEach(comment => {
                const commentTime = comment.timestamp || comment.created_at;
                latestTime = getLatestTime(latestTime, commentTime);

                if (comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0) {
                    const latestReplyTime = findLastCommentTime(comment.replies as Comment[]);
                    latestTime = getLatestTime(latestTime, latestReplyTime);
                }
            });
            return latestTime;
        };

        lastCommentTime = findLastCommentTime(postComments);

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
            aria-label={`Post: ${displayTitle}`}
        >
            <PostAuthor
                username={author.username}
                level={author.level}
                avatarUrl={author.avatarUrl || author.avatar_url} // Handle both possible prop names
                timestamp={timestamp}
                category={category}
                categoryColor={categoryColor}
            />

            {/* Título del post */}
            {displayTitle && (
                <h3 className="mt-3 mb-2 font-medium text-white break-words">{displayTitle}</h3>
            )}

            {/* Contenido del post */}
            {body && (
                 <div className="mb-3">
                    <p className="text-zinc-200 text-sm whitespace-pre-wrap break-words">{body}</p>
                </div>
            )}


            {/* Enlace si existe */}
            {features && features.link && (
                <div className="mb-3 bg-[#2a2a29] p-3 rounded-lg border border-white/10">
                    <a
                        href={features.link.startsWith('http') ? features.link : `https://${features.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline text-sm flex items-center gap-2 break-all"
                        onClick={(e) => e.stopPropagation()} // Evitar que se abra el post al clicar en el enlace
                    >
                        <div className="bg-blue-500/20 p-1 rounded flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
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
                                    <div className="relative pt-[56.25%] w-full"> {/* 16:9 Aspect Ratio */}
                                        <iframe
                                            className="absolute top-0 left-0 w-full h-full"
                                            src={`https://www.youtube.com/embed/${videoId}`}
                                            title="YouTube video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                );
                            }
                        } else if (videoUrl.includes('vimeo.com')) {
                            const videoId = getVimeoVideoId(videoUrl);
                            if (videoId) {
                                return (
                                    <div className="relative pt-[56.25%] w-full"> {/* 16:9 Aspect Ratio */}
                                        <iframe
                                            className="absolute top-0 left-0 w-full h-full"
                                            src={`https://player.vimeo.com/video/${videoId}?h=HASH&badge=0&autopause=0&player_id=0&app_id=APP_ID`} // Use correct Vimeo embed URL structure if needed
                                            title="Vimeo video player"
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
                                <div className="bg-red-500/20 p-1 rounded flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <a
                                    href={videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-red-400 hover:underline text-sm break-all"
                                    onClick={(e) => e.stopPropagation()} // Evitar que se abra el post al clicar en el enlace de video
                                >
                                    Ver video
                                </a>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* Encuesta si existe */}
            {features && Array.isArray(features.poll) && features.poll.length >= 1 && ( // Allow polls with 1 option for viewing results
                <div className="mb-3 bg-[#2a2a29] p-3 rounded-lg border border-white/10">
                    <h4 className="text-sm font-medium text-white mb-2">Encuesta</h4>
                    <div className="space-y-2">
                        {features.poll.map((option: any) => { // Consider creating a type for 'option'
                            // Obtener resultados de la encuesta si existen
                            const pollResults = features.poll_results || {};

                            // Calculate total votes safely
                            const totalVotes = Object.values(pollResults).reduce(
                                (accumulator: number, currentValue: unknown) => {
                                    const numericValue = Number(currentValue);
                                    return accumulator + (isNaN(numericValue) ? 0 : numericValue);
                                },
                                0 // Initial value is 0
                            );

                            // Get votes for this specific option safely
                            const optionVotes = Number(pollResults[option.id]) || 0;
                            const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;

                            return (
                                <div
                                    key={option.id}
                                    className={`relative bg-[#444442] rounded-lg p-2 text-sm text-white hover:bg-[#505050] transition-colors cursor-pointer overflow-hidden ${
                                        optionVotes > 0 ? 'border border-blue-500/30' : ''
                                    }`}
                                    onClick={(e) => {
                                        e.stopPropagation(); // Evitar que se abra el post al votar
                                        // Llamar al servicio para votar
                                        communityService.votePoll(id, option.id)
                                            .then(response => {
                                                console.warn('Voto registrado:', response);

                                                // Actualizar el componente con los nuevos resultados
                                                // This part might need refinement. Directly mutating `features` might not trigger a re-render.
                                                // Ideally, the parent component manages the post data and passes updated props,
                                                // or you use a state management solution.
                                                // The CustomEvent approach is a workaround.
                                                if (response.poll_results && enrichedContent) {
                                                     // Dispatch an event for potential parent component to handle refresh
                                                    const refreshEvent = new CustomEvent('refresh-posts', {
                                                        detail: { postId: id, newPollResults: response.poll_results }
                                                    });
                                                    window.dispatchEvent(refreshEvent);
                                                    // Consider adding local state update if immediate feedback is desired without full refresh
                                                }
                                            })
                                            .catch(error => {
                                                console.error('Error al votar:', error);
                                                // Handle voting error (e.g., show a message)
                                            });
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); } }}
                                    aria-label={`Votar por ${option.text}`}
                                >
                                    {/* Barra de progreso */}
                                    {totalVotes > 0 && (
                                        <div
                                            className="absolute top-0 left-0 h-full bg-blue-500/20"
                                            style={{ width: `${percentage}%` }}
                                            aria-hidden="true"
                                        ></div>
                                    )}

                                    {/* Contenido de la opción */}
                                    <div className="flex justify-between items-center relative z-10">
                                        <span className="break-words">{option.text}</span>
                                        {totalVotes > 0 && (
                                            <span className="text-xs text-blue-300 flex-shrink-0 ml-2">{percentage}%</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Mostrar total de votos si hay resultados */}
                        {features.poll_results && Object.keys(features.poll_results).length > 0 && (
                            <div className="text-xs text-zinc-400 mt-2 text-right">
                                {Object.values(features.poll_results).reduce(
                                     (accumulator: number, currentValue: unknown) => {
                                         const numericValue = Number(currentValue);
                                         return accumulator + (isNaN(numericValue) ? 0 : numericValue);
                                    },
                                    0
                                )} votos totales
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Imágenes para el post */}
            {imageUrl && (
                <div className="mt-2 mb-3">
                    {(() => {
                        // Verificar si hay una URL de imagen en features que fue subida con el nuevo sistema
                        const baseImageUrl = features && features.main_image 
                            ? features.main_image // Usar la URL de la imagen principal desde features
                            : (imageUrl.startsWith('http') || imageUrl.startsWith('/media') 
                                ? imageUrl // Usar URL tal como está si es absoluta o relativa a media
                                : `http://127.0.0.1:8000${imageUrl}`); // Fallback para URLs antiguas

                        // Verificar si hay múltiples imágenes
                        const imagesCount = features?.images_count ?? 1; // Default to 1 image
                        
                        // Obtener las URLs de todas las imágenes si existen
                        const imageUrls = features?.image_urls || [];

                        if (imagesCount === 1) {
                           return (
                                <div className="cursor-pointer hover:opacity-95 transition-all">
                                    <Image
                                        src={normalizeImageUrl(baseImageUrl) || '/placeholder-image.png'}
                                        alt={displayTitle || 'Imagen del post'}
                                        width={500}
                                        height={300}
                                        className="rounded-lg w-full max-h-64 object-cover border border-white/10" // Adjusted max-height
                                        priority={isPinned} // Prioritize pinned post images maybe?
                                        unoptimized={true} // Siempre usar unoptimized para compatibilidad
                                        onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if image fails to load
                                    />
                                </div>
                            );
                        }

                        // Obtener URL de la imagen por índice
                        const getImageSrc = (index: number): string => {
                            // Si tenemos un array de URLs desde features, usarlo
                            if (imageUrls && imageUrls.length > index - 1) {
                                return imageUrls[index - 1];
                            }
                            
                            // Fallback a la lógica antigua si no hay URLs explícitas
                            if (index === 1) return baseImageUrl;
                            const extension = baseImageUrl.substring(baseImageUrl.lastIndexOf('.'));
                            const baseName = baseImageUrl.substring(0, baseImageUrl.lastIndexOf('.'));
                            return `${baseName}_${index}${extension}`;
                        }

                        if (imagesCount === 2) {
                            return (
                                <div className="grid grid-cols-2 gap-1">
                                    {[1, 2].map(i => (
                                        <div key={i} className="cursor-pointer hover:opacity-95 transition-all relative aspect-video"> {/* Use aspect ratio */}
                                            <Image
                                                src={normalizeImageUrl(getImageSrc(i)) || '/placeholder-image.png'}
                                                alt={`Imagen ${i} de ${displayTitle || 'post'}`}
                                                fill // Use fill layout
                                                sizes="(max-width: 640px) 50vw, 250px" // Example sizes
                                                className="rounded-md object-cover border border-white/10"
                                                priority={i === 1 && isPinned}
                                                unoptimized={true}
                                                onError={(e) => (e.currentTarget.style.display = 'none')}
                                            />
                                        </div>
                                    ))}
                                </div>
                            );
                        }

                        if (imagesCount >= 3) {
                             // Show first 2 images + indicator for more
                             return (
                                <div className="grid grid-cols-3 gap-1">
                                    {[1, 2].map(i => (
                                        <div key={i} className="cursor-pointer hover:opacity-95 transition-all relative aspect-square"> {/* Use aspect ratio */}
                                            <Image
                                                src={getImageSrc(i)}
                                                alt={`Imagen ${i} de ${displayTitle || 'post'}`}
                                                fill
                                                sizes="(max-width: 640px) 33vw, 150px" // Example sizes
                                                className="rounded-md object-cover border border-white/10"
                                                priority={i === 1 && isPinned}
                                                unoptimized={true}
                                                onError={(e) => (e.currentTarget.style.display = 'none')}
                                            />
                                        </div>
                                    ))}
                                    <div className="cursor-pointer hover:opacity-95 transition-all relative aspect-square">
                                        <div className="absolute inset-0 w-full h-full bg-gray-700 rounded-md border border-white/10 flex items-center justify-center text-white/70 text-sm">
                                            <span>+{imagesCount - 2}</span> {/* Show how many more */}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // Fallback just in case (shouldn't be reached with above logic)
                        return (
                             <div className="cursor-pointer hover:opacity-95 transition-all">
                                <Image
                                    src={normalizeImageUrl(baseImageUrl) || '/placeholder-image.png'}
                                    alt={displayTitle || 'Imagen del post'}
                                    width={500}
                                    height={300}
                                    className="rounded-lg w-full max-h-64 object-cover border border-white/10"
                                    priority={isPinned}
                                    unoptimized={process.env.NODE_ENV !== 'production'}
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                            </div>
                        );

                    })()}
                </div>
            )}

            {/* Interacciones y Avatares de comentadores */}
            <div className="flex items-center justify-between mt-4 flex-wrap gap-y-2"> {/* Added mt-4, flex-wrap, gap-y-2 */}
                <div className="flex items-center gap-4 text-zinc-300">
                    <div className="flex items-center gap-1">
                        <button
                            className={`p-1 rounded-full transition-all transform hover:scale-110 ${isPostLiked ? 'text-blue-400 hover:text-blue-500' : 'text-zinc-400 hover:text-zinc-300'}`}
                            onClick={(e) => {
                                e.stopPropagation(); // Evitar que se abra el modal al dar like
                                const originalLiked = isPostLiked;
                                const originalCount = likesCount;

                                // Crear un elemento temporal para mostrar efecto de animación
                                const button = e.currentTarget;
                                const rect = button.getBoundingClientRect();
                                const tempIcon = document.createElement('div');
                                tempIcon.innerHTML = `<svg 
                                  width="16" 
                                  height="16" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="${!originalLiked ? '#3b82f6' : '#9ca3af'}" 
                                  stroke-width="2" 
                                  stroke-linecap="round" 
                                  stroke-linejoin="round"
                                  class="lucide lucide-thumbs-up"
                                >
                                  <path d="M7 10v12"></path>
                                  <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                                </svg>`;
                                
                                tempIcon.style.position = 'fixed';
                                tempIcon.style.left = `${rect.left + rect.width/2 - 8}px`;
                                tempIcon.style.top = `${rect.top + rect.height/2 - 8}px`;
                                tempIcon.style.opacity = '1';
                                tempIcon.style.transform = 'scale(1)';
                                tempIcon.style.transition = 'all 0.5s ease-out';
                                tempIcon.style.pointerEvents = 'none';
                                tempIcon.style.zIndex = '9999';
                                
                                document.body.appendChild(tempIcon);
                                
                                // Animar el elemento
                                setTimeout(() => {
                                  tempIcon.style.opacity = '0';
                                  tempIcon.style.transform = 'scale(2) translateY(-10px)';
                                }, 50);
                                
                                // Eliminar después de la animación
                                setTimeout(() => {
                                  document.body.removeChild(tempIcon);
                                }, 550);

                                // Optimistic UI update
                                setIsPostLiked(!originalLiked);
                                setLikesCount(originalLiked ? originalCount - 1 : originalCount + 1);

                                communityService.likePost(id)
                                    .then(response => {
                                        // Confirm update with server response
                                        setIsPostLiked(response.status === 'liked');
                                        setLikesCount(response.likes);
                                        
                                        // Dispatch event to synchronize like state across the app
                                        const likeUpdateEvent = new CustomEvent('post-like-update', {
                                            detail: { 
                                                postId: id, 
                                                isLiked: response.status === 'liked',
                                                likesCount: response.likes
                                            }
                                        });
                                        window.dispatchEvent(likeUpdateEvent);
                                    })
                                    .catch(() => {
                                        // Revert on error
                                        console.error('Error al dar/quitar like');
                                        setIsPostLiked(originalLiked);
                                        setLikesCount(originalCount);
                                        // Optionally show an error message to the user
                                    });
                            }}
                            aria-label={isPostLiked ? 'Quitar like' : 'Dar like'}
                        >
                            <ThumbsUp size={14} className={isPostLiked ? 'transform animate-pulse' : ''} />
                        </button>
                        <span className="text-sm tabular-nums">{likesCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {/* The button doesn't do anything interactive here, maybe link to comments section? */}
                        <span className="p-1 text-zinc-400"> {/* Just display icon + count */}
                            <MessageCircle size={16} />
                        </span>
                        <span className="text-sm tabular-nums">{commentsCount}</span>
                    </div>
                </div>

                {/* Avatares de comentadores y tiempo del último comentario */}
                {/* Only show this section if there are comments */}
                {Number(comments) > 0 && (
                    <div className="flex items-center flex-shrink-0"> {/* Prevent shrinking on small screens */}
                        {uniqueCommenters.length > 0 && (
                            <div className="flex items-center">
                                <CommentAvatars commenters={uniqueCommenters} />
                                <div className="flex items-center ml-2">
                                    <span className="text-xs" style={{ color: isNewestComment ? '#3b82f6' : '#9ca3af' }}>
                                        {isNewestComment ? 'Nuevo' : 'Último'} coment. {formatRelativeTime(lastCommentTime)}
                                    </span>
                                </div>
                            </div>
                        )}
                        {uniqueCommenters.length === 0 && (
                            <div className="flex items-center">
                                <div className="w-6 h-6 rounded-full overflow-hidden bg-[#444442] flex items-center justify-center text-zinc-400">
                                    <span className="text-xs">?</span>
                                </div>
                                <div className="flex items-center ml-2">
                                    <span className="text-xs" style={{ color: isNewestComment ? '#3b82f6' : '#9ca3af' }}>
                                        {isNewestComment ? 'Nuevo' : 'Último'} coment. {formatRelativeTime(lastCommentTime)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};