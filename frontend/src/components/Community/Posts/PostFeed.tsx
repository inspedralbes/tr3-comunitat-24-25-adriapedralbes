import React from 'react';

import { Post } from '@/types/Post';

import { PostCard } from './PostCard';

interface PostFeedProps {
    posts: Post[];
    filter?: string;
    onPostClick: (postId: string) => void;
    isLoading?: boolean;
}

export const PostFeed: React.FC<PostFeedProps> = ({ posts, filter = 'all', onPostClick, isLoading = false }) => {
    // Filtrar posts según la categoría seleccionada
    let filteredPosts = posts || [];
    
    if (filter !== 'all') {
        filteredPosts = filteredPosts.filter(post => {
            // Si la categoría es un objeto con slug
            if (post.category && typeof post.category === 'object' && post.category !== null && 'slug' in post.category) {
                return post.category.slug === filter;
            }
            // Si usamos categoryId
            if (post.categoryId) {
                return post.categoryId === filter;
            }
            // Si la categoría es un string
            if (typeof post.category === 'string') {
                return post.category === filter;
            }
            return false;
        });
    }

    if (isLoading) {
        return (
            <div className="space-y-4 mx-4 sm:mx-2 md:mx-0">
                {[...Array(3)].map((_, index) => (
                    <div key={index} className="bg-[#323230] rounded-lg p-4 border border-white/10">
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
                ))}
            </div>
        );
    }

    if (filteredPosts.length === 0) {
        return (
            <div className="bg-[#323230] rounded-lg p-4 my-3 mx-4 sm:mx-2 md:mx-0 border border-white/10 text-center text-zinc-400">
                No hay posts disponibles en esta categoría.
            </div>
        );
    }

    return (
        <div className="space-y-4 mx-4 sm:mx-2 md:mx-0">
            {filteredPosts.map((post) => {
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
                const imageUrl = post.imageUrl || post.image || null;
                
                return (
                    <PostCard
                        key={post.id}
                        id={post.id}
                        author={post.author}
                        timestamp={timestamp}
                        category={categoryName}
                        categoryColor={categoryColor}
                        content={post.content}
                        likes={post.likes || 0}
                        comments={post.comments_count || 0}
                        imageUrl={imageUrl}
                        onPostClick={onPostClick}
                    />
                );
            })}
        </div>
    );
};