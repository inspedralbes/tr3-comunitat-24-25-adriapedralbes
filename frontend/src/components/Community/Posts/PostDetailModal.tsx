import { ThumbsUp, MessageCircle, Bell, CornerUpRight } from 'lucide-react';
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

    // Basic conditional rendering
    if (!isOpen || !selectedPost) return null;

    return (
        <div>
            <style>{animatePulseLight}</style>
            <div>Modal Content Here</div>
        </div>
    );
};
