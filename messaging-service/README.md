# Servicio de Mensajería TR3 Comunitat

Este microservicio proporciona funcionalidades de mensajería en tiempo real para la plataforma TR3 Comunitat, permitiendo el intercambio de mensajes privados entre usuarios.

## Características

- Mensajería en tiempo real mediante Socket.io
- Historial completo de conversaciones
- Notificaciones de mensajes no leídos
- Indicador de "escribiendo" en tiempo real
- Confirmaciones de lectura
- Indicadores de estado en línea/offline
- Persistencia de mensajes con MongoDB

## Estructura del proyecto

```
messaging-service/
├── src/
│   ├── config/
│   │   ├── database.js     # Configuración de MongoDB
│   │   └── socket.js       # Configuración de Socket.io
│   ├── middleware/
│   │   └── auth.js         # Middleware de autenticación JWT
│   ├── models/
│   │   └── message.js      # Modelo de datos para mensajes
│   ├── routes/
│   │   └── messages.js     # Rutas API para mensajes
│   ├── socket/
│   │   └── handlers.js     # Manejadores de eventos Socket.io
│   └── index.js            # Punto de entrada principal
├── Dockerfile
├── .env.example            # Plantilla de variables de entorno
├── .env                    # Variables de entorno (no incluir en git)
└── package.json
```

## Requisitos

- Node.js 16+
- MongoDB
- Token JWT compatible con el sistema de autenticación principal

## Instalación

1. Clonar el repositorio
2. Crear archivo `.env` basado en `.env.example`:
```
cp .env.example .env
```
3. Modificar `.env` con los valores correctos
4. Instalar dependencias:
```
npm install
```

## Ejecución

```
npm run dev   # Desarrollo con recarga automática
npm start     # Producción
```

## Docker

El servicio está configurado para ejecutarse en Docker:

```
docker-compose up messaging
```

## Endpoints de API

- `GET /api/messages/conversations` - Obtener todas las conversaciones
- `GET /api/messages/conversation/:userId` - Obtener mensajes de una conversación
- `PATCH /api/messages/read/:messageId` - Marcar un mensaje como leído

## Eventos de Socket.io

### Cliente a Servidor

- `private_message` - Enviar un mensaje privado
- `typing` - Indicar estado de escritura
- `mark_read` - Marcar mensajes como leídos
- `get_online_status` - Solicitar estado en línea de usuarios

### Servidor a Cliente

- `new_message` - Recibir un nuevo mensaje privado
- `message_sent` - Confirmación de mensaje enviado
- `user_typing` - Recibir estado de escritura de un usuario
- `messages_read` - Notificación de que los mensajes fueron leídos
- `user_status` - Cambio de estado en línea/offline de un usuario
- `online_status_list` - Lista de estados en línea de usuarios

## Integración con el Frontend

El frontend utiliza los siguientes componentes para integrar el sistema de mensajería:

- `NotificationIcon` - Muestra contador de mensajes no leídos en la barra de navegación
- `ConversationList` - Lista de conversaciones actuales
- `Conversation` - Visualiza una conversación individual
- `UserSearch` - Permite buscar usuarios para iniciar nuevas conversaciones
