import stripe
import json
import logging
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta

# Configurar logging
logger = logging.getLogger(__name__)

# Configurar Stripe API key
stripe.api_key = settings.STRIPE_SECRET_KEY
logger.info(f"Stripe API Key configurada: {stripe.api_key[:5]}...")

class StripeService:
    """Servicio para interactuar con la API de Stripe"""
    
    @staticmethod
    def get_or_create_price():
        """
        Obtiene un precio válido o crea uno nuevo si no existe
        """
        try:
            # Primero intentar usar el configurado en settings
            price_id = settings.STRIPE_PRICE_ID
            try:
                price = stripe.Price.retrieve(price_id)
                logger.info(f"Usando price_id existente: {price_id}")
                return price_id
            except stripe.error.InvalidRequestError:
                # El price_id configurado no existe
                logger.warning(f"Price_id configurado no encontrado: {price_id}, creando uno nuevo")
                pass
                
            # Crear un nuevo producto
            product = stripe.Product.create(
                name="Suscripción TR3 Comunitat",
                description="Acceso mensual a la plataforma TR3 Comunitat"
            )
            logger.info(f"Producto creado: {product.id}")
            
            # Crear un nuevo precio
            new_price = stripe.Price.create(
                product=product.id,
                unit_amount=2000,  # 20.00€ en centavos
                currency="eur",
                recurring={"interval": "month"}
            )
            logger.info(f"Nuevo precio creado: {new_price.id}")
            
            return new_price.id
        except Exception as e:
            logger.error(f"Error al obtener o crear precio: {e}")
            raise Exception(f"Error al obtener o crear precio: {e}")
    
    @staticmethod
    def create_customer(user):
        """
        Crea un cliente en Stripe para un usuario
        """
        if user.stripe_customer_id:
            return user.stripe_customer_id
            
        customer = stripe.Customer.create(
            email=user.email,
            name=f"{user.first_name} {user.last_name}".strip() or user.username,
            metadata={
                'user_id': str(user.id),
                'username': user.username
            }
        )
        
        # Guardar ID de cliente Stripe en el usuario
        user.stripe_customer_id = customer.id
        user.save(update_fields=['stripe_customer_id'])
        
        return customer.id
    
    @staticmethod
    def create_subscription(user, price_id):
        """
        Crea una suscripción para un usuario
        """
        # Asegurar que el usuario tiene un customer_id
        if not user.stripe_customer_id:
            StripeService.create_customer(user)
            
        # Crear suscripción
        subscription = stripe.Subscription.create(
            customer=user.stripe_customer_id,
            items=[
                {"price": price_id},
            ],
            payment_behavior='default_incomplete',
            expand=['latest_invoice.payment_intent'],
        )
        
        # Guardar información de suscripción
        user.subscription_id = subscription.id
        user.subscription_status = subscription.status
        
        # Si la suscripción está activa
        if subscription.status == 'active':
            user.has_active_subscription = True
            # Convertir timestamps a datetime
            user.subscription_start_date = datetime.fromtimestamp(subscription.current_period_start)
            user.subscription_end_date = datetime.fromtimestamp(subscription.current_period_end)
            user.is_premium = True
            
        user.save()
        
        return subscription
    
    @staticmethod
    def create_checkout_session(user, price_id, success_url, cancel_url):
        """
        Crea una sesión de checkout para un usuario
        """
        try:
            logger.info(f"Creando sesión de checkout para el usuario {user.username} con price_id {price_id}")
            
            # Asegurar que el usuario tiene un customer_id
            if not user.stripe_customer_id:
                customer_id = StripeService.create_customer(user)
                logger.info(f"Cliente Stripe creado: {customer_id}")
            else:
                logger.info(f"Usuario ya tiene customer_id: {user.stripe_customer_id}")
                
            # Verificar que el price_id existe o crear uno nuevo
            try:
                # Intentar recuperar el precio para validar que existe
                stripe.Price.retrieve(price_id)
                logger.info(f"Price_id válido confirmado: {price_id}")
            except stripe.error.InvalidRequestError as e:
                logger.error(f"Price_id inválido: {e}")
                # Obtener o crear un precio válido
                price_id = StripeService.get_or_create_price()
                logger.info(f"Usando nuevo price_id: {price_id}")
            
            logger.info(f"Creando checkout session con URLs: success={success_url}, cancel={cancel_url}")
            
            # Crear la sesión con parámetros de depuración adicionales
            checkout_session = stripe.checkout.Session.create(
                customer=user.stripe_customer_id,
                payment_method_types=['card'],
                line_items=[
                    {
                        'price': price_id,
                        'quantity': 1,
                    },
                ],
                mode='subscription',
                success_url=success_url,
                cancel_url=cancel_url,
                # Cliente metadata adicional para depuración
                metadata={
                    'user_id': str(user.id),
                    'username': user.username,
                    'env': 'development' if settings.DEBUG else 'production'
                }
            )
            
            logger.info(f"Checkout session creada exitosamente: {checkout_session.id}")
            return checkout_session
        except stripe.error.StripeError as e:
            logger.error(f"Error de Stripe al crear sesión de checkout: {str(e)}")
            raise Exception(f"Error de Stripe: {str(e)}")
        except Exception as e:
            logger.error(f"Error general al crear sesión de checkout: {str(e)}")
            raise
    
    @staticmethod
    def cancel_subscription(user):
        """
        Cancela la suscripción de un usuario
        """
        if not user.subscription_id:
            return False
            
        try:
            # Cancelar inmediatamente
            stripe.Subscription.delete(user.subscription_id)
            
            # Actualizar usuario
            user.has_active_subscription = False
            user.is_premium = False
            user.subscription_status = 'canceled'
            user.subscription_end_date = timezone.now()
            user.save()
            
            return True
        except stripe.error.StripeError as e:
            logger.error(f"Error al cancelar suscripción: {e}")
            return False
    
    @staticmethod
    def check_subscription_status(user):
        """
        Verifica el estado de la suscripción de un usuario y actualiza la base de datos
        """
        # Si el usuario es superadmin, siempre tiene suscripción activa
        if user.is_superuser:
            logger.info(f"Verificación de suscripción para superusuario {user.username} - acceso garantizado")
            # Asegurar que el superusuario tenga los campos correctamente configurados
            user.has_active_subscription = True
            user.is_premium = True
            user.subscription_status = 'active'
            
            # Si no tiene fechas establecidas, establecerlas
            if not user.subscription_start_date:
                user.subscription_start_date = timezone.now()
            if not user.subscription_end_date:
                user.subscription_end_date = timezone.now() + timedelta(days=365)
                
            user.save()
            return True
            
        if not user.subscription_id:
            return False
            
        try:
            subscription = stripe.Subscription.retrieve(user.subscription_id)
            
            # Actualizar estado
            user.subscription_status = subscription.status
            
            # Verificar si está activa
            is_active = subscription.status == 'active'
            user.has_active_subscription = is_active
            user.is_premium = is_active
            
            # Actualizar fechas
            if subscription.status == 'active':
                user.subscription_start_date = datetime.fromtimestamp(subscription.current_period_start)
                user.subscription_end_date = datetime.fromtimestamp(subscription.current_period_end)
            
            user.save()
            
            return is_active
        except stripe.error.StripeError as e:
            logger.error(f"Error al verificar suscripción: {e}")
            return False
