"""
Vistas para Server-Sent Events (SSE) que permiten enviar actualizaciones en tiempo real al cliente.
Utiliza el sistema de broadcast para asegurar que todos los clientes reciben las mismas actualizaciones.
"""
import time
import json
import logging
from django.http import StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from .sockets import register_client, unregister_client, get_client_updates

# Configurar logger
logger = logging.getLogger(__name__)

@csrf_exempt
def ranking_updates_stream(request):
    """
    Vista que devuelve un flujo de eventos SSE para actualizar el ranking en tiempo real.
    Los clientes se suscriben a este endpoint y reciben actualizaciones cuando ocurren.
    """
    # Verificar si hay una buena conexión antes de registrar el cliente
    try:
        # Registrar este cliente
        client_id, client_queue = register_client()
        logger.info(f"Nueva conexión SSE establecida: {client_id}")
        
        def event_stream():
            """
            Generador que produce eventos SSE.
            """
            try:
                # Enviar un evento inicial para establecer la conexión
                connection_data = {"status": "connected", "client_id": client_id}
                yield f"event: connected\ndata: {json.dumps(connection_data)}\n\n"
                
                # Emitir evento de prueba inmediatamente para verificar conexión
                test_data = {"message": "Test connection", "timestamp": time.time()}
                yield f"event: test\ndata: {json.dumps(test_data)}\n\n"
                
                # Bucle principal para enviar eventos
                while True:
                    # Verificar si hay actualizaciones para este cliente
                    update = get_client_updates(client_id)
                    if update:
                        try:
                            event_data = json.loads(update)
                            
                            # Formato SSE: event: tipo_evento\ndata: datos_json\n\n
                            if 'event' in event_data and 'data' in event_data:
                                event_type = event_data['event']
                                event_data_json = json.dumps(event_data['data'])
                                
                                yield f"event: {event_type}\ndata: {event_data_json}\n\n"
                        except json.JSONDecodeError:
                            logger.error(f"Error decodificando JSON en update: {update}")
                    
                    # Pequeña pausa para evitar uso excesivo de CPU
                    time.sleep(0.5)
                    
                    # Enviar un ping periódico para mantener la conexión viva
                    yield ": ping\n\n"
                    
            except GeneratorExit:
                # El cliente cerró la conexión
                logger.info(f"Cliente {client_id} cerró la conexión")
                raise
            except Exception as e:
                logger.error(f"Error en stream SSE para cliente {client_id}: {str(e)}")
                raise
            finally:
                # Asegurar que el cliente se elimina cuando se cierra la conexión
                logger.info(f"Conexión SSE cerrada para cliente {client_id}")
                unregister_client(client_id)
        
        # Crear respuesta de streaming con cabeceras adecuadas para SSE
        response = StreamingHttpResponse(
            event_stream(),
            content_type='text/event-stream'
        )
        
        # Configurar cabeceras para SSE
        response['Cache-Control'] = 'no-cache, no-transform'
        response['X-Accel-Buffering'] = 'no'  # Para servidores Nginx
        response['Access-Control-Allow-Origin'] = '*'  # CORS para desarrollo
        # Eliminamos Connection: keep-alive que no es permitido en WSGI
        
        return response
        
    except Exception as e:
        logger.error(f"Error creando la conexión SSE: {str(e)}")
        # Devolver respuesta de error en formato SSE para no romper el cliente
        response = StreamingHttpResponse(
            [f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"],
            content_type='text/event-stream'
        )
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response['Access-Control-Allow-Origin'] = '*'
        return response
