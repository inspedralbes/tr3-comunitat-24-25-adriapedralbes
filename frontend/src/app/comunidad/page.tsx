"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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
import { Comment } from "@/types/Comment";
import { getPostViewsRecord, recordPostView } from "@/utils/postViewStorage";

export default function CommunityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSortType, setActiveSortType] = useState('default');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [categories, setCategories] = useState([]);
  const [pinnedPosts, setPinnedPosts] = useState<Post[]>([]);
  const [regularPosts, setRegularPosts] = useState<Post[]>([]);
  const [postComments, setPostComments] = useState<Record<string, Comment[]>>({});
  const [viewedPosts, setViewedPosts] = useState<Set<string>>(new Set());
  const [postViewsRecord, setPostViewsRecord] = useState({});
  const [leaderboardUsers, setLeaderboardUsers] = useState([]);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Comprobar si el usuario está autenticado
  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, [isAuthModalOpen]);

  // Cargar posts vistos desde localStorage
  useEffect(() => {
    const loadViewedPosts = () => {
      try {
        // Solo ejecutar en el cliente
        if (typeof window !== 'undefined') {
          // Cargar posts vistos
          const storedViewedPosts = localStorage.getItem('viewedPosts');
          if (storedViewedPosts) {
            const viewedPostsArray = JSON.parse(storedViewedPosts);
            setViewedPosts(new Set(viewedPostsArray));
          }
          
          // Cargar registros de vistas con timestamps
          const viewsRecord = getPostViewsRecord();
          setPostViewsRecord(viewsRecord);
        }
      } catch (error) {
        console.error('Error al cargar posts vistos:', error);
      }
    };
    
    loadViewedPosts();
  }, []);

  // Función para cargar los comentarios de un post
  const fetchPostComments = async (postId: string) => {
    try {
      const commentsData = await communityService.getPostComments(postId);
      const commentsArray = Array.isArray(commentsData)
        ? commentsData
        : (commentsData.results || []);

      // Actualizar el estado de comentarios para este post
      setPostComments(prev => ({
        ...prev,
        [postId]: commentsArray
      }));
      
      return commentsArray;
    } catch (error) {
      console.error(`Error al cargar comentarios para el post ${postId}:`, error);
      return [];
    }
  };

  // Función para cargar los comentarios de varios posts
  const fetchCommentsForPosts = async (posts: Post[]) => {
    // Limitar a 10 posts para evitar demasiadas peticiones simultáneas
    const postsToFetch = posts.slice(0, 10);
    
    try {
      // Crear un array de promesas para las peticiones
      const commentPromises = postsToFetch.map(post => fetchPostComments(post.id));
      
      // Esperar a que todas las promesas se resuelvan
      await Promise.all(commentPromises);
    } catch (error) {
      console.error('Error al cargar comentarios de los posts:', error);
    }
  };


  // Función para cargar el contenido del post (definida antes de ser usada en el efecto)
  const loadPostContent = useCallback(async (postId: string, updateUrl = true) => {
    try {
      // Agregar el post a la lista de posts vistos
      const updatedViewedPosts = new Set(viewedPosts);
      updatedViewedPosts.add(postId);
      setViewedPosts(updatedViewedPosts);
      
      // Registrar la visualización con timestamp
      recordPostView(postId);
      
      // Actualizar el estado de postViewsRecord
      setPostViewsRecord(getPostViewsRecord());
      
      // Guardar en localStorage (retrocompatibilidad)
      if (typeof window !== 'undefined') {
        localStorage.setItem('viewedPosts', JSON.stringify([...updatedViewedPosts]));
      }

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
        return normalizedPost;
      }
    } catch (err) {
      console.error('Error al obtener detalles del post:', err);
    }
    return null;
  }, [viewedPosts, pinnedPosts, regularPosts]);

  const initialLoadComplete = useRef(false);

  // Este efecto gestiona la URL y carga el post cuando se accede directamente a él
  useEffect(() => {
    // Solo se ejecuta una vez (evita ciclos y parpadeos)
    if (initialLoadComplete.current) return;
  
    const checkUrlForPostId = async () => {
      // Solo en cliente y si no está ya abierto el modal
      if (typeof window === 'undefined' || isModalOpen) return;
      
      initialLoadComplete.current = true;
      
      // Comprobar si estamos en una URL de post específico
      const path = window.location.pathname;
      const match = path.match(/\/comunidad\/([\w-]+)/);
      
      if (match) {
      // Extraer solo el ID (los UUIDs tienen 36 caracteres)
        const pathSegment = match[1];
        const postId = pathSegment.length > 36 ? pathSegment.substring(0, 36) : pathSegment;
        
        try {
          // Cargamos el post directamente
        await loadPostContent(postId, false);
          return;
        } catch (err) {
          console.error('Error al cargar post desde URL:', err);
        }
      }
    
    // Comprobar parámetros de consulta (compatibilidad hacia atrás)
      const queryPostId = searchParams.get('post');
    if (queryPostId) {
        try {
          await loadPostContent(queryPostId, false);
        } catch (err) {
          console.error('Error al cargar post desde parámetro:', err);
        }
      }
    };
    
    checkUrlForPostId();
  }, [isModalOpen, loadPostContent, searchParams]);

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
        let filteredRegularPosts;
        if (activeSortType !== 'pinned') {
          const pinnedIds = pinnedPostsArray.map(post => post.id);
          filteredRegularPosts = allPostsArray.filter(post => !pinnedIds.includes(post.id));
          setRegularPosts(filteredRegularPosts);
        } else {
          // Si el tipo es 'pinned', mostrar solo los posts fijados
          filteredRegularPosts = allPostsArray;
          setRegularPosts(filteredRegularPosts);
        }
        
        // Cargar comentarios para los posts
        const allPosts = [...pinnedPostsArray, ...filteredRegularPosts];
        await fetchCommentsForPosts(allPosts);
        
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
        let filteredRegularPosts;
        if (activeSortType !== 'pinned') {
          const pinnedIds = pinnedPosts.map(post => post.id);
          filteredRegularPosts = allPostsArray.filter(post => !pinnedIds.includes(post.id));
        } else {
          // Si el tipo es 'pinned', mostrar solo posts fijados
          filteredRegularPosts = allPostsArray;
        }

        // Cargar comentarios para los posts
        await fetchCommentsForPosts(filteredRegularPosts);
        
        setRegularPosts(filteredRegularPosts);
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
        
        // Cargar comentarios para los posts filtrados
        await fetchCommentsForPosts(filteredPosts);
        
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

  // Después definimos la función auxiliar que usa loadPostContent
  const handlePostLoadWithoutUrlChange = useCallback(async (postId: string) => {
    await loadPostContent(postId, false);
  }, [loadPostContent]);

  // Función para manejar el clic en un post
  const handlePostClick = useCallback(async (postId: string) => {
    try {
      // Cargar el post directamente sin cambiar la URL mientras esté en la vista principal
      await loadPostContent(postId, false);
      
      // Solo actualizar la URL cuando se está viendo desde la página principal
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        // Solo modificar la URL si estamos en la página principal, no si ya estamos en un post específico
        if (currentPath === '/comunidad') {
          // Modificar el historial sin navegar (evita recargas)
          window.history.replaceState(
            { postId }, 
            '', 
            `/comunidad/${postId}${selectedPost?.title ? `-${selectedPost.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/--+/g, '-').substring(0, 50)}` : ''}`
          );
        }
      }
    } catch (err) {
      console.error('Error al manejar clic en post:', err);
    }
  }, [loadPostContent, selectedPost]);


  const closeModal = () => {
    // Restaurar la URL original al cerrar el modal sin usar router (evita parpadeo)
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/comunidad');
    }
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
              postComments={postComments}
              viewedPosts={viewedPosts}
              postViewsRecord={postViewsRecord}
            />

            {/* Feed de publicaciones */}
            <PostFeed 
              posts={regularPosts} 
              filter={activeCategory} 
              onPostClick={handlePostClick} 
              isLoading={isLoadingInitial || isLoadingPosts}
              postComments={postComments}
              viewedPosts={viewedPosts}
              postViewsRecord={postViewsRecord}
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