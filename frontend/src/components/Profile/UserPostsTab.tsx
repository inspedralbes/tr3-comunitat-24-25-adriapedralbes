"use client";

import React, { useEffect, useState } from 'react';

import { PostCard } from '@/components/Community/Posts/PostCard';
import { PostDetailModal } from '@/components/Community/Posts/PostDetailModal';
import { Post } from '@/types/Post';
import { communityService } from '@/services/community';

interface UserPostsTabProps {
  userId: string;
}

export const UserPostsTab: React.FC<UserPostsTabProps> = ({ userId }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserPosts = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Obtener posts del usuario
        const response = await communityService.getUserPosts(userId);
        setPosts(Array.isArray(response) ? response : 
                (response.results ? response.results : []));
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
  }, [userId]);

  const handlePostClick = async (postId: string) => {
    try {
      // Obtener los detalles del post directamente de la API
      const postData = await communityService.getPostById(postId);
      
      if (postData) {
        // Normalizar el post para asegurar que tiene la estructura esperada
        const normalizedPost = {
          id: postData.id,
          author: {
            id: postData.author?.id,
            username: postData.author?.username || 'Usuario',
            level: postData.author?.level,
            avatarUrl: postData.author?.avatar_url || postData.author?.avatarUrl,
            avatar_url: postData.author?.avatar_url
          },
          title: postData.title,
          content: typeof postData.content === 'string' ? postData.content : JSON.stringify(postData.content),
          category: typeof postData.category === 'object' && postData.category !== null ? postData.category.name : postData.category,
          categoryColor: typeof postData.category === 'object' && postData.category !== null && postData.category.color ? postData.category.color : 'bg-[#444442] border border-white/5',
          created_at: postData.created_at,
          updated_at: postData.updated_at,
          image: postData.image,
          comments_count: postData.comments_count || 0,
          is_pinned: postData.is_pinned,
          timestamp: postData.timestamp || postData.created_at,
          likes: postData.likes || 0,
          comments: postData.comments_count || 0,
          isPinned: postData.is_pinned,
          imageUrl: postData.image || postData.imageUrl,
          is_liked: postData.is_liked
        };
        
        setSelectedPost(normalizedPost);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error('Error al obtener detalles del post:', err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
    
    // Opcionalmente actualizamos los posts para reflejar cambios
    if (userId) {
      const refreshPosts = async () => {
        try {
          // Obtener posts del usuario actualizados
          const response = await communityService.getUserPosts(userId);
          setPosts(Array.isArray(response) ? response : 
                  (response.results ? response.results : []));
        } catch (err) {
          console.error('Error actualizando posts:', err);
        }
      };
      
      refreshPosts();
    }
  };

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
        
        // Extraer URL de imagen
        const imageUrl = post.imageUrl || post.image || null;
        
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
            imageUrl={imageUrl}
            onPostClick={handlePostClick}
          />
        );
      })}

      {/* Modal de detalle del post */}
      <PostDetailModal
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};