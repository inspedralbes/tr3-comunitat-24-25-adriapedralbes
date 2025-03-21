# Sistema de Gamificación

Este sistema implementa mecánicas de gamificación para la plataforma, incluyendo un sistema de niveles, puntos, logros y una tabla de clasificación.

## Características

- **Sistema de Niveles**: Los usuarios suben de nivel al acumular puntos.
- **Sistema de Puntos**: Los usuarios ganan puntos por diversas acciones en la plataforma.
- **Logros Desbloqueables**: Los usuarios desbloquean logros al completar ciertos hitos.
- **Tabla de Clasificación**: Muestra los usuarios con más puntos.
- **Notificaciones de Logros**: Alerta a los usuarios cuando suben de nivel o desbloquean un logro.

## Estructura de Archivos

### Backend (Django)

- `models.py`: Define los modelos de datos para el sistema de gamificación.
- `services.py`: Contiene la lógica principal del sistema.
- `views.py`: Endpoints de API para acceder al sistema de gamificación.
- `urls.py`: Definición de rutas para los endpoints de gamificación.
- `fixtures/initial_gamification_data.py`: Script para inicializar datos de gamificación.

### Frontend (Next.js)

- `services/gamification.ts`: Cliente de API para interactuar con el backend.
- `components/gamification/`: Componentes de React para visualizar el sistema de gamificación.
- `hooks/useGamificationNotifications.ts`: Hook para gestionar notificaciones de gamificación.

## Modelos de Datos

### UserLevel
Define los niveles y requisitos de puntos para subir de nivel.

| Campo           | Tipo            | Descripción                           |
|-----------------|-----------------|---------------------------------------|
| level           | PositiveInteger | Número de nivel (único)               |
| points_required | PositiveInteger | Puntos necesarios para alcanzar nivel |
| title           | CharField       | Título del nivel                      |
| badge_color     | CharField       | Color CSS para el badge de nivel      |
| icon            | CharField       | Ícono para el nivel                   |
| description     | TextField       | Descripción del nivel                 |

### UserAction
Define las acciones que otorgan puntos a los usuarios.

| Campo        | Tipo          | Descripción                                   |
|--------------|---------------|-----------------------------------------------|
| action_type  | CharField     | Tipo de acción (create_post, daily_login, etc)|
| points       | PositiveInteger | Puntos otorgados por la acción               |
| description  | CharField     | Descripción de la acción                      |
| is_active    | BooleanField  | Si la acción está activa o no                 |

### UserActionLog
Registra cada instancia de acción realizada por un usuario.

| Campo          | Tipo            | Descripción                              |
|----------------|-----------------|------------------------------------------|
| user           | ForeignKey(User) | Usuario que realizó la acción            |
| action         | ForeignKey(UserAction) | Referencia a la acción             |
| points_earned  | PositiveInteger | Puntos ganados                           |
| created_at     | DateTimeField   | Fecha y hora de la acción                |
| reference_id   | CharField       | ID de referencia (post, comentario, etc) |

### UserAchievement
Define los logros que pueden desbloquear los usuarios.

| Campo           | Tipo           | Descripción                                |
|-----------------|----------------|--------------------------------------------|
| name            | CharField      | Nombre del logro                           |
| description     | TextField      | Descripción del logro                      |
| achievement_type| CharField      | Tipo de logro (post_count, level_up, etc)  |
| icon            | CharField      | Ícono para el logro                        |
| badge_color     | CharField      | Color CSS para el badge del logro          |
| points_reward   | PositiveInteger| Puntos otorgados al desbloquear el logro   |
| required_value  | PositiveInteger| Valor requerido para desbloquear el logro  |
| is_hidden       | BooleanField   | Si el logro está oculto hasta desbloquearlo|

### UserAchievementUnlock
Registra los logros desbloqueados por cada usuario.

| Campo          | Tipo                       | Descripción                      |
|----------------|----------------------------|----------------------------------|
| user           | ForeignKey(User)           | Usuario que desbloqueó el logro  |
| achievement    | ForeignKey(UserAchievement)| Referencia al logro              |
| unlocked_at    | DateTimeField              | Fecha y hora del desbloqueo      |

## Servicios Principales

### Otorgar Puntos
`award_points(user, action_type, reference_id=None)`: Otorga puntos a un usuario por una acción específica.

### Verificar Subida de Nivel
`check_level_up(user, old_points)`: Verifica si el usuario ha subido de nivel con los puntos ganados.

### Verificar Logros
`check_achievements(user)`: Verifica si el usuario ha conseguido nuevos logros.

### Obtener Puntos para Siguiente Nivel
`get_points_to_next_level(user)`: Calcula cuántos puntos faltan para el siguiente nivel.

## Endpoints de API

- `GET /api/gamification/user/progression/`: Obtiene información sobre la progresión del usuario actual.
- `GET /api/gamification/user/achievements/`: Obtiene los logros desbloqueados por el usuario actual.
- `POST /api/gamification/user/daily-login/`: Registra el acceso diario del usuario y otorga puntos.
- `GET /api/gamification/levels/`: Obtiene el leaderboard de niveles de usuario.
- `GET /api/gamification/achievements/`: Obtiene la lista de todos los logros disponibles.

## Inicialización del Sistema

Para inicializar el sistema de gamificación con datos predeterminados, ejecute:

```bash
python manage.py setup_gamification
```

## Tablas de Puntos y Niveles

### Puntos por Acciones

| Acción              | Puntos |
|---------------------|--------|
| Crear post          | 10     |
| Crear comentario    | 5      |
| Recibir like en post| 3      |
| Recibir like en comentario | 2 |
| Dar like a post     | 1      |
| Dar like a comentario | 1    |
| Acceso diario       | 2      |
| Desbloquear logro   | 15     |

### Requisitos de Niveles

| Nivel | Título      | Puntos Requeridos |
|-------|-------------|-------------------|
| 1     | Novato      | 0                 |
| 2     | Aprendiz    | 100               |
| 3     | Participante| 238               |
| 4     | Contribuidor| 400               |
| 5     | Experto     | 559               |
| 6     | Especialista| 734               |
| 7     | Maestro     | 927               |
| 8     | Gurú        | 1134              |
| 9     | Leyenda     | 1357              |
| 10    | Visionario  | 1590              |

## Uso

### Backend

1. Importar el servicio de gamificación:
   ```python
   from api.gamification.services import award_points
   ```

2. Otorgar puntos a un usuario:
   ```python
   result = award_points(user, 'create_post', reference_id=str(post.id))
   ```

### Frontend

1. Importar componentes de gamificación:
   ```tsx
   import { UserLevel, LeaderboardCard } from '@/components/gamification';
   ```

2. Usar el servicio de gamificación:
   ```tsx
   import { gamificationService } from '@/services/gamification';
   
   // En un componente:
   const { data } = useQuery('userProgress', gamificationService.getUserProgression);
   ```

3. Mostrar notificaciones de logros:
   ```tsx
   import { useGamificationNotifications } from '@/hooks/useGamificationNotifications';
   
   // En un componente:
   const { notifyAchievementUnlock, notifyLevelUp } = useGamificationNotifications();
   ```
