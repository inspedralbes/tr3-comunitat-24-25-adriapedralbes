import { existsSync } from 'fs';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

// Función para generar un ID único basado en timestamp y random
const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Verificar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipo de archivo no válido. Solo se permiten: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Crear nombre de archivo único
    const uniqueId = generateUniqueId();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uniqueId}.${fileExtension}`;
    
    // Determinar subpath basado en el tipo de imagen
    let subPath = 'media';
    const type = formData.get('type') as string;
    if (type === 'avatar') {
      subPath = 'media/avatars';
    } else if (type === 'post') {
      subPath = 'media/posts';
    }
    
    // Ruta completa al directorio de carga
    const uploadDir = path.join(process.cwd(), 'public', subPath);
    
    // Crear el directorio si no existe
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // Convertir el archivo a buffer y guardarlo
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, fileName), buffer);

    // Devolver la URL relativa para acceder al archivo
    const imageUrl = `/${subPath}/${fileName}`;
    
    return NextResponse.json({ 
      success: true, 
      url: imageUrl,
      message: 'Archivo subido correctamente'
    });
  } catch (error) {
    console.error('Error al procesar la subida de imagen:', error);
    return NextResponse.json(
      { error: 'Error al procesar la subida de imagen', details: String(error) },
      { status: 500 }
    );
  }
}