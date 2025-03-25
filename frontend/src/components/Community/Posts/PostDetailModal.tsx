import { ThumbsUp, MessageCircle, Bell, Smile, CornerUpRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useRef, useEffect, useState, useCallback } from 'react';

import { ImageViewerModal } from '@/components/Community/Posts/ImageViewerModal';
import { UserBadge } from '@/components/Community/UserBadge';
import { Button } from '@/components/ui/button';
import UserLevelBadge from '@/components/ui/UserLevelBadge';
import { authService, UserProfile } from '@/services/auth';
import { communityService } from '@/services/community';
import { Comment } from '@/types/Comment';
import { Post } from '@/types/Post';
import { formatAvatarUrl, formatImageUrl } from '@/utils/formatUtils';

interface PostDetailModalProps {
    post: Post | null;
    isOpen: boolean;
    onClose: () => void;
}

// Interfaz extendida para manejar respuestas anidadas con niveles
interface ReplyToInfo {
    id: string;               // ID del comentario al que respondemos
    username: string;         // Nombre del usuario al que respondemos
    isNested?: boolean;
    parentId?: string;
    replyLevel: number;
    parentCommentId?: string; // ID del comentario principal (nivel 0)
    userId?: string;          // ID del usuario al que respondemos (para menciones)
}

// Extendemos Comment para incluir el nivel de respuesta y la estructura anidada
interface EnhancedComment extends Comment {
    replyLevel?: number;
    parentId?: string; // ID del comentario al que responde directamente
    parentCommentId?: string; // ID del comentario raíz/principal
    isLiked?: boolean; // Estado local para el like
    likesCount?: number; // Estado local para el contador de likes
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
    post,
    isOpen,
    onClose
}) => {
    // Variable interna para manejar el post actualizado
    const [selectedPost, setSelectedPost] = useState<Post | null>(post);

    // Actualizar selectedPost cuando cambia el prop post
    useEffect(() => {
        setSelectedPost(post);
    }, [post]);
    const _router = useRouter();
    const [comment, setComment] = useState('');
    const [replyToComment, setReplyToComment] = useState<ReplyToInfo | null>(null);
    const [lastRespondedComment, setLastRespondedComment] = useState<ReplyToInfo | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const [liked, setLiked] = useState(post?.is_liked || false);
    const [likesCount, setLikesCount] = useState(post?.likes || 0);
    const [comments, setComments] = useState<EnhancedComment[]>([]);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [imageViewerOpen, setImageViewerOpen] = useState(false);

    // Cargar perfil del usuario actual
    useEffect(() => {
        const fetchCurrentUser = async () => {
            if (authService.isAuthenticated()) {
                try {
                    const profile = await authService.getProfile();
                    setCurrentUser(profile);
                } catch (error) {
                    console.error('Error al cargar el perfil de usuario:', error);
                }
            }
        };

        fetchCurrentUser();

        // Update liked state when post changes
        if (post) {
            setLiked(post.is_liked || false);
            setLikesCount(post.likes || 0);
        }

        // Reiniciar el estado del visor de imágenes al abrir el post
        if (isOpen) {
            setImageViewerOpen(false);
        }
    }, [isOpen, post]);

    // Función para confirmar salida si hay comentario pendiente (memoizada para evitar recreación)
    const confirmDiscardComment = useCallback((): boolean => {
        if (comment.trim() !== '') {
            return window.confirm("Aún no has terminado tu comentario. ¿Quieres irte sin terminar?");
        }
        return true;
    }, [comment]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                if (confirmDiscardComment() && !imageViewerOpen) { // No cerrar si el visor de imagen está abierto
                    setComment('');
                    onClose();
                }
            }
        };

        // Only add listener if modal is open
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, comment, confirmDiscardComment, imageViewerOpen]);

    // Close on escape key
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !imageViewerOpen) { // No cerrar si el visor de imagen está abierto
                if (confirmDiscardComment()) {
                    setComment('');
                    onClose();
                }
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, onClose, comment, confirmDiscardComment, imageViewerOpen]);

    // Handle like action
    const handleLike = () => {
        // Llamar a la API para dar/quitar like
        if (post && post.id) {
            communityService.likePost(post.id)
                .then(response => {
                    setLiked(response.status === 'liked');
                    setLikesCount(response.likes);
                })
                .catch(error => {
                    console.error('Error al dar/quitar like:', error);
                });
        }
    };

    // Función para actualizar la caché plana de comentarios
    const updateAllCommentsCache = (commentsArray: EnhancedComment[]) => {
        const cache: { [key: string]: EnhancedComment } = {};

        const processComments = (comments: EnhancedComment[], level = 0) => {
            comments.forEach(c => {
                c.replyLevel = level;
                cache[c.id] = c;

                if (c.replies && c.replies.length > 0) {
                    processComments(c.replies as EnhancedComment[], level + 1);
                }
            });
        };

        processComments(commentsArray);
    };

    // Cargar comentarios
    useEffect(() => {
        if (post && isOpen) {
            const fetchComments = async () => {
                try {
                    // Cargar comentarios del post seleccionado desde la API
                    const commentsData = await communityService.getPostComments(post.id);

                    // console.log('Comentarios recibidos:', commentsData);
                    // Normalizar los datos recibidos de la API
                    const commentsArray = Array.isArray(commentsData)
                        ? commentsData
                        : (commentsData.results || []);

                    // console.log('Array de comentarios normalizado:', commentsArray);

                    // Inspección de las URLs de los avatares no es necesaria en prod
                    commentsArray.forEach((_comment: Comment, _index: number) => {
                        // la lógica fue comentada
                    });

                    // Normalizar las propiedades para hacerlas compatibles con nuestra interfaz
                    const enhancedComments = commentsArray.map((comment: Comment) => {
                        // Asegurarnos de que content sea un string
                        const content = typeof comment.content === 'string'
                            ? comment.content
                            : JSON.stringify(comment.content);
                        // console.log('Tipo de content:', typeof comment.content);

                        // Asegurar que la URL del avatar está completa
                        const authorAvatarUrl = comment.author.avatar_url || comment.author.avatarUrl;

                        return {
                            ...comment,
                            content: content,
                            replyLevel: 0,
                            isLiked: comment.is_liked || false,
                            likesCount: comment.likes || 0,
                            author: {
                                ...comment.author,
                                // Asegurar que tenemos el ID del autor
                                id: comment.author.id || '',
                                // Normalizar avatar_url a avatarUrl
                                avatarUrl: authorAvatarUrl
                            },
                            replies: comment.replies?.map((reply: Comment) => {
                                // Asegurarnos de que el contenido de la respuesta sea string
                                const replyContent = typeof reply.content === 'string'
                                    ? reply.content
                                    : JSON.stringify(reply.content);

                                // Asegurar que la URL del avatar está completa
                                const replyAuthorAvatarUrl = reply.author.avatar_url || reply.author.avatarUrl;

                                return {
                                    ...reply,
                                    content: replyContent,
                                    replyLevel: 1,  // Nivel 1 para las respuestas directas
                                    parentId: comment.id, // Guardar referencia al padre
                                    parentCommentId: comment.id, // Principal es igual al padre para nivel 1
                                    isLiked: reply.is_liked || false,
                                    likesCount: reply.likes || 0,
                                    author: {
                                        ...reply.author,
                                        // Asegurar que tenemos el ID del autor
                                        id: reply.author.id || '',
                                        // Normalizar avatar_url a avatarUrl para las respuestas
                                        avatarUrl: replyAuthorAvatarUrl
                                    }
                                };
                            })
                        };
                    });

                    setComments(enhancedComments);
                    updateAllCommentsCache(enhancedComments);
                } catch (error) {
                    console.error('Error al cargar comentarios:', error);
                }
            };

            fetchComments();
        }
    }, [post, isOpen]);

    // Manejar respuesta a un comentario (principal o anidado)
    const handleReplyToComment = (
        commentId: string,
        username: string,
        isNested: boolean = false,
        parentId?: string,
        replyLevel: number = 0,
        parentCommentId?: string,
        userId?: string
    ) => {
        // Si es una respuesta a una respuesta, necesitamos el ID del comentario principal
        const rootCommentId = parentCommentId || (isNested ? parentId : commentId);

        setReplyToComment({
            id: commentId,
            username,
            isNested,
            parentId,
            replyLevel: replyLevel + 1,
            parentCommentId: rootCommentId,
            userId: userId // ID del usuario para la mención
        });

        // Enfocar el campo de comentario
        document.getElementById('comment-input')?.focus();
    };

    // Cancelar respuesta
    const cancelReply = () => {
        setReplyToComment(null);
    };

    // Función recursiva auxiliar para añadir la respuesta al árbol de comentarios
    const addReplyToComment = (
        comments: EnhancedComment[],
        parentId: string,
        newReply: EnhancedComment
    ): EnhancedComment[] => {
        return comments.map(c => {
            // Si este es el comentario al que queremos responder
            if (c.id === parentId) {
                return {
                    ...c,
                    replies: [...(c.replies || []), newReply]
                };
            }

            // Si este comentario tiene respuestas, buscar recursivamente
            if (c.replies && c.replies.length > 0) {
                return {
                    ...c,
                    replies: addReplyToComment(c.replies as EnhancedComment[], parentId, newReply)
                };
            }

            // No es el comentario que buscamos
            return c;
        });
    };

    // Añadir un nuevo comentario
    const addComment = async () => {
        if (comment.trim() === '') return;

        try {
            // Datos para el nuevo comentario
            const commentData = {
                post_id: post?.id || '',
                content: comment,
                parent_id: replyToComment?.id,
                mentioned_user_id: replyToComment?.userId || undefined // ID del usuario mencionado cuando respondemos
            };

            // console.log('Enviando comentario con datos:', commentData);

            // Enviar el comentario a la API
            const response = await communityService.createComment(commentData);

            // Obtener la información del usuario actual
            const userProfile = await authService.getProfile();

            // Crear el objeto de comentario con la respuesta y datos del usuario
            const newComment: EnhancedComment = {
                ...response,
                id: response.id,
                author: {
                    id: userProfile.id,      // ID del usuario para menciones futuras
                    username: userProfile.username,
                    level: userProfile.level,
                    avatarUrl: userProfile.avatar_url
                },
                content: comment,
                timestamp: 'ahora', // La API deberió devolver esto, pero por si acaso
                likes: 0,
                is_liked: false, // Inicialmente no está likeado por el usuario
                isLiked: false,   // Estado local para el like
                likesCount: 0,    // Estado local para contador de likes
                mentionedUser: replyToComment?.username,
                replyLevel: replyToComment ? replyToComment.replyLevel : 0
            };

            if (replyToComment) {
                // Agregar información de relación para mantener la jerarquía
                newComment.parentId = replyToComment.id;
                newComment.parentCommentId = replyToComment.parentCommentId;

                // Guardar la referencia del comentario que estamos respondiendo
                setLastRespondedComment({ ...replyToComment });

                // Cuando respondemos a un comentario raíz
                if (replyToComment.replyLevel === 1) {
                    setComments(prevComments => {
                        return prevComments.map(c => {
                            if (c.id === replyToComment.parentCommentId) {
                                return {
                                    ...c,
                                    replies: [...(c.replies || []), newComment]
                                };
                            }
                            return c;
                        });
                    });
                }
                // Cuando respondemos a una respuesta (cualquier nivel)
                else {
                    setComments(prevComments => {
                        const updatedComments = prevComments.map(c => {
                            // Buscar el comentario principal
                            if (c.id === replyToComment.parentCommentId) {
                                return {
                                    ...c,
                                    replies: addReplyToComment(
                                        c.replies as EnhancedComment[],
                                        replyToComment.id,
                                        newComment
                                    )
                                };
                            }
                            return c;
                        });

                        updateAllCommentsCache(updatedComments);
                        return updatedComments;
                    });
                }

                setReplyToComment(null);
            } else {
                // Añadir como comentario principal
                newComment.replyLevel = 0;
                setComments(prevComments => {
                    const updatedComments = [...prevComments, newComment];
                    updateAllCommentsCache(updatedComments);
                    return updatedComments;
                });
                setLastRespondedComment(null);
            }

            setComment('');

        } catch (error) {
            console.error('Error al añadir comentario:', error);
        }
    };

    // Componente recursivo para renderizar comentarios
    const CommentItem = ({
        comment,
        isNested = false,
        nestingLevel = 0
    }: {
        comment: EnhancedComment,
        isNested?: boolean,
        nestingLevel?: number
    }) => {
        // Estado local para el like del comentario
        const [isCommentLiked, setIsCommentLiked] = useState(comment.is_liked || false);
        const [commentLikesCount, setCommentLikesCount] = useState(comment.likes || 0);

        // Manejar like de comentario
        const handleCommentLike = (e: React.MouseEvent) => {
            e.stopPropagation(); // Evitar propagación del evento

            // Llamar a la API para dar/quitar like al comentario
            communityService.likeComment(comment.id)
                .then(response => {
                    setIsCommentLiked(response.status === 'liked');
                    setCommentLikesCount(response.likes);
                    // Actualizar también el objeto del comentario para mantener sincronizados los estados
                    comment.isLiked = response.status === 'liked';
                    comment.likesCount = response.likes;
                })
                .catch(error => {
                    console.error('Error al dar/quitar like al comentario:', error);
                });
        };
        return (
            <div className={`${nestingLevel > 0 ? `mb-3` : 'mb-4'}`}>
                <div className="flex gap-2">
                    {/* Avatar y detalles del autor */}
                    <div className="relative flex-shrink-0 self-start">
                        <div className="w-8 h-8 bg-[#444442] rounded-full overflow-hidden border border-white/10">
                            {comment.author.avatarUrl ? (
                                <Image
                                    src={formatAvatarUrl(comment.author.avatarUrl) || ''}
                                    alt={comment.author.username}
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-cover"
                                    unoptimized={true}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                    {comment.author.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        {comment.author.level && (
                            <div className="absolute -bottom-1 -right-1 z-10">
                                <UserLevelBadge level={comment.author.level} size="sm" showTooltip={true} />
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
                            {/* Siempre renderizar como string */}
                            {typeof comment.content === 'string'
                                ? comment.content
                                : (comment.content ? JSON.stringify(comment.content) : '')}
                        </div>

                        {/* Acciones del comentario */}
                        <div className="flex items-center gap-4 ml-1">
                            <div className="flex items-center gap-1">
                                <button
                                    className={`p-1 rounded-full ${isCommentLiked ? 'text-blue-400' : 'text-zinc-400 hover:text-zinc-300'}`}
                                    onClick={handleCommentLike}
                                    aria-label={isCommentLiked ? 'Quitar like' : 'Dar like'}
                                >
                                    <ThumbsUp size={14} />
                                </button>
                                {commentLikesCount > 0 && (
                                    <span className="text-xs text-zinc-400">{commentLikesCount}</span>
                                )}
                            </div>
                            <button
                                className="text-zinc-400 hover:text-zinc-300 text-xs flex items-center gap-1"
                                onClick={() => handleReplyToComment(
                                    comment.id,
                                    comment.author.username,
                                    isNested,
                                    comment.parentId,
                                    nestingLevel,
                                    comment.parentCommentId,
                                    comment.author.id || '' // Pasamos el ID del autor para la mención
                                )}
                                aria-label={`Reply to ${comment.author.username}`}
                            >
                                <CornerUpRight size={14} />
                                Reply
                            </button>
                        </div>
                    </div>
                </div>

                {/* Renderizar respuestas anidadas */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className={`ml-${Math.min(nestingLevel * 2 + 8, 20)} mt-3 pl-4 border-l-2 border-[#3a3a38]`}>
                        {(comment.replies as EnhancedComment[]).map(reply => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                isNested={true}
                                nestingLevel={nestingLevel + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

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

    // Format content with title and body
    const formatContent = () => {
        if (!selectedPost) return { title: '', body: '', features: null };

        // Asegurarse de que post.content sea un string
        const contentStr = typeof selectedPost.content === 'string'
            ? selectedPost.content
            : (selectedPost.content ? JSON.stringify(selectedPost.content) : '');

        // Verificar si hay contenido enriquecido
        const enrichedContent = getEnrichedContent(contentStr);
        const plainContent = enrichedContent ? enrichedContent.text : contentStr;
        const contentFeatures = enrichedContent ? enrichedContent.features : null;

        // Si el post tiene título explícito, usarlo
        if (selectedPost.title) {
            return {
                title: selectedPost.title,
                body: plainContent,
                features: contentFeatures
            };
        }

        // Si no tiene título, extraerlo de la primera línea del contenido (compatibilidad con posts antiguos)
        const contentLines = plainContent.split('\n');
        const title = contentLines[0];
        const body = contentLines.slice(1).join('\n');

        return { title, body, features: contentFeatures };
    };

    if (!isOpen || !selectedPost) return null;

    const { title, body, features } = formatContent();
    const isReply = typeof selectedPost.content === 'string' && selectedPost.content.startsWith('Re:');

    return (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-start justify-center pt-8 sm:pt-16 overflow-y-auto">
            <div
                ref={modalRef}
                className="bg-[#1f1f1e] w-full max-w-3xl mx-4 rounded-lg border border-white/10 shadow-xl z-50"
            >
                {/* Header */}
                <div className="flex justify-between items-center px-5 py-2.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <Bell size={14} className="text-zinc-400" />
                        <span className="text-zinc-300 text-xs">
                            {post.isPinned ? 'Post fijado' : 'Post de la comunidad'}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white text-xl"
                        aria-label="Close dialog"
                    >
                        &times;
                    </button>
                </div>

                {/* Post Content */}
                <div className="px-5 py-3">
                    <UserBadge
                        username={post.author.username}
                        level={post.author.level}
                        avatarUrl={post.author.avatarUrl || post.author.avatar_url}
                        timestamp={post.timestamp || post.created_at || 'hace un momento'}
                        category={typeof post.category === 'object' && post.category !== null ? post.category.name : post.category}
                        categoryColor={post.categoryColor || 'bg-[#444442] border border-white/5'}
                    />

                    {/* Title */}
                    {isReply ? (
                        <div className="mt-2 mb-1 font-medium flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            <h2 id="post-detail-title" className="text-white text-lg">{title}</h2>
                        </div>
                    ) : (
                        <h2 id="post-detail-title" className="mt-2 mb-1 font-medium text-white text-lg">{title}</h2>
                    )}

                    {/* Body */}
                    <div className="mb-3">
                        <p className="text-zinc-200">{body}</p>
                    </div>

                    {/* Enlace si existe */}
                    {features && features.link && (
                        <div className="mb-4 bg-[#252524] p-3 rounded-lg border border-white/10">
                            <a
                                href={features.link.startsWith('http') ? features.link : `https://${features.link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline flex items-center gap-2"
                                onClick={(e) => e.stopPropagation()} // Evitar propagación
                            >
                                <div className="bg-blue-500/20 p-1.5 rounded">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        <div className="mb-4 rounded-lg overflow-hidden border border-white/10">
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
                                                    onClick={(e) => e.stopPropagation()}
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
                                                    onClick={(e) => e.stopPropagation()}
                                                ></iframe>
                                            </div>
                                        );
                                    }
                                }

                                // Si no se reconoce el formato o no se pudo extraer el ID, mostrar enlace
                                return (
                                    <div className="p-3 bg-[#252524] flex items-center gap-2">
                                        <div className="bg-red-500/20 p-1.5 rounded">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <a
                                            href={videoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-red-400 hover:underline"
                                            onClick={(e) => e.stopPropagation()} // Evitar propagación
                                        >
                                            Ver video
                                        </a>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Encuesta si existe */}
                    {features && features.poll && features.poll.length >= 2 && (
                        <div className="mb-4 bg-[#252524] p-4 rounded-lg border border-white/10">
                            <h4 className="text-white font-medium mb-3">Encuesta</h4>
                            <div className="space-y-3">
                                {features.poll.map((option: any) => {
                                    // Obtener resultados de la encuesta si existen
                                    const pollResults = features.poll_results || {};
                                    const totalVotes = Object.values(pollResults).reduce((a: number, b: number) => a + (b as number), 0) as number;
                                    const optionVotes = pollResults[option.id] || 0;
                                    const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;

                                    return (
                                        <div
                                            key={option.id}
                                            className="relative bg-[#323230] hover:bg-[#3a3a38] transition-colors rounded-lg p-3 text-zinc-200 cursor-pointer flex items-center gap-2 overflow-hidden"
                                            onClick={() => {
                                                if (!selectedPost) return;
                                                // Llamar al servicio para votar
                                                communityService.votePoll(selectedPost.id, option.id)
                                                    .then(response => {
                                                        console.log('Voto registrado:', response);

                                                        // Actualizar el post con los nuevos resultados
                                                        if (selectedPost && typeof selectedPost.content === 'string') {
                                                            try {
                                                                const contentObj = JSON.parse(selectedPost.content);
                                                                if (contentObj.features) {
                                                                    contentObj.features.poll_results = response.poll_results;
                                                                    // Crear una copia del post con el contenido actualizado
                                                                    const updatedPost = {
                                                                        ...selectedPost,
                                                                        content: JSON.stringify(contentObj)
                                                                    };
                                                                    // Actualizar el estado
                                                                    setSelectedPost(updatedPost);
                                                                }
                                                            } catch (e) {
                                                                console.error('Error al actualizar resultados:', e);
                                                            }
                                                        }
                                                    })
                                                    .catch(error => {
                                                        console.error('Error al votar:', error);
                                                    });
                                            }}
                                        >
                                            {/* Barra de progreso */}
                                            {totalVotes > 0 && (
                                                <div
                                                    className="absolute top-0 left-0 h-full bg-blue-500/20"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            )}

                                            <div className={`w-5 h-5 rounded-full border ${totalVotes > 0 && optionVotes > 0 ? 'border-blue-500 bg-blue-500/20' : 'border-zinc-500'} flex-shrink-0 relative z-10`}></div>

                                            {/* Contenido de la opción con el porcentaje */}
                                            <div className="flex flex-1 justify-between items-center relative z-10">
                                                <span>{option.text}</span>
                                                {totalVotes > 0 && (
                                                    <span className="text-sm text-blue-300 ml-2">{percentage}%</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Mostrar total de votos si hay resultados */}
                                {features.poll_results && Object.keys(features.poll_results).length > 0 && (
                                    <div className="text-sm text-zinc-400 mt-2 text-right">
                                        {Object.values(features.poll_results).reduce((a: number, b: number) => a + (b as number), 0)} votos
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Imágenes para el post */}
                    {post.imageUrl && (
                        <div className="mt-2 mb-3">
                            {/* Verificar si hay múltiples imágenes en el contenido */}
                            {(() => {
                                try {
                                    if (typeof selectedPost?.content === 'string' && selectedPost.content.includes('multi_image')) {
                                        const contentObj = JSON.parse(selectedPost.content);
                                        if (contentObj.features && contentObj.features.multi_image) {
                                            const imagesCount = contentObj.features.images_count || 1;

                                            // Preparar URLs para todas las imágenes
                                            const baseImageUrl = formatImageUrl(post.imageUrl) || '';

                                            // Si hay 2 imágenes
                                            if (imagesCount === 2) {
                                                return (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            className="cursor-pointer hover:opacity-90 transition-opacity"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setImageViewerOpen(true);
                                                            }}
                                                            aria-label="Ver primera imagen a tamaño completo"
                                                        >
                                                            <Image
                                                                src={baseImageUrl}
                                                                alt={`Imagen 1 de ${title}`}
                                                                width={300}
                                                                height={300}
                                                                className="rounded-lg w-full h-56 object-cover border border-white/10"
                                                                unoptimized={true}
                                                            />
                                                        </button>
                                                        <div className="w-full h-56 bg-gray-700 rounded-lg border border-white/10 flex items-center justify-center text-white/70">
                                                            <span>+1 imagen más</span>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            // Si hay 3 imágenes
                                            if (imagesCount === 3) {
                                                return (
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <button
                                                            className="cursor-pointer hover:opacity-90 transition-opacity"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setImageViewerOpen(true);
                                                            }}
                                                            aria-label="Ver primera imagen a tamaño completo"
                                                        >
                                                            <Image
                                                                src={baseImageUrl}
                                                                alt={`Imagen 1 de ${title}`}
                                                                width={200}
                                                                height={200}
                                                                className="rounded-lg w-full h-40 object-cover border border-white/10"
                                                                unoptimized={true}
                                                            />
                                                        </button>
                                                        <div className="w-full h-40 bg-gray-700 rounded-lg border border-white/10 flex items-center justify-center text-white/70">
                                                            <span>+1</span>
                                                        </div>
                                                        <div className="w-full h-40 bg-gray-700 rounded-lg border border-white/10 flex items-center justify-center text-white/70">
                                                            <span>+1</span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        }
                                    }
                                } catch (e) {
                                    console.log("Error parsing content for multiple images in modal", e);
                                }

                                // Por defecto, mostrar solo la imagen principal
                                return (
                                    <button
                                        className="cursor-pointer hover:opacity-90 transition-opacity block w-full"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setImageViewerOpen(true);
                                        }}
                                        aria-label="Ver imagen a tamaño completo"
                                    >
                                        <Image
                                            src={formatImageUrl(post.imageUrl) || ''}
                                            alt={`Contenido de ${title}`}
                                            width={600}
                                            height={400}
                                            className="rounded-lg max-h-72 object-cover border border-white/10"
                                            unoptimized={true}
                                        />
                                    </button>
                                );
                            })()}
                        </div>
                    )}

                    {/* Interactions */}
                    <div className="flex items-center gap-4 mt-3 pb-3 border-b border-white/10 text-zinc-300">
                        <div className="flex items-center gap-1">
                            <button
                                className={`p-1 rounded-full ${liked ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-[#444442]'}`}
                                onClick={handleLike}
                                aria-label={liked ? "Unlike post" : "Like post"}
                                aria-pressed={liked}
                            >
                                <ThumbsUp size={16} />
                            </button>
                            <span className="text-sm">{likesCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                className="p-1 hover:bg-[#444442] rounded-full"
                                aria-label="View comments"
                            >
                                <MessageCircle size={16} />
                            </button>
                            <span className="text-sm">{post.comments}</span>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="mt-5">
                        <h3 className="text-white font-medium mb-4 text-sm">Comentarios ({comments.length})</h3>

                        {/* Lista de comentarios existentes - Renderizado recursivo */}
                        {comments.length > 0 ? (
                            <div className="space-y-4 mb-5">
                                {comments.map(comment => (
                                    <CommentItem key={comment.id} comment={comment} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-zinc-500 text-sm mb-4">
                                Aún no hay comentarios. ¡Sé el primero en comentar!
                            </div>
                        )}

                        {/* Add Comment */}
                        <div className="flex gap-2 mt-4 border-t border-white/10 pt-4">
                            <div className="relative flex-shrink-0 self-start">
                                <div className="w-8 h-8 bg-[#444442] rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                                    {currentUser?.avatar_url ? (
                                        <Image
                                            src={formatAvatarUrl(currentUser.avatar_url) || ''}
                                            alt={currentUser.username || 'Tu avatar'}
                                            width={32}
                                            height={32}
                                            className="w-full h-full object-cover"
                                            unoptimized={true}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                            {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 'T'}
                                        </div>
                                    )}
                                </div>
                                {currentUser?.level && (
                                    <div className="absolute -bottom-1 -right-1 z-10">
                                        <UserLevelBadge level={currentUser.level} size="sm" showTooltip={true} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                {/* Indicador de respuesta - Mejorado para mostrar nivel */}
                                {replyToComment && (
                                    <div className="flex items-center gap-2 mb-2 text-xs text-blue-400">
                                        <CornerUpRight size={14} />
                                        <span>
                                            Respondiendo a {replyToComment.username}
                                            {replyToComment.replyLevel > 1 ? ` (respuesta anidada)` : ''}
                                        </span>
                                        <button
                                            onClick={cancelReply}
                                            className="text-zinc-400 hover:text-zinc-300 ml-2"
                                            aria-label="Cancel reply"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}

                                {/* Botón de respuesta rápida */}
                                {!replyToComment && lastRespondedComment && comment.trim() === '' && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <button
                                            onClick={() => handleReplyToComment(
                                                lastRespondedComment.id,
                                                lastRespondedComment.username,
                                                lastRespondedComment.isNested,
                                                lastRespondedComment.parentId,
                                                lastRespondedComment.replyLevel - 1,
                                                lastRespondedComment.parentCommentId,
                                                lastRespondedComment.userId // Pasamos el ID del usuario para la mención
                                            )}
                                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                            aria-label={`Reply again to ${lastRespondedComment.username}`}
                                        >
                                            <CornerUpRight size={14} />
                                            Responder de nuevo a {lastRespondedComment.username}
                                        </button>
                                    </div>
                                )}

                                <div className="bg-[#252524] rounded-full flex items-center border border-white/5 mb-2">
                                    <input
                                        id="comment-input"
                                        type="text"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Your comment"
                                        className="flex-1 bg-transparent text-zinc-200 outline-none px-3 py-1.5 text-sm rounded-full"
                                        aria-label="Write a comment"
                                    />
                                    <div className="flex items-center mr-3 space-x-1">
                                        <button
                                            className="p-1 text-zinc-500 hover:text-zinc-300"
                                            aria-label="Add GIF"
                                        >
                                            <span className="text-xs font-bold">GIF</span>
                                        </button>
                                        <button
                                            className="p-1 text-zinc-500 hover:text-zinc-300"
                                            aria-label="Add emoji"
                                        >
                                            <Smile size={16} />
                                        </button>
                                    </div>
                                </div>

                                {comment.trim() !== '' && (
                                    <div className="flex justify-end mt-1.5 space-x-2">
                                        <button
                                            onClick={() => {
                                                if (confirmDiscardComment()) {
                                                    setComment('');
                                                    setReplyToComment(null);
                                                }
                                            }}
                                            className="text-zinc-400 hover:text-zinc-300 text-xs font-medium px-3 py-2"
                                        >
                                            CANCEL
                                        </button>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={addComment}
                                            className="rounded-full font-medium text-sm bg-amber-400 hover:bg-amber-500 text-black"
                                        >
                                            Comentar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de visualización de imagen completa */}
            {post.imageUrl && imageViewerOpen && (
                <ImageViewerModal
                    imageUrl={post.imageUrl}
                    isOpen={imageViewerOpen}
                    onClose={() => setImageViewerOpen(false)}
                    altText={`Imagen de ${post.author.username}: ${title}`}
                />
            )}
        </div>
    );
};