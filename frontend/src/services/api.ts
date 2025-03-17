// Base URL para API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.futurprive.com';

// Función para retornar la URL de la API
const getApiUrl = () => {
  // En desarrollo, sustituir localhost por 127.0.0.1 para evitar problemas con IPv6
  // En producción, usar la URL tal cual
  let baseUrl = API_URL;
  if (baseUrl.includes('localhost')) {
    baseUrl = baseUrl.replace('localhost', '127.0.0.1');
  }
  
  // Asegurarse de que la URL base termina sin /
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  
  return baseUrl;
};

// Función para manejar errores
const handleResponse = async (response: Response) => {
  // Mantener un registro de la respuesta para debugging
  console.log(`[API] Response status: ${response.status} ${response.statusText}`);
  
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    
    try {
      // Intentar extraer mensaje de error del cuerpo de la respuesta
      const errorData = await response.json();
      console.error('[API] Error details:', errorData);
      
      errorMessage = errorData.message || errorData.detail || errorMessage;
    } catch (parseError) {
      // Si no podemos parsear JSON, usar el texto de la respuesta
      try {
        const textError = await response.text();
        if (textError) {
          console.error('[API] Error text:', textError);
          errorMessage = textError.substring(0, 200); // Limitar longitud
        }
      } catch (textError) {
        console.error('[API] Could not extract error details:', textError);
      }
    }
    
    throw new Error(errorMessage);
  }
  
  try {
    // Para respuestas 204 No Content o similares que no tienen cuerpo
    if (response.status === 204) {
      return {};
    }
    
    const data = await response.json();
    return data;
  } catch (e) {
    console.warn('[API] Error parsing response JSON:', e);
    // Si no hay JSON que parsear, devolver objeto vacío
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

// Función para construir la URL completa del endpoint
const buildEndpointUrl = (endpoint: string) => {
  // Asegurarse de que endpoint no empieza con barra
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  // Añadir prefijo /api/ si no está presente
  const apiEndpoint = cleanEndpoint.startsWith('api/') ? cleanEndpoint : `api/${cleanEndpoint}`;
  
  return `${getApiUrl()}/${apiEndpoint}`;
};

// API general con funciones para peticiones HTTP
export const api = {
  get: async (endpoint: string) => {
    const url = buildEndpointUrl(endpoint);
    console.log(`[API] GET request to ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  post: async <T>(endpoint: string, data: T) => {
    const url = buildEndpointUrl(endpoint);
    console.log(`[API] POST request to ${url}`, data);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  put: async <T>(endpoint: string, data: T) => {
    const url = buildEndpointUrl(endpoint);
    console.log(`[API] PUT request to ${url}`, data);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  patch: async <T>(endpoint: string, data: T) => {
    const url = buildEndpointUrl(endpoint);
    console.log(`[API] PATCH request to ${url}`, data);
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (endpoint: string) => {
    const url = buildEndpointUrl(endpoint);
    console.log(`[API] DELETE request to ${url}`);
    
    const response = await fetch(url, {
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
    
    // Hacer la solicitud usando la URL construida correctamente
    const url = buildEndpointUrl(endpoint);
    console.log(`[API] Upload request to ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers, // No incluir Content-Type para que el navegador maneje el boundary
      body: formData,
    });
    
    return handleResponse(response);
  },
};

export default api;
