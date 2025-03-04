import React, { useRef, useEffect, useState } from 'react';
import { ThumbsUp, MessageCircle, Bell, Smile, CornerUpRight } from 'lucide-react';
import Image from 'next/image';

import { Post } from '@/types/Post';
import { Comment } from '@/types/Comment';
import { UserBadge } from '@/components/Community/UserBadge';
import { Button } from '@/components/ui/button';
import { commentsByPostId } from '@/mockData/mockComments';

interface PostDetailModalProps {
    post: Post | null;
    isOpen: boolean;
    onClose: () => void;
}

// Interfaz extendida para manejar respuestas anidadas con niveles
interface ReplyToInfo {
    id: string;
    username: string;
    isNested?: boolean;
    parentId?: string;
    replyLevel: number;
    parentCommentId?: string; // ID del comentario principal (nivel 0)
}

// Extendemos Comment para incluir el nivel de respuesta y la estructura anidada
interface EnhancedComment extends Comment {
    replyLevel?: number;
    parentId?: string; // ID del comentario al que responde directamente
    parentCommentId?: string; // ID del comentario raíz/principal
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
    post,
    isOpen,
    onClose
}) => {
    const [comment, setComment] = useState('');
    const [replyToComment, setReplyToComment] = useState<ReplyToInfo | null>(null);
    const [lastRespondedComment, setLastRespondedComment] = useState<ReplyToInfo | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post?.likes || 0);
    const [comments, setComments] = useState<EnhancedComment[]>([]);

    // Array plano de todos los comentarios/respuestas para búsqueda fácil
    const [allComments, setAllComments] = useState<{ [key: string]: EnhancedComment }>({});

    // Función para confirmar salida si hay comentario pendiente
    const confirmDiscardComment = (): boolean => {
        if (comment.trim() !== '') {
            return window.confirm("Aún no has terminado tu comentario. ¿Quieres irte sin terminar?");
        }
        return true;
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                if (confirmDiscardComment()) {
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
    }, [isOpen, onClose, comment]);

    // Close on escape key
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
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
    }, [isOpen, onClose, comment]);

    // Handle like action
    const handleLike = () => {
        setLiked(!liked);
        setLikesCount(prevCount => liked ? prevCount - 1 : prevCount + 1);
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
        setAllComments(cache);
    };

    // Cargar comentarios
    useEffect(() => {
        if (post && isOpen) {
            // Cargar comentarios del post seleccionado
            const postComments = commentsByPostId[post.id] || [];
            // Preparar los comentarios con el nivel 0 por defecto (comentarios principales)
            const enhancedComments = postComments.map(comment => ({
                ...comment,
                replyLevel: 0,
                replies: comment.replies?.map(reply => ({
                    ...reply,
                    replyLevel: 1,  // Nivel 1 para las respuestas directas
                    parentId: comment.id, // Guardar referencia al padre
                    parentCommentId: comment.id // Principal es igual al padre para nivel 1
                }))
            }));

            setComments(enhancedComments);
            updateAllCommentsCache(enhancedComments);
        }
    }, [post, isOpen]);

    // Manejar respuesta a un comentario (principal o anidado)
    const handleReplyToComment = (
        commentId: string,
        username: string,
        isNested: boolean = false,
        parentId?: string,
        replyLevel: number = 0,
        parentCommentId?: string
    ) => {
        // Si es una respuesta a una respuesta, necesitamos el ID del comentario principal
        const rootCommentId = parentCommentId || (isNested ? parentId : commentId);

        setReplyToComment({
            id: commentId,
            username,
            isNested,
            parentId,
            replyLevel: replyLevel + 1,
            parentCommentId: rootCommentId
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
    const addComment = () => {
        if (comment.trim() === '') return;

        const newComment: EnhancedComment = {
            id: `comment${Date.now()}`,
            author: {
                username: 'Tu Usuario', // Esto sería el usuario actual
                level: 1,
                avatarUrl: 'https://github.com/shadcn.png'
            },
            content: comment,
            timestamp: 'ahora',
            likes: 0,
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
        return (
            <div className={`${nestingLevel > 0 ? `mb-3` : 'mb-4'}`}>
                <div className="flex gap-2">
                    {/* Avatar y detalles del autor */}
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
                                    className="p-1 rounded-full text-zinc-400 hover:text-zinc-300"
                                >
                                    <ThumbsUp size={14} />
                                </button>
                                {comment.likes > 0 && (
                                    <span className="text-xs text-zinc-400">{comment.likes}</span>
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
                                    comment.parentCommentId
                                )}
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

    // Format content with title and body
    const formatContent = () => {
        if (!post) return { title: '', body: '' };

        const contentLines = post.content.split('\n');
        const title = contentLines[0];
        const body = contentLines.slice(1).join('\n');

        return { title, body };
    };

    if (!isOpen || !post) return null;

    const { title, body } = formatContent();
    const isReply = post.content.startsWith('Re:');

    return (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-start justify-center pt-8 sm:pt-16 overflow-y-auto">
            <div
                ref={modalRef}
                className="bg-[#1f1f1e] w-full max-w-3xl mx-4 rounded-lg border border-white/10 shadow-xl"
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
                    >
                        &times;
                    </button>
                </div>

                {/* Post Content */}
                <div className="px-5 py-3">
                    <UserBadge
                        username={post.author.username}
                        level={post.author.level}
                        avatarUrl={post.author.avatarUrl}
                        timestamp={post.timestamp}
                        category={post.category}
                        categoryColor={
                            post.category === 'General' ? 'bg-[#444442] border border-white/5' :
                                post.category === 'Anuncios' ? 'bg-[#444442] border border-white/5' :
                                    post.category === 'Preguntas' ? 'bg-[#444442] border border-white/5' :
                                        'bg-[#444442] border border-white/5'
                        }
                    />

                    {/* Title */}
                    {isReply ? (
                        <div className="mt-2 mb-1 font-medium flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            <h2 className="text-white text-lg">{title}</h2>
                        </div>
                    ) : (
                        <h2 className="mt-2 mb-1 font-medium text-white text-lg">{title}</h2>
                    )}

                    {/* Body */}
                    <div className="mb-3">
                        <p className="text-zinc-200">{body}</p>
                    </div>

                    {/* Image if available */}
                    {post.imageUrl && (
                        <div className="mt-2 mb-3">
                            <Image
                                src={post.imageUrl}
                                alt={`Contenido de ${title}`}
                                width={600}
                                height={400}
                                className="rounded-lg max-h-72 object-cover border border-white/10"
                            />
                        </div>
                    )}

                    {/* Interactions */}
                    <div className="flex items-center gap-4 mt-3 pb-3 border-b border-white/10 text-zinc-300">
                        <div className="flex items-center gap-1">
                            <button
                                className={`p-1 rounded-full ${liked ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-[#444442]'}`}
                                onClick={handleLike}
                            >
                                <ThumbsUp size={16} />
                            </button>
                            <span className="text-sm">{likesCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button className="p-1 hover:bg-[#444442] rounded-full">
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
                                    <Image
                                        src="https://github.com/shadcn.png"
                                        alt="Tu avatar"
                                        width={32}
                                        height={32}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-zinc-900 z-10">
                                    1
                                </div>
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
                                                lastRespondedComment.parentCommentId
                                            )}
                                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
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
                                    />
                                    <div className="flex items-center mr-3 space-x-1">
                                        <button className="p-1 text-zinc-500 hover:text-zinc-300">
                                            <span className="text-xs font-bold">GIF</span>
                                        </button>
                                        <button className="p-1 text-zinc-500 hover:text-zinc-300">
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
        </div>
    );
};