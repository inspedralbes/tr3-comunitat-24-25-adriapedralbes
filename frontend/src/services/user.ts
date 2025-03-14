import { api } from './api';

// Tipos para el servicio
export interface User {
  id?: string | number;  // ID puede ser string, número o no existir
  username: string;
  avatar_url?: string;
  level?: number;
  points?: number;
  bio?: string;
  location?: string;
  date_joined?: string;  // Fecha estándar de Django AbstractUser
  created_at?: string;   // Fecha personalizada definida en model User
  joined_at?: string;    // Alias alternativo para compatibilidad
  is_online?: boolean;
  last_active?: string;
  is_admin?: boolean;
  is_superuser?: boolean;
  is_staff?: boolean;
  position?: number;
}

// Servicio para interactuar con la API de usuarios
export const userService = {
  // Obtener todos los usuarios
  getAllUsers: async (page = 1, search = '') => {
    let endpoint = `users/?page=${page}`;
    
    // Añadir búsqueda si está especificada
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`;
    }
    
    return api.get(endpoint);
  },

  // Obtener un usuario específico por ID
  getUserById: async (id: string) => {
    return api.get(`users/${id}/`);
  },
  
  // Obtener el leaderboard (usuarios principales)
  getLeaderboard: async () => {
    return api.get('leaderboard/');
  },
  
  // Obtener los posts de un usuario
  getUserPosts: async (userId: string) => {
    return api.get(`users/${userId}/posts/`);
  },
  
  // Obtener la actividad de un usuario
  getUserActivity: async (userId: string) => {
    return api.get(`users/${userId}/activity/`);
  },
  
  // Obtener los usuarios administradores
  getAdmins: async () => {
    // Obtenemos todos los usuarios y filtramos por rol de admin (is_staff en Django)
    const users = await api.get('users/');
    return users.filter((user: User) => user.is_admin);
  },
  
  // Obtener los usuarios en línea
  getOnlineUsers: async () => {
    // Obtenemos todos los usuarios y filtramos por estado online
    const users = await api.get('users/');
    return users.filter((user: User) => user.is_online);
  }
};

export default userService;