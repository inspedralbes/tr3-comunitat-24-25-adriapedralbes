// Base URL para API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.futurprive.com';

// Función para retornar la URL de la API
const getApiUrl = () => {
  // Sustituir localhost por 127.0.0.1 para evitar problemas con IPv6
  return API_URL.replace('localhost', '127.0.0.1');
};

// Función para construir la URL completa del endpoint
const buildEndpointUrl = (endpoint: string, ensureTrailingSlash = false) => {
  // Asegurarse de que endpoint no empieza con barra
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

  // Añadir barra final si se requiere y no existe
  let finalEndpoint = cleanEndpoint;
  if (ensureTrailingSlash && !finalEndpoint.endsWith('/')) {
    finalEndpoint += '/';
  }

  return `${getApiUrl()}/${finalEndpoint}`;
};

// Función para manejar errores
const handleResponse = async (response: Response) => {
  // Log reducido solo para errores que no sean 404
  if (!response.ok && response.status !== 404) {
    console.log(`API Response: ${response.status} ${response.statusText} from ${response.url}`);
  }

  if (!response.ok) {
    // Para errores 404, simplemente devolvemos un objeto/array vacío sin registrar errores ruidosos
    if (response.status === 404) {
      console.log(`Endpoint no implementado: ${response.url}`);
      return response.url.includes('progress') ? [] : {};
    }

    let errorMessage = `Error ${response.status}: ${response.statusText}`;

    try {
      // Intentar obtener el error como JSON
      const errorData = await response.json().catch(() => null);

      if (errorData) {
        console.error('API Error Response:', errorData);

        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'object') {
          // Intentar obtener cualquier mensaje de error
          const errorKeys = Object.keys(errorData);
          if (errorKeys.length > 0) {
            const firstError = errorData[errorKeys[0]];
            if (Array.isArray(firstError) && firstError.length > 0) {
              errorMessage = `${errorKeys[0]}: ${firstError[0]}`;
            } else if (typeof firstError === 'string') {
              errorMessage = `${errorKeys[0]}: ${firstError}`;
            } else {
              errorMessage = JSON.stringify(errorData);
            }
          }
        }
      } else {
        // Si no es JSON, obtener texto
        const errorText = await response.text().catch(() => '');
        console.error('API Error Response (text):', errorText);
        if (errorText) {
          errorMessage = errorText;
        }
      }
    } catch (e) {
      console.error('Error extrayendo detalle del error:', e);
    }

    throw new Error(errorMessage);
  }

  try {
    // Para respuestas 204 No Content o similares que no tienen cuerpo
    if (response.status === 204) {
      return {};
    }

    const data = await response.json();
    console.log('API Success Response:', data);
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
const buildEndpointUrl = (endpoint: string, ensureTrailingSlash = false) => {
  // Asegurarse de que endpoint no empieza con barra
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

  // Añadir prefijo /api/ si no está presente
  const apiEndpoint = cleanEndpoint.startsWith('api/') ? cleanEndpoint : `api/${cleanEndpoint}`;

  // Asegurarse de que la URL termine con / si se requiere
  // (para evitar redirecciones 301 que convierten POSTs en GETs)
  let finalEndpoint = apiEndpoint;
  if (ensureTrailingSlash && !finalEndpoint.endsWith('/')) {
    finalEndpoint += '/';
  }

  return `${getApiUrl()}/${finalEndpoint}`;
};

// API general con funciones para peticiones HTTP
export const api = {
  get: async (endpoint: string) => {
    const response = await fetch(buildEndpointUrl(endpoint), {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  post: async <T>(endpoint: string, data: T) => {
    // Asegurar que la URL termine con / para evitar redirecciones 301 que convierten POST a GET
    const response = await fetch(buildEndpointUrl(endpoint, true), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  put: async <T>(endpoint: string, data: T) => {
    // Asegurar que la URL termine con / para evitar redirecciones 301
    const response = await fetch(buildEndpointUrl(endpoint, true), {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  patch: async <T>(endpoint: string, data: T) => {
    // Asegurar que la URL termine con / para evitar redirecciones 301
    const response = await fetch(buildEndpointUrl(endpoint, true), {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (endpoint: string) => {
    const response = await fetch(buildEndpointUrl(endpoint), {
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

    // Hacer la solicitud con URL que termina en slash
    const response = await fetch(buildEndpointUrl(endpoint, true), {
      method: 'POST',
      headers, // No incluir Content-Type para que el navegador maneje el boundary
      body: formData,
    });

    return handleResponse(response);
  },
};

export default api;
