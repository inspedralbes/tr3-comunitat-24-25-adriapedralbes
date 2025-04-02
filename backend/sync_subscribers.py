#!/usr/bin/env python
"""
Script para sincronizar los suscriptores de la base de datos local a Beehiiv
"""
import os
import sys
import django
from dotenv import load_dotenv

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Importar después de configurar Django
from api.models import Subscriber
from api.beehiiv import add_subscriber_to_beehiiv

# Cargar variables de entorno
load_dotenv()

def sync_subscribers():
    """Sincroniza los suscriptores confirmados a Beehiiv"""
    # Obtener suscriptores confirmados que necesitan sincronización
    subscribers = Subscriber.objects.filter(confirmed=True)
    
    print(f"\n=== Sincronización de Suscriptores a Beehiiv ===")
    print(f"Total de suscriptores confirmados: {subscribers.count()}")
    
    success_count = 0
    error_count = 0
    
    for subscriber in subscribers:
        print(f"\nProcesando suscriptor: {subscriber.email}")
        
        try:
            success, message = add_subscriber_to_beehiiv(
                email=subscriber.email,
                name=subscriber.name,
                source="FuturPrive Newsletter - Sync",
                is_confirmed=True
            )
            
            if success:
                success_count += 1
                print(f"✅ {subscriber.email}: {message}")
            else:
                error_count += 1
                print(f"❌ {subscriber.email}: {message}")
                
        except Exception as e:
            error_count += 1
            print(f"❌ Error con {subscriber.email}: {str(e)}")
    
    print(f"\n=== Resumen de Sincronización ===")
    print(f"Suscriptores procesados: {subscribers.count()}")
    print(f"Exitosos: {success_count}")
    print(f"Errores: {error_count}")

if __name__ == "__main__":
    sync_subscribers()
