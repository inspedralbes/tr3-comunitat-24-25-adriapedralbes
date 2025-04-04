#!/usr/bin/env python
"""
Script para probar la conexión con Beehiiv
"""
import os
import sys
import requests
import json
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def test_beehiiv_connection():
    """Prueba la conexión con la API de Beehiiv"""
    api_key = os.environ.get('BEEHIIV_API_KEY')
    publication_id = os.environ.get('BEEHIIV_PUBLICATION_ID')
    
    print("\n=== Prueba de Conexión a Beehiiv ===")
    print(f"API Key (primeros 5 caracteres): {api_key[:5]}...")
    print(f"Publication ID: {publication_id}")
    
    if not api_key or not publication_id:
        print("ERROR: Falta configuración. Verifica BEEHIIV_API_KEY y BEEHIIV_PUBLICATION_ID")
        return
    
    # URL para probar conexión (lista de suscriptores)
    url = f"https://api.beehiiv.com/v2/publications/{publication_id}/subscriptions"
    
    # Encabezados con autenticación
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    
    print(f"\nRealizando solicitud a: {url}")
    
    try:
        # Intentar obtener la lista de suscriptores (solo para probar conexión)
        response = requests.get(url, headers=headers)
        
        print(f"Código de respuesta: {response.status_code}")
        if response.status_code in [200, 201]:
            print("✅ Conexión exitosa a Beehiiv API!")
            
            # Ver primeros resultados (si hay)
            data = response.json()
            if 'data' in data and len(data['data']) > 0:
                print(f"\nTotal de suscriptores: {data.get('total', 'N/A')}")
                print("\nPrimeros suscriptores en la lista:")
                for i, sub in enumerate(data['data'][:3]):
                    print(f"  {i+1}. {sub.get('email', 'No email')} - Status: {sub.get('status', 'Unknown')}")
            else:
                print("\nNo se encontraron suscriptores o formato de respuesta inesperado")
        else:
            print(f"❌ Error al conectar: {response.status_code}")
            print(f"Respuesta: {response.text}")
            
            # Si es 404, probar con formato alternativo de ID
            if response.status_code == 404 and not publication_id.startswith('pub_'):
                alt_publication_id = f"pub_{publication_id}"
                alt_url = f"https://api.beehiiv.com/v2/publications/{alt_publication_id}/subscriptions"
                
                print(f"\nIntentando con ID alternativo: {alt_publication_id}")
                alt_response = requests.get(alt_url, headers=headers)
                
                print(f"Código de respuesta alternativo: {alt_response.status_code}")
                if alt_response.status_code in [200, 201]:
                    print("✅ Conexión exitosa con ID alternativo!")
                    print(f"⚠ Recomendación: Actualiza tu BEEHIIV_PUBLICATION_ID a: {alt_publication_id}")
                else:
                    print(f"❌ Error con ID alternativo: {alt_response.text}")
            
    except Exception as e:
        print(f"❌ Excepción: {str(e)}")

def test_subscription():
    """Prueba la creación de un suscriptor de prueba"""
    api_key = os.environ.get('BEEHIIV_API_KEY')
    publication_id = os.environ.get('BEEHIIV_PUBLICATION_ID')
    
    if not api_key or not publication_id:
        print("ERROR: Falta configuración. Verifica BEEHIIV_API_KEY y BEEHIIV_PUBLICATION_ID")
        return
    
    # Ajustar el ID si es necesario
    if not publication_id.startswith('pub_'):
        print(f"⚠ Ajustando formato de ID: {publication_id} -> pub_{publication_id}")
        publication_id = f"pub_{publication_id}"
    
    # URL para crear suscriptor
    url = f"https://api.beehiiv.com/v2/publications/{publication_id}/subscriptions"
    
    # Encabezados con autenticación
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    
    # Datos del suscriptor de prueba
    test_email = "test_prueba_temp@futurprive.com"
    
    subscription_data = {
        "email": test_email,
        "reactivate_existing": True,
        "consent_status": {
            "status": "express",
            "proof": {
                "source": "API Test Script",
                "timestamp": None,
            }
        },
        "status": "active",
        "custom_fields": [{"name": "first_name", "value": "Usuario Prueba"}]
    }
    
    print(f"\n=== Creando suscriptor de prueba ===")
    print(f"Email: {test_email}")
    
    try:
        # Intentar crear suscriptor
        response = requests.post(
            url, 
            headers=headers,
            json=subscription_data
        )
        
        print(f"Código de respuesta: {response.status_code}")
        if response.status_code in [200, 201]:
            print("✅ Suscriptor de prueba creado con éxito!")
            data = response.json()
            print(json.dumps(data, indent=2))
        else:
            print(f"❌ Error al crear suscriptor: {response.text}")
            
    except Exception as e:
        print(f"❌ Excepción: {str(e)}")

if __name__ == "__main__":
    test_beehiiv_connection()
    test_subscription()
