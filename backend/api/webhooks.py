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
    webhook_secret = settings.STRIPE_WEBHOOK_SECRET

    logger.info("🔔 Webhook de Stripe recibido")
    logger.info(f"URL: {request.path}")
    logger.info(f"Método: {request.method}")
    logger.info(f"¿Tiene firma? {'Sí' if sig_header else 'No'}")
    logger.info(f"¿Tiene secreto configurado? {'Sí' if webhook_secret else 'No'}")

    try:
        # Verificar la firma si hay un secreto de webhook configurado
        if webhook_secret:
            logger.info(f"Intentando verificar firma con secreto: {webhook_secret[:5]}...")
            try:
                event = stripe.Webhook.construct_event(
                    payload, sig_header, webhook_secret
                )
                logger.info("✅ Firma verificada correctamente")
            except ValueError as e:
                logger.error(f"❌ Error en la verificación (ValueError): {str(e)}")
                return HttpResponse(status=400)
            except stripe.error.SignatureVerificationError as e:
                logger.error(f"❌ Error en la verificación de firma: {str(e)}")
                return HttpResponse(status=400)
        else:
            # Si no hay secreto, simplemente parsear el JSON
            logger.warning("⚠️ No hay STRIPE_WEBHOOK_SECRET configurado")
            try:
                payload_json = json.loads(payload)
                event = payload_json
            except json.JSONDecodeError as e:
                logger.error(f"❌ Error al parsear JSON: {str(e)}")
                return HttpResponse(status=400)
        
        # Extraer el tipo de evento
        event_type = event['type'] if isinstance(event, dict) else event.type
        logger.info(f"📝 Evento recibido: {event_type}")
        
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
    logger.info(f"📦 Checkout session completada: {session.get('id')}")
    logger.info(f"Datos de sesión: {json.dumps(session, default=str)[:500]}...")
    
    # Obtener el customer_id y subscription_id
    customer_id = session.get('customer')
    subscription_id = session.get('subscription')
    
    logger.info(f"Customer ID: {customer_id}")
    logger.info(f"Subscription ID: {subscription_id}")
    
    if not customer_id:
        logger.warning("⚠️ Sesión sin customer_id")
        return
    
    try:
        # Buscar el usuario con este customer_id
        user = User.objects.filter(stripe_customer_id=customer_id).first()
        
        if not user:
            logger.warning(f"⚠️ No se encontró usuario con customer_id {customer_id}")
            # Intentar buscar por otros medios (metadata, email)
            if session.get('customer_email'):
                logger.info(f"Intentando encontrar usuario por email: {session.get('customer_email')}")
                user = User.objects.filter(email=session.get('customer_email')).first()
                if user:
                    logger.info(f"✅ Usuario encontrado por email: {user.username}")
                    # Actualizar el customer_id del usuario
                    user.stripe_customer_id = customer_id
            
            if not user and session.get('metadata', {}).get('user_id'):
                logger.info(f"Intentando encontrar usuario por user_id en metadata: {session.get('metadata', {}).get('user_id')}")
                user = User.objects.filter(id=session.get('metadata', {}).get('user_id')).first()
                if user:
                    logger.info(f"✅ Usuario encontrado por metadata: {user.username}")
                    # Actualizar el customer_id del usuario
                    user.stripe_customer_id = customer_id
            
            if not user:
                logger.error("❌ No se pudo encontrar al usuario por ningún método")
                return
        
        logger.info(f"✅ Usuario encontrado: {user.username}")
        
        # Actualizar datos básicos de cliente Stripe
        user.stripe_customer_id = customer_id
        
        # Si hay un subscription_id, obtener detalles de la suscripción
        if subscription_id:
            try:
                logger.info(f"Obteniendo detalles de suscripción: {subscription_id}")
                subscription = stripe.Subscription.retrieve(subscription_id)
                
                # Actualizar los datos del usuario
                user.subscription_id = subscription_id
                user.subscription_status = subscription.status
                user.has_active_subscription = subscription.status == 'active'
                user.is_premium = subscription.status == 'active'
                
                # Actualizar fechas de suscripción
                if hasattr(subscription, 'current_period_start'):
                    user.subscription_start_date = datetime.fromtimestamp(subscription.current_period_start)
                if hasattr(subscription, 'current_period_end'):
                    user.subscription_end_date = datetime.fromtimestamp(subscription.current_period_end)
                
                logger.info(f"✅ Detalles de suscripción actualizados. Estado: {subscription.status}")
            except Exception as e:
                logger.error(f"❌ Error al obtener detalles de suscripción: {str(e)}")
                # Si no podemos obtener detalles, asumimos suscripción activa
                user.subscription_id = subscription_id
                user.subscription_status = 'active'
                user.has_active_subscription = True
                user.is_premium = True
        else:
            # Incluso sin subscription_id, si completó el checkout, asumimos que tiene acceso
            logger.warning("⚠️ Checkout completado pero sin subscription_id")
            user.has_active_subscription = True
            user.is_premium = True
            user.subscription_status = 'pending'
        
        # Guardar todos los cambios
        user.save()
        logger.info(f"✅ Usuario {user.username} actualizado correctamente")
    except Exception as e:
        logger.error(f"❌ Error al procesar checkout session: {str(e)}")


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
