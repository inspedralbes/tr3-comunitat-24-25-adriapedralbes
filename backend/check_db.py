#!/usr/bin/env python
"""
Script para verificar el estado de los suscriptores en la base de datos
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Importar después de configurar Django
from api.models import Subscriber

def check_subscribers():
    """Verifica el estado de los suscriptores en la base de datos"""
    # Contar suscriptores
    total_count = Subscriber.objects.count()
    confirmed_count = Subscriber.objects.filter(confirmed=True).count()
    unconfirmed_count = Subscriber.objects.filter(confirmed=False).count()
    
    print(f"\n=== Estado de Suscriptores en la Base de Datos ===")
    print(f"Total de suscriptores: {total_count}")
    print(f"Suscriptores confirmados: {confirmed_count}")
    print(f"Suscriptores no confirmados: {unconfirmed_count}")
    
    # Mostrar algunos suscriptores de ejemplo
    if total_count > 0:
        print("\nPrimeros 5 suscriptores:")
        for i, subscriber in enumerate(Subscriber.objects.all()[:5]):
            print(f"  {i+1}. {subscriber.email} - Confirmado: {subscriber.confirmed}")

if __name__ == "__main__":
    check_subscribers()
