# Documentación del Sistema de Progreso de Usuario

Este documento describe la implementación del sistema de seguimiento de progreso de usuario en la plataforma TR3 Comunitat, específicamente para el módulo de cursos y lecciones.

## Estructura General

El sistema de progreso se compone de:

1. **Backend** (Django):
   - Modelos para almacenar el progreso de lecciones y cursos
   - API endpoints para gestionar este progreso
   - Lógica para calcular automáticamente el progreso global

2. **Frontend** (Next.js):
   - Servicios para comunicarse con la API
   - Hooks para facilitar el uso en componentes React
   - Integración con la UI de la plataforma

## Componentes del Backend

### Modelos

El sistema utiliza dos modelos principales:

1. **UserLessonProgress**: Registra el progreso individual por lección
   - `user`: Usuario al que pertenece el progreso
   - `lesson`: Lección a la que se refiere
   - `completed`: Estado de completado (boolean)
   - `completion_date`: Fecha de completado (opcional)
   - `time_spent_seconds`: Tiempo dedicado a la lección (opcional)

2. **UserCourseProgress**: Registra el progreso global por curso
   - `user`: Usuario al que pertenece el progreso
   - `course`: Curso al que se refiere
   - `progress_percentage`: Porcentaje de progreso (0-100)
   - `last_accessed_at`: Última vez que se accedió al curso
   - `completed_at`: Fecha de completado del curso (opcional)

### API Endpoints

Los siguientes endpoints están disponibles:

1. **Progreso de Lecciones**:
   - `GET /api/user/lessons/progress/`: Listar progreso de lecciones del usuario
   - `POST /api/user/lessons/progress/`: Crear nuevo progreso de lección
   - `PATCH /api/user/lessons/progress/{id}/`: Actualizar progreso existente

2. **Progreso de Cursos**:
   - `GET /api/user/courses/progress/`: Listar progreso de cursos del usuario
   - `GET /api/user/courses/progress/{id}/`: Obtener progreso de un curso específico
   - `POST /api/user/courses/progress/{id}/mark_lesson_complete/`: Marcar lección como completada
   - `POST /api/user/courses/progress/{id}/mark_lesson_incomplete/`: Marcar lección como no completada

### Cálculo Automático

Cuando se actualiza el progreso de una lección (completada o no), el sistema automáticamente:

1. Calcula el número total de lecciones en el curso
2. Cuenta cuántas lecciones ha completado el usuario
3. Calcula el porcentaje de progreso (lecciones completadas / total * 100)
4. Actualiza el registro `UserCourseProgress` correspondiente

## Componentes del Frontend

### Servicio de Progreso de Usuario

El archivo `userProgress.ts` contiene el servicio que interactúa con la API:

- `getUserProgress()`: Obtiene el progreso de todos los cursos
- `getCourseProgress(courseId)`: Obtiene el progreso de un curso específico
- `markLessonAsCompleted(courseId, lessonId)`: Marca una lección como completada
- `markLessonAsNotCompleted(courseId, lessonId)`: Marca una lección como no completada
- `updateLessonTimeSpent(courseId, lessonId, timeSpentSeconds)`: Registra el tiempo dedicado

### Hook de React

El hook `useUserProgress` facilita el uso del servicio en componentes React:

```typescript
const {
  loading,            // Indica si está cargando datos
  error,              // Error en caso de fallo
  progress,           // Datos completos de progreso
  progressPercentage, // Porcentaje de progreso (0-100)
  completedLessons,   // Array de IDs de lecciones completadas
  isLessonCompleted,  // Función que comprueba si una lección está completada
  markLessonAsCompleted,    // Función para marcar como completada
  markLessonAsNotCompleted, // Función para marcar como no completada
  toggleLessonCompletion,   // Alterna el estado de completado
  trackLessonTime,          // Registra tiempo de una lección
  refreshProgress           // Recarga los datos de progreso
} = useUserProgress(courseId);
```

## Uso del Sistema

### Marcar Lecciones como Completadas/No Completadas

```jsx
import { useUserProgress } from '@/hooks/useUserProgress';

const LessonView = ({ courseId, lessonId }) => {
  const { 
    isLessonCompleted, 
    markLessonAsCompleted,
    markLessonAsNotCompleted 
  } = useUserProgress(courseId);
  
  const completed = isLessonCompleted(lessonId);
  
  const handleToggleCompletion = async () => {
    if (completed) {
      await markLessonAsNotCompleted(lessonId);
    } else {
      await markLessonAsCompleted(lessonId);
    }
  };
  
  return (
    <div>
      <h1>Lección</h1>
      <button onClick={handleToggleCompletion}>
        {completed ? 'Marcar como no completada' : 'Marcar como completada'}
      </button>
    </div>
  );
};
```

### Mostrar Progreso Global

```jsx
import { useUserProgress } from '@/hooks/useUserProgress';

const CourseProgress = ({ courseId }) => {
  const { progressPercentage, loading, error } = useUserProgress(courseId);
  
  if (loading) return <p>Cargando progreso...</p>;
  if (error) return <p>Error al cargar progreso</p>;
  
  return (
    <div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progressPercentage}%` }} 
        />
      </div>
      <p>{Math.round(progressPercentage)}% completado</p>
    </div>
  );
};
```

## Consideraciones Técnicas

1. **Persistencia**: El progreso se almacena en la base de datos y persiste entre sesiones.

2. **Cache**: El hook `useUserProgress` mantiene un cache local que se actualiza inmediatamente al marcar lecciones, proporcionando una experiencia de usuario fluida.

3. **Manejo de Errores**: El sistema maneja errores graciosamente y tiene mecanismos de recuperación.

4. **Cálculo Automático**: El porcentaje de progreso se recalcula automáticamente en el backend.

5. **Seguimiento de Tiempo**: Opcionalmente permite registrar el tiempo dedicado a cada lección.

## Migración desde Datos Mock

Anteriormente, la aplicación utilizaba datos mock para simular el progreso del usuario. La migración a datos reales ha implicado:

1. Creación de nuevos modelos en el backend
2. Implementación de endpoints API
3. Modificación del servicio frontend para utilizar estos endpoints
4. Mejora del hook `useUserProgress` para manejar datos reales

El flag `USE_MOCK_DATA` se ha establecido a `false` para usar los datos reales, pero se mantiene el código mock como fallback.

## Pasos de Implementación

Para habilitar este sistema:

1. Ejecutar las migraciones de Django:
   ```
   python manage.py makemigrations api
   python manage.py migrate api
   ```

2. Asegurarse de que los endpoints API están funcionando correctamente:
   - `GET /api/user/courses/progress/`
   - `GET /api/user/courses/progress/{id}/`

3. Comprobar que el servicio frontend está utilizando los datos reales (sin mock)

## Futuras Mejoras

1. **Gamificación**: Integrar más profundamente con el sistema de gamificación para otorgar puntos al completar lecciones.

2. **Reportes**: Añadir reportes y estadísticas de progreso para administradores.

3. **Progreso Offline**: Permitir guardar progreso cuando no hay conexión y sincronizar después.

4. **Certificados de Finalización**: Generar certificados automáticos al completar cursos.

5. **Tiempo Estimado**: Añadir estimaciones de tiempo para completar lecciones y cursos.
