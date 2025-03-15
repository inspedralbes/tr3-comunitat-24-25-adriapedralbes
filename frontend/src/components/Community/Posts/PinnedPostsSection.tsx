import { Trophy } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Post } from '@/types/Post';
import { Comment } from '@/types/Comment';
import { PostViewRecord } from '@/types/PostView';

import { PostCard } from './PostCard';

interface PinnedPostsSectionProps {
    pinnedPosts: Post[];
    onPostClick: (postId: string) => void;
    isLoading?: boolean;
    postComments?: Record<string, Comment[]>;
    viewedPosts?: Set<string>;
    postViewsRecord?: PostViewRecord;
}

export const PinnedPostsSection: React.FC<PinnedPostsSectionProps> = ({ 
    pinnedPosts, 
    onPostClick, 
    isLoading = false, 
    postComments = {},
    viewedPosts = new Set(),
    postViewsRecord = {}
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [visiblePosts, setVisiblePosts] = useState<Post[]>([]);
    
    // Efecto para actualizar los posts con transición suave
    useEffect(() => {
        // Si no estamos cargando y tenemos posts, actualizar inmediatamente
        if (!isLoading) {
            // Si la longitud es la misma, probablemente solo estamos actualizando datos
            // después de cerrar un modal, así que no se necesita ninguna transición
            setVisiblePosts(pinnedPosts);
        }
    }, [pinnedPosts, isLoading]);

    if (!isVisible || (pinnedPosts.length === 0 && !isLoading)) {
        return null;
    }

    return (
        <div className="mb-4 mx-4 sm:mx-2 md:mx-0">
            <div className="bg-amber-800/30 rounded-t-lg px-4 py-2 flex items-center justify-between border-l-4 border-amber-500 border-t border-r border-white/10">
                <div className="flex items-center gap-2 text-amber-400">
                    <Trophy size={16} />
                    <span className="font-medium">Pinned</span>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-sm font-medium text-amber-400 hover:text-amber-300"
                >
                    Hide
                </button>
            </div>
            <div className="bg-transparent">
                {isLoading ? (
                    <div className="bg-[#323230] rounded-lg p-4 my-3 mx-4 sm:mx-2 md:mx-0 border border-white/10">
                        <div className="animate-pulse flex space-y-4 flex-col">
                            <div className="flex items-center gap-2">
                                <div className="rounded-full bg-zinc-700 h-10 w-10"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-zinc-700 rounded w-1/4"></div>
                                </div>
                            </div>
                            <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
                            <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
                        </div>
                    </div>
                ) : (
                    visiblePosts.map((post) => {
                        // Extracción segura del nombre de la categoría de la respuesta de la API
                        let categoryName = '';
                        let categoryColor = 'bg-[#444442] border border-white/5';
                        
                        if (post.category) {
                            // Si category es un objeto con la propiedad name
                            if (typeof post.category === 'object' && post.category !== null && 'name' in post.category) {
                                categoryName = post.category.name;
                                if ('color' in post.category && post.category.color) {
                                    categoryColor = post.category.color;
                                }
                            } 
                            // Si category es un string
                            else if (typeof post.category === 'string') {
                                categoryName = post.category;
                            }
                        }
                        
                        // Extraer timestamp del created_at de la API
                        const timestamp = post.timestamp || post.created_at || 'hace un momento';
                        
                        // Extraer URL de imagen si existe
                        const imageUrl = post.imageUrl || post.image || undefined;
                        
                        // Normalizar la URL del avatar - asegurarse de que author.avatarUrl siempre exista
                        const author = {
                            ...post.author,
                            avatarUrl: post.author.avatarUrl || post.author.avatar_url || undefined
                        };
                        
                        return (
                            <PostCard
                                key={post.id}
                                id={post.id}
                                author={author}
                                timestamp={timestamp}
                                category={categoryName}
                                categoryColor={categoryColor}
                                title={post.title}
                                content={post.content}
                                likes={post.likes || 0}
                                comments={post.comments_count || 0}
                                isPinned={true}
                                imageUrl={imageUrl}
                                onPostClick={onPostClick}
                                postComments={postComments[post.id] || []}
                                isViewed={viewedPosts.has(post.id)}
                                lastViewedAt={postViewsRecord[post.id] || null}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
};