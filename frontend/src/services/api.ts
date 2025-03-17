// Base URL para API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.futurprive.com/api';

// Función para retornar la URL de la API
const getApiUrl = () => {
  // En desarrollo, sustituir localhost por 127.0.0.1 para evitar problemas con IPv6
  // En producción, usar la URL tal cual
  if (API_URL.includes('localhost')) {
    return API_URL.replace('localhost', '127.0.0.1');
  }
  return API_URL;
};

// Función para manejar errores
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Ocurrió un error en la comunicación con el servidor'
    }));
    throw new Error(error.message || 'Ocurrió un error en el servidor');
  }
  
  try {
    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Error parsing JSON response:', e);
    return {};
  }
};

// Función para agregar token de autenticación si existe
const getHeaders = (includeContentType = true) => {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }

  // Si hay token de autenticación, lo agregamos
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// API general con funciones para peticiones HTTP
export const api = {
  get: async (endpoint: string) => {
    const response = await fetch(`${getApiUrl()}/${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  post: async <T>(endpoint: string, data: T) => {
    const response = await fetch(`${getApiUrl()}/${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  put: async <T>(endpoint: string, data: T) => {
    const response = await fetch(`${getApiUrl()}/${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  patch: async <T>(endpoint: string, data: T) => {
    const response = await fetch(`${getApiUrl()}/${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (endpoint: string) => {
    const response = await fetch(`${getApiUrl()}/${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  upload: async (endpoint: string, formData: FormData) => {
    // Obtenemos solo los headers de autenticación y aceptación sin Content-Type
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    // Añadir token de autenticación
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // Hacer la solicitud
    const response = await fetch(`${getApiUrl()}/${endpoint}`, {
      method: 'POST',
      headers, // No incluir Content-Type para que el navegador maneje el boundary
      body: formData,
    });
    
    return handleResponse(response);
  },
};

export default api;
