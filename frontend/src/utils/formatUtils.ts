/**
 * Formatea correctamente las URLs de avatar añadiendo URL base si es necesario
 * @param url URL del avatar (puede ser absoluta o relativa)
 * @returns URL formateada o null si no hay URL
 */
export const formatAvatarUrl = (url: string | null): string | null => {
  if (!url) return null;
  
  // Si ya es una URL completa, usarla tal cual
  if (url.startsWith('http')) return url;
  
  // Si es una ruta relativa, añadir la URL base del servidor
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const baseUrl = apiUrl.replace('/api', '');
  
  // Asegurarnos de que la URL tenga el formato correcto
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

/**
 * Formatea una fecha para mostrarla de forma amigable
 * @param dateString Fecha en formato string
 * @returns Fecha formateada
 */
export const formatMessageDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  // Si es hoy, mostrar solo la hora
  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Si es ayer, mostrar "Ayer"
  if (diffDays === 1) {
    return 'Ayer';
  }
  
  // Si es esta semana, mostrar nombre del día
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'long' });
  }
  
  // Si es este año, mostrar día y mes
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  }
  
  // Si es otro año, mostrar fecha completa
  return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
};
