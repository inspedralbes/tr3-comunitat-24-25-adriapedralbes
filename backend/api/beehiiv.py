import requests
import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def add_subscriber_to_beehiiv(email, name=None, source="API", is_confirmed=True):
    """
    Agrega un suscriptor a Beehiiv usando su API.
    
    Args:
        email (str): Email del suscriptor
        name (str, optional): Nombre del suscriptor. Defaults to None.
        source (str, optional): Fuente de la suscripción. Defaults to "API".
        is_confirmed (bool, optional): Si el suscriptor ha confirmado su suscripción. Defaults to True.
    
    Returns:
        tuple: (success, message) - si fue exitoso y un mensaje de respuesta
    """
    api_key = settings.BEEHIIV_API_KEY
    publication_id = settings.BEEHIIV_PUBLICATION_ID
    
    # Registro detallado para depuración
    print(f"[BEEHIIV DEBUG] Intentando agregar: {email} a Beehiiv")
    print(f"[BEEHIIV DEBUG] API Key (primeros 10 chars): {api_key[:10]}...")
    print(f"[BEEHIIV DEBUG] Publication ID: {publication_id}")
    
    # Verificar que tengamos configuración
    if not api_key or not publication_id:
        logger.error("Falta configuración de Beehiiv. Verifica BEEHIIV_API_KEY y BEEHIIV_PUBLICATION_ID en settings.")
        return False, "Falta configuración de Beehiiv."
    
    # URL de la API de Beehiiv para crear suscriptores (v2)
    url = f"https://api.beehiiv.com/v2/publications/{publication_id}/subscriptions"
    print(f"[BEEHIIV DEBUG] URL: {url}")
    
    # Encabezados con la autenticación
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    print(f"[BEEHIIV DEBUG] Headers: {json.dumps({k: '****' if k == 'Authorization' else v for k, v in headers.items()}, indent=2)}")
    
    # Datos del suscriptor - siguiendo la documentación de la API v2
    subscription_data = {
        "email": email,
        "reactivate_existing": True,  # Reactivar si existe pero estaba desuscrito
        "consent_status": {
            "status": "express",
            "proof": {
                "source": source,
                "ip_address": None,  # Se puede añadir si está disponible en el request
                "timestamp": None,  # Se puede añadir si es necesario
            }
        },
        "referring_site": settings.SITE_URL,
        "send_welcome_email": False,  # Ya enviamos nuestro propio email de bienvenida
        "status": "active" if is_confirmed else "pending"
    }
    
    # Añadir nombre si está disponible
    if name:
        subscription_data["custom_fields"] = [
            {
                "name": "first_name",
                "value": name
            }
        ]
    
    print(f"[BEEHIIV DEBUG] Datos a enviar: {json.dumps(subscription_data, indent=2)}")
    
    try:
        # Hacer la solicitud a la API con un timeout reducido
        response = requests.post(
            url, 
            headers=headers,
            json=subscription_data,
            timeout=5  # Timeout de 5 segundos para evitar bloqueos
        )
        
        # Imprimir respuesta completa para depuración
        print(f"[BEEHIIV DEBUG] Código de estado: {response.status_code}")
        print(f"[BEEHIIV DEBUG] Respuesta: {response.text}")
        
        # Si hay un error de 404, puede ser que el formato del ID es incorrecto, intentar con el prefijo 'pub_'
        if response.status_code == 404 and not publication_id.startswith('pub_'):
            print(f"[BEEHIIV DEBUG] Intentando con formato alternativo del ID de publicación")
            alt_publication_id = f"pub_{publication_id}"
            alt_url = f"https://api.beehiiv.com/v2/publications/{alt_publication_id}/subscriptions"
            print(f"[BEEHIIV DEBUG] URL alternativa: {alt_url}")
            
            # Hacer la solicitud con el ID alternativo
            alt_response = requests.post(
                alt_url, 
                headers=headers,
                json=subscription_data
            )
            
            print(f"[BEEHIIV DEBUG] Código de estado alternativo: {alt_response.status_code}")
            print(f"[BEEHIIV DEBUG] Respuesta alternativa: {alt_response.text}")
            
            # Usar la respuesta alternativa si tuvo éxito
            if alt_response.status_code in [200, 201]:
                response = alt_response
        
        # Verificar la respuesta
        if response.status_code in [200, 201]:
            logger.info(f"Suscriptor {email} agregado a Beehiiv correctamente.")
            return True, "Suscriptor agregado a Beehiiv correctamente."
        else:
            error_msg = f"Error al agregar suscriptor a Beehiiv: {response.status_code} - {response.text}"
            logger.error(error_msg)
            return False, error_msg
            
    except Exception as e:
        error_msg = f"Excepción al agregar suscriptor a Beehiiv: {str(e)}"
        logger.exception(error_msg)
        print(f"[BEEHIIV DEBUG] Excepción: {str(e)}")
        return False, error_msg
