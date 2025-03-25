import { api } from './api';

// Tipo para las opciones de encuesta
export interface PollOption {
  text: string;
  id: number;
}

// Tipos para el servicio
export interface CreatePostData {
  title?: string;
  content: string;
  category_id?: number;
  image?: File;
  attachments?: File[];
  video_url?: string;
  link_url?: string;
  poll_options?: PollOption[];
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
    // Siempre usamos FormData para manejar archivos adjuntos y otros tipos de contenido
    const formData = new FormData();
    
    // Crear estructura de contenido enriquecido para almacenar todo en el campo content
    let enrichedContent = {
      text: data.content,  // Texto original
      features: {}
    };
    
    // Añadir URL de enlace si existe
    if (data.link_url) {
      enrichedContent.features['link'] = data.link_url;
    }
    
    // Añadir URL de video si existe
    if (data.video_url) {
      enrichedContent.features['video'] = data.video_url;
    }
    
    // Añadir opciones de encuesta si existen
    if (data.poll_options && data.poll_options.length >= 2) {
      enrichedContent.features['poll'] = data.poll_options;
    }
    
    // Datos básicos
    if (data.title) {
      formData.append('title', data.title);
    }
    
    // Usar JSON estructurado en lugar de solo texto si hay características adicionales
    let hasFeatures = Object.keys(enrichedContent.features).length > 0;
    formData.append('content', hasFeatures 
      ? JSON.stringify(enrichedContent) 
      : data.content
    );
    
    if (data.category_id) {
      formData.append('category_id', data.category_id.toString());
    }
    
    // Solución alternativa: crear una estructura especial para múltiples imágenes
    // y convertirlas a base64 para almacenarlas en el contenido
    const allImages = [];
    
    // Recolectar todas las imágenes
    if (data.image) {
      allImages.push(data.image);
    }
    
    if (data.attachments && data.attachments.length > 0) {
      const imageFiles = data.attachments.filter(file => file.type.startsWith('image/'));
      allImages.push(...imageFiles);
      
      // Filtrar los attachments para mantener solo los no-imágenes
      data.attachments = data.attachments.filter(file => !file.type.startsWith('image/'));
    }
    
    // Limitar a un máximo de 3 imágenes
    const maxImages = Math.min(allImages.length, 3);
    
    if (maxImages > 0) {
      // Siempre asignar la primera imagen al campo 'image' para la vista previa
      formData.append('image', allImages[0]);
      
      // Si hay varias imágenes, almacenarlas de otra forma
      if (maxImages > 1) {
        // Asegurarse de que estamos usando contenido enriquecido
        if (!hasFeatures) {
          enrichedContent = {
            text: data.content,
            features: {}
          };
          hasFeatures = true;
        }
        
        // Agregar un marcador para indicar que hay múltiples imágenes
        enrichedContent.features['multi_image'] = true;
        enrichedContent.features['images_count'] = maxImages;
        
        // Incluir los nombres de archivo para ayudar en la visualización
        const imageFilenames = allImages.map(img => img.name || 'image.jpg');
        enrichedContent.features['image_filenames'] = imageFilenames;
        
        // Almacenar los nombres de archivo para mostrar en la UI
        formData.append('image_filenames', JSON.stringify(imageFilenames));
        
        // Actualizar el contenido enriquecido
        formData.set('content', JSON.stringify(enrichedContent));
        
        // Adjuntar todas las imágenes con nombres especiales para el backend
        for (let i = 0; i < maxImages; i++) {
          if (i === 0) {
            // La primera ya está asignada al campo 'image'
            continue;
          }
          
          // Usar nombre único para cada imagen adicional
          const fieldName = `image_${i+1}`;
          formData.append(fieldName, allImages[i]);
        }
      }
    }
    
    // Nuevos campos - archivos adjuntos múltiples podrían implementarse en el futuro
    if (data.attachments && data.attachments.length > 0) {
      // También incluimos la información de archivos adjuntos en el contenido
      if (hasFeatures) {
        enrichedContent.features['attachments_count'] = data.attachments.length;
        // Actualizar el contenido con la nueva información de attachments
        formData.set('content', JSON.stringify(enrichedContent));
      }
      
      // Seguimos enviando los archivos reales para un potencial procesamiento futuro
      data.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
      formData.append('attachments_count', data.attachments.length.toString());
    }
    
    // Log de depuración para verificar qué se está enviando
    console.log('Enviando FormData para creación de post:');
    for (const pair of formData.entries()) {
      if (pair[0] === 'image' || pair[0].startsWith('attachment_')) {
        console.log(`${pair[0]}: [Archivo] ${(pair[1] as File).name} (${(pair[1] as File).type})`);
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }
    
    // Usar el método de carga para FormData
    return api.upload('posts/', formData);
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

  votePoll: async (postId: string, optionId: number) => {
    return api.post(`posts/${postId}/vote/`, { option_id: optionId });
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
  getUserActivity: async (userId: string, page = 1) => {
    // Si se implementa paginación, se puede usar el parámetro page
    return api.get(`users/${userId}/activity/?page=${page}`);
  }
};

export default communityService;
