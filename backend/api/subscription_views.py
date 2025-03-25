from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def subscription_status(request):
    """
    Devuelve el estado de suscripción del usuario actual
    """
    user = request.user
    
    # Obtener información de suscripción del usuario
    subscription_data = {
        'is_premium': user.is_premium,
        'has_active_subscription': getattr(user, 'has_active_subscription', False),
        'subscription_status': getattr(user, 'subscription_status', None),
        'subscription_id': getattr(user, 'subscription_id', None),
        'subscription_start_date': getattr(user, 'subscription_start_date', None),
        'subscription_end_date': getattr(user, 'subscription_end_date', None),
    }
    
    return Response(subscription_data)
