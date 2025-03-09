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
from .beehiiv import add_subscriber_to_beehiiv
import uuid

@api_view(['POST'])
def test_beehiiv(request):
    """
    Endpoint de prueba para verificar la integración con Beehiiv.
    """
    email = request.data.get('email', 'test@example.com')
    name = request.data.get('name', 'Usuario de Prueba')
    
    try:
        print("\n[TEST BEEHIIV] Iniciando prueba de integración con Beehiiv")
        success, message = add_subscriber_to_beehiiv(
            email=email,
            name=name,
            source="Test Integration",
            is_confirmed=True
        )
        
        if success:
            print(f"[TEST BEEHIIV] ÉXITO: {message}")
            return Response({
                'success': True,
                'message': message
            })
        else:
            print(f"[TEST BEEHIIV] ERROR: {message}")
            return Response({
                'success': False,
                'message': message
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        error_message = f"Error en prueba de integración con Beehiiv: {str(e)}"
        print(f"[TEST BEEHIIV] EXCEPCIÓN: {error_message}")
        import traceback
        print(traceback.format_exc())
        
        return Response({
            'success': False,
            'message': error_message
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def subscribe(request):
    """
    API endpoint para suscribirse a la newsletter.
    """
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
            
            # También registramos en Beehiiv (con confirmed=false)
            try:
                print("\n[BEEHIIV-PRE] Registrando preliminarmente en Beehiiv (antes de confirmación)")
                success, message = add_subscriber_to_beehiiv(
                    email=subscriber.email,
                    name=subscriber.name,
                    source="FuturPrive-PreConfirmation",
                    is_confirmed=False
                )
                if success:
                    print(f"[BEEHIIV-PRE] ÉXITO en registro preliminar: {message}")
                else:
                    print(f"[BEEHIIV-PRE] ERROR en registro preliminar: {message}")
            except Exception as e:
                print(f"[BEEHIIV-PRE] EXCEPCIÓN en registro preliminar: {str(e)}")
                # No bloqueamos el flujo principal
            
            return Response({
                'success': True,
                'message': 'Te hemos enviado un correo para confirmar tu suscripción.'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Log del error
            import traceback
            print(f"Error enviando email: {e}")
            print(traceback.format_exc())
            
            # Guardamos el suscriptor pero informamos del problema con el correo
            return Response({
                'success': False,
                'message': 'Hubo un problema al enviar el correo de confirmación, pero tus datos se han guardado. El administrador te contactará para confirmar.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'success': False,
        'message': 'Los datos proporcionados no son válidos.',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
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
                import traceback
                print(traceback.format_exc())
            
            # Agregar a Beehiiv
            try:
                print("\n[BEEHIIV] Iniciando registro en Beehiiv para suscriptor confirmado")
                success, message = add_subscriber_to_beehiiv(
                    email=subscriber.email,
                    name=subscriber.name,
                    source="FuturPrive Newsletter",
                    is_confirmed=True
                )
                if success:
                    print(f"[BEEHIIV] ÉXITO: Usuario {subscriber.email} registrado en Beehiiv. {message}")
                else:
                    print(f"[BEEHIIV] ERROR: {message}")
                    # Intentar con correo directo
                    print("[BEEHIIV] Intentando suscripción directa como fallback...")
                    # Hacemos una llamada al endpoint de prueba como fallback
                    import requests
                    fallback_url = f"{settings.SITE_URL}/api/test/beehiiv/"
                    fallback_data = {
                        "email": subscriber.email,
                        "name": subscriber.name if subscriber.name else "Suscriptor"
                    }
                    fallback_response = requests.post(fallback_url, json=fallback_data)
                    print(f"[BEEHIIV] Respuesta de fallback: {fallback_response.status_code} - {fallback_response.text}")
            except Exception as e:
                print(f"[BEEHIIV] EXCEPCIÓN al registrar en Beehiiv: {str(e)}")
                import traceback
                print(traceback.format_exc())
                # No hacemos que falle todo el proceso si hay un error con Beehiiv
            
            return Response({
                'success': True,
                'message': '¡Gracias! Tu suscripción ha sido confirmada con éxito.'
            })
        
        return Response({
            'success': True,
            'message': 'Tu suscripción ya ha sido confirmada anteriormente.'
        })
        
    except Subscriber.DoesNotExist:
        return Response({
            'success': False,
            'message': 'El token de confirmación no es válido.'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def unsubscribe(request, token):
    """
    API endpoint para cancelar la suscripción.
    """
    try:
        subscriber = Subscriber.objects.get(confirmation_token=token)
        email = subscriber.email
        subscriber.delete()
        
        return Response({
            'success': True,
            'message': f'El correo {email} ha sido eliminado de nuestra lista.'
        })
        
    except Subscriber.DoesNotExist:
        return Response({
            'success': False,
            'message': 'El token de cancelación no es válido.'
        }, status=status.HTTP_404_NOT_FOUND)


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
