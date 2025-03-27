import { ThumbsUp, MessageCircle, Bell, CornerUpRight, X } from 'lucide-react';
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

export const PostDetailModal = ({
    post,
    isOpen,
    onClose
}: PostDetailModalProps) => {
    // Variable interna para manejar el post actualizado
    const [selectedPost, setSelectedPost] = useState<Post | null>(post);

    // Actualizar selectedPost cuando cambia el prop post
    useEffect(() => {
        setSelectedPost(post);
    }, [post]);
    
    const router = useRouter();
    const [comment, setComment] = useState('');
    const [replyToComment, setReplyToComment] = useState<ReplyToInfo | null>(null);
    const [lastRespondedComment, setLastRespondedComment] = useState<ReplyToInfo | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const [liked, setLiked] = useState(post?.is_liked || false);
    const [likesCount, setLikesCount] = useState(post?.likes || 0);
    const [comments, setComments] = useState<EnhancedComment[]>([]);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [imageViewerOpen, setImageViewerOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
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

    // Cargar comentarios cuando se abre el modal
    useEffect(() => {
        const loadComments = async () => {
            if (isOpen && selectedPost) {
                try {
                    const commentsData = await communityService.getPostComments(selectedPost.id);
                    const commentsArray = Array.isArray(commentsData) ? commentsData : (commentsData.results || []);
                    
                    // Procesar comentarios para estructura anidada
                    const processedComments = processCommentsTree(commentsArray);
                    setComments(processedComments);
                } catch (error) {
                    console.error('Error al cargar comentarios:', error);
                }
            }
        };
        
        loadComments();
        
        // Obtener usuario actual
        if (isOpen && authService.isAuthenticated()) {
            authService.getProfile()
                .then(profile => setCurrentUser(profile))
                .catch(err => console.error('Error al obtener perfil de usuario:', err));
        }
    }, [isOpen, selectedPost]);

    // Función para procesar los comentarios en una estructura de árbol
    const processCommentsTree = (commentsArray: Comment[]): EnhancedComment[] => {
        // Primero identificamos comentarios raíz vs respuestas
        const rootComments: EnhancedComment[] = [];
        const replies: { [key: string]: EnhancedComment[] } = {};
        
        // Primera pasada: clasificar comentarios
        commentsArray.forEach(comment => {
            const enhancedComment: EnhancedComment = {
                ...comment,
                replyLevel: 0,
                isLiked: comment.is_liked,
                likesCount: comment.likes
            };
            
            if (!comment.parent_id) {
                // Es un comentario raíz
                rootComments.push(enhancedComment);
            } else {
                // Es una respuesta
                if (!replies[comment.parent_id]) {
                    replies[comment.parent_id] = [];
                }
                replies[comment.parent_id].push(enhancedComment);
            }
        });
        
        // Segunda pasada: asignar niveles y organizar estructura
        const processedComments: EnhancedComment[] = [];
        
        // Añadir comentarios raíz primero
        rootComments.forEach(rootComment => {
            processedComments.push({
                ...rootComment,
                replyLevel: 0,
                parentCommentId: rootComment.id
            });
            
            // Añadir respuestas a este comentario raíz
            if (replies[rootComment.id]) {
                addReplies(rootComment.id, rootComment.id, 1, processedComments, replies);
            }
        });
        
        return processedComments;
    };
    
    // Función recursiva para añadir respuestas
    const addReplies = (
        commentId: string,
        rootId: string,
        level: number,
        result: EnhancedComment[],
        allReplies: { [key: string]: EnhancedComment[] }
    ) => {
        if (!allReplies[commentId]) return;
        
        allReplies[commentId].forEach(reply => {
            result.push({
                ...reply,
                replyLevel: level > 3 ? 3 : level, // Limitar nivel visual a 3
                parentId: commentId,
                parentCommentId: rootId
            });
            
            // Procesar respuestas a esta respuesta
            if (allReplies[reply.id]) {
                addReplies(reply.id, rootId, level + 1, result, allReplies);
            }
        });
    };

    // Manejar like al post
    const handleLikePost = async () => {
        if (!selectedPost || !authService.isAuthenticated()) return;
        
        try {
            if (liked) {
                await communityService.unlikePost(selectedPost.id);
                setLiked(false);
                setLikesCount(prevCount => prevCount - 1);
            } else {
                await communityService.likePost(selectedPost.id);
                setLiked(true);
                setLikesCount(prevCount => prevCount + 1);
            }
        } catch (error) {
            console.error('Error al dar like/unlike:', error);
        }
    };
    
    // Manejar envío de comentario
    const handleSubmitComment = async () => {
        if (!selectedPost || !comment.trim() || isSubmitting) return;
        
        setIsSubmitting(true);
        
        try {
            const commentData = {
                post_id: selectedPost.id,
                content: comment,
                parent_id: replyToComment?.id || null
            };
            
            const newComment = await communityService.createComment(commentData);
            
            // Limpiar campo de comentario y estado de respuesta
            setComment('');
            setIsSubmitting(false);
            
            // Gestionar las respuestas anidadas
            if (replyToComment) {
                setLastRespondedComment(replyToComment);
                setReplyToComment(null);
            }
            
            // Recargar todos los comentarios para mantener la estructura correcta
            const commentsData = await communityService.getPostComments(selectedPost.id);
            const commentsArray = Array.isArray(commentsData) ? commentsData : (commentsData.results || []);
            const processedComments = processCommentsTree(commentsArray);
            setComments(processedComments);
            
            // Actualizar contador de comentarios en el post actual
            setSelectedPost(prevPost => {
                if (!prevPost) return null;
                return {
                    ...prevPost,
                    comments_count: (prevPost.comments_count || 0) + 1,
                    comments: (prevPost.comments || 0) + 1
                };
            });
        } catch (error) {
            console.error('Error al crear comentario:', error);
            setIsSubmitting(false);
        }
    };
    
    // Manejar clic en el botón de responder
    const handleReplyClick = (commentInfo: ReplyToInfo) => {
        setReplyToComment(commentInfo);
        // Enfocar el textarea
        setTimeout(() => {
            const textarea = document.getElementById('comment-textarea');
            if (textarea) {
                textarea.focus();
            }
        }, 100);
    };
    
    // Cancelar respuesta
    const cancelReply = () => {
        setReplyToComment(null);
    };

    // Renderizar el contenido del post (texto plano o JSON)
    const renderPostContent = () => {
        if (!selectedPost || !selectedPost.content) return null;
        
        try {
            // Intentar parsear como JSON (para contenido enriquecido)
            const contentObj = JSON.parse(selectedPost.content);
            
            // Si tiene la estructura esperada (text + features)
            if (contentObj.text && typeof contentObj.text === 'string') {
                return (
                    <div className="whitespace-pre-wrap break-words">
                        {contentObj.text}
                        
                        {/* Aquí se podrían renderizar features adicionales como encuestas, etc. */}
                        {contentObj.features && contentObj.features.poll && (
                            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                                <h3 className="text-white font-medium mb-2">Encuesta</h3>
                                {/* Opciones de encuesta */}
                            </div>
                        )}
                    </div>
                );
            }
        } catch (e) {
            // Si no es JSON, mostrar como texto plano
        }
        
        // Renderizar como texto plano si no es JSON o si el formato no es el esperado
        return <div className="whitespace-pre-wrap break-words">{selectedPost.content}</div>;
    };

    // Cerrar modal al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);
    
    // Cerrar con tecla Escape
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, onClose]);

    // Basic conditional rendering
    if (!isOpen || !selectedPost) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 md:p-4 overflow-y-auto">
            <style>{animatePulseLight}</style>
            
            <div 
                ref={modalRef}
                className="bg-[#1c1c1c] rounded-xl max-w-3xl w-full max-h-[95vh] overflow-y-auto flex flex-col relative"
                role="dialog"
                aria-modal="true"
            >
                {/* Cabecera del post */}
                <div className="p-4 md:p-6 border-b border-gray-800">
                    <div className="flex items-start">
                        {/* Avatar del autor */}
                        <div className="mr-3 flex-shrink-0">
                            <UserBadge 
                                username={selectedPost.author?.username || 'Usuario'} 
                                avatarUrl={selectedPost.author?.avatarUrl || selectedPost.author?.avatar_url}
                                level={selectedPost.author?.level}
                                timestamp={selectedPost.created_at || new Date().toISOString()}
                            />
                        </div>
                        
                        {/* Información del post */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col">
                                <div className="flex items-center space-x-2">
                                    <h3 className="text-white text-lg font-semibold truncate">
                                        {selectedPost.author?.username || 'Usuario'}
                                    </h3>
                                    {selectedPost.author?.level && (
                                        <UserLevelBadge level={selectedPost.author.level} />
                                    )}
                                </div>
                                <span className="text-gray-400 text-sm">
                                    {selectedPost.created_at ? 
                                        new Date(selectedPost.created_at).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 
                                        new Date().toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                    }
                                </span>
                            </div>
                        </div>
                        
                        {/* Botón de cerrar */}
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors p-1"
                            aria-label="Cerrar modal"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    
                    {/* Título del post si existe */}
                    {selectedPost.title && (
                        <h2 className="text-white text-xl font-bold mt-3">
                            {selectedPost.title}
                        </h2>
                    )}
                </div>
                
                {/* Contenido del post */}
                <div className="p-4 md:p-6 text-white">
                    {/* Contenido de texto */}
                    {renderPostContent()}
                    
                    {/* Imagen del post si existe */}
                    {selectedPost.image && (
                        <div className="mt-4 relative">
                            <button
                                onClick={() => setImageViewerOpen(true)}
                                className="w-full cursor-zoom-in rounded-lg overflow-hidden"
                                aria-label="Ver imagen a tamaño completo"
                            >
                                <Image
                                    src={formatImageUrl(selectedPost.image) || ''}
                                    alt="Imagen de la publicación"
                                    width={800}
                                    height={500}
                                    className="w-full h-auto rounded-lg object-cover"
                                    unoptimized={true}
                                />
                            </button>
                        </div>
                    )}
                </div>
                
                {/* Interacciones del post */}
                <div className="p-4 border-t border-gray-800 flex items-center space-x-6">
                    <button 
                        onClick={handleLikePost} 
                        className={`flex items-center space-x-2 ${liked ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'} transition-colors`}
                        disabled={!authService.isAuthenticated()}
                    >
                        <ThumbsUp size={20} />
                        <span>{likesCount}</span>
                    </button>
                    
                    <div className="flex items-center space-x-2 text-gray-400">
                        <MessageCircle size={20} />
                        <span>{selectedPost.comments_count || 0}</span>
                    </div>
                </div>
                
                {/* Sección de comentarios */}
                <div className="p-4 md:p-6 border-t border-gray-800">
                    <h3 className="text-white text-lg font-semibold mb-4">
                        Comentarios ({selectedPost.comments_count || 0})
                    </h3>
                    
                    {/* Lista de comentarios */}
                    <div className="space-y-4 mb-6">
                        {comments.map((comment) => (
                            <div 
                                key={comment.id} 
                                className={`pl-${Math.min(comment.replyLevel || 0, 3) * 4} relative`}
                            >
                                {/* Línea de respuesta */}
                                {(comment.replyLevel || 0) > 0 && (
                                    <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-700" />
                                )}
                                
                                <div className="bg-[#252525] p-3 rounded-lg">
                                    {/* Cabecera del comentario */}
                                    <div className="flex items-start">
                                        <div className="mr-3 flex-shrink-0">
                                            <UserBadge 
                                                username={comment.user?.username || 'Usuario'} 
                                                avatarUrl={comment.user?.avatarUrl || comment.user?.avatar_url}
                                                level={comment.user?.level}
                                                timestamp={comment.created_at || comment.timestamp || new Date().toISOString()}
                                            />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="text-white font-semibold truncate">
                                                    {comment.user?.username || 'Usuario'}
                                                </h4>
                                                {comment.user?.level && (
                                                    <UserLevelBadge level={comment.user.level} />
                                                )}
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {comment.created_at ? 
                                                    new Date(comment.created_at).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }) : 
                                                    new Date().toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })
                                                }
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Contenido del comentario */}
                                    <div className="mt-2 text-white whitespace-pre-wrap break-words">
                                        {comment.content}
                                    </div>
                                    
                                    {/* Interacciones del comentario */}
                                    <div className="mt-2 flex items-center space-x-4">
                                        {/* Botón de responder */}
                                        {authService.isAuthenticated() && (
                                            <button 
                                                onClick={() => handleReplyClick({
                                                    id: comment.id,
                                                    username: comment.user?.username || 'Usuario',
                                                    parentId: comment.parentId,
                                                    replyLevel: (comment.replyLevel || 0) + 1,
                                                    parentCommentId: comment.parentCommentId || comment.id,
                                                    userId: comment.user?.id
                                                })} 
                                                className="flex items-center space-x-1 text-gray-400 hover:text-blue-500 transition-colors text-sm"
                                            >
                                                <CornerUpRight size={16} />
                                                <span>Responder</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {comments.length === 0 && (
                            <div className="text-gray-400 text-center py-4">
                                No hay comentarios aún. ¡Sé el primero en comentar!
                            </div>
                        )}
                    </div>
                    
                    {/* Formulario de comentario */}
                    {authService.isAuthenticated() ? (
                        <div className="mt-4">
                            {replyToComment && (
                                <div className="bg-gray-800 p-2 rounded mb-2 flex items-center justify-between">
                                    <span className="text-gray-300 text-sm">
                                        Respondiendo a <span className="font-semibold">{replyToComment.username}</span>
                                    </span>
                                    <button 
                                        onClick={cancelReply}
                                        className="text-gray-400 hover:text-white"
                                        aria-label="Cancelar respuesta"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                            
                            <div className="flex space-x-3">
                                {currentUser && (
                                    <div className="flex-shrink-0">
                                        <Image
                                            src={formatAvatarUrl(currentUser.avatar_url) || '/avatar-placeholder.png'}
                                            alt="Tu avatar"
                                            width={40}
                                            height={40}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    </div>
                                )}
                                
                                <div className="flex-1 flex flex-col">
                                    <textarea
                                        id="comment-textarea"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Escribe un comentario..."
                                        className="w-full bg-[#252525] text-white border border-gray-700 rounded-lg p-3 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                                    />
                                    
                                    <div className="mt-2 flex justify-end">
                                        <Button
                                            onClick={handleSubmitComment}
                                            disabled={!comment.trim() || isSubmitting}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                            {isSubmitting ? 'Enviando...' : 'Comentar'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 bg-[#252525] p-4 rounded-lg text-center">
                            <p className="text-gray-300">Debes iniciar sesión para comentar</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Modal de visualización de imagen */}
            {selectedPost.image && (
                <ImageViewerModal
                    imageUrl={selectedPost.image}
                    isOpen={imageViewerOpen}
                    onClose={() => setImageViewerOpen(false)}
                    altText="Imagen de la publicación a tamaño completo"
                />
            )}
        </div>
    );
};
