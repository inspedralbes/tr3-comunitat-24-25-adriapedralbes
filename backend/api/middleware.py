class CorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Generar una respuesta inmediata para solicitudes OPTIONS
        if request.method == "OPTIONS":
            response = self.options_response()
            return response

        # Procesar la solicitud normalmente
        response = self.get_response(request)
        
        # Agregar encabezados CORS
        origin = request.headers.get('Origin', '')
        if origin:
            # Permitir el origen específico de la solicitud
            response['Access-Control-Allow-Origin'] = origin
        else:
            # Si no hay origen, permitir cualquiera
            response['Access-Control-Allow-Origin'] = '*'
            
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept'
        response['Access-Control-Allow-Credentials'] = 'true'
        return response

    def options_response(self):
        """Crear una respuesta para solicitudes OPTIONS"""
        from django.http import HttpResponse
        response = HttpResponse()
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept'
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Max-Age'] = '86400'
        return response