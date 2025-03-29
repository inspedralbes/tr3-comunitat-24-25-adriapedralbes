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
    // En producción, asegurarnos de usar la URL completa con el dominio
    if (typeof window !== 'undefined') {
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isDevelopment) {
        // Para URLs en producción, usar futurprive.com como dominio
        return `https://futurprive.com${avatarUrl}`;
      }
    }
    return avatarUrl;
  }
  
  // En otros casos, asumimos que es una URL relativa al backend de Django
  if (typeof window !== 'undefined') {
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDevelopment) {
      return `http://127.0.0.1:8000${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
    } else {
      return `https://api.futurprive.com${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
    }
  }
  
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
