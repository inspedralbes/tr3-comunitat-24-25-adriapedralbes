"""
Vistas para el manejo de newsletter
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
from threading import Thread

from .models import Subscriber
from .serializers import SubscriberSerializer
from .welcome_email import send_welcome_email
from .beehiiv import add_subscriber_to_beehiiv

logger = logging.getLogger(__name__)

@api_view(['POST', 'OPTIONS'])
@permission_classes([AllowAny])
def subscribe(request):
    """
    API endpoint para suscribirse a la newsletter.
    """
    # Manejar preflight request
    if request.method == 'OPTIONS':
        response = Response()
        response["Access-Control-Allow-Origin"] = "https://futurprive.com"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response["Access-Control-Allow-Credentials"] = "true"
        return response
        
    print(f"\n[DEBUG] Recibida solicitud: {request.method}")
    print(f"[DEBUG] Origin: {request.META.get('HTTP_ORIGIN')}")
    print(f"[DEBUG] Datos: {request.data if hasattr(request, 'data') else 'No data'}")
        
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
                
                # Aplicar CORS headers
                response["Access-Control-Allow-Origin"] = "https://futurprive.com"
                response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
                response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
                response["Access-Control-Allow-Credentials"] = "true"
                
                return response
            
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
        
        # Enviar email de confirmación
        try:
            send_confirmation_email(subscriber)
            
            # Registrar el suscriptor en Beehiiv en segundo plano
            # Para evitar que el timeout afecte la respuesta al usuario
            def register_in_beehiiv_background():
                try:
                    print("\n[BEEHIIV] Registrando en Beehiiv (antes de confirmación)")
                    success, message = add_subscriber_to_beehiiv(
                        email=subscriber.email,
                        name=subscriber.name,
                        source="FuturPrive Website Direct",
                        is_confirmed=False
                    )
                    if success:
                        print(f"[BEEHIIV] ÉXITO: Usuario registrado en Beehiiv: {message}")
                    else:
                        print(f"[BEEHIIV] ERROR: {message}")
                except Exception as e:
                    print(f"[BEEHIIV] EXCEPCIÓN: {str(e)}")
            
            # Iniciar proceso en segundo plano
            beehiiv_thread = Thread(target=register_in_beehiiv_background)
            beehiiv_thread.daemon = True
            beehiiv_thread.start()
            
            response = Response({
                'success': True,
                'message': 'Te hemos enviado un correo para confirmar tu suscripción.'
            }, status=status.HTTP_201_CREATED)
            
            # Aplicar CORS headers
            response["Access-Control-Allow-Origin"] = "https://futurprive.com"
            response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
            response["Access-Control-Allow-Credentials"] = "true"
            
            return response
            
        except Exception as e:
            # Logging detallado del error
            logger.error(f"Error enviando email a {subscriber.email}: {str(e)}")
            logger.error(traceback.format_exc())
            
            # Diagnóstico de conexión
            connection_test = None
            try:
                from .views import test_email_connection
                connection_test = test_email_connection()
                error_details = {
                    'error_type': type(e).__name__,
                    'error_message': str(e),
                    'connection_test': connection_test
                }
                print("========= EMAIL ERROR DIAGNOSIS =========")
                print(json.dumps(error_details, indent=2))
                print("=======================================")
            except Exception as debug_error:
                print(f"Error during email diagnostics: {debug_error}")
            
            # Intento de registro directo en Beehiiv sin confirmación de email
            try:
                print("\n[BEEHIIV-FALLBACK] Intentando registro directo en Beehiiv")
                success, message = add_subscriber_to_beehiiv(
                    email=subscriber.email,
                    name=subscriber.name,
                    source="FuturPrive Website (Email Failed)",
                    is_confirmed=True  # Lo marcamos como confirmado directamente
                )
                if success:
                    print(f"[BEEHIIV-FALLBACK] ÉXITO: {message}")
                    subscriber.confirmed = True
                    subscriber.save(update_fields=['confirmed'])
                else:
                    print(f"[BEEHIIV-FALLBACK] ERROR: {message}")
            except Exception as beehiiv_error:
                print(f"[BEEHIIV-FALLBACK] EXCEPCIÓN: {str(beehiiv_error)}")
            
            # Guardamos el suscriptor pero informamos del problema con el correo
            response = Response({
                'success': True,
                'message': 'Tu suscripción ha sido procesada correctamente.'
            }, status=status.HTTP_201_CREATED)
            
            # Aplicar CORS headers
            response["Access-Control-Allow-Origin"] = "https://futurprive.com"
            response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
            response["Access-Control-Allow-Credentials"] = "true"
            
            return response
    
    # Si la validación falla
    response = Response({
        'success': False,
        'message': 'Los datos proporcionados no son válidos.',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)
    
    # Aplicar CORS headers
    response["Access-Control-Allow-Origin"] = "https://futurprive.com"
    response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    response["Access-Control-Allow-Credentials"] = "true"
    
    return response


@api_view(['GET'])
@permission_classes([AllowAny])
def confirm_subscription(request, token):
    """
    API endpoint para confirmar la suscripción.
    """
    try:
        subscriber = Subscriber.objects.get(confirmation_token=token)
        
        if not subscriber.confirmed:
            print(f"\n[CONFIRMACIÓN] Confirmando suscripción para: {subscriber.email}")
            subscriber.confirmed = True
            subscriber.save(update_fields=['confirmed'])
            
            # Enviar email de bienvenida con los recursos prometidos
            try:
                send_welcome_email(subscriber)
                print(f"[CONFIRMACIÓN] Email de bienvenida enviado a: {subscriber.email}")
            except Exception as e:
                print(f"Error enviando email de bienvenida: {str(e)}")
                print(traceback.format_exc())
            
            # Agregar a Beehiiv
            try:
                print("\n[BEEHIIV] Actualizando suscriptor en Beehiiv como confirmado")
                
                # Usar un hilo para evitar timeouts
                def update_beehiiv_status():
                    try:
                        success, message = add_subscriber_to_beehiiv(
                            email=subscriber.email,
                            name=subscriber.name,
                            source="FuturPrive Newsletter Confirmed",
                            is_confirmed=True
                        )
                        if success:
                            print(f"[BEEHIIV] ÉXITO: Usuario confirmado en Beehiiv. {message}")
                        else:
                            print(f"[BEEHIIV] ERROR: {message}")
                    except Exception as e:
                        print(f"[BEEHIIV] EXCEPCIÓN: {str(e)}")
                        print(traceback.format_exc())
                
                beehiiv_thread = Thread(target=update_beehiiv_status)
                beehiiv_thread.daemon = True
                beehiiv_thread.start()
                
            except Exception as e:
                print(f"[BEEHIIV] EXCEPCIÓN: {str(e)}")
                print(traceback.format_exc())
            
            response = Response({
                'success': True,
                'message': '¡Gracias! Tu suscripción ha sido confirmada con éxito.'
            })
            
            # Aplicar CORS headers
            response["Access-Control-Allow-Origin"] = "https://futurprive.com"
            response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
            response["Access-Control-Allow-Credentials"] = "true"
            
            return response
        
        response = Response({
            'success': True,
            'message': 'Tu suscripción ya ha sido confirmada anteriormente.'
        })
        
        # Aplicar CORS headers
        response["Access-Control-Allow-Origin"] = "https://futurprive.com"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response["Access-Control-Allow-Credentials"] = "true"
        
        return response
        
    except Subscriber.DoesNotExist:
        response = Response({
            'success': False,
            'message': 'El token de confirmación no es válido.'
        }, status=status.HTTP_404_NOT_FOUND)
        
        # Aplicar CORS headers
        response["Access-Control-Allow-Origin"] = "https://futurprive.com"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response["Access-Control-Allow-Credentials"] = "true"
        
        return response


@api_view(['GET', 'POST', 'OPTIONS'])
@permission_classes([AllowAny])
def unsubscribe(request, token):
    """
    API endpoint para cancelar la suscripción.
    """
    # Manejar preflight request
    if request.method == 'OPTIONS':
        response = Response()
        response["Access-Control-Allow-Origin"] = "https://futurprive.com"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response["Access-Control-Allow-Credentials"] = "true"
        return response
        
    try:
        subscriber = Subscriber.objects.get(confirmation_token=token)
        email = subscriber.email
        subscriber.delete()
        
        response = Response({
            'success': True,
            'message': f'El correo {email} ha sido eliminado de nuestra lista.'
        })
        
        # Aplicar CORS headers
        response["Access-Control-Allow-Origin"] = "https://futurprive.com"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response["Access-Control-Allow-Credentials"] = "true"
        
        return response
        
    except Subscriber.DoesNotExist:
        response = Response({
            'success': False,
            'message': 'El token de cancelación no es válido.'
        }, status=status.HTTP_404_NOT_FOUND)
        
        # Aplicar CORS headers
        response["Access-Control-Allow-Origin"] = "https://futurprive.com"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response["Access-Control-Allow-Credentials"] = "true"
        
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
