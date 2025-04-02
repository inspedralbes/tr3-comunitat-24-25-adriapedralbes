"""
Versión simplificada de las vistas de newsletter para depuración.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
import uuid
import logging

from .models import Subscriber
from .serializers import SubscriberSerializer

logger = logging.getLogger(__name__)

@api_view(['POST', 'OPTIONS'])
@permission_classes([AllowAny])
def subscribe(request):
    """
    API endpoint simplificado para suscribirse a la newsletter.
    """
    # Manejar preflight OPTIONS
    if request.method == 'OPTIONS':
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response["Access-Control-Max-Age"] = "86400"
        return response
    
    # Registrar información de depuración
    print(f"\n[DEBUG] Recibida solicitud: {request.method}")
    print(f"[DEBUG] Origin: {request.META.get('HTTP_ORIGIN')}")
    print(f"[DEBUG] Datos: {request.data if hasattr(request, 'data') else 'No data'}")
    
    # Validar datos
    serializer = SubscriberSerializer(data=request.data)
    
    if serializer.is_valid():
        email = serializer.validated_data['email']
        name = serializer.validated_data.get('name', '')
        
        # Verificar si ya existe el email
        try:
            subscriber = Subscriber.objects.get(email=email)
            
            if subscriber.confirmed:
                return Response({
                    'success': False,
                    'message': 'Este correo ya está suscrito a nuestra newsletter.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Si existe pero no está confirmado, actualizamos el nombre
            if name and name != subscriber.name:
                subscriber.name = name
                subscriber.save(update_fields=['name'])
                
        except Subscriber.DoesNotExist:
            # Crear nuevo suscriptor
            subscriber = Subscriber(
                email=email,
                name=name,
                confirmed=False,
                confirmation_token=str(uuid.uuid4())
            )
            subscriber.save()
        
        # Responder exitosamente (sin enviar correo ni sincronizar con Beehiiv por ahora)
        response = Response({
            'success': True,
            'message': 'Suscripción recibida correctamente.',
            'debug': f"Email: {email}, Name: {name}"
        }, status=status.HTTP_201_CREATED)
        
        # Agregar encabezados CORS manualmente
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        
        return response
    
    # Manejar errores de validación
    response = Response({
        'success': False,
        'message': 'Los datos proporcionados no son válidos.',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)
    
    # Agregar encabezados CORS manualmente
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    
    return response


@api_view(['GET'])
@permission_classes([AllowAny])
def confirm_subscription(request, token):
    """
    API endpoint simplificado para confirmar la suscripción.
    """
    try:
        subscriber = Subscriber.objects.get(confirmation_token=token)
        
        if not subscriber.confirmed:
            subscriber.confirmed = True
            subscriber.save(update_fields=['confirmed'])
            
            response = Response({
                'success': True,
                'message': '¡Gracias! Tu suscripción ha sido confirmada con éxito.'
            })
        else:
            response = Response({
                'success': True,
                'message': 'Tu suscripción ya ha sido confirmada anteriormente.'
            })
    except Subscriber.DoesNotExist:
        response = Response({
            'success': False,
            'message': 'El token de confirmación no es válido.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Agregar encabezados CORS manualmente
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    
    return response


@api_view(['GET', 'POST', 'OPTIONS'])
@permission_classes([AllowAny])
def unsubscribe(request, token):
    """
    API endpoint simplificado para cancelar la suscripción.
    """
    # Manejar preflight OPTIONS
    if request.method == 'OPTIONS':
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response["Access-Control-Max-Age"] = "86400"
        return response
    
    try:
        subscriber = Subscriber.objects.get(confirmation_token=token)
        email = subscriber.email
        subscriber.delete()
        
        response = Response({
            'success': True,
            'message': f'El correo {email} ha sido eliminado de nuestra lista.'
        })
    except Subscriber.DoesNotExist:
        response = Response({
            'success': False,
            'message': 'El token de cancelación no es válido.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Agregar encabezados CORS manualmente
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    
    return response
