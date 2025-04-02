import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
) {
  try {
    // Obtener el token de la URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const token = pathParts[pathParts.length - 1];
    
    // Redireccionar a la página visual del frontend (si existiera)
    // Si no existe aún, crearíamos una página similar a /newsletter/confirm/[token]/page.tsx
    // Por ahora, procesamos la baja directamente:
    
    // Usar una URL consistente para el backend independientemente de si estamos en desarrollo o producción
    const backendUrlBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    
    const response = await fetch(
      `${backendUrlBase}/newsletter/unsubscribe/${token}/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    const success = response.ok;
    const message = data.message || (success ? 'Te has dado de baja correctamente' : 'Error al procesar la baja');
    
    const BASE_URL = url.origin; // Obtiene la URL base actual
    
    // Generar HTML para mostrar el resultado
    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${success ? 'Baja procesada' : 'Error al procesar la baja'}</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <link rel="icon" href="${BASE_URL}/favicon.ico" type="image/x-icon">
      <style>
        body {
          background-color: #000;
          color: white;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      </style>
    </head>
    <body class="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div class="max-w-lg w-full bg-gray-900 p-8 rounded-xl border border-gray-800">
        <div class="text-center">
          ${success ? `
            <div class="inline-flex h-16 w-16 rounded-full bg-blue-500/20 items-center justify-center mb-4">
              <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 class="text-2xl font-bold mb-4">Baja procesada correctamente</h1>
            <p class="mb-6">${message}</p>
            <p class="text-gray-400 mb-8">
              Sentimos que te vayas. Si cambias de opinión, siempre puedes volver a suscribirte.<br/>
              Pasa un gran día,<br />
              Adrià Estévez
            </p>
          ` : `
            <div class="inline-flex h-16 w-16 rounded-full bg-red-500/20 items-center justify-center mb-4">
              <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h1 class="text-2xl font-bold mb-4">Error al procesar la baja</h1>
            <p class="text-lg text-red-400 font-medium mb-6">${message}</p>
          `}
          <a href="${BASE_URL}/" class="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
            Volver al inicio
          </a>
        </div>
      </div>
    </body>
    </html>
    `;
    
    // Devolver la respuesta HTML
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
    
  } catch (error) {
    console.error('Error al procesar la baja:', error);
    
    // Redireccionar a la página de inicio en caso de error
    return NextResponse.redirect(new URL('/', request.url));
  }
}
