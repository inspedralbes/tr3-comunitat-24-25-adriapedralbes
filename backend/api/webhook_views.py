import stripe
import json
import logging
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.conf import settings
from api.models import User
from django.utils import timezone
from datetime import datetime

# Configurar logging
logger = logging.getLogger(__name__)

# Configurar Stripe API key
stripe.api_key = settings.STRIPE_SECRET_KEY

@csrf_exempt
@require_POST
def stripe_webhook(request):
    """
    Vista para procesar webhooks de Stripe
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    webhook_secret = settings.STRIPE_WEBHOOK_SECRET if settings.STRIPE_WEBHOOK_SECRET else None
    event = None

    # Información detallada para diagnóstico
    logger.info("🔔 Webhook de Stripe recibido")
    logger.info(f"URL: {request.path}")
    logger.info(f"Método: {request.method}")
    logger.info(f"¿Tiene firma? {'Sí' if sig_header else 'No'}")
    logger.info(f"¿Tiene secreto configurado? {'Sí' if webhook_secret else 'No'}")
    if webhook_secret:
        logger.info(f"Secreto de webhook configurado: {webhook_secret[:5]}...")

    try:
        logger.info(f"Headers recibidos: {json.dumps({k: v for k, v in request.META.items() if k.startswith('HTTP_')})}")
        
        if webhook_secret:
            # Verificar firma del webhook si está configurada
            try:
                logger.info("Intentando verificar firma...")
                event = stripe.Webhook.construct_event(
                    payload, sig_header, webhook_secret
                )
                logger.info("✅ Firma del webhook verificada correctamente")
            except ValueError as e:
                # Invalid payload
                logger.error(f"❌ Payload inválido: {e}")
                return HttpResponse("Invalid payload", status=400)
            except stripe.error.SignatureVerificationError as e:
                # Invalid signature
                logger.error(f"❌ Firma inválida: {e}")
                return HttpResponse("Invalid signature", status=400)
        else:
            # Si no hay webhook_secret, parsear el payload directamente
            logger.warning("⚠️ No hay webhook_secret configurado, parseando el payload directamente")
            try:
                data = json.loads(payload)
                event = data
                logger.info("✅ Payload parseado correctamente")
            except json.JSONDecodeError as e:
                logger.error(f"❌ Payload inválido (JSONDecodeError): {e}")
                return HttpResponse("Invalid JSON", status=400)
        
        # Extraer el tipo de evento
        event_type = event.get('type', None) if isinstance(event, dict) else event.type
        logger.info(f"📝 Tipo de evento: {event_type}")
        
        # Manejar tipos específicos de eventos
        if event_type == 'checkout.session.completed':
            logger.info("Procesando evento checkout.session.completed")
            # Obtener el objeto evento dependiendo del formato
            session = event.get('data', {}).get('object') if isinstance(event, dict) else event.data.object
            
            # Procesar el evento checkout.session.completed
            handle_checkout_session_completed(session)
            logger.info("✅ Evento checkout.session.completed procesado correctamente")
            
        elif event_type == 'invoice.paid':
            logger.info("Procesando evento invoice.paid")
            # Obtener el objeto evento dependiendo del formato
            invoice = event.get('data', {}).get('object') if isinstance(event, dict) else event.data.object
            
            # Procesar el evento invoice.paid
            handle_invoice_paid(invoice)
            logger.info("✅ Evento invoice.paid procesado correctamente")
            
        elif event_type == 'customer.subscription.updated':
            logger.info("Procesando evento customer.subscription.updated")
            # Obtener el objeto evento dependiendo del formato
            subscription = event.get('data', {}).get('object') if isinstance(event, dict) else event.data.object
            
            # Procesar el evento customer.subscription.updated
            handle_subscription_updated(subscription)
            logger.info("✅ Evento customer.subscription.updated procesado correctamente")
            
        elif event_type == 'customer.subscription.deleted':
            logger.info("Procesando evento customer.subscription.deleted")
            # Obtener el objeto evento dependiendo del formato
            subscription = event.get('data', {}).get('object') if isinstance(event, dict) else event.data.object
            
            # Procesar el evento customer.subscription.deleted
            handle_subscription_deleted(subscription)
            logger.info("✅ Evento customer.subscription.deleted procesado correctamente")
            
        else:
            logger.info(f"⚠️ Tipo de evento no manejado: {event_type}")
        
        logger.info("✅ Webhook procesado correctamente")
        return HttpResponse("Webhook received", status=200)
        
    except Exception as e:
        logger.error(f"❌ Error al procesar webhook: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return HttpResponse(f"Error: {str(e)}", status=500)


def handle_checkout_session_completed(session):
    """
    Procesa el evento checkout.session.completed
    """
    try:
        # Obtener el ID del cliente y la suscripción
        customer_id = session.get('customer')
        subscription_id = session.get('subscription')
        
        logger.info(f"Checkout completado: customer_id={customer_id}, subscription_id={subscription_id}")
        
        if customer_id:
            # Buscar el usuario por el customer_id
            users = User.objects.filter(stripe_customer_id=customer_id)
            
            if not users.exists():
                logger.warning(f"No se encontró usuario con customer_id: {customer_id}")
                return
            
            user = users.first()
            
            # Si el evento incluye un ID de suscripción, obtener más detalles
            if subscription_id:
                subscription = stripe.Subscription.retrieve(subscription_id)
                
                # Actualizar información de suscripción
                user.subscription_id = subscription_id
                user.subscription_status = subscription.status
                user.has_active_subscription = subscription.status == 'active'
                user.is_premium = subscription.status == 'active'
                
                # Actualizar fechas si están disponibles
                if hasattr(subscription, 'current_period_start'):
                    user.subscription_start_date = datetime.fromtimestamp(subscription.current_period_start)
                if hasattr(subscription, 'current_period_end'):
                    user.subscription_end_date = datetime.fromtimestamp(subscription.current_period_end)
                
                user.save()
                logger.info(f"Usuario {user.username} actualizado con suscripción {subscription_id}")
            else:
                logger.warning("El evento checkout.session.completed no incluye subscription_id")
        else:
            logger.warning("El evento checkout.session.completed no incluye customer_id")
            
    except Exception as e:
        logger.error(f"Error procesando checkout.session.completed: {e}")


def handle_invoice_paid(invoice):
    """
    Procesa el evento invoice.paid
    """
    try:
        # Obtener el ID del cliente y la suscripción
        customer_id = invoice.get('customer')
        subscription_id = invoice.get('subscription')
        
        logger.info(f"Factura pagada: customer_id={customer_id}, subscription_id={subscription_id}")
        
        if customer_id and subscription_id:
            # Buscar el usuario por el customer_id
            users = User.objects.filter(stripe_customer_id=customer_id)
            
            if not users.exists():
                logger.warning(f"No se encontró usuario con customer_id: {customer_id}")
                return
            
            user = users.first()
            
            # Obtener detalles de la suscripción
            subscription = stripe.Subscription.retrieve(subscription_id)
            
            # Actualizar información de suscripción
            user.subscription_id = subscription_id
            user.subscription_status = subscription.status
            user.has_active_subscription = subscription.status == 'active'
            user.is_premium = subscription.status == 'active'
            
            # Actualizar fechas si están disponibles
            if hasattr(subscription, 'current_period_start'):
                user.subscription_start_date = datetime.fromtimestamp(subscription.current_period_start)
            if hasattr(subscription, 'current_period_end'):
                user.subscription_end_date = datetime.fromtimestamp(subscription.current_period_end)
            
            user.save()
            logger.info(f"Usuario {user.username} actualizado con suscripción {subscription_id} (factura pagada)")
    
    except Exception as e:
        logger.error(f"Error procesando invoice.paid: {e}")


def handle_subscription_updated(subscription):
    """
    Procesa el evento customer.subscription.updated
    """
    try:
        # Obtener el ID del cliente
        customer_id = subscription.get('customer')
        subscription_id = subscription.get('id')
        status = subscription.get('status')
        
        logger.info(f"Suscripción actualizada: customer_id={customer_id}, subscription_id={subscription_id}, status={status}")
        
        if customer_id:
            # Buscar el usuario por el customer_id
            users = User.objects.filter(stripe_customer_id=customer_id)
            
            if not users.exists():
                logger.warning(f"No se encontró usuario con customer_id: {customer_id}")
                return
            
            user = users.first()
            
            # Actualizar información de suscripción
            user.subscription_id = subscription_id
            user.subscription_status = status
            user.has_active_subscription = status == 'active'
            user.is_premium = status == 'active'
            
            # Actualizar fechas si están disponibles
            if 'current_period_start' in subscription:
                user.subscription_start_date = datetime.fromtimestamp(subscription.get('current_period_start'))
            if 'current_period_end' in subscription:
                user.subscription_end_date = datetime.fromtimestamp(subscription.get('current_period_end'))
            
            user.save()
            logger.info(f"Usuario {user.username} actualizado con suscripción {subscription_id} (actualización)")
    
    except Exception as e:
        logger.error(f"Error procesando customer.subscription.updated: {e}")


def handle_subscription_deleted(subscription):
    """
    Procesa el evento customer.subscription.deleted
    """
    try:
        # Obtener el ID del cliente
        customer_id = subscription.get('customer')
        subscription_id = subscription.get('id')
        
        logger.info(f"Suscripción cancelada: customer_id={customer_id}, subscription_id={subscription_id}")
        
        if customer_id:
            # Buscar el usuario por el customer_id
            users = User.objects.filter(stripe_customer_id=customer_id)
            
            if not users.exists():
                logger.warning(f"No se encontró usuario con customer_id: {customer_id}")
                return
            
            user = users.first()
            
            # Actualizar información de suscripción
            if user.subscription_id == subscription_id:
                user.subscription_status = 'canceled'
                user.has_active_subscription = False
                user.is_premium = False
                user.subscription_end_date = timezone.now()
                
                user.save()
                logger.info(f"Usuario {user.username} actualizado con suscripción cancelada")
    
    except Exception as e:
        logger.error(f"Error procesando customer.subscription.deleted: {e}")
