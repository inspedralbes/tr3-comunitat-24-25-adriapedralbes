import { PostViewRecord } from "@/types/PostView";

// Clave para almacenar los datos en localStorage
const POST_VIEWS_STORAGE_KEY = 'community_post_views';

/**
 * Registra la visualización de un post por el usuario actual
 * @param postId - ID del post visualizado
 */
export function recordPostView(postId: string): void {
  try {
    // Obtener registros existentes
    const existingRecords = getPostViewsRecord();
    
    // Actualizar el registro con la fecha actual
    const updatedRecords = {
      ...existingRecords,
      [postId]: new Date().toISOString()
    };
    
    // Guardar en localStorage
    localStorage.setItem(POST_VIEWS_STORAGE_KEY, JSON.stringify(updatedRecords));
  } catch (error) {
    console.error('Error al registrar la vista del post:', error);
  }
}

/**
 * Obtiene todos los registros de vistas de posts
 * @returns Un registro de IDs de posts con sus timestamps de última visualización
 */
export function getPostViewsRecord(): PostViewRecord {
  try {
    const storedData = localStorage.getItem(POST_VIEWS_STORAGE_KEY);
    if (!storedData) return {};
    
    return JSON.parse(storedData) as PostViewRecord;
  } catch (error) {
    console.error('Error al obtener los registros de vistas:', error);
    return {};
  }
}

/**
 * Obtiene la fecha de la última vez que se vio un post específico
 * @param postId - ID del post
 * @returns La fecha de última visualización o null si nunca se ha visto
 */
export function getLastViewedAt(postId: string): string | null {
  const records = getPostViewsRecord();
  return records[postId] || null;
}

/**
 * Obtiene el conjunto de IDs de posts que el usuario ha visto
 * @returns Set con los IDs de posts vistos
 */
export function getViewedPostsSet(): Set<string> {
  const records = getPostViewsRecord();
  return new Set(Object.keys(records));
}