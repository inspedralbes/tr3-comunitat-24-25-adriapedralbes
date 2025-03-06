from django.shortcuts import render

# Create your views here.
# views.py en la carpeta config (donde está settings.py)
from django.http import HttpResponse, JsonResponse

def index_view(request):
    """
    Vista para la página principal de la API.
    """
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>API de FuturPrivé</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                color: #333;
            }
            h1 {
                color: #2c3e50;
                border-bottom: 2px solid #3498db;
                padding-bottom: 10px;
            }
            .endpoint {
                background-color: #f8f9fa;
                border-left: 4px solid #3498db;
                padding: 10px 15px;
                margin-bottom: 10px;
            }
            code {
                background-color: #f1f1f1;
                padding: 2px 5px;
                border-radius: 3px;
                font-family: monospace;
            }
            .footer {
                margin-top: 40px;
                border-top: 1px solid #eee;
                padding-top: 10px;
                font-size: 0.9em;
                color: #777;
            }
        </style>
    </head>
    <body>
        <h1>API de FuturPrivé</h1>
        <p>Bienvenido a la API de FuturPrivé. Este es el punto de entrada para los servicios backend.</p>
        
        <h2>Documentación de la API</h2>
        <p>Aquí encontrarás una lista de los endpoints disponibles:</p>
        
        <div class="endpoint">
            <h3>Estado del servidor</h3>
            <p><code>GET /health/</code> - Verifica el estado del servidor API</p>
        </div>
        
        <div class="endpoint">
            <h3>Página de prueba</h3>
            <p><code>GET /test/</code> - Muestra una página HTML de prueba simple</p>
        </div>
        
        <div class="footer">
            <p>© 2025 FuturPrivé. Todos los derechos reservados.</p>
        </div>
    </body>
    </html>
    """
    return HttpResponse(html_content)

def health_check(request):
    """
    Vista para verificar el estado del servidor.
    """
    return JsonResponse({
        "status": "ok", 
        "message": "Django API is running",
        "version": "1.0.0"
    })

def test_view(request):
    """
    Vista de prueba simple.
    """
    return HttpResponse("<html><body><h1>Django API is working!</h1><p>If you can see this message, the API server is configured correctly.</p></body></html>")
