class CorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Manejar solicitudes OPTIONS de preflight directamente
        if request.method == "OPTIONS":
            response = self.handle_preflight(request)
            return response
            
        response = self.get_response(request)
        # Siempre permitir todas las solicitudes CORS
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept"
        response["Access-Control-Max-Age"] = "86400"
        return response
        
    def handle_preflight(self, request):
        # Crear una respuesta directa para solicitudes preflight OPTIONS
        from django.http import HttpResponse
        response = HttpResponse()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept"
        response["Access-Control-Max-Age"] = "86400"
        return response