"use client";

import React, { useEffect, useState } from 'react';

import { PostCard } from '@/components/Community/Posts/PostCard';
import { Post } from '@/types/Post';
import { communityService } from '@/services/community';

interface UserPostsTabProps {
  userId: string;
}

export const UserPostsTab: React.FC<UserPostsTabProps> = ({ userId }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  const handlePostClick = (postId: string) => {
    // Redirigir o abrir modal con el detalle del post
    console.log('Post clicked:', postId);
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
    </div>
  );
};