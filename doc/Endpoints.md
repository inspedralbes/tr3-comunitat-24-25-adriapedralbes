# Documentación de Endpoints API

A continuación se detalla la lista completa de endpoints disponibles en la API de la plataforma FuturPrive:

## Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/token/` | Obtiene un token JWT de acceso y refresco proporcionando credenciales de usuario |
| POST | `/api/token/refresh/` | Renueva un token de acceso utilizando el token de refresco |
| POST | `/api/auth/register/` | Registra un nuevo usuario en la plataforma |
| GET/PATCH | `/api/auth/me/` | Obtiene o actualiza la información del perfil del usuario autenticado |

## Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users/` | Obtiene lista de usuarios (requiere autenticación) |
| GET | `/api/users/{id}/` | Obtiene detalles de un usuario específico |
| GET | `/api/leaderboard/` | Obtiene la tabla de clasificación de usuarios basada en puntos |

## Comunidad

### Categorías
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/categories/` | Obtiene todas las categorías disponibles para los posts |
| GET | `/api/categories/{id}/` | Obtiene detalles de una categoría específica |

### Posts
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/posts/` | Obtiene todos los posts (admite filtros por categoría y otros parámetros) |
| POST | `/api/posts/` | Crea un nuevo post |
| GET | `/api/posts/{id}/` | Obtiene detalles de un post específico |
| PUT/PATCH | `/api/posts/{id}/` | Actualiza un post existente (solo autor) |
| DELETE | `/api/posts/{id}/` | Elimina un post (solo autor o administrador) |
| GET | `/api/pinned-posts/` | Obtiene los posts fijados o destacados |
| POST | `/api/posts/{post_id}/like/` | Da o quita like a un post |
| POST | `/api/posts/{post_id}/vote/` | Vota en una encuesta asociada a un post |

### Comentarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/comments/` | Obtiene todos los comentarios (admite filtros por post) |
| POST | `/api/comments/` | Crea un nuevo comentario |
| GET | `/api/comments/{id}/` | Obtiene detalles de un comentario específico |
| PUT/PATCH | `/api/comments/{id}/` | Actualiza un comentario (solo autor) |
| DELETE | `/api/comments/{id}/` | Elimina un comentario (solo autor o administrador) |
| POST | `/api/comments/{comment_id}/like/` | Da o quita like a un comentario |

## Cursos y Lecciones

### Cursos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/courses/` | Obtiene todos los cursos disponibles |
| GET | `/api/courses/{id}/` | Obtiene detalles de un curso específico con sus módulos y lecciones |

### Lecciones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/lessons/` | Obtiene todas las lecciones (admite filtros por curso) |
| GET | `/api/lessons/{id}/` | Obtiene detalles de una lección específica |

## Progreso de Usuario

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/user/lessons/progress/` | Obtiene el progreso del usuario para todas las lecciones |
| POST | `/api/user/lessons/progress/` | Registra progreso en una lección |
| PATCH | `/api/user/lessons/progress/{id}/` | Actualiza el progreso de una lección específica |
| GET | `/api/user/courses/progress/` | Obtiene el progreso del usuario para todos los cursos |
| GET | `/api/user/courses/progress/{id}/` | Obtiene el progreso del usuario para un curso específico |
| POST | `/api/user/courses/progress/{id}/mark_lesson_complete/` | Marca una lección como completada dentro de un curso |
| POST | `/api/user/courses/progress/{id}/mark_lesson_incomplete/` | Marca una lección como no completada dentro de un curso |

## Suscripciones y Pagos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/subscription/create-checkout-session/` | Crea una sesión de pago en Stripe |
| GET | `/api/subscription/status/` | Obtiene el estado actual de la suscripción del usuario |
| POST | `/api/subscription/cancel/` | Cancela la suscripción actual del usuario |

## Gamificación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/gamification/achievements/` | Obtiene todos los logros disponibles |
| GET | `/api/gamification/user-achievements/` | Obtiene los logros del usuario actual |
| GET | `/api/gamification/levels/` | Obtiene información sobre niveles y requisitos |
| GET | `/api/gamification/user-level/` | Obtiene detalles del nivel actual del usuario |

## Newsletter

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/newsletter/subscribe/` | Suscribe un email al newsletter |
| GET | `/api/newsletter/confirm/{token}/` | Confirma una suscripción al newsletter |
| GET | `/api/newsletter/unsubscribe/{token}/` | Cancela una suscripción al newsletter |

## Eventos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/events/` | Obtiene todos los eventos del calendario |

## Webhooks

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/webhooks/stripe/` | Endpoint que recibe los eventos webhook de Stripe |

## Consideraciones de seguridad

- Todos los endpoints, excepto algunos específicos (autenticación, registro, estado de suscripción), requieren un token JWT válido.
- El acceso a contenido premium está protegido por el middleware `PremiumContentMiddleware`.
- Los usuarios solo pueden modificar o eliminar sus propios posts y comentarios.
- Las solicitudes de acceso a recursos protegidos sin una suscripción activa reciben un error 403.

## Formato de respuesta

Las respuestas siguen un formato estándar con los siguientes códigos HTTP:

- **200**: Petición exitosa
- **201**: Recurso creado correctamente
- **400**: Error en la petición
- **401**: No autenticado
- **403**: Sin permisos para acceder al recurso
- **404**: Recurso no encontrado
- **500**: Error del servidor

Los errores incluyen un objeto JSON con detalles del problema:

```json
{
  "error": "Descripción del error",
  "authenticated": true/false,
  "is_premium": true/false,
  "redirect_to": "/ruta/opcional"
}
```

## Paginación

Los endpoints que devuelven listas (posts, comentarios, usuarios) implementan paginación con los siguientes parámetros:

- `page`: Número de página (predeterminado: 1)
- `page_size`: Tamaño de página (predeterminado: 10, máximo: 100)

Ejemplo de respuesta paginada:

```json
{
  "count": 100,
  "next": "http://api.futurprive.com/api/posts/?page=3",
  "previous": "http://api.futurprive.com/api/posts/?page=1",
  "results": [
    // Array de recursos
  ]
}
```