"use client";

import { 
  MessageCircle, 
  ThumbsUp, 
  User, 
  Clock, 
  Filter,
  Image as ImageIcon
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

import UserLevelBadge from '@/components/ui/UserLevelBadge';
import { communityService } from '@/services/community';
import { normalizeAvatarUrl, normalizeImageUrl } from '@/utils/imageUtils';

// Tipos de actividad para filtrado
type ActivityType = 'all' | 'comments' | 'likes';

interface UserActivity {
  id: string;
  type: 'comment' | 'post_like' | 'comment_like';
  created_at: string;
  content?: string;
  post?: {
    id: string;
    title: string;
    content?: string;
    image?: string;
    imageUrl?: string;
    image_url?: string;
  };
  comment?: {
    id: string;
    content: string;
    post: {
      id: string;
      title: string;
      image?: string;
      imageUrl?: string;
      image_url?: string;
    }
  };
  // Campos obsoletos para compatibilidad
  postId?: string;
  post_id?: string;
  postTitle?: string; 
  post_title?: string;
  timestamp?: string;
  imageUrl?: string;
  image_url?: string;
  author?: {
    username: string;
    level?: number;
    avatarUrl?: string;
    avatar_url?: string;
  };
  commentAuthor?: {
    username: string;
    level?: number;
    avatarUrl?: string;
    avatar_url?: string;
  };
}

interface UserActivityTabProps {
  userId: string;
}

export const UserActivityTab: React.FC<UserActivityTabProps> = ({ userId }) => {
  // Estado para el filtro de actividad seleccionado
  const [selectedFilter, setSelectedFilter] = useState<ActivityType>('all');
  // Estado para la carga de actividades
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  // Estado para simular la carga de más actividades
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Función para construir la URL del post según la convención de la aplicación
  const getPostUrl = (postId: string | undefined, postTitle?: string) => {
    if (!postId) return '#';

    // Creamos un slug a partir del título si existe
    let slug = '';
    if (postTitle) {
      slug = `-${postTitle.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .substring(0, 50)}`;
    }

    // Formato: /comunidad/[postId]-[slug]
    return `/comunidad/${postId}${slug}`;
  };

  // Función para formatear fechas relativas
  const formatRelativeDate = (dateString: string | undefined) => {
    // Si no hay fecha, devolver un valor por defecto
    if (!dateString) return 'fecha desconocida';
    
    // Si ya es un string formateado como "hace X días", devolverlo directamente
    if (typeof dateString === 'string' && dateString.startsWith('hace ')) {
      return dateString;
    }
    
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: es });
    } catch (error) {
      // Si hay error al parsear la fecha, devolver el string original
      return dateString;
    }
  };

  useEffect(() => {
    const fetchUserActivity = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Obtener la actividad del usuario desde el backend
        const activityData = await communityService.getUserActivity(userId);
        
        if (Array.isArray(activityData) && activityData.length > 0) {
          // Los datos ya vienen normalizados del backend
          setActivities(activityData);
          setHasMore(activityData.length >= 10); // Suponer que hay más si hay muchos items
        } else {
          // Si no hay datos o el array está vacío
          setActivities([]);
          setHasMore(false);
        }
      } catch (err) {
        console.error('Error al cargar la actividad del usuario:', err);
        setError('No se pudo cargar la actividad del usuario.');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserActivity();
    }
  }, [userId]);

  // Filtrar actividades para mostrar solo comentarios y likes
  const filteredActivities = activities.filter(item => {
    // Si es un filtro específico, aplicarlo
    if (selectedFilter === 'comments') return item.type === 'comment';
    if (selectedFilter === 'likes') return item.type === 'post_like' || item.type === 'comment_like';
    
    // Para 'all' o cualquier otro caso, mostrar todos los tipos
    return item.type === 'comment' || item.type === 'post_like' || item.type === 'comment_like';
  });

  // Estado para rastrear la página actual para cargar más
  const [currentPage, setCurrentPage] = useState(1);

  // Función para cargar más actividades desde el backend
  const loadMoreActivities = async () => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    try {
      const nextPage = currentPage + 1;
      // Llamar al endpoint con paginación
      const moreActivityData = await communityService.getUserActivity(userId, nextPage);
      
      if (Array.isArray(moreActivityData) && moreActivityData.length > 0) {
        // Añadir las nuevas actividades a las existentes
        setActivities(prevActivities => [...prevActivities, ...moreActivityData]);
        setCurrentPage(nextPage);
        setHasMore(moreActivityData.length >= 10); // Si hay menos de 10, probablemente no hay más
      } else {
        // No hay más actividades
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error al cargar más actividades:', error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Renderizar un ícono según el tipo de actividad
  const renderActivityIcon = (type: UserActivity['type']) => {
    switch (type) {
      case 'comment':
        return <MessageCircle className="text-blue-400" size={18} />;
      case 'post_like':
        return <ThumbsUp className="text-red-400" size={18} />;
      case 'comment_like':
        return <ThumbsUp className="text-purple-400" size={18} />;
      default:
        return <Clock className="text-gray-400" size={18} />;
    }
  };

  // Función para obtener la URL de imagen correctamente normalizada
  const getPostImageUrl = (post: any): string | null => {
    if (!post) return null;
    
    // 1. Verificar campos directos de imagen
    if (post.imageUrl) {
      return normalizeImageUrl(post.imageUrl);
    }
    
    if (post.image_url) {
      return normalizeImageUrl(post.image_url);
    }
    
    if (post.image) {
      return normalizeImageUrl(post.image);
    }
    
    // 2. Verificar si hay una imagen en el contenido enriquecido
    if (post.content && typeof post.content === 'string') {
      try {
        const parsedContent = JSON.parse(post.content);
        if (parsedContent.features && parsedContent.features.main_image) {
          return normalizeImageUrl(parsedContent.features.main_image);
        }
      } catch (e) {
        // No es JSON válido, ignorar
      }
    }
    
    return null;
  };

  // Renderizar el contenido según el tipo de actividad
  const renderActivityContent = (item: UserActivity) => {
    switch (item.type) {
      case 'comment': {
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-zinc-300">Comentaste en </span>
              {item.post?.title ? (
                <Link href={getPostUrl(item.post.id, item.post.title)} className="text-blue-400 hover:underline">
                  {item.post.title}
                </Link>
              ) : (
                <Link href={getPostUrl(item.post?.id || '')} className="text-blue-400 hover:underline">
                  una publicación
                </Link>
              )}
              <span className="text-zinc-400 text-xs">• {formatRelativeDate(item.created_at)}</span>
            </div>
            {item.content && (
              <div className="bg-[#252524] rounded-lg px-3 py-2 border border-white/5 text-zinc-200">
                {item.content}
              </div>
            )}
          </div>
        );
      }
      
      case 'post_like': {
        // Obtener la URL de la imagen del post
        const postImageUrl = getPostImageUrl(item.post);
        
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-zinc-300">Te gustó </span>
              {item.post?.title ? (
                <Link href={getPostUrl(item.post.id, item.post.title)} className="text-blue-400 hover:underline">
                  {item.post.title}
                </Link>
              ) : (
                <Link href={getPostUrl(item.post?.id || '')} className="text-blue-400 hover:underline">
                  una publicación
                </Link>
              )}
              <span className="text-zinc-400 text-xs">• {formatRelativeDate(item.created_at)}</span>
            </div>
            
            {/* Mostrar la imagen si existe */}
            {postImageUrl && (
              <Link 
                href={getPostUrl(item.post?.id || '')} 
                className="block w-full mt-2 hover:opacity-90 transition-opacity"
              >
                <div className="relative w-full h-40 bg-black/20 rounded-lg overflow-hidden border border-white/10">
                  <Image
                    src={postImageUrl}
                    alt={item.post?.title || 'Imagen de la publicación'}
                    fill
                    className="object-cover"
                    unoptimized={true}
                    onError={(e) => {
                      console.error('Error loading image:', postImageUrl);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </Link>
            )}
          </div>
        );
      }
      
      case 'comment_like': {
        // Obtener la URL de la imagen del post donde se comentó
        const commentPostImageUrl = getPostImageUrl(item.comment?.post);
        
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-zinc-300">Te gustó un comentario en </span>
              {item.comment?.post.title ? (
                <Link href={getPostUrl(item.comment.post.id, item.comment.post.title)} className="text-blue-400 hover:underline">
                  {item.comment.post.title}
                </Link>
              ) : (
                <Link href={getPostUrl(item.comment?.post.id || '')} className="text-blue-400 hover:underline">
                  una publicación
                </Link>
              )}
              <span className="text-zinc-400 text-xs">• {formatRelativeDate(item.created_at)}</span>
            </div>
            
            {/* Mostrar la imagen si existe */}
            {commentPostImageUrl && (
              <Link 
                href={getPostUrl(item.comment?.post.id || '')} 
                className="block w-full mt-2 hover:opacity-90 transition-opacity"
              >
                <div className="relative w-full h-40 bg-black/20 rounded-lg overflow-hidden border border-white/10">
                  <Image
                    src={commentPostImageUrl}
                    alt={item.comment?.post.title || 'Imagen de la publicación'}
                    fill
                    className="object-cover"
                    unoptimized={true}
                    onError={(e) => {
                      console.error('Error loading image:', commentPostImageUrl);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </Link>
            )}
          </div>
        );
      }
      
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {/* Placeholders para los filtros */}
        <div className="h-12 bg-[#323230] rounded-lg mb-4" />
        
        {/* Placeholders para las actividades */}
        {Array.from({length: 3}, (_, i) => (
          <div key={`loading-placeholder-${i}`} className="bg-[#323230] rounded-lg p-4 border border-white/10 h-16" />
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

  return (
    <div className="space-y-4">
      {/* Filtros de actividad - Solo mostrar filtros relevantes */}
      <div className="flex flex-wrap items-center gap-2 mb-4 bg-zinc-800/30 p-3 rounded-lg border border-white/5">
        <Filter size={16} className="text-zinc-400 mr-1" />
        
        <button
          className={`px-3 py-1.5 rounded-full text-sm ${selectedFilter === 'all' 
            ? 'bg-blue-600 text-white' 
            : 'text-zinc-300 hover:bg-zinc-700/50 transition-colors'}`}
          onClick={() => setSelectedFilter('all')}
        >
          Todas
        </button>
        
        <button
          className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${selectedFilter === 'comments' 
            ? 'bg-blue-600 text-white' 
            : 'text-zinc-300 hover:bg-zinc-700/50 transition-colors'}`}
          onClick={() => setSelectedFilter('comments')}
        >
          <MessageCircle size={14} />
          Comentarios
        </button>
        
      <button
          className={`px-3 py-1.5 rounded-full text-sm ${selectedFilter === 'likes' 
            ? 'bg-blue-600 text-white' 
            : 'text-zinc-300 hover:bg-zinc-700/50 transition-colors'}`}
          onClick={() => setSelectedFilter('likes')}
        >
          <div className="flex items-center gap-1">
            <ThumbsUp size={14} />
            Likes
          </div>
        </button>
      </div>

      {/* Lista de actividades */}
      <div className="space-y-3">
        {filteredActivities.length > 0 ? (
          <>
            {filteredActivities.map((activity, index) => (
              <div 
                key={`${activity.id}-${index}`} 
                className="bg-zinc-800/20 hover:bg-zinc-800/30 transition-colors p-4 rounded-lg border border-white/5"
              >
                <div className="flex gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-[#444442] flex items-center justify-center border border-white/10">
                      {activity.author?.avatarUrl || activity.author?.avatar_url ? (
                        <Image
                          src={normalizeAvatarUrl(activity.author.avatarUrl || activity.author.avatar_url) || ''}
                          alt={activity.author.username || 'user'}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                          unoptimized={true}
                        />
                      ) : (
                        <div className="text-white font-medium">
                          {activity.author?.username ? activity.author.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 mt-1">
                      {renderActivityIcon(activity.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    {renderActivityContent(activity)}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Botón para cargar más */}
            {hasMore && (
              <button
                className="w-full py-3 bg-zinc-800/30 hover:bg-zinc-800/50 text-zinc-300 rounded-lg border border-white/5 transition-colors"
                onClick={loadMoreActivities}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cargando...
                  </span>
                ) : (
                  'Cargar más'
                )}
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-8 bg-zinc-800/20 rounded-lg border border-white/5">
            <div className="text-zinc-400 mb-2">No hay actividad que mostrar con este filtro</div>
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              onClick={() => setSelectedFilter('all')}
            >
              Ver toda la actividad
            </button>
          </div>
        )}
      </div>
    </div>
  );
};