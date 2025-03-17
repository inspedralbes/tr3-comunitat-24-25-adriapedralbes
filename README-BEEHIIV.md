# Beehiiv API Integration Guide

## Resumen de Cambios Implementados

Para solucionar los problemas con la integración de Beehiiv, hemos realizado las siguientes mejoras:

1. **Tiempo de espera extendido de Gunicorn**
   - Aumentado a 120 segundos para evitar timeouts de trabajadores
   - Configurado para trabajar con 3 workers para mejor distribución de carga

2. **Procesamiento completamente asincrónico**
   - Ahora la API responde inmediatamente tras guardar en la base de datos
   - Todo el procesamiento de Beehiiv y correos electrónicos ocurre en segundo plano
   - El usuario recibe confirmación inmediata sin esperar a Beehiiv

3. **Optimización de tiempos de espera**
   - Reducido el timeout de solicitudes a Beehiiv a 3 segundos
   - Implementado backoff exponencial para reintentos
   - Mejor manejo de errores y logging detallado

4. **Configuración mejorada de CORS**
   - Limitado a orígenes específicos para mayor seguridad
   - Configuración distinta para desarrollo y producción
   - Manejo consistente de headers CORS

## Uso de la API de Beehiiv según Documentación

La integración con Beehiiv sigue estos principios de la documentación oficial:

### Crear Suscripciones

```
POST https://api.beehiiv.com/v2/publications/{publication_id}/subscriptions
```

Encabezados necesarios:
```
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

Payload:
```json
{
  "email": "string",
  "reactivate_existing": true,
  "consent_status": {
    "status": "express",
    "proof": {
      "source": "string",
      "ip_address": "string",
      "timestamp": 0
    }
  },
  "referring_site": "string",
  "send_welcome_email": false,
  "status": "active"
}
```

### Mejores Prácticas

1. **Autenticación**
   - Utilizar siempre API key en el encabezado Authorization
   - Formato: `Authorization: Bearer YOUR_API_KEY`

2. **Campos Requeridos**
   - `email` y `publication_id` son obligatorios

3. **Manejo de Errores**
   - Implementar reintentos con backoff exponencial
   - Manejar límites de tasa (respuestas 429)
   - Establecer timeouts razonables (3-5 segundos máximo)

4. **Webhooks**
   - Para una integración más robusta, considerar usar webhooks
   - Se podría configurar un endpoint para recibir notificaciones

## Cómo Funciona Ahora

1. El usuario envía un formulario de suscripción desde el sitio web
2. La API guarda inmediatamente el suscriptor en la base de datos local
3. La API responde al usuario con un mensaje de éxito (típicamente en <200ms)
4. En segundo plano, un hilo separado:
   - Envía el email de confirmación 
   - Intenta registrar al usuario en Beehiiv
   - Registra cualquier error para diagnóstico

Este flujo asegura que:
- La experiencia del usuario es instantánea
- No hay timeouts en el frontend
- Los errores en Beehiiv no afectan al usuario
- Los datos se guardan siempre en nuestra base de datos

## Monitoreo y Solución de Problemas

Para diagnosticar problemas:

1. Revisar los logs de Django para mensajes con prefijo `[BEEHIIV]`
2. Verificar tiempos de respuesta en los logs de Traefik
3. Comprobar que los suscriptores aparecen en la base de datos local
4. Si es necesario, verificar suscriptores directamente en el panel de Beehiiv

## Configuración de Producción

En entorno de producción:

1. La configuración de CORS está limitada a dominios específicos
2. Los timeouts son más agresivos para evitar bloqueos
3. Los URLs de confirmación apuntan a https://futurprive.com
4. Se utiliza registro detallado para diagnóstico

## Posibles Mejoras Futuras

1. **Sistema de colas**
   - Implementar Celery o similar para una gestión más robusta de tareas
   - Agregar Redis como backend para persistencia de tareas

2. **Webhooks**
   - Configurar webhooks de Beehiiv para tener confirmación de éxito
   - Implementar reconciliación periódica entre sistemas

3. **Monitoreo avanzado**
   - Agregar métricas de rendimiento y éxito/fallo
   - Configurar alertas para fallos persistentes

---

Documento actualizado: 17 de marzo de 2025
