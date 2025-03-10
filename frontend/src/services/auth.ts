import { api } from './api';

// Interfaces para autenticación
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
  level: number;
  points: number;
  website: string | null;
  position: number | null;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

// Servicio para autenticación de usuarios
export const authService = {
  // Login 
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const response = await api.post('token/', credentials);
    
    // Guardar tokens en localStorage
    if (response && response.access) {
      localStorage.setItem('auth_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
    }
    
    return response;
  },
  
  // Registro de usuario
  register: async (userData: RegisterData): Promise<UserProfile> => {
    return api.post('auth/register/', userData);
  },
  
  // Obtener perfil del usuario actual
  getProfile: async (): Promise<UserProfile> => {
    return api.get('auth/me/');
  },
  
  // Actualizar perfil del usuario
  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    return api.patch('auth/me/', data);
  },
  
  // Actualizar avatar del usuario
  updateAvatar: async (file: File): Promise<UserProfile> => {
    const formData = new FormData();
    formData.append('avatar_url', file);
    return api.upload('auth/me/avatar/', formData);
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  },
  
  // Verificar si el usuario está autenticado
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  },
  
  // Refrescar token
  refreshToken: async (): Promise<TokenResponse> => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No hay token de refresco disponible');
    }
    
    const response = await api.post('token/refresh/', { refresh: refreshToken });
    
    if (response && response.access) {
      localStorage.setItem('auth_token', response.access);
    }
    
    return response;
  }
};

export default authService;