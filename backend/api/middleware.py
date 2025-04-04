import logging
import json
from django.urls import resolve
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from .services import StripeService

# Configurar logging
logger = logging.getLogger(__name__)

class PremiumContentMiddleware(MiddlewareMixin):
    """
    Middleware para verificar si el usuario tiene acceso a contenido premium.
    Comprueba si el usuario tiene una suscripción activa en la base de datos.
    """
    
    # Lista de rutas de API protegidas que requieren suscripción premium
    PREMIUM_ENDPOINTS = [
        # Comunidad
        r'^api/posts',
        r'^api/pinned-posts',
        r'^api/categories',
        r'^api/comments',
        
        # Classroom
        r'^api/courses',
        r'^api/lessons',
        r'^api/user/lessons/progress',
        r'^api/user/courses/progress',
        
        # Calendario
        r'^api/events',
        
        # Miembros
        r'^api/users',
        
        # Ranking
        r'^api/leaderboard',
        r'^api/gamification',
    ]
    
    # Excepciones para endpoints específicos que deberían ser accesibles sin suscripción
    PUBLIC_EXCEPTIONS = [
        r'^api/auth/register',
        r'^api/auth/me',
        r'^api/token',
        r'^api/subscription/status',
        r'^api/subscription/create-checkout-session',
    ]
    
    def is_premium_endpoint(self, path):
        """Determina si la ruta solicitada requiere acceso premium."""
        
        # Primero verificar si la ruta está en las excepciones públicas
        for exception in self.PUBLIC_EXCEPTIONS:
            if exception in path:
                return False
        
        # Luego verificar si está en las rutas premium
        for endpoint in self.PREMIUM_ENDPOINTS:
            if endpoint in path:
                return True
        
        # Por defecto, permitir acceso
        return False
    
    def process_request(self, request):
        """
        Procesa la solicitud entrante y verifica si el usuario tiene acceso premium
        para los endpoints protegidos.
        """
        path = request.path_info
        
        # Si no es un endpoint premium, permitir la solicitud
        if not self.is_premium_endpoint(path):
            return None
        
        # Verificar si el usuario está autenticado
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return JsonResponse({
                'error': 'Autenticación requerida para acceder a este recurso',
                'authenticated': False,
                'is_premium': False
            }, status=401)
        
        user = request.user
        
        # Si el usuario es superusuario o staff, permitir acceso sin más verificaciones
        if user.is_superuser or user.is_staff:
            logger.info(f"Acceso premium garantizado para {user.username} (superuser/staff)")
            return None
        
        # Verificar si el usuario tiene una suscripción activa
        if hasattr(user, 'has_active_subscription') and user.has_active_subscription:
            # Doble verificación con Stripe Service (opcional, puede ser comentado si causa sobrecarga)
            try:
                is_still_active = StripeService.check_subscription_status(user)
                if not is_still_active:
                    logger.warning(f"Suscripción marcada como activa para {user.username} pero Stripe indica que no está activa")
                    # Actualizar el usuario en la base de datos
                    user.has_active_subscription = False
                    user.is_premium = False
                    user.save(update_fields=['has_active_subscription', 'is_premium'])
                    
                    return JsonResponse({
                        'error': 'Tu suscripción premium ha expirado',
                        'authenticated': True,
                        'is_premium': False,
                        'redirect_to': '/perfil'
                    }, status=403)
            except Exception as e:
                # Si hay un error al verificar con Stripe, permitir el acceso temporal
                # para evitar interrupciones por problemas técnicos
                logger.error(f"Error al verificar suscripción con Stripe: {e}")
                # Como el usuario tiene has_active_subscription=True, permitimos el acceso
            
            # Usuario premium verificado, permitir acceso
            return None
        
        # El usuario no tiene suscripción activa, denegar acceso
        logger.info(f"Acceso premium denegado para {user.username} (sin suscripción activa)")
        
        return JsonResponse({
            'error': 'Se requiere una suscripción premium para acceder a este contenido',
            'authenticated': True,
            'is_premium': False,
            'redirect_to': '/perfil'
        }, status=403)
