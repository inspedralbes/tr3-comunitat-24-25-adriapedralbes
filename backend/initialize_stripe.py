#!/usr/bin/env python
import os
import django
import sys

# Configurar entorno Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

import stripe
from django.conf import settings

# Configurar API key de Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

print(f"Inicializando Stripe con clave: {stripe.api_key[:5]}...")

def create_stripe_product_and_price():
    """Crea un producto y un precio en Stripe para usar con suscripciones"""
    
    try:
        # Verificar si ya existe el product_id en settings
        product_id = settings.STRIPE_PRODUCT_ID
        price_id = settings.STRIPE_PRICE_ID
        
        # Si ambos existen, intentar recuperarlos
        if product_id and price_id:
            try:
                product = stripe.Product.retrieve(product_id)
                price = stripe.Price.retrieve(price_id)
                print(f"Producto existente: {product.name} (ID: {product.id})")
                print(f"Precio existente: {price.unit_amount/100} {price.currency} (ID: {price.id})")
                return product.id, price.id
            except stripe.error.InvalidRequestError:
                # Si no se pueden recuperar, crear nuevos
                print("No se pudieron recuperar el producto o precio existentes. Creando nuevos...")
        
        # Crear un nuevo producto
        product = stripe.Product.create(
            name="Suscripción TR3 Comunitat",
            description="Acceso mensual a la plataforma TR3 Comunitat"
        )
        print(f"Producto creado: {product.name} (ID: {product.id})")
        
        # Crear un nuevo precio (20€ mensual)
        price = stripe.Price.create(
            product=product.id,
            unit_amount=2000,  # 20.00€ en centavos
            currency="eur",
            recurring={"interval": "month"}
        )
        print(f"Precio creado: {price.unit_amount/100} {price.currency} (ID: {price.id})")
        
        print("\nActualiza tu archivo .env con estos valores:")
        print(f"STRIPE_PRODUCT_ID={product.id}")
        print(f"STRIPE_PRICE_ID={price.id}")
        
        return product.id, price.id
        
    except stripe.error.StripeError as e:
        print(f"Error de Stripe: {e}")
        return None, None
    except Exception as e:
        print(f"Error inesperado: {e}")
        return None, None

if __name__ == "__main__":
    product_id, price_id = create_stripe_product_and_price()
    
    if product_id and price_id:
        print("\nStripe inicializado correctamente.")
    else:
        print("\nError al inicializar Stripe.")
        sys.exit(1)
