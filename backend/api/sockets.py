"""
Implementación para emitir actualizaciones de ranking mediante Server-Sent Events (SSE).
Esta versión implementa un patrón de broadcast para asegurar que todos los clientes
reciban las mismas actualizaciones.
"""
import logging
import json
import threading
import queue
import time
from django.conf import settings
from collections import deque

# Configurar logger
logger = logging.getLogger(__name__)

# Cola de mensajes para broadcast a todos los clientes
broadcast_queue = deque(maxlen=100)  # Mantener los últimos 100 mensajes

# Control de clientes
client_queues = {}  # Diccionario para mantener colas individuales por cliente
client_lock = threading.Lock()  # Lock para operaciones thread-safe en el diccionario

def emit_ranking_update(user_data):
    """
    Emite una actualización de ranking a todos los clientes conectados.
    
    Params:
        user_data: diccionario con datos de usuario actualizado incluyendo
                  id, username, points, position, etc.
    """
    logger.info(f"Emitiendo actualización de ranking para usuario: {user_data['username']}")
    
    try:
        # Crear el evento
        event_data = {
            'event': 'ranking_update',
            'data': user_data,
            'timestamp': time.time()  # Añadir timestamp para orden
        }
        
        # Convertir a JSON
        json_data = json.dumps(event_data)
        
        # Añadir a la cola de broadcast
        broadcast_queue.append(json_data)
        
        # Distribuir a todas las colas de clientes activos
        with client_lock:
            for client_id, client_queue in client_queues.items():
                try:
                    client_queue.put(json_data)
                    logger.debug(f"Evento enviado a cliente {client_id}")
                except Exception as e:
                    logger.error(f"Error enviando a cliente {client_id}: {e}")
        
        logger.info(f"Evento de ranking transmitido: {user_data['username']}, Posición: {user_data['position']}")
    except Exception as e:
        logger.error(f"Error al emitir actualización de ranking: {str(e)}")

def register_client():
    """
    Registra un nuevo cliente SSE y devuelve un ID único y una cola
    para recibir actualizaciones.
    """
    client_id = f"client_{time.time()}_{threading.get_ident()}"
    client_queue = queue.Queue()
    
    # Añadir la cola al diccionario de clientes
    with client_lock:
        client_queues[client_id] = client_queue
        logger.info(f"Nuevo cliente SSE registrado: {client_id}")
    
    # Ya no enviamos historial completo para evitar animaciones al conectar
    # Solo enviamos un evento de prueba para confirmar conexión
    test_event = {
        'event': 'test',
        'data': {
            'message': 'Conexión exitosa',
            'timestamp': time.time()
        }
    }
    client_queue.put(json.dumps(test_event))
    
    return client_id, client_queue

def unregister_client(client_id):
    """
    Elimina un cliente del registro cuando se desconecta.
    """
    with client_lock:
        if client_id in client_queues:
            del client_queues[client_id]
            logger.info(f"Cliente SSE desregistrado: {client_id}")

# Almacenar los últimos eventos enviados a cada cliente para evitar duplicados
last_client_events = {}

def get_client_updates(client_id):
    """
    Obtiene actualizaciones para un cliente específico.
    """
    try:
        with client_lock:
            if client_id not in client_queues:
                logger.warning(f"Cliente no encontrado: {client_id}")
                return None
                
            client_queue = client_queues[client_id]
            
        # Intentar obtener evento de la cola del cliente (no bloqueante)
        try:
            event_data = client_queue.get(block=False)
            
            # Verificar si este evento ya se envió (evitar duplicados)
            if event_data:
                try:
                    event_obj = json.loads(event_data)
                    
                    # Crear una clave única para este evento basado en usuario y puntos
                    if event_obj.get('event') == 'ranking_update':
                        user_data = event_obj.get('data', {})
                        username = user_data.get('username', '')
                        points = user_data.get('points', 0)
                        event_key = f"{username}:{points}"
                        
                        # Si es el mismo evento que enviamos antes, ignorarlo
                        last_event = last_client_events.get(client_id)
                        if last_event and last_event.get('key') == event_key:
                            logger.debug(f"Evento duplicado ignorado: {event_key}")
                            return None
                        
                        # Guardar este evento como el último enviado a este cliente
                        last_client_events[client_id] = {
                            'key': event_key,
                            'timestamp': time.time()
                        }
                except Exception as e:
                    logger.error(f"Error al verificar duplicado: {str(e)}")
                    # Si hay error al procesar, simplemente enviar el evento
                    
            return event_data
        except queue.Empty:
            return None
            
    except Exception as e:
        logger.error(f"Error obteniendo actualizaciones para cliente {client_id}: {str(e)}")
        return None

# Compatibilidad con código anterior
def get_ranking_updates():
    """
    Función de compatibilidad. Use register_client y get_client_updates
    para el nuevo sistema.
    """
    logger.warning("get_ranking_updates() está obsoleto. Use register_client y get_client_updates")
    return None

# Limpiar datos (útil para pruebas)
def clear_ranking_updates():
    """
    Limpia todas las actualizaciones pendientes.
    """
    try:
        broadcast_queue.clear()
        with client_lock:
            for client_id, client_queue in client_queues.items():
                while not client_queue.empty():
                    client_queue.get(block=False)
        logger.info("Todas las colas de eventos limpiadas")
    except Exception as e:
        logger.error(f"Error al limpiar colas de actualizaciones: {str(e)}")
