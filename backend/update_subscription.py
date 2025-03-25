#!/usr/bin/env python
import os
import django
import sys
import logging
import stripe
from datetime import datetime

# Configurar entorno Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
from api.models import User

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configurar API key de Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

def update_subscription_for_customer(customer_id=None, username=None, all_users=False):
    """
    Actualiza la información de suscripción para un usuario específico o todos los usuarios
    """
    if all_users:
        users = User.objects.filter(stripe_customer_id__isnull=False)
        logger.info(f"Actualizando suscripciones para {users.count()} usuarios con customer_id")
    elif customer_id:
        users = User.objects.filter(stripe_customer_id=customer_id)
        logger.info(f"Buscando usuario con customer_id: {customer_id}")
    elif username:
        users = User.objects.filter(username=username)
        logger.info(f"Buscando usuario con username: {username}")
    else:
        logger.error("Debe proporcionar un customer_id, username o usar all_users=True")
        return
    
    for user in users:
        logger.info(f"Procesando usuario: {user.username} (customer_id: {user.stripe_customer_id})")
        
        try:
            # Buscar suscripciones activas para este cliente
            subscriptions = stripe.Subscription.list(
                customer=user.stripe_customer_id,
                status='all',
                limit=1
            )
            
            if not subscriptions.data:
                logger.info(f"No se encontraron suscripciones para el usuario {user.username}")
                continue
            
            # Tomar la suscripción más reciente
            subscription = subscriptions.data[0]
            logger.info(f"Suscripción encontrada: {subscription.id}, estado: {subscription.status}")
            
            # Actualizar el usuario con la información de la suscripción
            user.subscription_id = subscription.id
            user.subscription_status = subscription.status
            
            # Verificar si la suscripción está activa
            is_active = subscription.status == 'active'
            user.has_active_subscription = is_active
            user.is_premium = is_active
            
            # Actualizar fechas de suscripción
            if hasattr(subscription, 'current_period_start'):
                user.subscription_start_date = datetime.fromtimestamp(subscription.current_period_start)
                logger.info(f"Fecha de inicio: {user.subscription_start_date}")
            
            if hasattr(subscription, 'current_period_end'):
                user.subscription_end_date = datetime.fromtimestamp(subscription.current_period_end)
                logger.info(f"Fecha de fin: {user.subscription_end_date}")
            
            # Guardar cambios
            user.save()
            logger.info(f"Usuario {user.username} actualizado correctamente")
            
        except stripe.error.StripeError as e:
            logger.error(f"Error de Stripe para usuario {user.username}: {e}")
        except Exception as e:
            logger.error(f"Error general para usuario {user.username}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python update_subscription.py [customer_id|username|all]")
        sys.exit(1)
    
    param = sys.argv[1]
    
    if param == 'all':
        update_subscription_for_customer(all_users=True)
    elif param.startswith('cus_'):
        update_subscription_for_customer(customer_id=param)
    else:
        update_subscription_for_customer(username=param)
