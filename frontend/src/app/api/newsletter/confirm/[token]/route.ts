import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
) {
  try {
    // Obtener el token de la URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const token = pathParts[pathParts.length - 1];
    
    // Ya que no tenemos una página de confirmación, simplemente redirigimos a la página principal
    // Aquí se podría añadir la lógica para guardar en la base de datos si fuera necesario
    
    // Redireccionar a la página principal
    return NextResponse.redirect(new URL('/?subscribed=true', url.origin));
  } catch (error) {
    console.error('Error al procesar la redirección:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
