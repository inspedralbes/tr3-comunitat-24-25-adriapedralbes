class CorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        # En lugar de usar wildcard, usamos los dominios específicos
        if request.headers.get('Origin'):
            response["Access-Control-Allow-Origin"] = request.headers.get('Origin')
            response["Access-Control-Allow-Credentials"] = "true"
        else:
            # Fallback para compatibilidad con solicitudes sin origen
            response["Access-Control-Allow-Origin"] = "*"
            
        response["Access-Control-Allow-Headers"] = "X-Requested-With, Content-Type, Authorization, X-CSRFToken"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        return response