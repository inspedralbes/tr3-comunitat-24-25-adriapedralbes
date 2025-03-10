from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Subscriber
from .serializers import SubscriberSerializer
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.urls import reverse
from .welcome_email import send_welcome_email
from .email_debug import test_email_connection
from .cors import add_cors_headers
import uuid
import json
import logging
import traceback

# Vista para la ruta raíz
@api_view(['GET'])
@add_cors_headers
def api_root(request):
    """
    Vista para la página principal de la API
    """
    return Response({
        'status': 'online',
        'message': 'Bienvenido a la API de FuturPrive',
        'version': '1.0',
        'endpoints': {
            'newsletter_subscribe': '/api/newsletter/subscribe/',
            'newsletter_confirm': '/api/newsletter/confirm/{token}/',
            'newsletter_unsubscribe': '/api/newsletter/unsubscribe/{token}/'
        }
    })

@api_view(['GET'])
@add_cors_headers
def test_email(request):
    """
    Endpoint para probar la conexión de correo
    """
    # Eliminamos la restricción de DEBUG para permitir diagnóstico
    results = test_email_connection()
    return Response(results)

@api_view(['POST', 'OPTIONS'])
@add_cors_headers
def subscribe(request):
    """
    API endpoint para suscribirse a la newsletter.
    """
    # Asegurarnos de que tenemos encabezados CORS para esta vista
    if request.method == 'OPTIONS':
        response = Response({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Headers"] = "*"
        response["Access-Control-Allow-Methods"] = "*"
        return response
        
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
                confirmed=False
            )
            subscriber.save()
        
        # Enviar email de confirmación
        try:
            send_confirmation_email(subscriber)
            
            response = Response({
                'success': True,
                'message': 'Te hemos enviado un correo para confirmar tu suscripción.'
            }, status=status.HTTP_201_CREATED)
            
            # Añadir encabezados CORS
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Headers"] = "*"
            response["Access-Control-Allow-Methods"] = "*"
            
            return response
            
        except Exception as e:
            # Logging detallado del error
            logger = logging.getLogger(__name__)
            logger.error(f"Error enviando email a {subscriber.email}: {str(e)}")
            logger.error(traceback.format_exc())
            
            # Diagnóstico de conexión
            try:
                connection_test = test_email_connection()
                error_details = {
                    'error_type': type(e).__name__,
                    'error_message': str(e),
                    'email_settings': {
                        'EMAIL_HOST': settings.EMAIL_HOST,
                        'EMAIL_PORT': settings.EMAIL_PORT,
                        'EMAIL_USE_TLS': settings.EMAIL_USE_TLS,
                        'EMAIL_USE_SSL': settings.EMAIL_USE_SSL,
                    },
                    'connection_test': connection_test
                }
                print("========= EMAIL ERROR DIAGNOSIS =========")
                print(json.dumps(error_details, indent=2))
                print("=======================================")
            except Exception as debug_error:
                print(f"Error during email diagnostics: {debug_error}")
            
            # Guardamos el suscriptor pero informamos del problema con el correo
            response = Response({
                'success': False,
                'message': 'Hubo un problema al enviar el correo de confirmación, pero tus datos se han guardado. El administrador te contactará para confirmar.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Añadir encabezados CORS
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Headers"] = "*"
            response["Access-Control-Allow-Methods"] = "*"
            
            return response
    
    response = Response({
        'success': False,
        'message': 'Los datos proporcionados no son válidos.',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)
    
    # Añadir encabezados CORS
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Headers"] = "*"
    response["Access-Control-Allow-Methods"] = "*"
    
    return response


@api_view(['GET'])
@add_cors_headers
def confirm_subscription(request, token):
    """
    API endpoint para confirmar la suscripción.
    """
    try:
        subscriber = Subscriber.objects.get(confirmation_token=token)
        
        if not subscriber.confirmed:
            subscriber.confirmed = True
            subscriber.save(update_fields=['confirmed'])
            
            # Enviar email de bienvenida con los recursos prometidos
            try:
                send_welcome_email(subscriber)
            except Exception as e:
                print(f"Error enviando email de bienvenida: {e}")
            
            response = Response({
                'success': True,
                'message': '¡Gracias! Tu suscripción ha sido confirmada con éxito.'
            })
            
            # Añadir encabezados CORS
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Headers"] = "*"
            response["Access-Control-Allow-Methods"] = "*"
            
            return response
        
        response = Response({
            'success': True,
            'message': 'Tu suscripción ya ha sido confirmada anteriormente.'
        })
        
        # Añadir encabezados CORS
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Headers"] = "*"
        response["Access-Control-Allow-Methods"] = "*"
        
        return response
        
    except Subscriber.DoesNotExist:
        response = Response({
            'success': False,
            'message': 'El token de confirmación no es válido.'
        }, status=status.HTTP_404_NOT_FOUND)
        
        # Añadir encabezados CORS
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Headers"] = "*"
        response["Access-Control-Allow-Methods"] = "*"
        
        return response


@api_view(['GET', 'POST', 'OPTIONS'])
@add_cors_headers
def unsubscribe(request, token):
    """
    API endpoint para cancelar la suscripción.
    """
    # Asegurarnos de que tenemos encabezados CORS para esta vista
    if request.method == 'OPTIONS':
        response = Response({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Headers"] = "*"
        response["Access-Control-Allow-Methods"] = "*"
        return response
        
    try:
        subscriber = Subscriber.objects.get(confirmation_token=token)
        email = subscriber.email
        subscriber.delete()
        
        response = Response({
            'success': True,
            'message': f'El correo {email} ha sido eliminado de nuestra lista.'
        })
        
        # Añadir encabezados CORS
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Headers"] = "*"
        response["Access-Control-Allow-Methods"] = "*"
        
        return response
        
    except Subscriber.DoesNotExist:
        response = Response({
            'success': False,
            'message': 'El token de cancelación no es válido.'
        }, status=status.HTTP_404_NOT_FOUND)
        
        # Añadir encabezados CORS
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Headers"] = "*"
        response["Access-Control-Allow-Methods"] = "*"
        
        return response


def send_confirmation_email(subscriber):
    """
    Envía un email de confirmación al suscriptor.
    """
    confirmation_link = f"{settings.SITE_URL}/api/newsletter/confirm/{subscriber.confirmation_token}"
    unsubscribe_link = f"{settings.SITE_URL}/api/newsletter/unsubscribe/{subscriber.confirmation_token}/"
    
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
    
    send_mail(
        subject=subject,
        message=plain_message,
        html_message=html_message,
        from_email='Adrià Estévez <adria@futurprive.com>',
        recipient_list=[subscriber.email],
        fail_silently=False,
    )