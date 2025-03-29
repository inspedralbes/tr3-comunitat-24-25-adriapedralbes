from functools import wraps
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def premium_required(view_func):
    """
    Decorador para vistas individuales que requieren una suscripción premium.
    Se puede usar en vistas específicas para agregar una capa adicional de protección.
    
    Ejemplo de uso:
    
    @premium_required
    @api_view(['GET'])
    def protected_view(request):
        # Código de la vista protegida
        return Response(...)
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        user = request.user
        
        # Si el usuario no está autenticado, denegar acceso
        if not user.is_authenticated:
            return Response(
                {'error': 'Autenticación requerida para acceder a este recurso'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Si el usuario es superusuario o staff, permitir acceso
        if user.is_superuser or user.is_staff:
            return view_func(request, *args, **kwargs)
        
        # Verificar si el usuario tiene una suscripción activa
        if hasattr(user, 'has_active_subscription') and user.has_active_subscription:
            return view_func(request, *args, **kwargs)
        
        # Usuario sin suscripción premium, denegar acceso
        logger.info(f"Acceso premium denegado para {user.username} en vista {view_func.__name__}")
        return Response(
            {
                'error': 'Se requiere una suscripción premium para acceder a este contenido',
                'authenticated': True,
                'is_premium': False,
                'redirect_to': '/perfil'
            },
            status=status.HTTP_403_FORBIDDEN
        )
    
    return _wrapped_view
