import { api } from './api';

// Tipos para el servicio de gamificación
export interface UserProgressionData {
  current_level: number;
  current_points: number;
  next_level?: number;
  next_level_points?: number;
  points_needed?: number;
  progress_percentage?: number;
  max_level_reached?: boolean;
  next_level_info?: {
    title: string;
    description: string;
    badge_color: string;
    icon: string;
  };
}

export interface UserAchievementData {
  id: number;
  name: string;
  description: string;
  icon: string;
  badge_color: string;
  points_reward: number;
  unlocked_at: string;
}

export interface AchievementData {
  id: number;
  name: string;
  description: string;
  achievement_type: string;
  icon: string;
  badge_color: string;
  points_reward: number;
  required_value: number;
  unlocked: boolean;
}

export interface UserLevelData {
  level: number;
  title: string;
  points_required: number;
  badge_color: string;
  icon?: string;
  description: string;
}

// Servicio para interactuar con la API de gamificación
export const gamificationService = {
  // Progresión del usuario
  getUserProgression: async (): Promise<UserProgressionData> => {
    return api.get('gamification/user/progression/');
  },

  // Logros del usuario
  getUserAchievements: async () => {
    return api.get('gamification/user/achievements/');
  },

  // Registrar acceso diario
  registerDailyLogin: async () => {
    return api.post('gamification/user/daily-login/', {});
  },

  // Obtener todos los niveles
  getLevels: async (): Promise<UserLevelData[]> => {
    return api.get('gamification/levels/');
  },

  // Obtener todos los logros
  getAchievements: async (): Promise<AchievementData[]> => {
    return api.get('gamification/achievements/');
  }
};

export default gamificationService;
