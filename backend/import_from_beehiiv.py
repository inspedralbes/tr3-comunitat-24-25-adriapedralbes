#!/usr/bin/env python
"""
Script para importar suscriptores desde Beehiiv a la base de datos de Django
"""
import os
import sys
import django
import requests
import json
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Importar después de configurar Django
from api.models import Subscriber
import uuid

def fetch_subscribers_from_beehiiv(page=1, subscribers=None):
    """Obtiene los suscriptores de Beehiiv paginando a través de la API"""
    if subscribers is None:
        subscribers = []
    
    api_key = os.environ.get('BEEHIIV_API_KEY')
    publication_id = os.environ.get('BEEHIIV_PUBLICATION_ID')
    
    if not api_key or not publication_id:
        print("ERROR: Falta configuración de Beehiiv. Verifica BEEHIIV_API_KEY y BEEHIIV_PUBLICATION_ID")
        return []
    
    # Asegurarse de que el ID tiene el formato correcto
    if not publication_id.startswith('pub_'):
        publication_id = f"pub_{publication_id}"
    
    # URL de la API de Beehiiv para listar suscriptores
    url = f"https://api.beehiiv.com/v2/publications/{publication_id}/subscriptions"
    
    # Parámetros de paginación
    params = {
        'limit': 100,  # Máximo por página
        'page': page
    }
    
    # Encabezados con la autenticación
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    
    try:
        # Obtener suscriptores de la página actual
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            data = response.json()
            page_subscribers = data.get('data', [])
            subscribers.extend(page_subscribers)
            
            # Verificar si hay más páginas
            current_page = data.get('page', 1)
            total_pages = data.get('pages', 1)
            
            print(f"Obtenida página {current_page} de {total_pages} ({len(page_subscribers)} suscriptores)")
            
            # Si hay más páginas, hacer recursión
            if current_page < total_pages:
                return fetch_subscribers_from_beehiiv(page + 1, subscribers)
            
        else:
            print(f"Error al obtener suscriptores: {response.status_code} - {response.text}")
    
    except Exception as e:
        print(f"Excepción al obtener suscriptores: {str(e)}")
    
    return subscribers

def import_subscribers():
    """Importa suscriptores desde Beehiiv a la base de datos de Django"""
    print("\n=== Importando Suscriptores desde Beehiiv ===")
    
    # Obtener suscriptores de Beehiiv
    beehiiv_subscribers = fetch_subscribers_from_beehiiv()
    print(f"\nTotal de suscriptores obtenidos de Beehiiv: {len(beehiiv_subscribers)}")
    
    if not beehiiv_subscribers:
        print("No se encontraron suscriptores para importar.")
        return
    
    # Importar suscriptores a la base de datos
    imported_count = 0
    already_exists_count = 0
    
    for sub in beehiiv_subscribers:
        email = sub.get('email')
        status = sub.get('status', 'unknown')
        
        # Obtener nombre de campos personalizados si existe
        name = None
        if 'custom_fields' in sub and sub['custom_fields']:
            for field in sub['custom_fields']:
                if field.get('name') == 'first_name':
                    name = field.get('value')
                    break
        
        print(f"Procesando: {email} - Status: {status}")
        
        # Verificar si ya existe
        existing = Subscriber.objects.filter(email=email).first()
        
        if existing:
            # Actualizar información existente
            already_exists_count += 1
            if not existing.confirmed and status == 'active':
                existing.confirmed = True
                existing.save(update_fields=['confirmed'])
                print(f"  ✅ {email}: Actualizado status a confirmed=True")
            else:
                print(f"  ⏭ {email}: Ya existe, no se requieren cambios")
        else:
            # Crear nuevo suscriptor
            try:
                Subscriber.objects.create(
                    email=email,
                    name=name or "",
                    confirmed=status == 'active',
                    confirmation_token=str(uuid.uuid4())
                )
                imported_count += 1
                print(f"  ✅ {email}: Importado correctamente")
            except Exception as e:
                print(f"  ❌ {email}: Error al importar: {str(e)}")
    
    print(f"\n=== Resumen de Importación ===")
    print(f"Total de suscriptores procesados: {len(beehiiv_subscribers)}")
    print(f"Suscriptores importados: {imported_count}")
    print(f"Suscriptores ya existentes: {already_exists_count}")

if __name__ == "__main__":
    import_subscribers()
