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
    // Importar el servicio de subida de imágenes dinámicamente para evitar circular dependencies
    const { default: imageUploadService } = await import('./imageUpload');
    
    // Crear FormData para enviar al backend - excluyendo las imágenes por ahora
    const formData = new FormData();
    
    // Crear estructura de contenido enriquecido
    let enrichedContent = {
      text: data.content,  // Texto original
      features: {} as Record<string, any>
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
    
    if (data.category_id) {
      formData.append('category_id', data.category_id.toString());
    }
    
    // Procesar imágenes
    const allImages = [];
    const imageUrls = [];
    
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
    
    // Subir imágenes si hay alguna
    if (maxImages > 0) {
      try {
        console.log(`Subiendo ${maxImages} imágenes para el post...`);
        
        // Subir cada imagen a Next.js
        for (let i = 0; i < maxImages; i++) {
          const imageUrl = await imageUploadService.uploadImage(allImages[i], 'post');
          imageUrls.push(imageUrl);
        }
        
        console.log(`Imágenes subidas correctamente:`, imageUrls);
        
        // Si hay imágenes, actualizar el contenido enriquecido
        if (imageUrls.length > 0) {
          // Guardar la primera imagen como principal
          enrichedContent.features['main_image'] = imageUrls[0];
          
          // Si hay varias imágenes, añadir información adicional
          if (imageUrls.length > 1) {
            enrichedContent.features['multi_image'] = true;
            enrichedContent.features['images_count'] = imageUrls.length;
            enrichedContent.features['image_urls'] = imageUrls;
          }
        }
        
      } catch (error) {
        console.error('Error al subir imágenes:', error);
        throw new Error('Error al subir imágenes: ' + error);
      }
    }
    
    // Procesar attachments (archivos que no son imágenes)
    if (data.attachments && data.attachments.length > 0) {
      // Incluir info de attachments en el contenido
      enrichedContent.features['attachments_count'] = data.attachments.length;
      
      // Enviamos los archivos adjuntos al backend de Django (no cambiamos esta parte)
      data.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
      formData.append('attachments_count', data.attachments.length.toString());
    }
    
    // Determinar si el contenido tiene características extra
    const hasFeatures = Object.keys(enrichedContent.features).length > 0;
    
    // Añadir el contenido al FormData
    formData.append('content', hasFeatures 
      ? JSON.stringify(enrichedContent) 
      : data.content
    );
    
    // Log de depuración
    console.log('Enviando FormData para creación de post con URLs de imágenes en Next.js');
    
    // Usar el método de upload para FormData
    return api.upload('posts/', formData);
  },

  updatePost: async (id: string, data: Partial<CreatePostData>) => {
    // Si hay imagen, necesitamos procesarla
    if (data.image) {
      // Importar el servicio de subida de imágenes
      const { default: imageUploadService } = await import('./imageUpload');
      
      try {
        // Subir la imagen a Next.js
        const imageUrl = await imageUploadService.uploadImage(data.image, 'post');
        
        // Crear FormData para el resto de los datos
        const formData = new FormData();
        
        // Si hay contenido, puede ser necesario actualizar el JSON para incluir la imagen
        if (data.content) {
          // Intentar parsear el contenido si es JSON
          try {
            const contentObj = JSON.parse(data.content);
            if (contentObj.text && contentObj.features) {
              // Es un objeto de contenido enriquecido, actualizar con la nueva imagen
              contentObj.features.main_image = imageUrl;
              formData.append('content', JSON.stringify(contentObj));
            } else {
              // No es el formato esperado, usar como está
              formData.append('content', data.content);
            }
          } catch (e) {
            // No es JSON, usar como está
            formData.append('content', data.content);
          }
        } else {
          // Si no hay contenido nuevo, obtenemos el post actual para actualizar solo la imagen
          const post = await api.get(`posts/${id}/`);
          if (post && post.content) {
            try {
              const contentObj = JSON.parse(post.content);
              if (contentObj.text && contentObj.features) {
                // Es un objeto de contenido enriquecido, actualizar con la nueva imagen
                contentObj.features.main_image = imageUrl;
                formData.append('content', JSON.stringify(contentObj));
              } else {
                // Crear un nuevo objeto de contenido enriquecido
                const enrichedContent = {
                  text: post.content,
                  features: { main_image: imageUrl }
                };
                formData.append('content', JSON.stringify(enrichedContent));
              }
            } catch (e) {
              // No es JSON, crear un nuevo objeto de contenido enriquecido
              const enrichedContent = {
                text: post.content,
                features: { main_image: imageUrl }
              };
              formData.append('content', JSON.stringify(enrichedContent));
            }
          }
        }
        
        if (data.category_id) {
          formData.append('category_id', data.category_id.toString());
        }
        
        // Enviar la actualización
        return api.upload(`posts/${id}/`, formData);
      } catch (error) {
        console.error('Error al actualizar post con imagen:', error);
        throw error;
      }
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
