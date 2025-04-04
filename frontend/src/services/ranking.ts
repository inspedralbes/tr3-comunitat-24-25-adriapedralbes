import { api } from './api';
import { User } from './user';

// Interfaz para los datos de usuario del leaderboard
export interface LeaderboardUserResponse extends User {
  position: number;
  points: number;
  avatar_url?: string;
  username: string;
}

// Interfaz para el formato que necesita el componente de frontend
export interface LeaderboardUserFormatted {
  position: number;
  username: string;
  avatarUrl: string | null;
  points: number;
  level: number;
}

// Función para transformar la respuesta de la API al formato del componente
const formatLeaderboardUsers = (users: LeaderboardUserResponse[]): LeaderboardUserFormatted[] => {
  return users.map(user => {
    // Función para determinar la URL del avatar
    // Permitir URLs relativas o absolutas para avatares
    let avatarUrl = user.avatar_url || null;
    
    return {
      position: user.position || 0,
      username: user.username,
      avatarUrl: avatarUrl,  // Permitir que sea null para el componente UserAvatar
      points: user.points || 0,
      level: user.level || 1
    };
  });
};

// Interfaz para la distribución de niveles
export interface LevelDistribution {
  level: number;
  title: string;
  count: number;
  percentage: number;
  badge_color: string;
  icon: string | null;
}

// Servicio para interactuar con la API de ranking/leaderboard
export const rankingService = {
  // Obtener el leaderboard general
  getLeaderboard: async (period: 'all' | 'month' | 'week' = 'all'): Promise<LeaderboardUserFormatted[]> => {
    const response = await api.get(`leaderboard/?period=${period}`);
    return formatLeaderboardUsers(response);
  },
  
  // Obtener el leaderboard de todos los tiempos
  getAllTimeLeaderboard: async (): Promise<LeaderboardUserFormatted[]> => {
    const response = await api.get('leaderboard/?period=all');
    return formatLeaderboardUsers(response);
  },
  
  // Obtener el leaderboard del último mes
  getMonthlyLeaderboard: async (): Promise<LeaderboardUserFormatted[]> => {
    const response = await api.get('leaderboard/?period=month');
    return formatLeaderboardUsers(response);
  },
  
  // Obtener el leaderboard de la última semana
  getWeeklyLeaderboard: async (): Promise<LeaderboardUserFormatted[]> => {
    const response = await api.get('leaderboard/?period=week');
    return formatLeaderboardUsers(response);
  },
  
  // Obtener el perfil del usuario actual con su nivel
  getCurrentUserProfile: async (): Promise<{
    username: string,
    level: number,
    avatarUrl: string,
    pointsToNextLevel: number
  }> => {
    try {
      const response = await api.get('auth/me/');
      // Usar directamente la URL del avatar
      const avatarUrl = response.avatar_url || null;

      return {
        username: response.username,
        level: response.level || 1,
        avatarUrl: avatarUrl,  // Permitir que sea null para el componente UserAvatar
        // Suponemos que necesita 10 puntos por nivel, pero esto debería venir del backend
        pointsToNextLevel: 10 - (response.points % 10)
      };
    } catch (error) {
      console.error('Error obteniendo perfil de usuario:', error);
      // Devolver valores por defecto en caso de error
      return {
        username: 'Usuario',
        level: 1,
        avatarUrl: '', // Valor predeterminado como string vacío si es null
        pointsToNextLevel: 10
      };
    }
  },
  
  // Obtener la distribución de usuarios por nivel
  getLevelDistribution: async (): Promise<LevelDistribution[]> => {
    const response = await api.get('gamification/level-distribution/');
    return response; 
  }
};

export default rankingService;