# Documentación del Sistema de Ranking en Tiempo Real

## Descripción General

El sistema de ranking en tiempo real implementado en la plataforma de comunidad permite a los usuarios ver actualizaciones instantáneas cuando cualquier miembro gana puntos o cambia de posición en el ranking. Estas actualizaciones se muestran con animaciones visuales para resaltar los cambios, mejorando significativamente la experiencia de usuario y fomentando la participación.

## Arquitectura

El sistema utiliza una arquitectura basada en Sockets que consta de los siguientes componentes:

### Backend (Django)

1. **Servicio de Emisión de Eventos (`api/sockets.py`)**
   - Gestiona la distribución de eventos de actualización de ranking a todos los clientes conectados
   - Implementa un patrón de broadcast para enviar actualizaciones a múltiples clientes
   - Mantiene colas individuales para cada cliente conectado
   - Previene la duplicación de eventos

2. **Vistas SSE (`api/sse_views.py`)**
   - Proporciona el endpoint `/api/sse/ranking-updates/` que establece una conexión de streaming con el cliente
   - Registra nuevos clientes y maneja la desconexión
   - Envía eventos en formato SSE estándar

3. **Servicios de Gamificación (`api/gamification/services.py`)**
   - Contiene la función `award_points()` que otorga puntos a los usuarios y emite actualizaciones de ranking
   - Incluye timestamp en cada evento para permitir validación en el cliente
   - Recalcula la posición del usuario en el ranking después de obtener puntos

4. **Controladores de Likes (`api/views.py`)**
   - Implementa la lógica para los likes en posts y comentarios
   - Evita que los usuarios obtengan puntos repetidamente al dar/quitar likes al mismo contenido
   - Usa `UserActionLog` para rastrear acciones previas y prevenir abusos

### Frontend (React/Next.js)

1. **Servicio de Socket (`services/socket.ts`)**
   - Establece y mantiene la conexión SSE con el servidor
   - Maneja reconexiones automáticas en caso de pérdida de conexión
   - Decodifica eventos SSE y los distribuye a los componentes registrados
   - Filtra eventos duplicados para evitar animaciones innecesarias

2. **Componente de Leaderboard (`components/Community/LeaderboardWidget.tsx`)**
   - Muestra el ranking de usuarios con sus posiciones y puntos
   - Gestiona las animaciones visuales cuando cambian los puntos o posiciones
   - Actualiza el estado de los usuarios de manera eficiente
   - Calcula correctamente las posiciones visuales basadas en el orden real

## Características Implementadas

### Animaciones Inteligentes

- **Animación de Subida**: Efecto verde cuando un usuario sube de posición
- **Animación de Bajada**: Efecto rojo cuando un usuario baja de posición
- **Actualización de Puntos**: Efecto sutil cuando solo cambian los puntos sin afectar la posición
- **Transiciones Suaves**: Las animaciones tienen una duración adecuada (1500ms) para ser visibles sin resultar molestas

### Prevención de Explotación

- Verificación para evitar otorgar puntos repetidamente por dar/quitar likes al mismo contenido
- Uso de `UserActionLog` para rastrear las acciones ya recompensadas
- Identificación única de acciones para prevenir puntajes duplicados

### Posiciones Correctas

- Las posiciones visualizadas siempre coinciden con el orden real en la lista
- Los cambios de posición se reflejan inmediatamente
- Los indicadores de posición (1º, 2º, 3º) muestran el valor correcto sin necesidad de recargar

### Optimizaciones

- **Sin Animaciones al Cargar**: Las animaciones solo se muestran para cambios en tiempo real, no al recargar la página
- **Deduplicación de Eventos**: Evita procesamiento innecesario de eventos duplicados
- **Reconexión Automática**: El cliente intenta reconectarse si se pierde la conexión SSE
- **Mejor Rendimiento**: Optimizaciones para reducir actualizaciones de estado innecesarias

## Soluciones Técnicas Específicas

### Problema 1: Animaciones al Recargar la Página

**Solución**: 
- Modificación del sistema de registro de clientes para que no envíe el historial completo de eventos
- Implementación de validación de eventos para ignorar actualizaciones que no representen cambios reales
- Sistema de tracking de eventos duplicados en el frontend y backend

### Problema 2: Posición Incorrecta en los Badges

**Solución**:
- Cálculo dinámico de la posición basado en el índice real del usuario en el array ordenado
- Actualización inmediata del orden visual después de recibir actualizaciones

### Problema 3: Explotación de Puntos por Likes

**Solución**:
- Verificación en `PostLikeView` y `CommentLikeView` para comprobar si el usuario ya recibió puntos
- Uso de `UserActionLog` para rastrear acciones previas con un ID de referencia específico
- Separación entre la funcionalidad de likes (UI) y la recompensa de puntos (gamificación)

### Problema 4: Errores de Conexión SSE

**Solución**:
- Eliminación de cabeceras HTTP no permitidas (`Connection: keep-alive`) en WSGI
- Mejor manejo de errores y reconexión automática
- Implementación robusta del cierre de conexiones para liberar recursos


## Consejos de Mantenimiento

1. **Monitoreo de Eventos**: Revisar periódicamente los logs para detectar posibles patrones de eventos duplicados o excesivos
2. **Ajuste de Animaciones**: Las duraciones y efectos visuales pueden ajustarse en `LeaderboardWidget.tsx`
3. **Escalabilidad**: Para un gran número de usuarios, considerar implementar filtrado adicional de eventos en el servidor
4. **Depuración**: El sistema incluye logs detallados para facilitar la identificación de problemas

## Mejoras Futuras Posibles

1. **Notificaciones Push**: Añadir notificaciones para eventos importantes del ranking
2. **Filtrado por Segmentos**: Permitir visualizar el ranking por categorías o períodos
3. **Animaciones Personalizadas**: Efectos especiales para logros significativos (subir al top 3, alcanzar cierto nivel)
4. **Optimización de Rendimiento**: Implementar throttling y debouncing adicional para usuarios muy activos