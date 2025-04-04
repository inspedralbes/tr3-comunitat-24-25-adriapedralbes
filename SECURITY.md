# Medidas de Seguridad Implementadas

Este documento detalla las medidas de seguridad implementadas en el proyecto para proteger la API y el panel de administración.

## Cambios Importantes

⚠️ **IMPORTANTE**: El panel de administración ahora se encuentra en `/backend-admin/` en lugar de `/admin/`.

La URL `/admin/` es ahora una trampa (honeypot) para detectar intentos de acceso no autorizados.

## Medidas de Seguridad

### 1. Protección Contra Fuerza Bruta (django-axes)

- Bloqueo de cuenta después de 5 intentos fallidos de inicio de sesión
- Duración del bloqueo: 1 hora
- Considera la combinación de usuario e IP para el bloqueo
- Muestra una página personalizada cuando se bloquea a un usuario

### 2. Trampa para Atacantes (Custom Honeypot)

- Panel de administración simulado en `/admin/`
- Registra todos los intentos de acceso con credenciales en los logs del sistema
- El panel real ahora está en `/backend-admin/`

### 3. Políticas de Seguridad de Contenido (CSP)

- Implementadas mediante django-csp
- Previene ataques XSS estableciendo restricciones sobre los recursos que puede cargar la página
- Configuración restrictiva que solo permite recursos del mismo origen

### 4. Rate Limiting

- Limita el número de solicitudes por usuario/IP
- Protege contra ataques de denegación de servicio (DoS)
- Muestra una página personalizada cuando se excede el límite

### 5. Headers de Seguridad Adicionales

- HSTS (HTTP Strict Transport Security)
- Protección contra CSRF
- Protección contra clickjacking
- Seguridad de cookies mejorada

### 6. URLs y Acceso Seguro

- Redirección de usuarios no autenticados al panel de administración
- Control de acceso granular por ruta
- Protección de rutas sensibles

## Mantenimiento

- Para actualizar las medidas de seguridad, edita los archivos en `backend/config/security_settings.py`
- Después de cambios, reinicia los servicios con `./restart_prod.sh`
- Monitoriza los intentos de acceso al honeypot en los logs del contenedor
  ```bash
  docker logs django-app | grep "Intento de acceso al honeypot"
  ```

## Contacto y Reporte de Vulnerabilidades

- Si encuentras alguna vulnerabilidad de seguridad, por favor reporta a: adria@futurprive.com
- No compartas la URL real del panel de administración con personal no autorizado
