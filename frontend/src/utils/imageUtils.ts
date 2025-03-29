/**
 * Utility functions for handling images in the application
 */

/**
 * Normaliza una URL de avatar para asegurar que sea completa y correcta
 * @param avatarUrl URL del avatar que puede ser relativa o absoluta
 * @returns URL normalizada lista para usar en componentes de imagen
 */
export const normalizeAvatarUrl = (avatarUrl: string | null | undefined): string | null => {
  if (!avatarUrl) return null;
  
  // Si la URL ya es absoluta (comienza con http o https), usarla directamente
  if (avatarUrl.startsWith('http')) {
    return avatarUrl;
  }
  
  // Si la URL es relativa a /media (nuevo sistema), usarla directamente
  if (avatarUrl.startsWith('/media')) {
    return avatarUrl;
  }
  
  // En otros casos, asumimos que es una URL relativa al backend de Django
  return `http://127.0.0.1:8000${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
};

/**
 * Normaliza una URL de imagen para asegurar que sea completa y correcta
 * @param imageUrl URL de la imagen que puede ser relativa o absoluta
 * @returns URL normalizada lista para usar en componentes de imagen
 */
export const normalizeImageUrl = (imageUrl: string | null | undefined): string | null => {
  return normalizeAvatarUrl(imageUrl);
};
