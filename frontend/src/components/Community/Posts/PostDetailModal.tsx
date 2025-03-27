import { ThumbsUp, MessageCircle, Bell, Smile, CornerUpRight } from 'lucide-react';
import { formatRelativeTime } from '@/utils/dateUtils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useRef, useEffect, useState, useCallback } from 'react';

import { ImageViewerModal } from '@/components/Community/Posts/ImageViewerModal';
import { UserBadge } from '@/components/Community/UserBadge';
import { Button } from '@/components/ui/button';
import UserLevelBadge from '@/components/ui/UserLevelBadge';
import { authService, UserProfile } from '@/services/auth';
import { communityService } from '@/services/community';
import { Comment } from '@/types/Comment'; // Assuming Comment.ts is in '@/types/Comment'
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

    // Actualizar selectedPost y estados de like cuando cambia el prop post
    useEffect(() => {
        if (post) {
            setSelectedPost(post);
            setLiked(post.is_liked || false);
            setLikesCount(post.likes || 0);
        }
    }, [post]);

    const _router = useRouter();
    const [comment, setComment] = useState('');
    const [replyToComment, setReplyToComment] = useState<ReplyToInfo | null>(null);
    const [lastRespondedComment, setLastRespondedComment] = useState<ReplyToInfo | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    // Ensure liked state is properly tracked from the post prop
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

        // No need to update state here, it's already handled in the post useEffect

        // Reiniciar el estado del visor de imágenes al abrir el post
        if (isOpen) {
            setImageViewerOpen(false);
        }
    }, [isOpen, selectedPost]); // Depend on selectedPost now

    // Función para confirmar salida si hay comentario pendiente (memoizada para evitar recreación)
    const confirmDiscardComment = useCallback((): boolean => {
        if (comment.trim() !== '') {
            return window.confirm("Aún no has terminado tu comentario. ¿Quieres irte sin terminar?");
        }
        return true;
    }, [comment]);

    // Definición de la animación personalizada
    const animatePulseLight = `
        @keyframes pulseLight {
            0% { opacity: 1; }
            50% { opacity: 0.85; }
            100% { opacity: 1; }
        }
        .animate-pulse-light {
            animation: pulseLight 2s ease-in-out;
        }
    `;
    
    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                if (confirmDiscardComment() && !imageViewerOpen) { // No cerrar si el visor de imagen está abierto
                    setComment('');
                    cancelReply(); // Also cancel reply on close
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
                    cancelReply(); // Also cancel reply on close
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
        // Use selectedPost here too
        if (selectedPost && selectedPost.id) {
             const originalLiked = liked;
             const originalCount = likesCount;

             // Optimistic update
             setLiked(!originalLiked);
             setLikesCount(originalLiked ? originalCount - 1 : originalCount + 1);

            communityService.likePost(selectedPost.id)
                .then(response => {
                    // Confirm update
                    setLiked(response.status === 'liked');
                    setLikesCount(response.likes);
                    // Update selectedPost state
                    setSelectedPost(prevPost => prevPost ? {...prevPost, is_liked: response.status === 'liked', likes: response.likes} : null);
                    
                    // Dispatch event to synchronize like state across the app
                    const likeUpdateEvent = new CustomEvent('post-like-update', {
                        detail: { 
                            postId: selectedPost.id, 
                            isLiked: response.status === 'liked',
                            likesCount: response.likes
                        }
                    });
                    window.dispatchEvent(likeUpdateEvent);
                })
                .catch(error => {
                    console.error('Error al dar/quitar like:', error);
                    // Revert optimistic update on error
                    setLiked(originalLiked);
                    setLikesCount(originalCount);
                });
        }
    };

    // Función para actualizar la caché plana de comentarios (no se usa activamente, podría eliminarse si no es necesaria)
    const updateAllCommentsCache = (commentsArray: EnhancedComment[]) => {
        const cache: { [key: string]: EnhancedComment } = {};

        const processComments = (comments: EnhancedComment[], level = 0) => {
            comments.forEach(c => {
                if (!c) return; // Safety check
                c.replyLevel = level;
                cache[c.id] = c;

                if (c.replies && Array.isArray(c.replies) && c.replies.length > 0) {
                    processComments(c.replies as EnhancedComment[], level + 1);
                }
            });
        };

        processComments(commentsArray);
         // console.log("Updated comment cache:", cache); // For debugging if needed
    };

    // Emitir evento cuando cambie el contador de comentarios
    useEffect(() => {
        if (selectedPost) {
            const commentUpdateEvent = new CustomEvent('post-comment-update', {
                detail: { 
                    postId: selectedPost.id, 
                    commentCount: selectedPost.comments
                }
            });
            // Usar un pequeño retraso para asegurar que ocurra después del renderizado
            const timerId = setTimeout(() => {
                window.dispatchEvent(commentUpdateEvent);
            }, 0);
            
            return () => clearTimeout(timerId);
        }
    }, [selectedPost?.comments, selectedPost?.id]);
    
    // Cargar comentarios
    useEffect(() => {
        // Use selectedPost
        if (selectedPost && isOpen) {
            const fetchComments = async () => {
                try {
                    // Cargar comentarios del post seleccionado desde la API
                    const commentsData = await communityService.getPostComments(selectedPost.id);

                    const commentsArray = Array.isArray(commentsData)
                        ? commentsData
                        : (commentsData.results || []);

                     // Normalizar y estructurar comentarios y respuestas
                    const processComment = (comment: Comment, level: number = 0, directParentId?: string, rootCommentId?: string): EnhancedComment => {
                         // Ensure content is string
                        const content = typeof comment.content === 'string'
                            ? comment.content
                            : JSON.stringify(comment.content);

                        const authorAvatarUrl = comment.author?.avatar_url || comment.author?.avatarUrl;
                        // --- FIX IS HERE ---
                        const mentionedUser = comment.mentionedUser; // Use the existing string property from the interface
                        // --- END FIX ---

                        const enhanced: EnhancedComment = {
                            ...comment,
                            content: content,
                            replyLevel: level,
                            parentId: directParentId, // ID of the direct parent
                            parentCommentId: rootCommentId || (level > 0 ? directParentId : undefined), // ID of the top-level comment
                            isLiked: comment.is_liked || false,
                            likesCount: comment.likes || 0,
                            author: {
                                ...comment.author,
                                id: comment.author?.id || '',
                                username: comment.author?.username || '', // Ensure username is never undefined
                                avatarUrl: authorAvatarUrl
                            },
                            mentionedUser: mentionedUser, // Assign the extracted string
                            timestamp: comment.timestamp || comment.created_at || new Date().toISOString(), // Ensure timestamp exists
                            created_at: comment.created_at || comment.timestamp || new Date().toISOString(), // Guardar created_at original
                            replies: [], // Initialize replies array
                        };

                        // Recursively process replies
                        if (comment.replies && Array.isArray(comment.replies)) {
                             enhanced.replies = comment.replies.map(reply =>
                                processComment(reply, level + 1, comment.id, rootCommentId || comment.id)
                            );
                        }

                        return enhanced;
                    };

                    const enhancedComments = commentsArray.map((comment: Comment) => processComment(comment));

                    setComments(enhancedComments);
                    updateAllCommentsCache(enhancedComments); // Update cache if using it
                } catch (error) {
                    console.error('Error al cargar comentarios:', error);
                    setComments([]); // Clear comments on error
                }
            };

            fetchComments();
        } else if (!isOpen) {
             // Clear comments when modal closes
             setComments([]);
             setComment('');
             cancelReply();
        }
    }, [selectedPost, isOpen]); // Depend on selectedPost

    // Manejar respuesta a un comentario (principal o anidado)
    const handleReplyToComment = (
        commentId: string,
        username: string,
        isNested: boolean = false,
        directParentId?: string, // ID of the comment being directly replied to
        replyLevel: number = 0, // Level of the comment being replied to
        parentCommentId?: string, // ID of the root comment
        userId?: string
    ) => {
        // If replying to a nested comment, parentCommentId should already be set.
        // If replying to a root comment (level 0), the commentId itself is the parentCommentId for the new reply.
        const rootCommentId = parentCommentId || (replyLevel === 0 ? commentId : undefined);

        setReplyToComment({
            id: commentId,          // ID of the comment being replied to
            username,
            isNested,
            parentId: directParentId, // Keep track of direct parent for potential future use
            replyLevel: replyLevel + 1, // The level of the *new* reply
            parentCommentId: rootCommentId, // ID of the root comment thread
            userId: userId          // ID of the user being replied to (for @mention)
        });

        // Enfocar el campo de comentario
        document.getElementById('comment-input')?.focus();
    };

    // Cancelar respuesta
    const cancelReply = () => {
        setReplyToComment(null);
    };

    // Función recursiva auxiliar para añadir la respuesta al árbol de comentarios
    const addReplyToCommentTree = (
        commentsList: EnhancedComment[],
        targetParentId: string, // The ID of the comment we are replying *to*
        newReply: EnhancedComment
    ): EnhancedComment[] => {
        return commentsList.map(c => {
            if (!c) return c; // Safety check

            // If this comment is the one we're replying to, add the reply to its replies array
            if (c.id === targetParentId) {
                 // console.log(`Found target parent ${targetParentId}, adding reply.`); // Debugging
                return {
                    ...c,
                    // Ensure replies array exists and add the new reply
                    replies: [...(Array.isArray(c.replies) ? c.replies : []), newReply]
                };
            }

            // If this comment has replies, search recursively within them
            if (c.replies && Array.isArray(c.replies) && c.replies.length > 0) {
                 // console.log(`Searching replies of ${c.id} for target ${targetParentId}`); // Debugging
                return {
                    ...c,
                    replies: addReplyToCommentTree(c.replies as EnhancedComment[], targetParentId, newReply)
                };
            }

            // Not the comment or its descendants
            return c;
        });
    };


    // Añadir un nuevo comentario o respuesta
    const addCommentOrReply = async () => {
        if (comment.trim() === '' || !selectedPost) return; // Ensure post exists

        const commentContent = comment.trim();
        setComment(''); // Clear input field immediately for better UX
        
        try {
            // Obtener datos del usuario actual
            const userProfile = currentUser || await authService.getProfile();
            
            // Crear un ID temporal para el comentario
            const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Crear un comentario optimista que se mostrará inmediatamente
            const now = new Date().toISOString(); // Usar una fecha ISO real para evitar errores de parseo
            const optimisticComment: EnhancedComment = {
                id: tempId,
                author: {
                    id: userProfile?.id || '',
                    username: userProfile?.username || 'Usuario',
                    level: userProfile?.level,
                    avatarUrl: userProfile?.avatar_url || undefined,
                },
                content: commentContent,
                timestamp: 'ahora mismo', // Texto amigable para el usuario
                created_at: now, // Fecha real para operaciones internas
                likes: 0,
                is_liked: false,
                isLiked: false,
                likesCount: 0,
                mentionedUser: replyToComment?.username,
                replyLevel: replyToComment ? replyToComment.replyLevel : 0,
                parentId: replyToComment?.id,
                parentCommentId: replyToComment?.parentCommentId,
                replies: [],
            };

            // Actualizar UI inmediatamente (optimistic update)
            if (replyToComment) {
                // Es una respuesta a un comentario existente
                setComments(prevComments => {
                    const updatedComments = addReplyToCommentTree(
                        prevComments, 
                        replyToComment.id, 
                        optimisticComment
                    );
                    updateAllCommentsCache(updatedComments);
                    return updatedComments;
                });

                // Guardar referencia para "responder de nuevo"
                setLastRespondedComment({ ...replyToComment });
                setReplyToComment(null);
            } else {
                // Es un comentario nuevo de primer nivel
                setComments(prevComments => {
                    const updatedComments = [...prevComments, optimisticComment];
                    updateAllCommentsCache(updatedComments);
                    return updatedComments;
                });
                setLastRespondedComment(null);
            }

            // Actualizar el contador de comentarios del post (optimistic)
            setSelectedPost(prevPost => 
                prevPost ? {...prevPost, comments: (prevPost.comments || 0) + 1} : null
            );

            // Preparar datos para la API
            const commentData = {
                post_id: selectedPost.id,
                content: commentContent,
                parent_id: replyToComment?.id,
                mentioned_user_id: replyToComment?.userId || undefined
            };

            // Enviar a la API en segundo plano
            const response = await communityService.createComment(commentData);

            // Una vez recibida la respuesta, actualizar el comentario temporal con los datos reales
            setComments(prevComments => {
                // Función para actualizar un comentario temporal en el árbol de comentarios
                const updateCommentInTree = (comments: EnhancedComment[]): EnhancedComment[] => {
                    return comments.map(c => {
                        if (c.id === tempId) {
                            // Reemplazar el comentario temporal con el real
                            return {
                                ...response,
                                id: response.id,
                                author: {
                                    id: userProfile?.id || '',
                                    username: userProfile?.username || 'Usuario',
                                    level: userProfile?.level,
                                    avatarUrl: userProfile?.avatar_url,
                                },
                                content: response.content || commentContent,
                                timestamp: response.timestamp || response.created_at || 'ahora mismo',
                                likes: response.likes || 0,
                                is_liked: response.is_liked || false,
                                isLiked: response.is_liked || false,
                                likesCount: response.likes || 0,
                                mentionedUser: c.mentionedUser,
                                replyLevel: c.replyLevel,
                                parentId: c.parentId,
                                parentCommentId: c.parentCommentId,
                                replies: c.replies || [],
                            };
                        }
                        
                        // Si tiene respuestas, buscar recursivamente
                        if (c.replies && Array.isArray(c.replies) && c.replies.length > 0) {
                            return {
                                ...c,
                                replies: updateCommentInTree(c.replies as EnhancedComment[])
                            };
                        }
                        
                        return c;
                    });
                };
                
                // Actualizar toda la estructura de comentarios
                const updatedComments = updateCommentInTree(prevComments);
                updateAllCommentsCache(updatedComments);
                return updatedComments;
            });

        } catch (error) {
            console.error('Error al añadir comentario/respuesta:', error);
            // Mostrar mensaje de error y restaurar el comentario al campo de entrada
            setComment(commentContent);
            // Opcionalmente mostrar un toast o alerta de error
        }
    };


    // Componente recursivo para renderizar comentarios
    const CommentItem = ({
        comment,
        isNested = false, // Indicates if it's rendered as part of a reply chain (visual style maybe)
        nestingLevel = 0 // Actual depth in the tree
    }: {
        comment: EnhancedComment,
        isNested?: boolean, // May not be needed if using nestingLevel for style
        nestingLevel?: number
    }) => {
        // State for likes specific to this comment instance
        const [isCommentLiked, setIsCommentLiked] = useState(comment.isLiked || false);
        const [commentLikesCount, setCommentLikesCount] = useState(comment.likesCount || 0);

        // Handle liking/unliking a comment
        const handleCommentLike = (e: React.MouseEvent) => {
            e.stopPropagation();

             const originalLiked = isCommentLiked;
             const originalCount = commentLikesCount;

             // Optimistic update
             setIsCommentLiked(!originalLiked);
             setCommentLikesCount(originalLiked ? originalCount - 1 : originalCount + 1);

            communityService.likeComment(comment.id)
                .then(response => {
                    // Confirm update from server
                    setIsCommentLiked(response.status === 'liked');
                    setCommentLikesCount(response.likes);
                    // Update the comment object in the main state might be complex here.
                    // Consider refetching or using a more robust state management solution
                    // For now, local state handles the UI update.
                })
                .catch(error => {
                    console.error('Error al dar/quitar like al comentario:', error);
                     // Revert optimistic update on error
                    setIsCommentLiked(originalLiked);
                    setCommentLikesCount(originalCount);
                });
        };

        // Use nestingLevel to determine indentation
        const indentationClass = nestingLevel > 0 ? `ml-8` : ''; // Adjust margin based on level
        const borderClass = nestingLevel > 0 ? `pl-4 border-l-2 border-[#3a3a38]` : '';

        return (
            <div className={`mb-6 ${indentationClass}`}>
                 <div className={` ${borderClass}`}>
                    <div className="flex gap-2">
                        {/* Avatar and author details */}
                        <div className="relative flex-shrink-0 self-start mt-1">
                             <div className="w-8 h-8 bg-[#444442] rounded-full overflow-hidden border border-white/10">
                                {comment.author?.avatarUrl ? (
                                    <Image
                                        src={formatAvatarUrl(comment.author.avatarUrl) || '/default-avatar.png'} // Provide a fallback avatar
                                        alt={comment.author.username || 'Avatar'}
                                        width={32}
                                        height={32}
                                        className="w-full h-full object-cover"
                                        unoptimized={true}
                                        onError={(e) => (e.currentTarget.src = '/default-avatar.png')} // Fallback on error
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm font-semibold">
                                        {(comment.author?.username || '?').charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            {comment.author?.level !== undefined && comment.author.level !== null && (
                                <div className="absolute -bottom-1 -right-1 z-10">
                                    <UserLevelBadge level={comment.author.level} size="sm" showTooltip={true} />
                                </div>
                            )}
                        </div>

                        {/* Comment content and actions */}
                        <div className="flex-1">
                            {/* Comment Header */}
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-medium text-white text-sm">{comment.author?.username || 'Usuario'}</span>
                                <span className="text-xs text-zinc-400">{formatRelativeTime(comment.timestamp)}</span>
                            </div>

                            {/* Comment Body */}
                            <div className="bg-[#2a2a29] rounded-lg px-3 py-2 text-zinc-200 text-sm mb-1 break-words">
                                {/* Display @mention if present (using the string property) */}
                                {comment.mentionedUser && comment.replyLevel && comment.replyLevel > 0 && (
                                    <span className="text-blue-400 font-medium mr-1">@{comment.mentionedUser}</span>
                                )}
                                {/* Render content safely */}
                                {comment.content}
                            </div>

                            {/* Comment Actions */}
                            <div className="flex items-center gap-4 ml-1 text-xs">
                                <div className="flex items-center gap-1">
                                    <button
                                        className={`p-1 rounded-full transition-all transform hover:scale-110 ${isCommentLiked ? 'text-blue-400 hover:text-blue-500' : 'text-zinc-400 hover:text-zinc-300'}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            
                                            // Crear un elemento temporal para mostrar efecto de animación
                                            const button = e.currentTarget;
                                            const rect = button.getBoundingClientRect();
                                            const tempIcon = document.createElement('div');
                                            tempIcon.innerHTML = `<svg 
                                              width="14" 
                                              height="14" 
                                              viewBox="0 0 24 24" 
                                              fill="none" 
                                              stroke="${!isCommentLiked ? '#3b82f6' : '#9ca3af'}" 
                                              stroke-width="2" 
                                              stroke-linecap="round" 
                                              stroke-linejoin="round"
                                              class="lucide lucide-thumbs-up"
                                            >
                                              <path d="M7 10v12"></path>
                                              <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                                            </svg>`;
                                            
                                            tempIcon.style.position = 'fixed';
                                            tempIcon.style.left = `${rect.left + rect.width/2 - 7}px`;
                                            tempIcon.style.top = `${rect.top + rect.height/2 - 7}px`;
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
                                            
                                            // Llamar al manejador original
                                            handleCommentLike(e);
                                        }}
                                        aria-label={isCommentLiked ? 'Quitar like' : 'Dar like'}
                                    >
                                        <ThumbsUp size={14} className={isCommentLiked ? 'transform animate-pulse' : ''} />
                                    </button>
                                    {/* Show count only if > 0 */}
                                    {commentLikesCount > 0 && (
                                        <span className="text-zinc-400 tabular-nums">{commentLikesCount}</span>
                                    )}
                                </div>
                                <button
                                    className="text-zinc-400 hover:text-zinc-300 flex items-center gap-1"
                                    onClick={() => handleReplyToComment(
                                        comment.id,
                                        comment.author?.username || 'Usuario',
                                        true, // It's nested visually if level > 0
                                        comment.id, // Direct parent is this comment
                                        comment.replyLevel || 0, // Pass the level of this comment
                                        comment.parentCommentId, // Pass the root comment ID
                                        comment.author?.id || '' // Pass author ID for mention
                                    )}
                                    aria-label={`Responder a ${comment.author?.username || 'Usuario'}`}
                                >
                                    <CornerUpRight size={14} />
                                    Responder
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Render Replies Recursively */}
                {comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0 && (
                     <div className={`mt-3`}> {/* No extra border/padding needed here, handled by child's indentation */}
                        {(comment.replies as EnhancedComment[]).map(reply => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                isNested={true} // All replies are nested relative to their parent
                                nestingLevel={nestingLevel + 1} // Increment nesting level
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // --- Helper Functions for Content Formatting ---

    const getEnrichedContent = (contentStr: string | null | undefined): { text: string; features: any | null } | null => {
        if (!contentStr) return null;
        try {
            const parsedContent = JSON.parse(contentStr);
            // Basic check for enriched content structure
            if (typeof parsedContent === 'object' && parsedContent !== null) {
                return {
                    text: parsedContent.text || '', // Ensure text field exists
                    features: parsedContent.features || null
                };
            }
            return null;
        } catch (e) {
            return null; // Not JSON or invalid structure
        }
    };

    const formatContent = () => {
        if (!selectedPost) return { title: '', body: '', features: null };

        const contentStr = typeof selectedPost.content === 'string'
            ? selectedPost.content
            : JSON.stringify(selectedPost.content || '');

        const enriched = getEnrichedContent(contentStr);

        if (enriched) {
            // If enriched content exists, use its text. The title might still be separate.
            return {
                title: selectedPost.title || enriched.text.split('\n')[0] || 'Post', // Use post title or first line of enriched text
                body: selectedPost.title ? enriched.text : enriched.text.split('\n').slice(1).join('\n'), // Use full enriched text if title exists, else skip first line
                features: enriched.features
            };
        } else {
            // If not enriched, treat contentStr as plain text
            const contentLines = contentStr.split('\n');
            const displayTitle = selectedPost.title || contentLines[0] || 'Post';
            const displayBody = selectedPost.title ? contentStr : contentLines.slice(1).join('\n');
            return {
                title: displayTitle,
                body: displayBody,
                features: null // No features for plain text
            };
        }
    };

    // --- Main Component Render ---

    // Check if modal should be open and if we have a post to display
    if (!isOpen || !selectedPost) return null;

    // Format content after ensuring selectedPost is not null
    const { title, body, features } = formatContent();
    // Simple check if it looks like a reply based on title prefix (adjust if needed)
    const isReplyPost = selectedPost.title?.startsWith('Re:') || false;


    // Calculate total comments count including nested replies
    const getTotalCommentsCount = (commentsList: EnhancedComment[]): number => {
        let count = commentsList.length;
        commentsList.forEach(comment => {
            if (comment.replies && Array.isArray(comment.replies)) {
                count += getTotalCommentsCount(comment.replies as EnhancedComment[]);
            }
        });
        return count;
    };
    const totalCommentsCount = getTotalCommentsCount(comments);


    return (
        <>
        <style>{animatePulseLight}</style>
        <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-8 sm:pt-12 md:pt-16 pb-8 px-2 sm:px-4 overflow-y-auto" aria-modal="true" role="dialog" aria-labelledby="post-modal-title">
            <div
                ref={modalRef}
                className="bg-[#1f1f1e] w-full max-w-3xl rounded-lg border border-white/10 shadow-xl z-50 flex flex-col max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-8rem)]" // Allow vertical scrolling
            >
                {/* Header */}
                <div className="flex justify-between items-center px-4 sm:px-5 py-2.5 border-b border-white/10 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <Bell size={14} className="text-zinc-400" />
                        <span className="text-zinc-300 text-xs">
                            {selectedPost.isPinned ? 'Post fijado' : 'Post de la comunidad'}
                        </span>
                    </div>
                    <button
                        onClick={() => {
                             if (confirmDiscardComment()) {
                                setComment('');
                                cancelReply();
                                onClose();
                            }
                        }}
                        className="text-zinc-400 hover:text-white text-2xl leading-none p-1"
                        aria-label="Cerrar modal"
                    >
                        ×
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4">
                    {/* --- Post Content --- */}
                    <UserBadge
                        username={selectedPost.author.username}
                        level={selectedPost.author.level}
                        avatarUrl={selectedPost.author.avatarUrl || selectedPost.author.avatar_url}
                        timestamp={selectedPost.timestamp || selectedPost.created_at || 'just now'}
                        category={typeof selectedPost.category === 'object' && selectedPost.category !== null ? selectedPost.category.name : selectedPost.category}
                        categoryColor={selectedPost.categoryColor || 'bg-[#444442] border border-white/5'}
                    />

                    {/* Title */}
                    <h2 id="post-modal-title" className="mt-3 mb-2 font-medium text-white text-lg break-words">
                         {isReplyPost && <span className="text-blue-400 mr-1">Re:</span>}
                         {title}
                    </h2>

                    {/* Body */}
                    {body && (
                        <div className="mb-3">
                            <p className="text-zinc-200 text-sm whitespace-pre-wrap break-words">{body}</p>
                        </div>
                    )}

                     {/* Enlace si existe */}
                    {features && features.link && (
                        <div className="mb-4 bg-[#252524] p-3 rounded-lg border border-white/10">
                            <a
                                href={features.link.startsWith('http') ? features.link : `https://${features.link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline text-sm flex items-center gap-2 break-all"
                                onClick={(e) => e.stopPropagation()} // Evitar propagación
                            >
                                <div className="bg-blue-500/20 p-1 rounded flex-shrink-0">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
                                    </svg>
                                </div>
                                <span>{features.link}</span>
                            </a>
                        </div>
                    )}

                    {/* Video si existe */}
                     {features && features.video && (
                        <div className="mb-4 rounded-lg overflow-hidden border border-white/10">
                            {(() => {
                                const getYoutubeVideoId = (url: string) => url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?. [2]?.length === 11 ? url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?. [2] : null;
                                const getVimeoVideoId = (url: string) => url.match(/^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/)?. [5];
                                const videoUrl = features.video.startsWith('http') ? features.video : `https://${features.video}`;
                                const youtubeId = getYoutubeVideoId(videoUrl);
                                const vimeoId = getVimeoVideoId(videoUrl);

                                if (youtubeId) {
                                    return (
                                        <div className="relative pt-[56.25%] w-full"> {/* 16:9 Aspect Ratio */}
                                            <iframe className="absolute top-0 left-0 w-full h-full" src={`https://www.youtube.com/embed/${youtubeId}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                                        </div>
                                    );
                                } else if (vimeoId) {
                                    return (
                                        <div className="relative pt-[56.25%] w-full"> {/* 16:9 Aspect Ratio */}
                                            <iframe className="absolute top-0 left-0 w-full h-full" src={`https://player.vimeo.com/video/${vimeoId}`} title="Vimeo video player" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen></iframe>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div className="p-3 bg-[#252524] flex items-center gap-2">
                                             <div className="bg-red-500/20 p-1 rounded flex-shrink-0">
                                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                            <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline text-sm break-all">Ver video</a>
                                        </div>
                                    );
                                }
                            })()}
                        </div>
                    )}

                    {/* Encuesta si existe - Use selectedPost for poll results */}
                    {features && Array.isArray(features.poll) && features.poll.length >= 1 && (
                        <div className="mb-4 bg-[#252524] p-4 rounded-lg border border-white/10">
                            <h4 className="text-white font-medium mb-3 text-sm">Encuesta</h4>
                            <div className="space-y-2">
                                {features.poll.map((option: any) => {
                                    const pollResults = features.poll_results || {}; // Use features from selectedPost
                                    const totalVotes = Object.values(pollResults).reduce((acc: number, val: unknown) => acc + (Number(val) || 0), 0);
                                    const optionVotes = Number(pollResults[option.id]) || 0;
                                    const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;

                                    return (
                                        <button
                                            key={option.id}
                                            className="relative w-full bg-[#323230] hover:bg-[#3a3a38] transition-colors rounded-lg p-2.5 text-zinc-200 text-sm cursor-pointer flex items-center gap-3 overflow-hidden text-left"
                                            onClick={() => {
                                                communityService.votePoll(selectedPost.id, option.id)
                                                    .then(response => {
                                                         // console.log('Voto registrado:', response); // Debugging
                                                        // Update selectedPost state with new poll results
                                                        setSelectedPost(prevPost => {
                                                            if (!prevPost) return null;
                                                            // Need to parse, update, and stringify content carefully
                                                            try {
                                                                const contentObj = getEnrichedContent(prevPost.content as string);
                                                                if (contentObj && contentObj.features) {
                                                                    const updatedFeatures = { ...contentObj.features, poll_results: response.poll_results };
                                                                    const updatedContent = JSON.stringify({ ...contentObj, features: updatedFeatures });
                                                                    return { ...prevPost, content: updatedContent };
                                                                }
                                                            } catch (e) { console.error("Error updating poll results in state:", e); }
                                                            return prevPost; // Return previous state on error
                                                        });
                                                    })
                                                    .catch(error => console.error('Error al votar:', error));
                                            }}
                                            aria-label={`Votar por ${option.text}`}
                                        >
                                            {/* Progress bar */}
                                            {totalVotes > 0 && (
                                                <div className="absolute top-0 left-0 h-full bg-blue-500/20" style={{ width: `${percentage}%` }} aria-hidden="true"></div>
                                            )}
                                            {/* Circle indicator */}
                                            <div className={`w-4 h-4 rounded-full border ${optionVotes > 0 ? 'border-blue-500 bg-blue-500/30' : 'border-zinc-500'} flex-shrink-0 relative z-10`}></div>
                                            {/* Option text and percentage */}
                                            <div className="flex flex-1 justify-between items-center relative z-10 gap-2">
                                                <span className="break-words">{option.text}</span>
                                                {totalVotes > 0 && (
                                                    <span className="text-xs text-blue-300 flex-shrink-0 tabular-nums">{percentage}%</span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                                {/* Total votes display */}
                                {features.poll_results && Object.keys(features.poll_results).length > 0 && (
                                    <div className="text-xs text-zinc-400 mt-2 text-right">
                                        {Object.values(features.poll_results).reduce((acc: number, val: unknown) => acc + (Number(val) || 0), 0)} votos totales
                                    </div>
                                )}
                            </div>
                        </div>
                    )}


                    {/* Imágenes para el post */}
                    {selectedPost.imageUrl && (
                        <div className="mt-2 mb-4">
                            {/* Image Display Logic (Simplified) */}
                            <button
                                className="cursor-pointer hover:opacity-90 transition-opacity block w-full"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setImageViewerOpen(true);
                                }}
                                aria-label="Ver imagen a tamaño completo"
                            >
                                <Image
                                    src={formatImageUrl(selectedPost.imageUrl) || '/placeholder-image.png'} // Fallback image
                                    alt={`Imagen para ${title}`}
                                    width={600} // Provide appropriate defaults or calculate based on container
                                    height={400}
                                    className="rounded-lg w-full max-h-80 object-contain border border-white/10 bg-black" // Use object-contain
                                    priority={selectedPost.isPinned} // Prioritize if pinned
                                    unoptimized={process.env.NODE_ENV !== 'production'}
                                    onError={(e) => (e.currentTarget.style.display = 'none')} // Optionally hide on error
                                />
                            </button>
                             {/* Add logic for multiple images if needed, similar to PostCard */}
                        </div>
                    )}

                    {/* Interactions */}
                    <div className="flex items-center gap-4 pt-3 pb-3 border-b border-white/10 text-zinc-300">
                        <div className="flex items-center gap-1">
                            <button
                                className={`p-1 rounded-full transition-all transform hover:scale-110 ${liked ? 'text-blue-400 hover:text-blue-500' : 'text-zinc-400 hover:text-zinc-300'}`}
                                onClick={(e) => {
                                    // Crear un elemento temporal para mostrar efecto de animación
                                    const button = e.currentTarget;
                                    const rect = button.getBoundingClientRect();
                                    const tempIcon = document.createElement('div');
                                    tempIcon.innerHTML = `<svg 
                                      width="16" 
                                      height="16" 
                                      viewBox="0 0 24 24" 
                                      fill="none" 
                                      stroke="${!liked ? '#3b82f6' : '#9ca3af'}" 
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
                                    
                                    // Llamar al manejador original
                                    handleLike();
                                }}
                                aria-label={liked ? 'Quitar like' : 'Dar like'}
                            >
                                <ThumbsUp size={14} className={liked ? 'transform animate-pulse' : ''} />
                            </button>
                            <span className="text-sm tabular-nums">{likesCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                             {/* Icon can be non-interactive if just showing count */}
                             <span className="p-1 text-zinc-400">
                                <MessageCircle size={16} />
                             </span>
                             {/* Use calculated total comments count */}
                            <span className="text-sm tabular-nums">{totalCommentsCount}</span>
                        </div>
                    </div>

                    {/* --- Comments Section --- */}
                    <div className="mt-5">
                         <h3 className="text-white font-medium mb-4 text-sm">Comentarios ({totalCommentsCount})</h3>

                        {/* Lista de comentarios */}
                        {comments.length > 0 ? (
                            <div className="space-y-2 mb-6"> {/* Increased space-y for better separation */}
                                {comments.map((comment, index) => (
                                    <div 
                                        key={comment.id} 
                                        className={`transition-all duration-300 ease-in-out ${
                                            comment.id.startsWith('temp-') ? 'animate-pulse-light' : ''
                                        }`}
                                    >
                                        <CommentItem comment={comment} nestingLevel={0} />
                                        {index < comments.length - 1 && (
                                            <div className="border-b border-zinc-800/50 mt-5 mb-1"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-zinc-500 text-sm text-center py-8 border border-dashed border-zinc-800 rounded-lg">
                                <div className="flex flex-col items-center gap-2">
                                    <MessageCircle size={20} className="opacity-50" />
                                    <p>Aún no hay comentarios. ¡Sé el primero!</p>
                                </div>
                            </div>
                        )}
                    </div>
                 </div>


                {/* --- Add Comment Footer (Sticky) --- */}
                <div className="px-4 sm:px-5 py-3 border-t border-white/10 bg-[#1f1f1e] flex-shrink-0">
                    <div className="flex gap-2 items-start">
                        {/* Current User Avatar */}
                         <div className="relative flex-shrink-0 self-start mt-1">
                            <div className="w-8 h-8 bg-[#444442] rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                                {currentUser?.avatar_url ? (
                                    <Image
                                        src={formatAvatarUrl(currentUser.avatar_url) || '/default-avatar.png'}
                                        alt={currentUser.username || 'Tu avatar'}
                                        width={32}
                                        height={32}
                                        className="w-full h-full object-cover"
                                        unoptimized={true}
                                        onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm font-semibold">
                                        {(currentUser?.username || '?').charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                             {currentUser?.level !== undefined && currentUser.level !== null && (
                                <div className="absolute -bottom-1 -right-1 z-10">
                                    <UserLevelBadge level={currentUser.level} size="sm" showTooltip={true} />
                                </div>
                            )}
                        </div>

                        {/* Comment Input Area */}
                        <div className="flex-1">
                             {/* Replying To Indicator */}
                            {replyToComment && (
                                <div className="flex items-center justify-between gap-2 mb-1.5 text-xs text-blue-400">
                                    <div className="flex items-center gap-1">
                                        <CornerUpRight size={14} />
                                        <span>Respondiendo a {replyToComment.username}</span>
                                    </div>
                                    <button
                                        onClick={cancelReply}
                                        className="text-zinc-400 hover:text-zinc-300 p-0.5 rounded-full leading-none"
                                        aria-label="Cancelar respuesta"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}

                            {/* Quick Reply Again Button */}
                             {!replyToComment && lastRespondedComment && comment.trim() === '' && (
                                <div className="flex items-center gap-2 mb-1.5">
                                    <button
                                        onClick={() => handleReplyToComment(
                                            lastRespondedComment.id,
                                            lastRespondedComment.username,
                                            lastRespondedComment.isNested,
                                            lastRespondedComment.parentId, // Use parentId (direct parent)
                                            lastRespondedComment.replyLevel - 1, // Level of the comment being replied to
                                            lastRespondedComment.parentCommentId, // Root comment ID
                                            lastRespondedComment.userId
                                        )}
                                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                    >
                                        <CornerUpRight size={14} />
                                        Responder de nuevo a {lastRespondedComment.username}
                                    </button>
                                </div>
                            )}

                            {/* Input Field */}
                            <div className="bg-[#2a2a29] rounded-full flex items-center border border-white/10 focus-within:border-amber-400/50 focus-within:ring-1 focus-within:ring-amber-400/30 transition-all">
                                <input
                                    id="comment-input"
                                    type="text"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder={replyToComment ? `Responder a ${replyToComment.username}...` : "Añadir un comentario..."}
                                    className="flex-1 bg-transparent text-zinc-200 outline-none px-4 py-2.5 text-sm rounded-full placeholder-zinc-500"
                                    onKeyDown={(e) => { 
                                        if (e.key === 'Enter' && !e.shiftKey && comment.trim()) { 
                                            e.preventDefault();
                                            
                                            // Efecto visual de enfoque
                                            const input = e.currentTarget;
                                            const originalBg = input.style.backgroundColor;
                                            input.style.backgroundColor = 'rgba(251, 191, 36, 0.05)';
                                            
                                            setTimeout(() => {
                                                input.style.backgroundColor = originalBg;
                                                addCommentOrReply();
                                            }, 150);
                                        } 
                                    }}
                                />
                                 {/* Optional: Emoji/GIF buttons */}
                                {/* <div className="flex items-center mr-3 space-x-1">
                                    <button className="p-1 text-zinc-500 hover:text-zinc-300">
                                        <Smile size={16} />
                                    </button>
                                </div> */}
                            </div>

                             {/* Action Buttons */}
                            {comment.trim() !== '' && (
                                <div className="flex justify-end mt-2 space-x-2">
                                    <Button
                                        variant="ghost" // Use ghost variant for cancel
                                        size="sm"
                                        onClick={() => {
                                            // No confirmation needed for just clearing text?
                                            setComment('');
                                            cancelReply(); // Also cancel reply state
                                        }}
                                        className="text-zinc-400 hover:text-zinc-100 px-3 py-1.5 h-auto" // Adjust padding/height
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="default" // Keep default for primary action
                                        size="sm"
                                        onClick={(e) => {
                                            // Efecto visual de botón pulsado
                                            const button = e.currentTarget;
                                            button.classList.add("scale-95");
                                            
                                            setTimeout(() => {
                                                button.classList.remove("scale-95");
                                                addCommentOrReply();
                                            }, 150);
                                        }}
                                        disabled={comment.trim() === ''} // Disable if empty
                                        className="rounded-full font-medium text-sm bg-amber-500 hover:bg-amber-600 text-black px-4 py-1.5 h-auto transition-all transform active:scale-95" // Adjust padding/height
                                    >
                                        {replyToComment ? 'Responder' : 'Comentar'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

             {/* Image Viewer Modal */}
            {selectedPost.imageUrl && imageViewerOpen && (
                <ImageViewerModal
                    imageUrl={selectedPost.imageUrl}
                    isOpen={imageViewerOpen}
                    onClose={() => setImageViewerOpen(false)}
                    altText={`Imagen de ${selectedPost.author.username}: ${title}`}
                />
            )}

        </div>
        </>
    );
};