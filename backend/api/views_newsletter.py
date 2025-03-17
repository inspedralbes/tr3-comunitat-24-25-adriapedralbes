"""
Vistas para el manejo de newsletter - Implementación Optimizada
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
from django.core.mail import send_mail
from django.utils.html import strip_tags
import uuid
import json
import logging
import traceback
import time
from threading import Thread

from .models import Subscriber
from .serializers import SubscriberSerializer
from .welcome_email import send_welcome_email
from .beehiiv import add_subscriber_to_beehiiv

logger = logging.getLogger(__name__)

# Constantes de configuración
CORS_ORIGINS = ["https://futurprive.com", "https://www.futurprive.com", "http://localhost:3000"]
DEFAULT_ORIGIN = "https://futurprive.com"

def apply_cors_headers(response, request):
    """Aplica los encabezados CORS necesarios a la respuesta."""
    # Origen dinámico basado en la solicitud
    request_origin = request.META.get('HTTP_ORIGIN')
    if request_origin and request_origin in CORS_ORIGINS:
        response["Access-Control-Allow-Origin"] = request_origin
    else:
        # Fallback al origen principal para producción
        response["Access-Control-Allow-Origin"] = DEFAULT_ORIGIN
        
    response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Origin"
    response["Access-Control-Allow-Credentials"] = "true"
    response["Access-Control-Max-Age"] = "86400"  # 24 horas
    
    # Prevenir caché para evitar problemas de CORS
    response["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    return response

def process_subscription_background(subscriber, request=None, is_confirmation=False):
    """
    Maneja todas las tareas de fondo para una suscripción:
    1. Enviar email cuando corresponda
    2. Registrar o actualizar en Beehiiv
    3. Manejar errores apropiadamente
    
    Args:
        subscriber: El objeto Subscriber a procesar
        request: La solicitud HTTP original (si está disponible)
        is_confirmation: Si es una confirmación de suscripción o nuevo registro
    """
    start_time = time.time()
    
    try:
        # IP para tracking
        ip_address = None
        if request:
            ip_address = request.META.get('REMOTE_ADDR') or request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip()
        
        # Paso 1: Enviar email cuando corresponda
        if not is_confirmation:
            # Para nuevas suscripciones enviamos email de confirmación
            try:
                send_confirmation_email(subscriber)
                logger.info(f"Email de confirmación enviado a {subscriber.email}")
            except Exception as e:
                logger.error(f"Error enviando email de confirmación a {subscriber.email}: {str(e)}")
                logger.error(traceback.format_exc())
        else:
            # Para confirmaciones enviamos email de bienvenida
            try:
                send_welcome_email(subscriber)
                logger.info(f"Email de bienvenida enviado a {subscriber.email}")
            except Exception as e:
                logger.error(f"Error enviando email de bienvenida a {subscriber.email}: {str(e)}")
                logger.error(traceback.format_exc())
        
        # Paso 2: Registrar o actualizar en Beehiiv
        # Definir el origen adecuado según el tipo de operación
        if is_confirmation:
            source = "FuturPrive Newsletter - Email Confirmed"
        else:
            source = "FuturPrive Website - Newsletter Form"
        
        # Enviar a Beehiiv con reintentos configurados
        try:
            logger.info(f"Enviando a Beehiiv: {subscriber.email} (Confirmado: {is_confirmation or subscriber.confirmed})")
            
            success, message = add_subscriber_to_beehiiv(
                email=subscriber.email,
                name=subscriber.name,
                source=source,
                is_confirmed=is_confirmation or subscriber.confirmed,  # Usar el estado actual
                ip_address=ip_address,
                max_retries=3  # Más reintentos para asegurar el registro
            )
            
            if success:
                logger.info(f"Beehiiv: Éxito registrando a {subscriber.email}")
            else:
                logger.error(f"Beehiiv: Error registrando a {subscriber.email} - {message}")
                
        except Exception as e:
            logger.error(f"Beehiiv: Excepción al registrar a {subscriber.email} - {str(e)}")
            logger.error(traceback.format_exc())
    
    except Exception as e:
        # Capturar cualquier error en el hilo de fondo
        logger.error(f"Error en proceso de fondo para suscriptor {subscriber.email}: {str(e)}")
        logger.error(traceback.format_exc())
    
    finally:
        # Registrar tiempo total de procesamiento
        elapsed = time.time() - start_time
        logger.info(f"Procesamiento de suscriptor {subscriber.email} completado en {elapsed:.2f} segundos")

@api_view(['POST', 'OPTIONS'])
@permission_classes([AllowAny])
def subscribe(request):
    """
    API endpoint para suscribirse a la newsletter.
    Implementación optimizada que responde inmediatamente y procesa en segundo plano.
    """
    # Manejar preflight request
    if request.method == 'OPTIONS':
        response = Response()
        return apply_cors_headers(response, request)
        
    logger.info(f"Solicitud de suscripción: {request.method} desde {request.META.get('HTTP_ORIGIN')}")
    logger.debug(f"Datos: {request.data if hasattr(request, 'data') else 'No data'}")
        
    serializer = SubscriberSerializer(data=request.data)
    
    if serializer.is_valid():
        email = serializer.validated_data['email']
        name = serializer.validated_data.get('name', '')
        
        # Verificar si ya existe el email
        try:
            subscriber = Subscriber.objects.get(email=email)
            
            if subscriber.confirmed:
                response = Response({
                    'success': False,
                    'message': 'Este correo ya está suscrito a nuestra newsletter.'
                }, status=status.HTTP_400_BAD_REQUEST)
                return apply_cors_headers(response, request)
            
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
            logger.info(f"Nuevo suscriptor creado: {email}")
        
        # CAMBIO CLAVE: Responder inmediatamente para evitar timeout
        response = Response({
            'success': True,
            'message': 'Te hemos enviado un correo para confirmar tu suscripción.'
        }, status=status.HTTP_201_CREATED)
        response = apply_cors_headers(response, request)
        
        # Iniciar todo el procesamiento en segundo plano
        thread = Thread(target=process_subscription_background, args=(subscriber, request, False))
        thread.daemon = True
        thread.start()
        
        return response
    
    # Si la validación falla
    response = Response({
        'success': False,
        'message': 'Los datos proporcionados no son válidos.',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)
    
    return apply_cors_headers(response, request)


@api_view(['GET'])
@permission_classes([AllowAny])
def confirm_subscription(request, token):
    """
    API endpoint para confirmar la suscripción.
    Implementación optimizada para responder rápidamente.
    """
    try:
        subscriber = Subscriber.objects.get(confirmation_token=token)
        
        if not subscriber.confirmed:
            logger.info(f"Confirmando suscripción para: {subscriber.email}")
            subscriber.confirmed = True
            subscriber.save(update_fields=['confirmed'])
            
            # Responder inmediatamente
            response = Response({
                'success': True,
                'message': '¡Gracias! Tu suscripción ha sido confirmada con éxito.'
            })
            response = apply_cors_headers(response, request)
            
            # Procesar el resto en segundo plano
            thread = Thread(target=process_subscription_background, args=(subscriber, request, True))
            thread.daemon = True
            thread.start()
            
            return response
        
        # Ya estaba confirmado
        response = Response({
            'success': True,
            'message': 'Tu suscripción ya ha sido confirmada anteriormente.'
        })
        
        return apply_cors_headers(response, request)
        
    except Subscriber.DoesNotExist:
        response = Response({
            'success': False,
            'message': 'El token de confirmación no es válido.'
        }, status=status.HTTP_404_NOT_FOUND)
        
        return apply_cors_headers(response, request)


@api_view(['GET', 'POST', 'OPTIONS'])
@permission_classes([AllowAny])
def unsubscribe(request, token):
    """
    API endpoint para cancelar la suscripción.
    """
    # Manejar preflight request
    if request.method == 'OPTIONS':
        response = Response()
        return apply_cors_headers(response, request)
        
    try:
        subscriber = Subscriber.objects.get(confirmation_token=token)
        email = subscriber.email
        subscriber.delete()
        logger.info(f"Suscriptor eliminado: {email}")
        
        response = Response({
            'success': True,
            'message': f'El correo {email} ha sido eliminado de nuestra lista.'
        })
        
        return apply_cors_headers(response, request)
        
    except Subscriber.DoesNotExist:
        response = Response({
            'success': False,
            'message': 'El token de cancelación no es válido.'
        }, status=status.HTTP_404_NOT_FOUND)
        
        return apply_cors_headers(response, request)


def send_confirmation_email(subscriber):
    """
    Envía un email de confirmación al suscriptor.
    """
    # URL real para producción
    site_url = "https://futurprive.com"
    confirmation_link = f"{site_url}/api/newsletter/confirm/{subscriber.confirmation_token}"
    unsubscribe_link = f"{site_url}/api/newsletter/unsubscribe/{subscriber.confirmation_token}/"
    
    subject = '¿ERES UNA IA?'
    
    # Contenido HTML
    context = {
        'name': subscriber.name if subscriber.name else 'Usuario',
        'confirmation_link': confirmation_link,
        'unsubscribe_link': unsubscribe_link
    }
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Confirma tu correo</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 650px;
            }}
            p {{
                font-size: 16px;
                margin-bottom: 24px;
            }}
            .red {{
                color: #ff0000;
            }}
            .bold {{
                font-weight: bold;
            }}
        </style>
    </head>
    <body>
        <p>Debes confirmar tu correo.</p>
        
        <p>Si es que NO te interesa saber cómo la IA puede ahorrarte cientos de horas este año, pues ignora este email y sigue haciendo todo manualmente.</p>
        
        <p>Pero si es que SÍ te interesa dejar que la tecnología trabaje PARA TI mientras duermes...</p>
        
        <p class="bold">DEBES CONFIRMAR HACIENDO CLIC EN EL ENLACE QUE TIENES DEBAJO.</p>
        
        <p>
            <a href="{context['confirmation_link']}" class="red">CONFIRMAR AHORA</a>
        </p>
        
        <p>Pd: Confirma arriba 👆 para acceder a tu regalo.</p>
        
        <p>Pasa un día productivo (o no),<br>
        Adrià Estévez</p>
        
        <p>© FuturPrive - Todos los derechos reservados.</p>
    </body>
    </html>
    """
    
    # Versión texto plano
    plain_message = strip_tags(html_message)
    
    # Usar un timeout más corto para evitar bloqueos
    send_mail(
        subject=subject,
        message=plain_message,
        html_message=html_message,
        from_email='Adrià Estévez <adria@futurprive.com>',
        recipient_list=[subscriber.email],
        fail_silently=False,
        # No bloqueando más de 10 segundos en envío de correo
        timeout=10
    )
