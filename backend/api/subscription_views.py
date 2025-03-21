from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.conf import settings
import stripe
import logging
from .services import StripeService
from datetime import datetime

# Configurar logging
logger = logging.getLogger(__name__)

class UpdateSubscriptionView(views.APIView):
    """
    Endpoint para forzar la actualización de información de suscripción
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        user = request.user
        
        logger.info(f"Actualizando suscripción para usuario: {user.username}")
        
        if not user.stripe_customer_id:
            logger.warning(f"Usuario {user.username} no tiene customer_id")
            return Response({
                "error": "Usuario no tiene customer_id de Stripe"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Buscar suscripciones para este usuario
            subscriptions = stripe.Subscription.list(
                customer=user.stripe_customer_id,
                status='all',
                limit=1
            )
            
            if not subscriptions.data:
                logger.warning(f"No se encontraron suscripciones para usuario {user.username}")
                return Response({
                    "message": "No se encontraron suscripciones para este usuario"
                })
            
            # Tomar la suscripción más reciente
            subscription = subscriptions.data[0]
            logger.info(f"Suscripción encontrada: {subscription.id}, estado: {subscription.status}")
            
            # Actualizar el usuario
            user.subscription_id = subscription.id
            user.subscription_status = subscription.status
            
            # Verificar si la suscripción está activa
            is_active = subscription.status == 'active'
            user.has_active_subscription = is_active
            user.is_premium = is_active
            
            # Actualizar fechas de suscripción
            if hasattr(subscription, 'current_period_start'):
                user.subscription_start_date = datetime.fromtimestamp(subscription.current_period_start)
            
            if hasattr(subscription, 'current_period_end'):
                user.subscription_end_date = datetime.fromtimestamp(subscription.current_period_end)
            
            # Guardar cambios
            user.save()
            
            return Response({
                "has_subscription": is_active,
                "subscription_status": user.subscription_status,
                "start_date": user.subscription_start_date,
                "end_date": user.subscription_end_date
            })
            
        except stripe.error.StripeError as e:
            logger.error(f"Error de Stripe: {e}")
            return Response({
                "error": f"Error de Stripe: {e}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Error general: {e}")
            return Response({
                "error": f"Error inesperado: {e}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CreateCheckoutSessionView(views.APIView):
    """
    Endpoint para crear una sesión de checkout de Stripe
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        # Obtener URLs de redirección de los parámetros
        success_url = request.data.get('success_url')
        cancel_url = request.data.get('cancel_url')
        
        logger.info(f"Solicitud de creación de sesión de checkout recibida: success_url={success_url}, cancel_url={cancel_url}")
        
        if not success_url or not cancel_url:
            logger.error("URLs de redirección no proporcionadas")
            return Response(
                {"error": "Se requieren URLs de redirección"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Obtener o crear un price_id válido
            try:
                price_id = settings.STRIPE_PRICE_ID
                logger.info(f"Usando STRIPE_PRICE_ID de configuración: {price_id}")
            except Exception as e:
                logger.error(f"Error al obtener STRIPE_PRICE_ID: {e}")
                price_id = ""  # Valor por defecto para que falle de manera controlada
            
            # Si el price_id es inválido, intentar crear uno nuevo
            try:
                stripe.Price.retrieve(price_id)
            except stripe.error.InvalidRequestError:
                logger.warning(f"Price_id configurado inválido: {price_id}")
                price_id = StripeService.get_or_create_price()
                logger.info(f"Nuevo price_id obtenido: {price_id}")
            
            # Verificar si el usuario ya tiene un customer_id
            if not request.user.stripe_customer_id:
                logger.info(f"Usuario {request.user.username} no tiene customer_id, se creará uno nuevo")
            else:
                logger.info(f"Usuario {request.user.username} ya tiene customer_id: {request.user.stripe_customer_id}")
            
            # Crear sesión de checkout
            session = StripeService.create_checkout_session(
                user=request.user,
                price_id=price_id,
                success_url=success_url,
                cancel_url=cancel_url
            )
            
            logger.info(f"Sesión de checkout creada exitosamente: {session.id}")
            
            return Response({
                "session_id": session.id,
                "checkout_url": session.url
            })
        except stripe.error.StripeError as e:
            logger.error(f"Error de Stripe: {str(e)}")
            return Response(
                {"error": f"Error de Stripe: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            logger.error(f"Error inesperado: {str(e)}")
            return Response(
                {"error": f"Error inesperado: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SubscriptionStatusView(views.APIView):
    """
    Endpoint para verificar el estado de la suscripción
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        user = request.user
        
        if not user.subscription_id:
            return Response({
                "has_subscription": False,
                "subscription_status": None
            })
        
        # Verificar estado actual
        is_active = StripeService.check_subscription_status(user)
        
        return Response({
            "has_subscription": is_active,
            "subscription_status": user.subscription_status,
            "start_date": user.subscription_start_date,
            "end_date": user.subscription_end_date
        })


class CancelSubscriptionView(views.APIView):
    """
    Endpoint para cancelar una suscripción
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        user = request.user
        
        if not user.subscription_id:
            return Response(
                {"error": "No hay suscripción activa"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        success = StripeService.cancel_subscription(user)
        
        if success:
            return Response({"status": "Suscripción cancelada correctamente"})
        else:
            return Response(
                {"error": "Error al cancelar la suscripción"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
