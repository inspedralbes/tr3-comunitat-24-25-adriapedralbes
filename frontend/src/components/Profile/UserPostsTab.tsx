"use client";

import React, { useEffect, useState } from 'react';

import { PostCard } from '@/components/Community/Posts/PostCard';
import { PostDetailModal } from '@/components/Community/Posts/PostDetailModal';
import { Post } from '@/types/Post';
import { communityService } from '@/services/community';
import { formatAvatarUrl } from '@/utils/formatUtils';

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
        const normalizedPosts = postsData.map(post => {
          // Asegurarnos de que tengamos un objeto author completo
          const author = post.author || { username: 'unknown' };
          
          // Crear una nueva URL formateada para el avatar
          let avatarUrl = null;
          if (author.avatar_url) {
            avatarUrl = author.avatar_url.startsWith('http') 
              ? author.avatar_url 
              : `http://127.0.0.1:8000${author.avatar_url}`;
          } else if (author.avatarUrl) {
            avatarUrl = author.avatarUrl.startsWith('http') 
              ? author.avatarUrl 
              : `http://127.0.0.1:8000${author.avatarUrl}`;
          }
          
          return {
            ...post,
            author: {
              ...author,
              avatarUrl: avatarUrl
            }
          };
        });
        
        setPosts(normalizedPosts);
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

  const handlePostClick = (postId: string) => {
    // Find the post by ID
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setIsModalOpen(true);
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
            imageUrl={imageUrl}
            onPostClick={handlePostClick}
          />
        );
      })}
      
      {/* Post Detail Modal */}
      <PostDetailModal 
        post={selectedPost} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};