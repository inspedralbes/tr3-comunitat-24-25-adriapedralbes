import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
) {
  try {
    // Obtener el token de la URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const token = pathParts[pathParts.length - 1];
    
    // Redireccionar a la página visual del frontend
    return NextResponse.redirect(new URL(`/newsletter/confirm/${token}`, url.origin));
  } catch (error) {
    console.error('Error al procesar la redirección:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
