import json
import logging
import stripe
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.conf import settings
from datetime import datetime
from .models import User

# Configurar logging
logger = logging.getLogger(__name__)

@csrf_exempt
@require_POST
def stripe_webhook(request):
    """
    Endpoint para recibir webhooks de Stripe
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

    try:
        # Verificar la firma si hay un secreto de webhook configurado
        if settings.STRIPE_WEBHOOK_SECRET:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        else:
            # Si no hay secreto, simplemente parsear el JSON
            payload_json = json.loads(payload)
            event = payload_json
            logger.warning("Webhook sin verificar - no hay STRIPE_WEBHOOK_SECRET configurado")
        
        logger.info(f"Webhook Stripe recibido: {event['type']}")
        
        # Manejar el evento según su tipo
        if event['type'] == 'checkout.session.completed':
            handle_checkout_session_completed(event['data']['object'])
        elif event['type'] == 'customer.subscription.created':
            handle_subscription_created(event['data']['object'])
        elif event['type'] == 'customer.subscription.updated':
            handle_subscription_updated(event['data']['object'])
        elif event['type'] == 'customer.subscription.deleted':
            handle_subscription_deleted(event['data']['object'])
        # Puedes agregar más manejadores para otros tipos de eventos
        
        return HttpResponse(status=200)
    except ValueError as e:
        # JSON inválido
        logger.error(f'Error de JSON inválido: {str(e)}')
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        # Firma inválida
        logger.error(f'Error de firma de webhook: {str(e)}')
        return HttpResponse(status=400)
    except Exception as e:
        # Error inesperado
        logger.error(f'Error inesperado en webhook: {str(e)}')
        return HttpResponse(content=str(e), status=500)


def handle_checkout_session_completed(session):
    """
    Manejar evento de sesión de checkout completada
    """
    logger.info(f"Checkout session completada: {session.id}")
    
    # Obtener el customer_id y subscription_id
    customer_id = session.get('customer')
    subscription_id = session.get('subscription')
    
    if not customer_id or not subscription_id:
        logger.warning(f"Sesión sin customer_id o subscription_id: {session.id}")
        return
    
    try:
        # Buscar el usuario con este customer_id
        user = User.objects.filter(stripe_customer_id=customer_id).first()
        
        if not user:
            logger.warning(f"No se encontró usuario con customer_id {customer_id}")
            return
        
        # Si hay un subscription_id, obtener detalles de la suscripción
        subscription = stripe.Subscription.retrieve(subscription_id)
        
        # Actualizar los datos del usuario
        user.subscription_id = subscription_id
        user.subscription_status = subscription.status
        user.has_active_subscription = subscription.status == 'active'
        user.is_premium = subscription.status == 'active'
        
        # Actualizar fechas de suscripción
        if subscription.current_period_start:
            user.subscription_start_date = datetime.fromtimestamp(subscription.current_period_start)
        if subscription.current_period_end:
            user.subscription_end_date = datetime.fromtimestamp(subscription.current_period_end)
        
        user.save()
        logger.info(f"Usuario {user.username} actualizado con suscripción {subscription_id}")
    except Exception as e:
        logger.error(f"Error al procesar checkout session: {str(e)}")


def handle_subscription_created(subscription):
    """
    Manejar evento de suscripción creada
    """
    logger.info(f"Suscripción creada: {subscription.id}")
    
    try:
        # Buscar el usuario con este customer_id
        customer_id = subscription.get('customer')
        user = User.objects.filter(stripe_customer_id=customer_id).first()
        
        if not user:
            logger.warning(f"No se encontró usuario con customer_id {customer_id}")
            return
        
        # Actualizar los datos del usuario
        user.subscription_id = subscription.id
        user.subscription_status = subscription.status
        user.has_active_subscription = subscription.status == 'active'
        user.is_premium = subscription.status == 'active'
        
        # Actualizar fechas de suscripción
        if subscription.current_period_start:
            user.subscription_start_date = datetime.fromtimestamp(subscription.current_period_start)
        if subscription.current_period_end:
            user.subscription_end_date = datetime.fromtimestamp(subscription.current_period_end)
        
        user.save()
        logger.info(f"Usuario {user.username} actualizado con nueva suscripción {subscription.id}")
    except Exception as e:
        logger.error(f"Error al procesar subscription created: {str(e)}")


def handle_subscription_updated(subscription):
    """
    Manejar evento de suscripción actualizada
    """
    logger.info(f"Suscripción actualizada: {subscription.id}")
    
    try:
        # Buscar el usuario con este subscription_id
        user = User.objects.filter(subscription_id=subscription.id).first()
        
        if not user:
            # Intentar buscar por customer_id si no se encuentra por subscription_id
            customer_id = subscription.get('customer')
            user = User.objects.filter(stripe_customer_id=customer_id).first()
            
            if not user:
                logger.warning(f"No se encontró usuario para suscripción {subscription.id}")
                return
        
        # Actualizar los datos del usuario
        user.subscription_status = subscription.status
        user.has_active_subscription = subscription.status == 'active'
        user.is_premium = subscription.status == 'active'
        
        # Actualizar fechas de suscripción
        if subscription.current_period_start:
            user.subscription_start_date = datetime.fromtimestamp(subscription.current_period_start)
        if subscription.current_period_end:
            user.subscription_end_date = datetime.fromtimestamp(subscription.current_period_end)
        
        user.save()
        logger.info(f"Usuario {user.username} actualizado con cambios de suscripción {subscription.id}")
    except Exception as e:
        logger.error(f"Error al procesar subscription updated: {str(e)}")


def handle_subscription_deleted(subscription):
    """
    Manejar evento de suscripción cancelada
    """
    logger.info(f"Suscripción cancelada: {subscription.id}")
    
    try:
        # Buscar el usuario con este subscription_id
        user = User.objects.filter(subscription_id=subscription.id).first()
        
        if not user:
            logger.warning(f"No se encontró usuario para suscripción cancelada {subscription.id}")
            return
        
        # Actualizar los datos del usuario
        user.subscription_status = 'canceled'
        user.has_active_subscription = False
        user.is_premium = False
        
        user.save()
        logger.info(f"Usuario {user.username} actualizado por cancelación de suscripción {subscription.id}")
    except Exception as e:
        logger.error(f"Error al procesar subscription deleted: {str(e)}")
