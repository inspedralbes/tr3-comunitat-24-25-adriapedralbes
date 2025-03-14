"use client";

import { useState, useEffect } from 'react';

import { AuthModal, AuthModalType } from "@/components/Auth";
import { CategoryFilter } from "@/components/Community/CategoryFilter";
import { LeaderboardWidget } from "@/components/Community/LeaderboardWidget";
import { PinnedPostsSection } from "@/components/Community/Posts/PinnedPostsSection";
import { PostDetailModal } from "@/components/Community/Posts/PostDetailModal";
import { PostFeed } from "@/components/Community/Posts/PostFeed";
import { WritePostComponent } from "@/components/Community/Posts/WritePostComponent";
import MainLayout from '@/components/layouts/MainLayout';
// import { pinnedPosts, regularPosts } from "@/mockData/mockData"; // Comentado para usar datos reales de la API
// import { topUsers } from "@/leaderboardData"; // Comentado para usar datos reales de la API
import { authService } from '@/services/auth';
import { communityService } from '@/services/community';
import { Post } from "@/types/Post";

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSortType, setActiveSortType] = useState('default');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [categories, setCategories] = useState([]);
  const [pinnedPosts, setPinnedPosts] = useState<Post[]>([]);
  const [regularPosts, setRegularPosts] = useState<Post[]>([]);
  const [leaderboardUsers, setLeaderboardUsers] = useState([]);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Comprobar si el usuario está autenticado
  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, [isAuthModalOpen]);

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
        const pinnedPostsArray = Array.isArray(pinnedData) ? pinnedData : 
                                (pinnedData.results ? pinnedData.results : []);
        setPinnedPosts(pinnedPostsArray);
        
        // Obtener posts regulares con el tipo de ordenamiento activo
        const postsData = await communityService.getAllPosts(undefined, 1, activeSortType);
        const allPostsArray = postsData.results || (Array.isArray(postsData) ? postsData : []);
        
        // Filtrar los posts regulares para eliminar los que ya están fijados
        // Solo si no estamos en el tipo de ordenamiento 'pinned'
        if (activeSortType !== 'pinned') {
          const pinnedIds = pinnedPostsArray.map(post => post.id);
          const filteredRegularPosts = allPostsArray.filter(post => !pinnedIds.includes(post.id));
          setRegularPosts(filteredRegularPosts);
        } else {
          // Si el tipo es 'pinned', mostrar solo los posts fijados
          setRegularPosts(allPostsArray);
        }
        
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
  }, [activeSortType]);

  // Cargar posts filtrados por categoría
  useEffect(() => {
    const fetchFilteredPosts = async () => {
      if (!activeCategory || activeCategory === 'all') {
        // No cargar datos nuevamente si es la categoría 'all' - usar los datos iniciales
        if (isLoadingInitial) return; // No hacer nada si todavía estamos cargando datos iniciales
        
        const postsData = await communityService.getAllPosts(undefined, 1, activeSortType);
        const allPostsArray = postsData.results || (Array.isArray(postsData) ? postsData : []);
        
        // Filtrar los posts fijados si no estamos en vista de 'pinned'
        if (activeSortType !== 'pinned') {
          const pinnedIds = pinnedPosts.map(post => post.id);
          const filteredRegularPosts = allPostsArray.filter(post => !pinnedIds.includes(post.id));
          setRegularPosts(filteredRegularPosts);
        } else {
          // Si el tipo es 'pinned', mostrar solo posts fijados
          setRegularPosts(allPostsArray);
        }
        return;
      }
      
      setIsLoadingPosts(true);
      try {
        const postsData = await communityService.getAllPosts(activeCategory, 1, activeSortType);
        const categoryPostsArray = postsData.results || postsData;
        
        // Filtrar los posts fijados si no estamos en vista de 'pinned'
        let filteredPosts = categoryPostsArray;
        if (activeSortType !== 'pinned') {
          const pinnedIds = pinnedPosts.map(post => post.id);
          filteredPosts = categoryPostsArray.filter(post => !pinnedIds.includes(post.id));
        }
        
        // Usar un timeout para suavizar la transición
        setTimeout(() => {
          setRegularPosts(filteredPosts);
          setIsLoadingPosts(false);
        }, 300);
      } catch (err) {
        console.error('Error al filtrar posts:', err);
        setIsLoadingPosts(false);
      }
    };
    
    fetchFilteredPosts();
  }, [activeCategory, isLoadingInitial, pinnedPosts, activeSortType]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleSortTypeChange = (sortType: string) => {
    setActiveSortType(sortType);
  };

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
          imageUrl: postData.image || postData.imageUrl
        };
        
        // Actualizar las listas si el estado de fijado ha cambiado
        if (postData.is_pinned) {
          // Si el post está fijado, asegurarse de que está en la lista de posts fijados
          const isAlreadyPinned = pinnedPosts.some(post => post.id === postData.id);
          if (!isAlreadyPinned) {
            // Añadir a posts fijados y quitar de posts regulares
            setPinnedPosts([...pinnedPosts, normalizedPost]);
            setRegularPosts(regularPosts.filter(post => post.id !== postData.id));
          }
        } else {
          // Si el post no está fijado, asegurarse de que no está en la lista de posts fijados
          const wasPreviouslyPinned = pinnedPosts.some(post => post.id === postData.id);
          if (wasPreviouslyPinned) {
            // Quitar de posts fijados y añadir a posts regulares
            setPinnedPosts(pinnedPosts.filter(post => post.id !== postData.id));
            setRegularPosts([normalizedPost, ...regularPosts]);
          }
        }
        
        setSelectedPost(normalizedPost);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error('Error al obtener detalles del post:', err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    
    // Optionally refresh data when closing modal to ensure all changes are reflected
    const refreshPosts = async () => {
      try {
        // Obtener posts fijados actualizados
        const pinnedData = await communityService.getPinnedPosts();
        const pinnedPostsArray = Array.isArray(pinnedData) ? pinnedData : 
                               (pinnedData.results ? pinnedData.results : []);
        setPinnedPosts(pinnedPostsArray);
        
        // Obtener posts regulares actualizados
        const postsData = await communityService.getAllPosts(activeCategory !== 'all' ? activeCategory : undefined, 1, activeSortType);
        const allPostsArray = postsData.results || (Array.isArray(postsData) ? postsData : []);
        
        // Filtrar los posts regulares para eliminar los que ya están fijados (excepto en vista 'pinned')
        if (activeSortType !== 'pinned') {
          const pinnedIds = pinnedPostsArray.map(post => post.id);
          const filteredRegularPosts = allPostsArray.filter(post => !pinnedIds.includes(post.id));
          setRegularPosts(filteredRegularPosts);
        } else {
          setRegularPosts(allPostsArray);
        }
      } catch (err) {
        console.error('Error al actualizar posts después de cerrar modal:', err);
      }
    };
    
    refreshPosts();
  };

  // Función para crear un nuevo post
  const handleCreatePost = async (content: string, title?: string, categoryId?: number) => {
    // Verificar autenticación antes de crear un post
    if (!authService.isAuthenticated()) {
      setIsAuthModalOpen(true);
      return false;
    }
    
    try {
      await communityService.createPost({
        title,
        content,
        category_id: categoryId
      });
      
      // Recargar posts después de crear uno nuevo
      const postsData = await communityService.getAllPosts(
        activeCategory !== 'all' ? activeCategory : undefined, 
        1, 
        activeSortType
      );
      const newPostsArray = postsData.results || postsData;
      
      // Filtrar los posts fijados para evitar duplicados (excepto en vista 'pinned')
      if (activeSortType !== 'pinned') {
        const pinnedIds = pinnedPosts.map(post => post.id);
        const filteredNewPosts = newPostsArray.filter(post => !pinnedIds.includes(post.id));
        setRegularPosts(filteredNewPosts);
      } else {
        setRegularPosts(newPostsArray);
      }
      
      return true;
    } catch (err) {
      console.error('Error al crear post:', err);
      return false;
    }
  };
  
  // Manejar la autenticación exitosa
  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    setIsAuthenticated(true);
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
              activeSortType={activeSortType}
              onCategoryChange={handleCategoryChange}
              onSortTypeChange={handleSortTypeChange}
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
      
      {/* Modal de autenticación */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        type={AuthModalType.LOGIN}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </MainLayout>
  );
}