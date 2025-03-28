"use client";

import { useParams } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';

import { PostCard } from '@/components/Community/Posts/PostCard';
import { PostDetailModal } from '@/components/Community/Posts/PostDetailModal';
import { communityService } from '@/services/community';
import { Comment } from '@/types/Comment';
import { Post } from '@/types/Post';
import { formatAvatarUrl } from '@/utils/formatUtils';
import { normalizeAvatarUrl, normalizeImageUrl } from '@/utils/imageUtils';

interface UserPostsTabProps {
  userId: string;
}

export const UserPostsTab: React.FC<UserPostsTabProps> = ({ userId }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postsComments, setPostsComments] = useState<Record<string, Comment[]>>({});
  const [viewedPosts, setViewedPosts] = useState<Record<string, string>>({});

  // Cargar el registro de posts vistos desde localStorage al iniciar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedViewedPosts = localStorage.getItem(`viewed_posts_${userId}`);
        if (savedViewedPosts) {
          setViewedPosts(JSON.parse(savedViewedPosts));
        }
      } catch (error) {
        console.error('Error loading viewed posts from localStorage:', error);
      }
    }
  }, [userId]);
  
  // Obtener el username de los parámetros de la URL
  const params = useParams();
  const username = params.username as string;
  const postIdFromUrl = params.postId as string;

  // Función para registrar un post como visto cuando se abre el detalle
  const recordPostView = useCallback((postId: string) => {
    const now = new Date().toISOString();
    
    setViewedPosts(prev => {
      const updatedViewedPosts = { ...prev, [postId]: now };
      
      // Guardar en localStorage para persistencia
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`viewed_posts_${userId}`, JSON.stringify(updatedViewedPosts));
        } catch (error) {
          console.error('Error saving viewed posts to localStorage:', error);
        }
      }
      
      return updatedViewedPosts;
    });
  }, [userId]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Obtener posts del usuario
        const response = await communityService.getUserPosts(userId);
        
        // Procesar la respuesta para asegurarnos de que los datos son consistentes
        let postsData;
        if (Array.isArray(response)) {
          postsData = response;
        } else if (response.results) {
          postsData = response.results;
        } else {
          postsData = [];
        }
        
        // Normalizar las URL de avatares para todos los posts
        const normalizedPosts = postsData.map((post: Post) => {
          // Asegurarnos de que tengamos un objeto author completo
          const author = post.author || { username: 'unknown' };
          
          // Normalizar la URL del avatar usando la función de utilidad
          const avatarUrl = normalizeAvatarUrl(author.avatar_url || author.avatarUrl);
          
          return {
            ...post,
            author: {
              ...author,
              avatarUrl: avatarUrl
            }
          };
        });
        
        setPosts(normalizedPosts);
        
        // Cargar comentarios para cada post
        const commentsPromises = normalizedPosts.map((post: Post) => 
          communityService.getPostComments(post.id)
            .then(comments => {
              // Normalizar los datos de comentarios y avatares
              const normalizedComments = Array.isArray(comments) ? comments : (comments.results || []);
              
              // Procesar los comentarios para asegurar que los avatares están bien formateados
              const processedComments = normalizedComments.map((comment: Comment) => {
                // Asegurarnos de que el autor del comentario tiene avatarUrl normalizada
                if (comment.author) {
                  comment.author = {
                    ...comment.author,
                    avatarUrl: formatAvatarUrl(comment.author.avatar_url || comment.author.avatarUrl) || undefined
                  };
                }
                
                // También procesar las respuestas si existen
                if (comment.replies && comment.replies.length > 0) {
                  comment.replies = comment.replies.map((reply: Comment) => {
                    if (reply.author) {
                      reply.author = {
                        ...reply.author,
                        avatarUrl: formatAvatarUrl(reply.author.avatar_url || reply.author.avatarUrl) || undefined
                      };
                    }
                    return reply;
                  });
                }
                
                return comment;
              });
              
              return { postId: post.id, comments: processedComments };
            })
            .catch(err => {
              console.error(`Error fetching comments for post ${post.id}:`, err);
              return { postId: post.id, comments: [] };
            })
        );
        
        // Esperar a que se resuelvan todas las promesas de comentarios
        const commentsResults = await Promise.all(commentsPromises);
        
        // Crear un objeto con los comentarios indexados por ID de post
        const commentsMap: Record<string, Comment[]> = {};
        commentsResults.forEach(result => {
          commentsMap[result.postId] = result.comments;
        });
        
        setPostsComments(commentsMap);
        
        // Si hay un postId en la URL, abrir automáticamente ese post
        if (postIdFromUrl) {
          // Extraer solo el ID (los UUIDs tienen 36 caracteres)
          const postId = postIdFromUrl.length > 36 ? postIdFromUrl.substring(0, 36) : postIdFromUrl;
          
          // Buscar el post por ID
          const post = normalizedPosts.find((p: Post) => p.id === postId);
          if (post) {
            // Marcar el post como visto
            recordPostView(postId);
            
            // Abrir el modal
            setSelectedPost(post);
            setIsModalOpen(true);
          }
        }
      } catch (err) {
        console.error('Error fetching user posts:', err);
        setError('No se pudieron cargar las publicaciones.');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserPosts();
    }
  }, [userId, postIdFromUrl, recordPostView]);

  // Handler para cuando se hace clic en un post
  const handlePostClick = useCallback((postId: string) => {
    // Registrar la vista
    recordPostView(postId);
    
    // Buscar el post por ID
    const post = posts.find((p: Post) => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setIsModalOpen(true);
      
      // Actualizar la URL para incluir el ID del post pero sin navegar
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const regex = new RegExp(`^/perfil/${username}$`);
        
        // Solo actualizar si estamos en la página principal de perfil
        if (regex.test(currentPath)) {
          // Modificar el historial sin navegar (evita recargas)
          window.history.replaceState(
            { postId }, 
            '', 
            `/perfil/${username}/${postId}${post.title ? `-${post.title.toLowerCase().replace(/[^\\w\\s-]/g, '').replace(/\\s+/g, '-').replace(/--+/g, '-').substring(0, 50)}` : ''}`
          );
        }
      }
    }
  }, [posts, username, recordPostView]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#323230] rounded-lg p-4 border border-white/10 h-32" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-[#323230] rounded-lg p-6 border border-white/10 text-center">
        <p className="text-zinc-400">Aún no has publicado nada en la comunidad.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        // Extracción segura del nombre de la categoría
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
        
        // Extraer timestamp
        const timestamp = post.timestamp || post.created_at || 'hace un momento';
        
        // Extraer URL de imagen - considerar también el contenido enriquecido
        let imageUrl = post.imageUrl || post.image || undefined;
        
        // Comprobar si hay una imagen en el contenido enriquecido
        if (typeof post.content === 'string') {
          try {
            const contentObj = JSON.parse(post.content);
            if (contentObj.features && contentObj.features.main_image) {
              imageUrl = contentObj.features.main_image;
            }
          } catch (e) {
            // No es JSON válido, mantener la URL original
          }
        }
        
        // Normalizar la URL de la imagen
        const normalizedImageUrl = normalizeImageUrl(imageUrl);
        
        // No necesitamos reconstruir el author aquí, ya lo hicimos en el useEffect
        return (
          <PostCard
            key={post.id}
            id={post.id}
            author={post.author}
            timestamp={timestamp}
            category={categoryName}
            categoryColor={categoryColor}
            title={post.title}
            content={post.content}
            likes={post.likes || 0}
            comments={post.comments_count || 0}
            imageUrl={normalizedImageUrl}
            onPostClick={handlePostClick}
            postComments={postsComments[post.id] || []}
            isViewed={!!viewedPosts[post.id]}
            lastViewedAt={viewedPosts[post.id] || null}
          />
        );
      })}
      
      {/* Post Detail Modal */}
      <PostDetailModal 
        post={selectedPost} 
        isOpen={isModalOpen} 
        onClose={() => {
          // Restaurar la URL original al cerrar el modal
          if (typeof window !== 'undefined') {
            window.history.replaceState({}, '', `/perfil/${username}`);
          }
          setSelectedPost(null);
          setIsModalOpen(false);
        }} 
      />
    </div>
  );
};