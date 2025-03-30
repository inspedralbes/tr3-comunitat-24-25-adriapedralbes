from django.http import HttpResponse
from django.urls import reverse

# Middleware simplificado sin Socket.io
class SocketIOMiddleware:
    """
    Versión simulada del middleware de Socket.IO
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Para todas las solicitudes, simplemente continuar con el flujo normal
        return self.get_response(request)

# Middleware para verificar acceso a áreas premium (con bypass para desarrollo)
class PremiumAccessMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        
        # Rutas que requieren verificación de suscripción premium
        self.premium_paths = [
            '/api/leaderboard/',
            '/api/courses/',
            '/api/lessons/',
            '/api/events/',
        ]
        
        # Excluir algunas rutas específicas (como la API pública)
        self.excluded_paths = [
            '/api/auth/',
            '/admin/',
            '/api/subscribe/',
            '/api/confirm/',
            '/api/unsubscribe/',
        ]

    def __call__(self, request):
        # Verificar si el path actual requiere suscripción premium
        requires_premium = False
        
        # Excluir rutas específicas
        for excluded in self.excluded_paths:
            if request.path.startswith(excluded):
                requires_premium = False
                break
                
        # Verificar rutas premium
        for premium_path in self.premium_paths:
            if request.path.startswith(premium_path):
                requires_premium = True
                break
                
        if requires_premium and request.user.is_authenticated:
            # En producción, aquí verificaríamos si el usuario tiene suscripción activa
            # Por ahora, solo para desarrollo, permitimos acceso a todos los usuarios autenticados
            pass
        
        response = self.get_response(request)
        return response
