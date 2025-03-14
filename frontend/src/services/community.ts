import { api } from './api';

// Tipos para el servicio
export interface CreatePostData {
  title?: string;
  content: string;
  category_id?: number;
  image?: File;
}

export interface CreateCommentData {
  post_id: string;
  content: string;
  parent_id?: string;
  mentioned_user_id?: string;
}

// Servicio para interactuar con la API de comunidad
export const communityService = {
  // Posts
  getAllPosts: async (category?: string, page = 1, sortType = 'default') => {
    let endpoint = `posts/?page=${page}`;
    
    // Añadir filtro por categoría si está especificado
    if (category && category !== 'all') {
      endpoint += `&category=${category}`;
    }
    
    // Añadir parámetro de ordenamiento
    switch (sortType) {
      case 'new':
        endpoint += '&ordering=-created_at'; // Ordenar por fecha de creación, más recientes primero
        break;
      case 'top':
        endpoint += '&ordering=-likes'; // Ordenar por más likes
        break;
      case 'pinned':
        endpoint += '&is_pinned=true'; // Solo mostrar posts fijados
        break;
      default: // 'default'
        // No añadir ordenamiento especial, usar el predeterminado del backend
        break;
    }
    
    return api.get(endpoint);
  },

  getPinnedPosts: async () => {
    return api.get('pinned-posts/');
  },

  getPostById: async (id: string) => {
    return api.get(`posts/${id}/`);
  },

  createPost: async (data: CreatePostData) => {
    // Si hay imagen, usamos FormData
    if (data.image) {
      const formData = new FormData();
      if (data.title) {
        formData.append('title', data.title);
      }
      formData.append('content', data.content);
      if (data.category_id) {
        formData.append('category_id', data.category_id.toString());
      }
      formData.append('image', data.image);
      return api.upload('posts/', formData);
    }
    
    // Si no hay imagen, usamos JSON normal
    return api.post('posts/', {
      title: data.title,
      content: data.content,
      category_id: data.category_id
    });
  },

  updatePost: async (id: string, data: Partial<CreatePostData>) => {
    // Si hay imagen, usamos FormData
    if (data.image) {
      const formData = new FormData();
      if (data.content) formData.append('content', data.content);
      if (data.category_id) formData.append('category_id', data.category_id.toString());
      formData.append('image', data.image);
      return api.upload(`posts/${id}/`, formData);
    }
    
    // Si no hay imagen, usamos JSON normal
    return api.patch(`posts/${id}/`, data);
  },

  deletePost: async (id: string) => {
    return api.delete(`posts/${id}/`);
  },

  likePost: async (id: string) => {
    return api.post(`posts/${id}/like/`, {});
  },

  // Comentarios
  getPostComments: async (postId: string) => {
    return api.get(`posts/${postId}/comments/`);
  },

  createComment: async (data: CreateCommentData) => {
    return api.post('comments/', data);
  },

  updateComment: async (id: string, content: string) => {
    return api.patch(`comments/${id}/`, { content });
  },

  deleteComment: async (id: string) => {
    return api.delete(`comments/${id}/`);
  },

  likeComment: async (id: string) => {
    return api.post(`comments/${id}/like/`, {});
  },

  // Categorías
  getAllCategories: async () => {
    return api.get('categories/');
  },

  // Leaderboard
  getLeaderboard: async () => {
    return api.get('leaderboard/');
  },
  
  // Posts de usuario
  getUserPosts: async (userId: string) => {
    return api.get(`users/${userId}/posts/`);
  },
  
  // Actividad de usuario
  getUserActivity: async (userId: string) => {
    return api.get(`users/${userId}/activity/`);
  }
};

export default communityService;
