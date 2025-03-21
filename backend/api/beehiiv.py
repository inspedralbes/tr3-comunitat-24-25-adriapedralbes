"""
Módulo para la integración con Beehiiv API v2.
Proporciona funciones para gestionar suscriptores en la plataforma Beehiiv.
"""
import requests
import json
import logging
import time
from django.conf import settings
from datetime import datetime

logger = logging.getLogger(__name__)

def add_subscriber_to_beehiiv(email, name=None, source="API", is_confirmed=True, ip_address=None, max_retries=2):
    """
    Agrega un suscriptor a Beehiiv usando su API v2.
    
    Args:
        email (str): Email del suscriptor
        name (str, optional): Nombre del suscriptor. Defaults to None.
        source (str, optional): Fuente de la suscripción. Defaults to "API".
        is_confirmed (bool, optional): Si el suscriptor ha confirmado su suscripción. Defaults to True.
        ip_address (str, optional): Dirección IP del suscriptor para mayor trazabilidad. Defaults to None.
        max_retries (int, optional): Número máximo de reintentos en caso de error. Defaults to 2.
    
    Returns:
        tuple: (success, message) - si fue exitoso y un mensaje de respuesta
    """
    api_key = settings.BEEHIIV_API_KEY
    publication_id = settings.BEEHIIV_PUBLICATION_ID
    
    # Registro detallado para depuración
    logger.info(f"[BEEHIIV] Intentando agregar: {email} a Beehiiv")
    logger.debug(f"[BEEHIIV] Publication ID: {publication_id}")
    
    # Verificar que tengamos configuración
    if not api_key or not publication_id:
        logger.error("Falta configuración de Beehiiv. Verifica BEEHIIV_API_KEY y BEEHIIV_PUBLICATION_ID en settings.")
        return False, "Falta configuración de Beehiiv."
    
    # Asegurar que el publication_id tiene el formato correcto con prefijo 'pub_'
    if not publication_id.startswith('pub_'):
        publication_id = f"pub_{publication_id}"
        logger.info(f"[BEEHIIV] Añadido prefijo 'pub_' al ID de publicación: {publication_id}")
    
    # URL de la API de Beehiiv para crear suscriptores (v2)
    url = f"https://api.beehiiv.com/v2/publications/{publication_id}/subscriptions"
    
    # Encabezados con la autenticación
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    # Timestamp actual para la API
    current_timestamp = int(datetime.now().timestamp())
    
    # Datos del suscriptor - siguiendo la documentación de la API v2
    subscription_data = {
        "email": email,
        "reactivate_existing": True,  # Reactivar si existe pero estaba desuscrito
        "consent_status": {
            "status": "express",
            "proof": {
                "source": source,
                "ip_address": ip_address,
                "timestamp": current_timestamp,
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
    
    logger.debug(f"[BEEHIIV] Datos a enviar: {json.dumps(subscription_data)}")
    
    # Sistema de reintentos con backoff exponencial
    retry_count = 0
    while retry_count <= max_retries:
        try:
            # Hacer la solicitud a la API con un timeout reducido
            # Usar un timeout aún más agresivo para producción
            response = requests.post(
                url, 
                headers=headers,
                json=subscription_data,
                timeout=3  # Timeout reducido a 3 segundos para evitar bloqueos
            )
            
            # Imprimir respuesta completa para depuración
            logger.debug(f"[BEEHIIV] Código de estado: {response.status_code}")
            
            # Verificar la respuesta
            if response.status_code in [200, 201]:
                logger.info(f"[BEEHIIV] Suscriptor {email} agregado a Beehiiv correctamente.")
                return True, "Suscriptor agregado a Beehiiv correctamente."
            elif response.status_code == 429:  # Rate limit
                retry_after = int(response.headers.get('Retry-After', 60))
                logger.warning(f"[BEEHIIV] Rate limit alcanzado. Esperando {retry_after} segundos.")
                time.sleep(min(retry_after, 60))  # Esperar como máximo 60 segundos
                retry_count += 1
                continue
            else:
                error_msg = f"Error al agregar suscriptor a Beehiiv: {response.status_code} - {response.text}"
                logger.error(error_msg)
                
                # Si llegamos al máximo de reintentos, devolvemos el error
                if retry_count >= max_retries:
                    return False, error_msg
                
                # Aumentar el contador de reintentos y esperar
                retry_count += 1
                backoff_time = 2 ** retry_count  # Backoff exponencial: 2, 4, 8...
                logger.info(f"[BEEHIIV] Reintentando en {backoff_time} segundos (intento {retry_count}/{max_retries})")
                time.sleep(backoff_time)
                
        except requests.exceptions.Timeout:
            logger.warning(f"[BEEHIIV] Timeout al conectar con Beehiiv. Reintento {retry_count+1}/{max_retries+1}")
            if retry_count >= max_retries:
                return False, "Timeout al conectar con Beehiiv después de varios intentos."
            retry_count += 1
            backoff_time = 2 ** retry_count
            time.sleep(backoff_time)
            
        except Exception as e:
            error_msg = f"Excepción al agregar suscriptor a Beehiiv: {str(e)}"
            logger.exception(error_msg)
            return False, error_msg
    
    # Si llegamos aquí es porque agotamos los reintentos
    return False, "Fallo al comunicarse con Beehiiv después de múltiples intentos."


def get_subscriber_from_beehiiv(email):
    """
    Obtiene información de un suscriptor desde Beehiiv.
    
    Args:
        email (str): Email del suscriptor a consultar
    
    Returns:
        tuple: (success, data) - éxito de la operación y datos del suscriptor o mensaje de error
    """
    api_key = settings.BEEHIIV_API_KEY
    publication_id = settings.BEEHIIV_PUBLICATION_ID
    
    # Verificar que tengamos configuración
    if not api_key or not publication_id:
        logger.error("Falta configuración de Beehiiv.")
        return False, "Falta configuración de Beehiiv."
    
    # Asegurar que el publication_id tiene el formato correcto
    if not publication_id.startswith('pub_'):
        publication_id = f"pub_{publication_id}"
    
    # URL para buscar suscriptor por email
    url = f"https://api.beehiiv.com/v2/publications/{publication_id}/subscriptions"
    
    # Parámetros de búsqueda
    params = {
        "email": email
    }
    
    # Encabezados con la autenticación
    headers = {
        "Accept": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    try:
        # Hacer la solicitud a la API
        response = requests.get(
            url,
            headers=headers,
            params=params,
            timeout=5
        )
        
        # Verificar la respuesta
        if response.status_code == 200:
            data = response.json()
            logger.info(f"Información del suscriptor {email} obtenida correctamente.")
            return True, data
        else:
            error_msg = f"Error al obtener información del suscriptor: {response.status_code} - {response.text}"
            logger.error(error_msg)
            return False, error_msg
            
    except Exception as e:
        error_msg = f"Excepción al obtener información del suscriptor: {str(e)}"
        logger.exception(error_msg)
        return False, error_msg
