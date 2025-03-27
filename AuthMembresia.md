# Documentación Técnica: Sistema de Protección de Contenido Premium

## Índice
1. [Visión General](#1-visión-general)
2. [Arquitectura de la Solución](#2-arquitectura-de-la-solución)
3. [Componentes Clave](#3-componentes-clave)
4. [Flujo de Verificación de Suscripción](#4-flujo-de-verificación-de-suscripción)
5. [Detalles de Implementación](#5-detalles-de-implementación)
6. [Rutas y Recursos Protegidos](#6-rutas-y-recursos-protegidos)
7. [Consideraciones de Seguridad](#7-consideraciones-de-seguridad)
8. [Mantenimiento y Extensión](#8-mantenimiento-y-extensión)
9. [Resolución de Problemas](#9-resolución-de-problemas)

## 1. Visión General

Este sistema implementa una protección robusta a nivel de backend para asegurar que solo los usuarios con suscripciones premium activas puedan acceder a ciertas funcionalidades y contenidos dentro de la plataforma TR3 Comunitat. La implementación sigue un enfoque de seguridad en capas, con verificaciones tanto en el frontend (para mejorar la experiencia de usuario) como en el backend (para garantizar la seguridad real).

**Funcionalidades protegidas:**
- Comunidad (posts, comentarios y categorías)
- Classroom (cursos y lecciones)
- Calendario (eventos)
- Miembros (listado de usuarios)
- Ranking (leaderboard)

## 2. Arquitectura de la Solución

La solución implementa una arquitectura de seguridad en tres capas:

### Capa 1: Frontend (UX)
- Redirecciones condicionales basadas en el estado de suscripción del usuario
- Oculta elementos de navegación para usuarios sin suscripción
- Proporciona feedback visual cuando se intenta acceder a contenido premium

### Capa 2: Middleware (Backend)
- Intercepta todas las solicitudes a endpoints protegidos
- Verifica la autenticación y suscripción en la base de datos
- Protege todas las APIs de datos premium

### Capa 3: Verificación con Stripe
- Valida el estado actual de la suscripción con Stripe
- Actualiza el estado en la base de datos si es necesario
- Proporciona una fuente autoritativa sobre el estado de suscripción

## 3. Componentes Clave

### 3.1 Middleware de Protección Premium

El componente central de la solución es el middleware `PremiumContentMiddleware` que verifica cada solicitud a recursos protegidos:

- **Ubicación**: `/backend/api/middleware.py`
- **Función**: Intercepta solicitudes HTTP y verifica suscripciones premium
- **Punto de integración**: Configurado en `settings.MIDDLEWARE`

### 3.2 Servicio Stripe

El servicio `StripeService` maneja todas las interacciones con la API de Stripe:

- **Ubicación**: `/backend/api/services.py`
- **Funciones principales**:
  - Verificación de estado de suscripción
  - Creación de sesiones de checkout
  - Gestión de suscripciones (cancelación, actualizaciones)

### 3.3 Decorador para Vistas Específicas

El decorador `premium_required` proporciona protección adicional para vistas específicas:

- **Ubicación**: `/backend/api/decorators.py`
- **Uso**: Se aplica a vistas que requieren verificación adicional

### 3.4 Redirecciones en Frontend

Implementación en componentes React de verificación de suscripción:

- **Ubicaciones**: 
  - `/frontend/src/app/comunidad/page.tsx`
  - `/frontend/src/app/classroom/page.tsx`
  - `/frontend/src/app/calendar/page.tsx`
  - `/frontend/src/app/members/page.tsx`
  - `/frontend/src/app/ranking/page.tsx`

## 4. Flujo de Verificación de Suscripción

El sistema sigue el siguiente flujo para verificar el acceso a contenido premium:

1. **Solicitud Inicial**:
   - Usuario solicita acceso a una ruta/recurso protegido

2. **Verificación Frontend** (Experiencia de usuario):
   - Verifica si el usuario está autenticado
   - Comprueba localmente si tiene suscripción premium
   - Si no, redirecciona al perfil del usuario

3. **Verificación de Middleware** (Seguridad principal):
   - Intercepta la solicitud HTTP
   - Verifica que el usuario esté autenticado
   - Comprueba en la base de datos si tiene una suscripción activa (`has_active_subscription`)
   - Para usuarios superadmin (`is_superuser`), permite acceso automático
   - Si no tiene suscripción activa, devuelve error 403 (Forbidden)

4. **Verificación Opcional con Stripe**:
   - El middleware puede opcionalmente verificar el estado actual con Stripe
   - Actualiza la base de datos si hay discrepancias
   - Proporciona una capa adicional de verificación

5. **Entrega de Contenido**:
   - Si todas las verificaciones son exitosas, la solicitud continúa su procesamiento normal
   - Se entrega el contenido premium solicitado

## 5. Detalles de Implementación

### 5.1 Middleware de Protección Premium

```python
# /backend/api/middleware.py
class PremiumContentMiddleware(MiddlewareMixin):
    """
    Middleware para verificar si el usuario tiene acceso a contenido premium.
    Comprueba si el usuario tiene una suscripción activa en la base de datos.
    """
    
    # Lista de rutas de API protegidas que requieren suscripción premium
    PREMIUM_ENDPOINTS = [
        r'^api/posts',
        r'^api/pinned-posts',
        r'^api/categories',
        r'^api/comments',
        r'^api/courses',
        r'^api/lessons',
        r'^api/events',
        r'^api/users',
        r'^api/leaderboard',
        r'^api/gamification',
    ]
    
    # Excepciones para endpoints específicos que deberían ser accesibles sin suscripción
    PUBLIC_EXCEPTIONS = [
        r'^api/auth/register',
        r'^api/auth/me',
        r'^api/token',
        r'^api/subscription/status',
        r'^api/subscription/create-checkout-session',
    ]
    
    def is_premium_endpoint(self, path):
        """Determina si la ruta solicitada requiere acceso premium."""
        
        # Primero verificar si la ruta está en las excepciones públicas
        for exception in self.PUBLIC_EXCEPTIONS:
            if exception in path:
                return False
        
        # Luego verificar si está en las rutas premium
        for endpoint in self.PREMIUM_ENDPOINTS:
            if endpoint in path:
                return True
        
        # Por defecto, permitir acceso
        return False
    
    def process_request(self, request):
        """
        Procesa la solicitud entrante y verifica si el usuario tiene acceso premium
        para los endpoints protegidos.
        """
        path = request.path_info
        
        # Si no es un endpoint premium, permitir la solicitud
        if not self.is_premium_endpoint(path):
            return None
        
        # Verificar si el usuario está autenticado
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return JsonResponse({
                'error': 'Autenticación requerida para acceder a este recurso',
                'authenticated': False,
                'is_premium': False
            }, status=401)
        
        user = request.user
        
        # Si el usuario es superusuario o staff, permitir acceso sin más verificaciones
        if user.is_superuser or user.is_staff:
            logger.info(f"Acceso premium garantizado para {user.username} (superuser/staff)")
            return None
        
        # Verificar si el usuario tiene una suscripción activa
        if hasattr(user, 'has_active_subscription') and user.has_active_subscription:
            # Doble verificación con Stripe Service (opcional)
            try:
                is_still_active = StripeService.check_subscription_status(user)
                if not is_still_active:
                    logger.warning(f"Suscripción marcada como activa para {user.username} pero Stripe indica que no está activa")
                    # Actualizar el usuario en la base de datos
                    user.has_active_subscription = False
                    user.is_premium = False
                    user.save(update_fields=['has_active_subscription', 'is_premium'])
                    
                    return JsonResponse({
                        'error': 'Tu suscripción premium ha expirado',
                        'authenticated': True,
                        'is_premium': False,
                        'redirect_to': '/perfil'
                    }, status=403)
            except Exception as e:
                # Si hay un error al verificar con Stripe, permitir el acceso temporal
                logger.error(f"Error al verificar suscripción con Stripe: {e}")
            
            # Usuario premium verificado, permitir acceso
            return None
        
        # El usuario no tiene suscripción activa, denegar acceso
        logger.info(f"Acceso premium denegado para {user.username} (sin suscripción activa)")
        
        return JsonResponse({
            'error': 'Se requiere una suscripción premium para acceder a este contenido',
            'authenticated': True,
            'is_premium': False,
            'redirect_to': '/perfil'
        }, status=403)
```

### 5.2 Decorador de Protección Premium

```python
# /backend/api/decorators.py
def premium_required(view_func):
    """
    Decorador para vistas individuales que requieren una suscripción premium.
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        user = request.user
        
        # Si el usuario no está autenticado, denegar acceso
        if not user.is_authenticated:
            return Response(
                {'error': 'Autenticación requerida para acceder a este recurso'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Si el usuario es superusuario o staff, permitir acceso
        if user.is_superuser or user.is_staff:
            return view_func(request, *args, **kwargs)
        
        # Verificar si el usuario tiene una suscripción activa
        if hasattr(user, 'has_active_subscription') and user.has_active_subscription:
            return view_func(request, *args, **kwargs)
        
        # Usuario sin suscripción premium, denegar acceso
        logger.info(f"Acceso premium denegado para {user.username} en vista {view_func.__name__}")
        return Response(
            {
                'error': 'Se requiere una suscripción premium para acceder a este contenido',
                'authenticated': True,
                'is_premium': False,
                'redirect_to': '/perfil'
            },
            status=status.HTTP_403_FORBIDDEN
        )
    
    return _wrapped_view
```

### 5.3 Verificación Frontend (ejemplo de Comunidad)

```typescript
// /frontend/src/app/comunidad/page.tsx (fragmento)
useEffect(() => {
  // Función para verificar autenticación y suscripción al cargar la página
  const checkAuth = async () => {
    setIsLoading(true);
    
    // Verificar si está autenticado
    if (!authService.isAuthenticated()) {
      router.push('/perfil');
      return;
    }
    
    try {
      // Verificar suscripción
      const subscriptionStatus = await subscriptionService.getSubscriptionStatus().catch(error => {
        console.error('Error al verificar suscripción:', error);
        // En caso de error, permitimos acceso temporal
        return { has_subscription: true, subscription_status: 'temp_access', start_date: null, end_date: null };
      });
      
      console.warn('Estado de suscripción:', subscriptionStatus);
      
      // Si no tiene suscripción, redirigir a la página de perfil
      if (!subscriptionStatus.has_subscription) {
        console.warn('Usuario sin suscripción, redirigiendo al perfil');
        router.push('/perfil');
        return;
      }
      
      // Continuar con la carga de datos...
    } catch (error) {
      console.error('Error general al verificar acceso:', error);
      setIsLoading(false);
    }
  };
  
  checkAuth();
}, [router]);
```

### 5.4 Servicio de Verificación de Suscripción

```python
# /backend/api/services.py (fragmento)
@staticmethod
def check_subscription_status(user):
    """
    Verifica el estado de la suscripción de un usuario y actualiza la base de datos
    """
    # Si el usuario es superadmin, siempre tiene suscripción activa
    if user.is_superuser:
        logger.info(f"Verificación de suscripción para superusuario {user.username} - acceso garantizado")
        # Asegurar que el superusuario tenga los campos correctamente configurados
        user.has_active_subscription = True
        user.is_premium = True
        user.subscription_status = 'active'
        
        # Si no tiene fechas establecidas, establecerlas
        if not user.subscription_start_date:
            user.subscription_start_date = timezone.now()
        if not user.subscription_end_date:
            user.subscription_end_date = timezone.now() + timedelta(days=365)
            
        user.save()
        return True
        
    if not user.subscription_id:
        return False
        
    try:
        subscription = stripe.Subscription.retrieve(user.subscription_id)
        
        # Actualizar estado
        user.subscription_status = subscription.status
        
        # Verificar si está activa
        is_active = subscription.status == 'active'
        user.has_active_subscription = is_active
        user.is_premium = is_active
        
        # Actualizar fechas
        if subscription.status == 'active':
            user.subscription_start_date = datetime.fromtimestamp(subscription.current_period_start)
            user.subscription_end_date = datetime.fromtimestamp(subscription.current_period_end)
        
        user.save()
        
        return is_active
    except stripe.error.StripeError as e:
        logger.error(f"Error al verificar suscripción: {e}")
        return False
```

## 6. Rutas y Recursos Protegidos

Los siguientes tipos de recursos están protegidos por el sistema:

### 6.1 API Endpoints Protegidos

| Endpoint | Recurso | Descripción |
|----------|---------|-------------|
| `/api/posts` | Posts | Contenido de comunidad (publicaciones) |
| `/api/pinned-posts` | Posts fijados | Posts destacados o fijados |
| `/api/categories` | Categorías | Categorías para posts |
| `/api/comments` | Comentarios | Comentarios en posts |
| `/api/courses` | Cursos | Cursos de e-learning |
| `/api/lessons` | Lecciones | Lecciones dentro de cursos |
| `/api/user/lessons/progress` | Progreso | Progreso del usuario en lecciones |
| `/api/user/courses/progress` | Progreso | Progreso del usuario en cursos |
| `/api/events` | Eventos | Eventos del calendario |
| `/api/users` | Usuarios | Listado de usuarios (miembros) |
| `/api/leaderboard` | Ranking | Tabla de clasificación de usuarios |
| `/api/gamification` | Gamificación | Sistema de puntos y logros |

### 6.2 Rutas Frontend Protegidas

| Ruta | Funcionalidad | Componente |
|------|---------------|------------|
| `/comunidad` | Comunidad | `CommunityPage` |
| `/classroom` | Cursos | `ClassroomPage` |
| `/calendar` | Calendario | `CalendarPage` |
| `/members` | Miembros | `MiembrosPage` |
| `/ranking` | Ranking | `RankingPage` |

## 7. Consideraciones de Seguridad

### 7.1 Puntos Fuertes

1. **Verificación en el Servidor**: Toda la lógica de seguridad crítica se ejecuta en el backend, no en el cliente.
2. **Seguridad en Capas**: Múltiples capas de verificación proporcionan protección redundante.
3. **Protección a Nivel de API**: Se protegen los endpoints de datos, no solo las vistas.
4. **Verificación de Base de Datos**: Se comprueban los estados de suscripción almacenados en la base de datos.
5. **Verificación con Stripe**: Opcional pero disponible para verificar el estado actual con Stripe.

### 7.2 Posibles Mejoras

1. **Caché de Estados**: Implementar caché para reducir consultas a la base de datos y a Stripe.
2. **JWTs con Roles**: Incluir información de suscripción en los tokens JWT.
3. **Auditoría de Accesos**: Registrar intentos de acceso a recursos premium.
4. **Rate Limiting**: Limitar solicitudes a endpoints premium para prevenir abusos.

## 8. Mantenimiento y Extensión

### 8.1 Añadir Nuevas Rutas Protegidas

Para añadir una nueva ruta protegida:

1. **En el Middleware**: Agregar el nuevo patrón de URL a `PREMIUM_ENDPOINTS` en `PremiumContentMiddleware`.
2. **En el Frontend**: Implementar verificación en el componente correspondiente, similar a los ejemplos existentes.

```python
# Ejemplo: Añadir una nueva ruta protegida
PREMIUM_ENDPOINTS = [
    # ... rutas existentes ...
    r'^api/nueva-funcionalidad',
]
```

### 8.2 Excepciones a la Protección

Para excepciones específicas (endpoints que deben ser públicos):

```python
# Ejemplo: Añadir una excepción
PUBLIC_EXCEPTIONS = [
    # ... excepciones existentes ...
    r'^api/nueva-funcionalidad/preview',
]
```

### 8.3 Aplicar el Decorador a Vistas Específicas

Para una protección más específica, aplicar el decorador a vistas individuales:

```python
# Ejemplo: Proteger una vista específica
@premium_required
@api_view(['GET'])
def vista_protegida(request):
    # Código de la vista
    return Response(...)
```

## 9. Resolución de Problemas

### 9.1 Errores Comunes

| Síntoma | Posible Causa | Solución |
|---------|---------------|----------|
| Error 403 inesperado | Usuario sin suscripción intentando acceder a contenido premium | Verificar estado de suscripción en Django Admin |
| Error 500 en verificación | Problemas de conexión con Stripe | Verificar claves API de Stripe y conexión a internet |
| Usuarios premium sin acceso | Estado de suscripción desactualizado | Ejecutar `StripeService.check_subscription_status(user)` manualmente |
| Redirección en bucle | Problema en la lógica de redirección frontend | Verificar condiciones en `useEffect` en componentes React |

### 9.2 Depuración del Sistema

Para depurar el sistema:

1. **Logs Django**: Revisar los logs del servidor Django para mensajes del middleware.
2. **Estado de Usuario**: Verificar el estado `has_active_subscription` y `is_premium` en la base de datos.
3. **Consola del Navegador**: Revisar mensajes de consola en el frontend para redirecciones.
4. **Dashboard de Stripe**: Verificar el estado actual de la suscripción en el panel de Stripe.

### 9.3 Comandos Útiles para Administradores

```python
# Shell de Django para verificar suscripciones
python manage.py shell

# En el shell:
from api.models import User
from api.services import StripeService

# Verificar suscripción de un usuario
user = User.objects.get(username='nombre_usuario')
StripeService.check_subscription_status(user)

# Forzar actualización de todos los usuarios
for user in User.objects.all():
    StripeService.check_subscription_status(user)
```

---

Este documento proporciona una visión general completa del sistema de protección de contenido premium implementado en la plataforma TR3 Comunitat. Para preguntas específicas o asistencia adicional, contacte al equipo de desarrollo.

**Última Actualización**: [FECHA]