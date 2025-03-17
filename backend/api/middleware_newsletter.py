"""
Middleware específico para manejar CORS en los endpoints de newsletter.
"""
class NewsletterCorsMiddleware:
    """
    Middleware para asegurar que los endpoints de newsletter siempre
    incluyan los encabezados CORS correctos, incluso cuando ocurren errores.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Solo procesar para rutas de newsletter
        if not request.path.startswith('/api/newsletter/'):
            return self.get_response(request)
            
        # Para solicitudes OPTIONS (preflight), respondemos inmediatamente con los encabezados CORS
        if request.method == 'OPTIONS':
            response = self.get_response(request)
            self.add_cors_headers(response)
            return response
            
        # Para otras solicitudes, procesamos normalmente
        response = self.get_response(request)
        self.add_cors_headers(response)
        return response
        
    def add_cors_headers(self, response):
        """Añade los encabezados CORS necesarios a la respuesta."""
        response["Access-Control-Allow-Origin"] = "https://futurprive.com"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response["Access-Control-Allow-Credentials"] = "true"
        response["Access-Control-Max-Age"] = "86400"  # 24 horas
        return response
