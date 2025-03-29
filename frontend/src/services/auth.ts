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
  avatar_url_external: string | null; // Añadido para compatibilidad con backend
  bio: string | null;
  level: number;
  points: number;
  website: string | null;
  position: number | null;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
  posts_count?: number;
  likes_received?: number;
  comments_count?: number;
  
  // Campos relacionados con permisos
  is_staff?: boolean;
  is_superuser?: boolean;
  
  // Campos adicionales de suscripción
  has_active_subscription: boolean;
  stripe_customer_id: string | null;
  subscription_id: string | null;
  subscription_status: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

// Servicio para autenticación de usuarios
// Event bus para notificar cambios de autenticación
const authEvents = {
  listeners: new Set<() => void>(),
  
  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  },
  
  notify() {
    this.listeners.forEach(callback => callback());
  }
};

export const authService = {
  // Login 
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const response = await api.post('token/', credentials);
    
    // Guardar tokens en localStorage
    if (response && response.access) {
      localStorage.setItem('auth_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      
      // Notificar a los componentes sobre el cambio de estado de autenticación
      authEvents.notify();
    }
    
    return response;
  },
  
  // Registro de usuario
  register: async (userData: RegisterData): Promise<UserProfile> => {
    return api.post('auth/register/', userData);
  },
  

  
  // Obtener perfil del usuario actual
  getProfile: async (): Promise<UserProfile> => {
    try {
      console.log('Obteniendo perfil del usuario...');
      // La respuesta de auth/me/ ya debe incluir los contadores gracias a nuestras modificaciones en el backend
      const profile = await api.get('auth/me/');
      console.log('Perfil obtenido:', profile);
      return profile;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      throw error;
    }
  },
  
  // Actualizar perfil del usuario
  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    return api.patch('auth/me/', data);
  },
  
  // Actualizar avatar del usuario
  updateAvatar: async (file: File): Promise<UserProfile> => {
    // Importar el servicio de subida de imágenes dinámicamente
    // para evitar problemas de dependencia circular
    const { default: imageUploadService } = await import('./imageUpload');
    
    try {
      // Subir la imagen a Next.js
      console.log('Iniciando subida de avatar al servidor local...');
      const imageUrl = await imageUploadService.uploadImage(file, 'avatar');
      console.log('Imagen subida exitosamente. URL obtenida:', imageUrl);
      
      // Actualizar el perfil con la URL de la imagen
      console.log('Enviando URL de avatar al servidor de Django para actualizar perfil...');
      
      // Imprimir datos que estamos enviando a la API
      console.log('Datos enviados a la API:', { avatar_url: imageUrl });
      
      const updatedProfile = await api.patch('auth/me/', { avatar_url: imageUrl });
      console.log('Respuesta de actualización de perfil:', updatedProfile);
      
      // Verificar que la URL se actualizó correctamente
      if (updatedProfile && updatedProfile.avatar_url !== imageUrl) {
        console.warn('La URL del avatar no coincide. Recibida:', updatedProfile.avatar_url, 'Esperada:', imageUrl);
      }
      
      return updatedProfile;
    } catch (error) {
      console.error('Error al actualizar avatar:', error);
      throw error;
    }
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    
    // Notificar a los componentes sobre el cambio de estado de autenticación
    authEvents.notify();
  },
  
  // Suscribirse a cambios de autenticación
  onAuthChange: (callback: () => void) => {
    return authEvents.subscribe(callback);
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