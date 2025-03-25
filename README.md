# TR3 Comunitat

Plataforma educativa con funcionalidades de comunidad, cursos y mensajería privada.

## Integrantes del Equipo
* [Nombre del integrante 1]
* [Nombre del integrante 2]
* [Nombre del integrante 3]

## Descripción del Proyecto

TR3 Comunitat es una plataforma de suscripción premium para cursos y comunidad educativa. Ofrece funcionalidades como:

* Sistema de cursos y lecciones
* Comunidad interactiva con publicaciones, comentarios y reacciones
* Sistema de gamificación con niveles y logros
* Calendario compartido de eventos
* Mensajería privada en tiempo real
* Sistema de suscripción premium

## Tecnologías Utilizadas

* **Backend**: Django con Django REST Framework
* **Frontend**: Next.js (TypeScript, React)
* **Base de datos**: PostgreSQL para el sistema principal, MongoDB para mensajería
* **Tiempo real**: Socket.io para mensajería privada
* **Autenticación**: JWT
* **Estilos**: TailwindCSS
* **Contenedores**: Docker y Docker Compose

## Enlaces del Proyecto

* **Gestor de tareas**: [Enlace a Taiga/Jira/Trello]
* **Diseño UI/UX**: [Enlace a Penpot/Figma]
* **Repositorio de código**: [Enlace a GitHub]
* **URL de producción**: [Pendiente]

## Estructura del Proyecto

```
tr3-comunitat/
├── backend/             # Aplicación Django
├── frontend/            # Aplicación Next.js
├── messaging-service/   # Servicio de mensajería (Node.js, Socket.io)
└── docker-compose.yml   # Configuración Docker
```

## Configuración de Desarrollo

1. Clonar el repositorio
2. Configurar variables de entorno:
   ```
   cp .env.example .env
   ```
3. Iniciar los servicios con Docker:
   ```
   docker-compose up
   ```
4. Acceder a la aplicación:
   * Frontend: http://localhost:3000
   * API Django: http://localhost:8000/api
   * Adminer (DB): http://localhost:8080
   * Servicio de mensajería: http://localhost:3001

## Funcionalidades Principales

### Sistema de Usuarios y Autenticación
* Registro y login con JWT
* Perfiles expandidos con avatares, niveles y datos personalizados

### Plataforma de Cursos
* Visualización de cursos y módulos
* Seguimiento de progreso personal
* Reproductor de video personalizado

### Comunidad Interactiva
* Feed de publicaciones con filtrado por categorías
* Sistema de comentarios anidados y reacciones
* Publicaciones fijadas importantes

### Mensajería Privada
* Conversaciones en tiempo real con Socket.io
* Notificaciones de mensajes no leídos
* Estado de escritura e indicadores en línea/offline
* Historial completo de conversaciones

### Gamificación
* Sistemas de niveles y puntos de experiencia
* Logros desbloqueables
* Ranking de usuarios

## Estado Actual del Proyecto

[Descripción del estado actual y próximos pasos]

## Documentación Adicional

Para más detalles sobre cada componente:
* [Documentación de API](doc/api.md)
* [Guía de Despliegue](doc/deployment.md)
* [Manual de Usuario](doc/user_manual.md)
