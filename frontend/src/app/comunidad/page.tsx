"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';

import { AuthModalType } from "@/components/Auth";
import { RequiredAuthModal } from "@/components/Auth/RequiredAuthModal";
import { CategoryFilter } from "@/components/Community/CategoryFilter";
import { LeaderboardWidget } from "@/components/Community/LeaderboardWidget";
import { PinnedPostsSection } from "@/components/Community/Posts/PinnedPostsSection";
import { PostDetailModal } from "@/components/Community/Posts/PostDetailModal";
import { PostFeed } from "@/components/Community/Posts/PostFeed";
import { WritePostComponent } from "@/components/Community/Posts/WritePostComponent";
import MainLayout from '@/components/layouts/MainLayout';
import { authService } from '@/services/auth';
import { communityService } from '@/services/community';
import subscriptionService from '@/services/subscription';
import { Comment } from "@/types/Comment";
import { Post } from "@/types/Post";
import { getPostViewsRecord, recordPostView } from "@/utils/postViewStorage";

function CommunityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSortType, setActiveSortType] = useState('default');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [_isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [_isRefreshing, _setIsRefreshing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [pinnedPosts, setPinnedPosts] = useState<Post[]>([]);
  const [regularPosts, setRegularPosts] = useState<Post[]>([]);
  const [postComments, setPostComments] = useState<Record<string, Comment[]>>({});
  const [viewedPosts, setViewedPosts] = useState<Set<string>>(new Set());
  const [postViewsRecord, setPostViewsRecord] = useState({});
  const [leaderboardUsers, setLeaderboardUsers] = useState([]);
  const [error, setError] = useState('');
  const [_isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [skipLoadingIndicator, setSkipLoadingIndicator] = useState(false);

  // Verificar autenticación y suscripción
  useEffect(() => {
    // Función para verificar autenticación y suscripción al cargar la página
    const checkAuth = async () => {
      setIsLoadingInitial(true);

      // Verificar si está autenticado
      if (!authService.isAuthenticated()) {
        setIsAuthModalOpen(true);
        setIsLoadingInitial(false);
        return;
      }

      try {
        // Verificar suscripción
        const subscriptionStatus = await subscriptionService.getSubscriptionStatus().catch(error => {
          console.error('Error al verificar suscripción:', error);
          // En caso de error, permitimos acceso temporal
          return { has_subscription: true, subscription_status: 'temp_access', start_date: null, end_date: null };
        });

        console.warn('Estado de suscripción:', subscriptionStatus);

        // Si no tiene suscripción, redirigir a la página de configuración
        if (!subscriptionStatus.has_subscription) {
          console.warn('Usuario sin suscripción, redirigiendo a configuración');
          router.push('/perfil/configuracion');
          return;
        }
      } catch (error) {
        console.error('Error general al verificar acceso:', error);
      }
      // No establecemos isLoadingInitial en false aquí, lo hará el efecto de carga de datos
    };

    checkAuth();
  }, [router]);

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

  // Escuchar evento de refresco para actualizar los posts después de votar en encuestas
  useEffect(() => {
    const handleRefreshPosts = (event: Event) => {
      const customEvent = event as CustomEvent<{ postId: string, newResults: any }>;
      if (customEvent.detail && customEvent.detail.postId) {
        const postId = customEvent.detail.postId;
        const newResults = customEvent.detail.newResults;

        // Función para actualizar los resultados de encuesta en un array de posts
        const updatePostsArray = (posts: Post[]) => {
          return posts.map(post => {
            if (post.id === postId && typeof post.content === 'string') {
              try {
                const contentObj = JSON.parse(post.content);
                if (contentObj.features) {
                  contentObj.features.poll_results = newResults;
                  return {
                    ...post,
                    content: JSON.stringify(contentObj)
                  };
                }
              } catch (e) {
                console.error('Error al actualizar post:', e);
              }
            }
            return post;
          });
        };

        // Actualizar posts fijados y regulares
        setPinnedPosts(updatePostsArray(pinnedPosts));
        setRegularPosts(updatePostsArray(regularPosts));

        // Si el post seleccionado es el que se actualizó, también actualizarlo
        if (selectedPost && selectedPost.id === postId) {
          communityService.getPostById(postId)
            .then(freshPost => {
              if (freshPost) {
                setSelectedPost({
                  ...selectedPost,
                  content: freshPost.content
                });
              }
            })
            .catch(err => {
              console.error('Error al recargar post después de votar:', err);
            });
        }
      }
    };

    // Registrar evento personalizado
    window.addEventListener('refresh-posts', handleRefreshPosts as EventListener);

    // Limpiar evento al desmontar
    return () => {
      window.removeEventListener('refresh-posts', handleRefreshPosts as EventListener);
    };
  }, [pinnedPosts, regularPosts, selectedPost]);

  // Función para cargar los comentarios de un post
  const fetchPostComments = useCallback(async (postId: string) => {
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
  }, []);

  // Función para cargar los comentarios de varios posts - envuelta en useCallback
  const fetchCommentsForPosts = useCallback(async (posts: Post[]) => {
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
  }, [fetchPostComments]);

  // Función para cargar el contenido del post (definida antes de ser usada en el efecto)
  const loadPostContent = useCallback(async (postId: string, _updateUrl = true) => {
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
        // Manejar el contenido - podría ser JSON o string
        const contentValue = typeof postData.content === 'string'
          ? postData.content
          : JSON.stringify(postData.content);

        // Intentar detectar contenido enriquecido (JSON con features)
        let processedContent = contentValue;
        try {
          // Si el contenido parece ser JSON con nuestra estructura enriquecida (text + features)
          // lo dejamos como está para permitir que se procese correctamente
          const parsedContent = JSON.parse(contentValue);
          if (parsedContent.text && parsedContent.features) {
            processedContent = contentValue; // Mantener el JSON como string para procesar en componentes
            console.warn("Post con contenido enriquecido detectado:", postId);
          }
        } catch (e) {
          // Si no es JSON o no tiene la estructura esperada, usamos como está
          processedContent = contentValue;
        }

        // Buscar si el post existe en las listas para preservar el estado de like
        const existingPost = [...pinnedPosts, ...regularPosts].find(post => post.id === postId);

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
          content: processedContent,
          category: typeof postData.category === 'object' && postData.category !== null ? postData.category.name : postData.category,
          categoryColor: typeof postData.category === 'object' && postData.category !== null && postData.category.color ? postData.category.color : 'bg-[#444442] border border-white/5',
          created_at: postData.created_at,
          updated_at: postData.updated_at,
          image: postData.image,
          comments_count: postData.comments_count || 0,
          is_pinned: postData.is_pinned,
          timestamp: postData.timestamp || postData.created_at,
          // Preservar el estado de like si existe, o usar el valor de la API
          likes: existingPost?.likes || postData.likes || 0,
          comments: postData.comments_count || 0,
          isPinned: postData.is_pinned,
          imageUrl: postData.image || postData.imageUrl,
          // Preservar el estado de like si existe, o usar el valor de la API
          is_liked: existingPost?.is_liked !== undefined ? existingPost.is_liked : postData.is_liked
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
          const pinnedIds = pinnedPostsArray.map((post: Post) => post.id);
          filteredRegularPosts = allPostsArray.filter((post: Post) => !pinnedIds.includes(post.id));
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
  }, [activeSortType, fetchCommentsForPosts]);

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
          const pinnedIds = pinnedPosts.map((post: Post) => post.id);
          filteredRegularPosts = allPostsArray.filter((post: Post) => !pinnedIds.includes(post.id));
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
          const pinnedIds = pinnedPosts.map((post: Post) => post.id);
          filteredPosts = categoryPostsArray.filter((post: Post) => !pinnedIds.includes(post.id));
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
  }, [activeCategory, isLoadingInitial, pinnedPosts, activeSortType, fetchCommentsForPosts]);

  // Añadir console.log para depurar los posts regulares cada vez que cambian
  useEffect(() => {
    console.log('Posts regulares actualizados:', regularPosts.length, 'posts');
    if (regularPosts.length > 0) {
      console.log('Ejemplo primer post:', regularPosts[0]);
    }
  }, [regularPosts]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleSortTypeChange = (sortType: string) => {
    setActiveSortType(sortType);
  };

  // Después definimos la función auxiliar que usa loadPostContent
  const _handlePostLoadWithoutUrlChange = useCallback(async (postId: string) => {
    await loadPostContent(postId, false);
  }, [loadPostContent]);

  // Función para manejar el clic en un post
  const handlePostClick = useCallback(async (postId: string) => {
    try {
      // Buscar el post en las listas existentes para preservar su estado (como is_liked)
      let existingPost = [...pinnedPosts, ...regularPosts].find(post => post.id === postId);

      // Cargar el post directamente sin cambiar la URL mientras esté en la vista principal
      const loadedPost = await loadPostContent(postId, false);

      // Si encontramos el post en las listas y tenemos uno cargado, asegurarse de que el estado de like se preserve
      if (existingPost && loadedPost) {
        // Actualizar el selectedPost con el estado de like de la lista
        setSelectedPost(prev => {
          if (!prev) return loadedPost;
          return {
            ...prev,
            is_liked: existingPost?.is_liked,
            likes: existingPost?.likes
          };
        });
      }

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

  // Añadir el efecto para actualizaciones silenciosas en segundo plano
  useEffect(() => {
    if (!isModalOpen && !isLoadingInitial) {
      // Solo actualizar si no hay modal abierto y no estamos en la carga inicial
      const refreshInterval = setInterval(() => {
        const silentRefresh = async () => {
          try {
            // No activar flag de carga para actualizaciones en segundo plano
            const [pinnedData, postsData] = await Promise.all([
              communityService.getPinnedPosts(),
              communityService.getAllPosts(activeCategory !== 'all' ? activeCategory : undefined, 1, activeSortType)
            ]);

            const pinnedPostsArray = Array.isArray(pinnedData) ? pinnedData :
              (pinnedData.results ? pinnedData.results : []);

            const allPostsArray = postsData.results || (Array.isArray(postsData) ? postsData : []);

            if (activeSortType !== 'pinned') {
              const pinnedIds = pinnedPostsArray.map((post: Post) => post.id);
              const filteredRegularPosts = allPostsArray.filter((post: Post) => !pinnedIds.includes(post.id));
              setPinnedPosts(pinnedPostsArray);
              setRegularPosts(filteredRegularPosts);
            } else {
              setPinnedPosts(pinnedPostsArray);
              setRegularPosts(allPostsArray);
            }
          } catch (err) {
            console.error('Error en la actualización silenciosa:', err);
          }
        };

        silentRefresh();
      }, 30000); // Actualizar cada 30 segundos

      return () => clearInterval(refreshInterval);
    }
  }, [isModalOpen, isLoadingInitial, activeCategory, activeSortType]);

  const closeModal = () => {
    // Activar el flag para evitar cualquier skeleton
    setSkipLoadingIndicator(true);

    // Restaurar URL original
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/comunidad');
    }

    // Cerrar el modal inmediatamente
    setSelectedPost(null);
    setIsModalOpen(false);

    // Mantener el flag activo por un tiempo suficiente
    setTimeout(() => {
      setSkipLoadingIndicator(false);
    }, 2000);
  };

  // Función para crear un nuevo post
  const handleCreatePost = async (
    content: string,
    title?: string,
    categoryId?: number,
    attachments?: File[],
    videoUrl?: string,
    linkUrl?: string,
    pollOptions?: { id: number, text: string }[]
  ): Promise<boolean> => {
    // Verificar autenticación antes de crear un post
    if (!authService.isAuthenticated()) {
      setIsAuthModalOpen(true);
      return false;
    }

    try {
      const newPostResponse = await communityService.createPost({
        title,
        content,
        category_id: categoryId,
        attachments,
        video_url: videoUrl,
        link_url: linkUrl,
        poll_options: pollOptions
      });

      console.log('Respuesta de creación de post:', newPostResponse);

      // Recargar posts después de crear uno nuevo
      const postsData = await communityService.getAllPosts(
        activeCategory !== 'all' ? activeCategory : undefined,
        1,
        activeSortType
      );

      console.log('Datos de posts después de crear:', postsData);

      const newPostsArray = postsData.results || postsData;

      // Filtrar los posts fijados para evitar duplicados (excepto en vista 'pinned')
      if (activeSortType !== 'pinned') {
        const pinnedIds = pinnedPosts.map((post: Post) => post.id);
        const filteredNewPosts = newPostsArray.filter((post: Post) => !pinnedIds.includes(post.id));
        console.log('Posts filtrados para mostrar:', filteredNewPosts.length);
        setRegularPosts(filteredNewPosts);

        // Forzar actualización después de un breve retraso para asegurar que los cambios se apliquen
        setTimeout(async () => {
          const refreshData = await communityService.getAllPosts(
            activeCategory !== 'all' ? activeCategory : undefined,
            1,
            activeSortType
          );
          const refreshPostsArray = refreshData.results || refreshData;
          const refreshFilteredPosts = refreshPostsArray.filter(
            (post: Post) => !pinnedIds.includes(post.id)
          );
          setRegularPosts(refreshFilteredPosts);
        }, 1000);
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
      {/* Overlay difuminado cuando el usuario no está autenticado */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 pointer-events-none" />
      )}

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
              isLoading={isLoadingInitial && !selectedPost && !skipLoadingIndicator}
              postComments={postComments}
              viewedPosts={viewedPosts}
              postViewsRecord={postViewsRecord}
            />

            {/* Feed de publicaciones */}
            <PostFeed
              posts={regularPosts}
              filter={activeCategory}
              onPostClick={handlePostClick}
              isLoading={isLoadingInitial && !selectedPost && !skipLoadingIndicator}
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

      {/* Modal de autenticación requerida */}
      <RequiredAuthModal
        isOpen={isAuthModalOpen}
        onSuccess={handleAuthSuccess}
      />
    </MainLayout>
  );
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 max-w-6xl pt-6 pb-24 sm:pt-8">Cargando...</div>}>
      <CommunityContent />
    </Suspense>
  );
}
