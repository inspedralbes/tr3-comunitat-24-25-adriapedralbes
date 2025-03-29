/**
 * Servicio para gestionar la subida de imágenes al sistema de archivos local de Next.js
 */

// Tipos de imágenes aceptados
export type ImageType = 'avatar' | 'post' | 'media';

/**
 * Sube una imagen al sistema de archivos de Next.js
 * @param file Archivo a subir
 * @param type Tipo de imagen (avatar, post, etc.)
 * @returns URL de la imagen subida
 */
export const uploadImage = async (file: File, type: ImageType = 'media'): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    console.log(`Subiendo imagen tipo ${type}: ${file.name} (${file.size} bytes)`);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al subir la imagen');
    }

    const data = await response.json();
    console.log('Imagen subida correctamente:', data.url);
    return data.url;
  } catch (error) {
    console.error('Error en la subida de imagen:', error);
    throw error;
  }
};

const imageUploadService = {
  uploadImage
};

export default imageUploadService;