import { api } from './api';
import { Post } from '@/types/Post';
import { Comment } from '@/types/Comment';

// Tipos para el servicio
export interface CreatePostData {
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
  getAllPosts: async (category?: string, page = 1) => {
    const endpoint = `posts/?page=${page}${category && category !== 'all' ? `&category=${category}` : ''}`;
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
      formData.append('content', data.content);
      if (data.category_id) {
        formData.append('category_id', data.category_id.toString());
      }
      formData.append('image', data.image);
      return api.upload('posts/', formData);
    }
    
    // Si no hay imagen, usamos JSON normal
    return api.post('posts/', {
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
  }
};

export default communityService;
