import React, { useEffect, useState } from 'react';

import { PostSkeleton } from '@/components/ui/PostSkeleton';
import { Comment } from '@/types/Comment';
import { Post } from '@/types/Post';
import { PostViewRecord } from '@/types/PostView';

import { PostCard } from './PostCard';

interface PostFeedProps {
    posts: Post[];
    filter?: string;
    onPostClick: (postId: string) => void;
    isLoading?: boolean;
    postComments?: Record<string, Comment[]>;
    viewedPosts?: Set<string>;
    postViewsRecord?: PostViewRecord;
}

export const PostFeed: React.FC<PostFeedProps> = ({ 
    posts, 
    filter = 'all', 
    onPostClick, 
    isLoading = false, 
    postComments = {},
    viewedPosts = new Set(),
    postViewsRecord = {}
}) => {
    // Estado para manejar la visibilidad y transición
    const [visiblePosts, setVisiblePosts] = useState<Post[]>([]);
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    // Efecto para actualizar los posts con transición suave
    useEffect(() => {
        if (isLoading) {
            // No hacer nada mientras carga, el esqueleto se mostrará
            return;
        }
        
        // Importante: si ya tenemos posts visibles y los nuevos posts tienen la misma longitud,
        // probablemente estamos actualizando después de cerrar un modal, así que no hacemos transición
        if (visiblePosts.length > 0 && posts.length > 0 && posts.length === visiblePosts.length) {
            setVisiblePosts(posts);
            return;
        }
        
        if (posts.length === 0) {
            setVisiblePosts([]);
            return;
        }
        
        // Iniciar transición solo si es necesario (cambio real en los posts)
        setIsTransitioning(true);
        
        // Pequeño retraso para la animación
        const timer = setTimeout(() => {
            setVisiblePosts(posts);
            setIsTransitioning(false);
        }, 300);
        
        return () => clearTimeout(timer);
    }, [posts, isLoading, visiblePosts.length]);
    
    // Filtrar posts según la categoría seleccionada
    let filteredPosts = visiblePosts || [];
    
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
                <PostSkeleton count={3} withImage={true} />
            </div>
        );
    }
    
    if (isTransitioning) {
        return (
            <div className="space-y-4 mx-4 sm:mx-2 md:mx-0 opacity-50 transition-opacity duration-300">
                <PostSkeleton count={Math.min(3, posts.length)} withImage={true} />
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
        <div className="space-y-4 mx-4 sm:mx-2 md:mx-0 fade-in">
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
                
                // Siempre extraer la URL de imagen principal
                const imageUrl = post.imageUrl || post.image || undefined;
                
                // Verificar si hay múltiples imágenes en el contenido enriquecido
                let image2Url = undefined;
                let image3Url = undefined;
                let hasMultipleImages = false;
                
                // Obtener la URL base para imágenes (podría ser diferente en producción)
                const baseImageUrl = imageUrl ? 
                    (imageUrl.startsWith('http') ? 
                        imageUrl.substring(0, imageUrl.lastIndexOf('/') + 1) : 
                        '/media/post_images/') : 
                    '/media/post_images/';
                
                try {
                    // Intentar parsear el contenido como JSON
                    if (typeof post.content === 'string' && post.content.includes('multi_image')) {
                        const contentObj = JSON.parse(post.content);
                        
                        // Verificar si tiene la marca de múltiples imágenes
                        if (contentObj.features && contentObj.features.multi_image) {
                            hasMultipleImages = true;
                            const imagesCount = contentObj.features.images_count || 0;
                            
                            // Generar URLs basadas en el ID del post
                            if (imagesCount >= 2) {
                                // Para la segunda imagen, usar un patrón predecible basado en el ID
                                const postIdShort = post.id.substring(0, 8);
                                image2Url = imageUrl ? imageUrl.replace('.jpg', '_2.jpg').replace('.png', '_2.png') : undefined;
                            }
                            
                            if (imagesCount >= 3) {
                                // Para la tercera imagen, similar a la segunda
                                image3Url = imageUrl ? imageUrl.replace('.jpg', '_3.jpg').replace('.png', '_3.png') : undefined;
                            }
                        }
                    }
                } catch (e) {
                    // Si hay error al parsear, seguimos con solo la imagen principal
                    console.log("Error parsing content for multiple images:", e);
                }
                
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
                        imageUrl={imageUrl}
                        image2Url={image2Url}
                        image3Url={image3Url}
                        isLiked={post.is_liked || false}
                        onPostClick={onPostClick}
                        postComments={postComments[post.id] || []}
                        isViewed={viewedPosts.has(post.id)}
                        lastViewedAt={postViewsRecord[post.id] || null}
                    />
                );
            })}
        </div>
    );
};