/**
 * Formatea una fecha de publicación para mostrar solo el día
 * @param dateString - String de fecha ISO, timestamp Unix, o formato Django
 * @returns String formateado como "Mar 15"
 */
export function formatPostDate(dateString: string): string {
  // Si la fecha está vacía, retornar una cadena vacía
  if (!dateString) return '';
  
  try {
    // Parsear la fecha utilizando la función existente
    const date = parseDjangoTimestamp(dateString);
    
    // Si la fecha es inválida, mostrar el string original
    if (isNaN(date.getTime())) {
      console.error('Invalid date format for post date:', dateString);
      return dateString;
    }
    
    // Verificar si la fecha es de hoy
    const today = new Date();
    if (date.getDate() === today.getDate() && 
        date.getMonth() === today.getMonth() && 
        date.getFullYear() === today.getFullYear()) {
      return 'Hoy';
    }
    
    // Verificar si la fecha es de ayer
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.getDate() === yesterday.getDate() && 
        date.getMonth() === yesterday.getMonth() && 
        date.getFullYear() === yesterday.getFullYear()) {
      return 'Ayer';
    }
    
    // Formatear solo el día y mes
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    
    return `${month} ${day}`;
  } catch (error) {
    console.error('Error formatting post date:', error);
    return dateString;
  }
}

/**
 * Formatea una fecha en formato relativo (hace X minutos, horas, días, etc.)
 * @param dateString - String de fecha ISO, timestamp Unix, o formato Django
 * @returns String formateado como "hace Xm", "hace Xh", "hace Xd"
 */
export function formatRelativeTime(dateString: string): string {
  // Si la fecha está vacía, retornar una cadena vacía
  if (!dateString) return '';

  // Detectar si es nuestro texto "ahora mismo" (caso especial para actualizaciones optimistas)
  if (dateString === 'ahora mismo') {
    return dateString;
  }

  // Intentar parsear la fecha en diferentes formatos
  let date: Date;
  
  // Comprobar si es un formato como "2023-03-14T20:11:49.108032Z"
  if (dateString.includes('T') && dateString.includes('Z')) {
    date = new Date(dateString);
  } 
  // Comprobar si es un formato como "2023-03-14 20:11:49.108032"
  else if (dateString.includes('-') && dateString.includes(':')) {
    date = new Date(dateString.replace(' ', 'T') + 'Z');
  }
  // Si no coincide con ninguno, intentar parsearlo directamente
  else {
    date = new Date(dateString);
  }
  
  // Si la fecha es inválida, mostrar el string original pero no generar error en consola
  if (isNaN(date.getTime())) {
    return dateString;
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Menos de un minuto
  if (diffInSeconds < 60) {
    return 'ahora mismo';
  }
  
  // Menos de una hora
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `hace ${minutes}m`;
  }
  
  // Menos de un día
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `hace ${hours}h`;
  }
  
  // Menos de una semana
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `hace ${days}d`;
  }
  
  // Menos de un mes (aproximadamente)
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `hace ${weeks}sem`;
  }
  
  // Más de un mes
  const months = Math.floor(diffInSeconds / 2592000);
  return `hace ${months}mes`;
}

/**
 * Analiza una timestamp en varios formatos posibles
 * Ejemplo: "2025-03-14T20:11:49.108032Z" o "2025-03-14 20:11:49.108032" o timestamp unix
 * @param timestamp - String con el timestamp en diferentes formatos
 * @returns Date objeto
 */
export function parseDjangoTimestamp(timestamp: string): Date {
  // Si está vacío, devolver fecha actual
  if (!timestamp) return new Date();
  
  let parsedDate: Date;
  
  // Comprobar si es un timestamp Unix (números solamente)
  if (/^\d+$/.test(timestamp)) {
    // Determinar si es en segundos (10 dígitos) o milisegundos (13 dígitos)
    const factor = timestamp.length === 10 ? 1000 : 1;
    parsedDate = new Date(parseInt(timestamp) * factor);
  }
  // Si ya tiene el formato ISO completo (con T y Z)
  else if (timestamp.includes('T') && timestamp.includes('Z')) {
    parsedDate = new Date(timestamp);
  }
  // Si tiene el formato ISO sin Z
  else if (timestamp.includes('T') && !timestamp.includes('Z')) {
    parsedDate = new Date(timestamp + 'Z');
  }
  // Si tiene el formato Django con espacio en lugar de T
  else if (timestamp.includes('-') && timestamp.includes(':') && timestamp.includes(' ')) {
    parsedDate = new Date(timestamp.replace(' ', 'T') + 'Z');
  }
  // Intentar parsear directamente como último recurso
  else {
    parsedDate = new Date(timestamp);
  }
  
  // Si la fecha es inválida, registrar el error
  if (isNaN(parsedDate.getTime())) {
    console.error('Failed to parse date:', timestamp);
  }
  
  return parsedDate;
}

/**
 * Comprueba si un usuario ha visto un comentario basado en la fecha de visualización
 * @param lastViewedDate - Última fecha en que el usuario vio el post
 * @param commentDate - Fecha del comentario
 * @returns true si el comentario es más reciente que la última visualización
 */
export function isNewComment(lastViewedDate: string | null, commentDate: string): boolean {
  if (!lastViewedDate) return true;
  
  const lastViewed = new Date(lastViewedDate);
  const comment = parseDjangoTimestamp(commentDate);
  
  // Si alguna de las fechas es inválida, considerarlo como nuevo
  if (isNaN(lastViewed.getTime()) || isNaN(comment.getTime())) {
    console.error('Invalid date comparison:', { lastViewedDate, commentDate });
    return true;
  }
  
  return comment > lastViewed;
}