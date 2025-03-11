"use client";

import { useState, useEffect } from 'react';

import { CategoryFilter } from "@/components/Community/CategoryFilter";
import { LeaderboardWidget } from "@/components/Community/LeaderboardWidget";
import { PinnedPostsSection } from "@/components/Community/Posts/PinnedPostsSection";
import { PostDetailModal } from "@/components/Community/Posts/PostDetailModal";
import { PostFeed } from "@/components/Community/Posts/PostFeed";
import { WritePostComponent } from "@/components/Community/Posts/WritePostComponent";
import MainLayout from '@/components/layouts/MainLayout';
// import { pinnedPosts, regularPosts } from "@/mockData/mockData"; // Comentado para usar datos reales de la API
// import { topUsers } from "@/leaderboardData"; // Comentado para usar datos reales de la API
import { communityService } from '@/services/community';
import { Post } from "@/types/Post";

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [categories, setCategories] = useState([]);
  const [pinnedPosts, setPinnedPosts] = useState<Post[]>([]);
  const [regularPosts, setRegularPosts] = useState<Post[]>([]);
  const [leaderboardUsers, setLeaderboardUsers] = useState([]);
  const [error, setError] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingInitial(true);
      setError('');
      
      try {
        // Obtener categorías
        const categoriesData = await communityService.getAllCategories();
        // Asegurarnos de que categories sea un array
        setCategories(Array.isArray(categoriesData) ? categoriesData : 
                      (categoriesData.results ? categoriesData.results : []));
        
        // Obtener posts fijados
        const pinnedData = await communityService.getPinnedPosts();
        setPinnedPosts(Array.isArray(pinnedData) ? pinnedData : 
                      (pinnedData.results ? pinnedData.results : []));
        
        // Obtener posts regulares
        const postsData = await communityService.getAllPosts();
        setRegularPosts(postsData.results || (Array.isArray(postsData) ? postsData : []));
        
        // Obtener leaderboard
        const leaderboardData = await communityService.getLeaderboard();
        setLeaderboardUsers(Array.isArray(leaderboardData) ? leaderboardData : 
                           (leaderboardData.results ? leaderboardData.results : []));
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Hubo un error al cargar los datos. Por favor, intenta nuevamente.');
      } finally {
        setIsLoadingInitial(false);
      }
    };
    
    fetchInitialData();
  }, []);

  // Cargar posts filtrados por categoría
  useEffect(() => {
    const fetchFilteredPosts = async () => {
      if (!activeCategory || activeCategory === 'all') {
        // No cargar datos nuevamente si es la categoría 'all' - usar los datos iniciales
        if (isLoadingInitial) return; // No hacer nada si todavía estamos cargando datos iniciales
        
        const postsData = await communityService.getAllPosts();
        setRegularPosts(postsData.results || (Array.isArray(postsData) ? postsData : []));
        return;
      }
      
      setIsLoadingPosts(true);
      try {
        const postsData = await communityService.getAllPosts(activeCategory);
        // Usar un timeout para suavizar la transición
        setTimeout(() => {
          setRegularPosts(postsData.results || postsData);
          setIsLoadingPosts(false);
        }, 300);
      } catch (err) {
        console.error('Error al filtrar posts:', err);
        setIsLoadingPosts(false);
      }
    };
    
    fetchFilteredPosts();
  }, [activeCategory, isLoadingInitial]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handlePostClick = async (postId: string) => {
    try {
      // Obtener los detalles del post directamente de la API
      const post = await communityService.getPostById(postId);
      
      if (post) {
        setSelectedPost(post);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error('Error al obtener detalles del post:', err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Función para crear un nuevo post
  const handleCreatePost = async (content: string, categoryId?: number) => {
    try {
      await communityService.createPost({
        content,
        category_id: categoryId
      });
      
      // Recargar posts después de crear uno nuevo
      const postsData = await communityService.getAllPosts(activeCategory !== 'all' ? activeCategory : undefined);
      setRegularPosts(postsData.results || postsData);
      
      return true;
    } catch (err) {
      console.error('Error al crear post:', err);
      return false;
    }
  };

  return (
    <MainLayout activeTab="community">
      {/* Contenido principal con dos columnas */}
      <div className="container mx-auto px-4 max-w-6xl pt-6 sm:pt-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Columna principal (izquierda) */}
          <div className="flex-1">
            {/* Componente para escribir nuevos posts */}
            <WritePostComponent onSubmit={handleCreatePost} categories={categories} />

            {/* Filtros de categoría */}
            <CategoryFilter
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              categories={categories}
            />

            {/* Publicaciones fijadas */}
            <PinnedPostsSection 
              pinnedPosts={pinnedPosts} 
              onPostClick={handlePostClick} 
              isLoading={isLoadingInitial}
            />

            {/* Feed de publicaciones */}
            <PostFeed 
              posts={regularPosts} 
              filter={activeCategory} 
              onPostClick={handlePostClick} 
              isLoading={isLoadingInitial || isLoadingPosts}
            />
          </div>

          {/* Columna lateral (derecha) - oculta en móvil */}
          <div className="hidden md:block md:w-80 space-y-6">
            {/* Widget de Leaderboard */}
            <LeaderboardWidget users={leaderboardUsers} />

            {/* Aquí se pueden añadir más widgets laterales en el futuro */}
          </div>
        </div>
      </div>

      {/* Modal de detalle del post */}
      <PostDetailModal
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </MainLayout>
  );
}