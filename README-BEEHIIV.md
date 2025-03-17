# Guía de Integración con Beehiiv API

## Introducción

Este documento proporciona una guía detallada para integrar correctamente la API de Beehiiv con la plataforma FuturPrive. La API de Beehiiv permite gestionar suscriptores, publicaciones y otros aspectos de tu newsletter de manera programática.

## Requisitos Previos

- **API Key de Beehiiv**: Necesitas generar una clave API desde tu panel de control de Beehiiv
- **ID de Publicación**: El identificador único de tu publicación en Beehiiv
- **Django**: Nuestra integración está desarrollada para Django

## Configuración de Credenciales

Asegúrate de que las siguientes variables están correctamente configuradas en el archivo `.env`:

```
BEEHIIV_API_KEY=your_api_key_here
BEEHIIV_PUBLICATION_ID=pub_your_publication_id_here
```

**IMPORTANTE**: El ID de la publicación debe comenzar con el prefijo `pub_`. Si tu ID no tiene este prefijo, añádelo manualmente o verifica que esté correcto.

## Buenas Prácticas para Integración con Beehiiv

### 1. Gestión de Tiempos de Espera (Timeouts)

Beehiiv puede tardar en responder, especialmente durante períodos de alta carga. Siempre configura un timeout adecuado:

```python
response = requests.post(
    url,
    headers=headers,
    json=subscription_data,
    timeout=5  # 5 segundos es un buen equilibrio
)
```

### 2. Procesamiento Asíncrono

Para evitar bloquear tu aplicación, procesa las solicitudes a Beehiiv en segundo plano:

```python
from threading import Thread

def register_in_beehiiv_background():
    # Código para registrar el suscriptor en Beehiiv
    
thread = Thread(target=register_in_beehiiv_background)
thread.daemon = True
thread.start()
```

### 3. Estructura de Datos para Suscriptores

La API V2 de Beehiiv requiere el siguiente formato para crear suscriptores:

```python
subscription_data = {
    "email": email,
    "reactivate_existing": True,  # Reactivar si existe pero estaba desuscrito
    "consent_status": {
        "status": "express",  # o "implicit" según el caso
        "proof": {
            "source": source,  # De dónde viene el suscriptor
            "ip_address": ip_address,  # Opcional
            "timestamp": timestamp,  # Opcional
        }
    },
    "referring_site": site_url,
    "send_welcome_email": False,  # True si quieres que Beehiiv envíe el email
    "status": "active"  # o "pending" si requiere confirmación
}

# Si tienes el nombre del suscriptor:
if name:
    subscription_data["custom_fields"] = [
        {
            "name": "first_name",
            "value": name
        }
    ]
```

### 4. Manejo de Errores

Siempre maneja los errores y excepciones de forma adecuada:

```python
try:
    response = requests.post(...)
    
    if response.status_code in [200, 201]:
        # Éxito
        logger.info("Suscriptor registrado correctamente")
    else:
        # Error en la API
        logger.error(f"Error al registrar suscriptor: {response.status_code} - {response.text}")
        
except Exception as e:
    # Error de conexión u otro problema
    logger.exception(f"Excepción al comunicarse con Beehiiv: {str(e)}")
```

### 5. Formato del ID de Publicación

Beehiiv requiere que el ID de publicación comience con el prefijo `pub_`. Si tu ID no tiene este prefijo, añádelo:

```python
if not publication_id.startswith('pub_'):
    publication_id = f"pub_{publication_id}"
```

## Solución de Problemas Comunes

### Problema 1: Error CORS al registrar suscriptores

Si recibes errores CORS, asegúrate de que:

1. Tu servidor Django tiene configuración CORS adecuada:
   ```python
   CORS_ALLOW_ALL_ORIGINS = True
   CORS_ALLOW_CREDENTIALS = True
   ```

2. El middleware CORS está correctamente configurado:
   ```python
   MIDDLEWARE = [
       # ... otros middlewares
       'corsheaders.middleware.CorsMiddleware',
       'api.middleware_newsletter.NewsletterCorsMiddleware',
       # ... otros middlewares
   ]
   ```

3. Las vistas de API añaden encabezados CORS en cada respuesta, especialmente para manejar OPTIONS preflight:
   ```python
   response["Access-Control-Allow-Origin"] = "https://futurprive.com"
   response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
   response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
   ```

### Problema 2: Tiempos de espera largos de Beehiiv

Si la API de Beehiiv tarda demasiado en responder:

1. Procesa las solicitudes en segundo plano usando hilos o tareas asíncronas
2. Implementa un sistema de reintentos con backoff exponencial
3. Considera usar un job queue para operaciones masivas

### Problema 3: Errores de autenticación

Si recibes errores 401 o 403:

1. Verifica que tu API key es correcta y no ha expirado
2. Asegúrate de que estás formateando correctamente el encabezado de autorización:
   ```
   Authorization: Bearer tu_api_key_aquí
   ```

## Pruebas y Verificación

Para probar la integración con Beehiiv:

1. Usa el endpoint de prueba: `/api/test/beehiiv/`
2. Revisa los logs del servidor para ver respuestas detalladas
3. Verifica en tu panel de Beehiiv que los suscriptores aparecen correctamente

## Recursos Adicionales

- [Documentación oficial de Beehiiv API](https://developers.beehiiv.com/)
- [Soporte de Beehiiv](https://www.beehiiv.com/kb)

---

Desarrollado para FuturPrive por el equipo de desarrollo.
