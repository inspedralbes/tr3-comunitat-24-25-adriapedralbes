# Documentación del Calendario

## Índice
1. [Estructura General](#estructura-general)
2. [Componentes](#componentes)
3. [Tipos de Datos](#tipos-de-datos)
4. [Servicios](#servicios)
5. [Utilidades](#utilidades)
6. [Guía de Personalización](#guía-de-personalización)

## Estructura General

El calendario es una aplicación Next.js que se integra con un backend Django. La aplicación permite visualizar y gestionar eventos de diferentes tipos (clases de inglés, masterclasses, talleres, entrevistas simuladas).

### Características Principales
- Vista mensual de eventos
- Modal detallado para cada evento
- Soporte para eventos de día completo
- Enlaces directos a reuniones virtuales
- Interfaz adaptativa y responsiva
- Temas de color según el tipo de evento

## Componentes

### 1. Calendar (`/components/Calendar/Calendar.tsx`)
Componente principal que orquesta la vista del calendario.
```typescript
interface CalendarProps {
    events: CalendarEvent[];
    onEventClick?: (event: CalendarEvent) => void;
}
```

### 2. CalendarEvent (`/components/Calendar/CalendarEvent.tsx`)
Representa un evento individual en el calendario.
- Muestra título, hora, tipo y estado de la reunión
- Efectos hover para información adicional
- Accesibilidad mediante teclado

### 3. EventDetailModal (`/components/Calendar/EventDetailModel.tsx`)
Modal que muestra los detalles completos de un evento.
- Cabecera con color según tipo de evento
- Información temporal detallada
- Botón de acceso directo a la reunión
- Descripción del evento

### 4. CalendarHeader (`/components/Calendar/CalendarHeader.tsx`)
Controles de navegación y visualización del calendario.
- Navegación entre meses
- Botón "Hoy"
- Visualización del mes y año actual

## Tipos de Datos

### CalendarEvent (`/types/Calendar.ts`)
```typescript
interface CalendarEvent {
    id: number;
    title: string;
    start: Date;
    end?: Date;
    type: 'english' | 'masterclass' | 'workshop' | 'mockinterview' | 'other';
    allDay?: boolean;
    description?: string;
    meetingUrl: string;  // Campo obligatorio para el enlace de la reunión
}
```

### Otros Tipos Importantes
```typescript
type ViewMode = 'month' | 'week' | 'day' | 'list';

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    events: CalendarEvent[];
}

interface MonthData {
    year: number;
    month: number; // 0-11
    days: CalendarDay[];
}
```

## Servicios

### eventService (`/services/eventService.ts`)
Gestiona la comunicación con el backend:
```typescript
// Obtener eventos
const fetchEvents = async (
    start?: Date,
    end?: Date,
    type?: string,
    useMockOnFailure: boolean = true
): Promise<CalendarEvent[]>
```

## Utilidades

### calendarUtils (`/utils/calendarUtils.ts`)
Funciones auxiliares para el manejo de fechas y eventos:
```typescript
// Formateo de tiempo
formatTime(date: Date): string

// Obtener color según tipo de evento
getEventColor(type: string): string

// Generar datos del mes
getMonthData(year: number, month: number, events: CalendarEvent[]): MonthData
```

## Guía de Personalización

### 1. Modificar Tipos de Eventos
Para añadir o modificar tipos de eventos:
1. Actualizar el tipo `CalendarEvent` en `/types/Calendar.ts`
2. Modificar `getEventColor` en `/utils/calendarUtils.ts`
3. Actualizar `eventTypeLabel` y `getEventIcon` en los componentes relevantes

### 2. Cambiar Estilos
Los estilos están implementados con Tailwind CSS:
- Colores de eventos: Modificar `getEventColor` en `calendarUtils.ts`
- Estilos del modal: Editar las clases en `EventDetailModel.tsx`
- Estilos de eventos: Actualizar las clases en `CalendarEvent.tsx`

### 3. Añadir Nuevas Funcionalidades
1. **Nueva Vista**:
   - Crear nuevo componente en `/components/Calendar/`
   - Actualizar `ViewMode` en `/types/Calendar.ts`
   - Modificar `Calendar.tsx` para incluir la nueva vista

2. **Nuevos Campos de Evento**:
   - Actualizar interfaz `CalendarEvent`
   - Modificar el modelo Django correspondiente
   - Actualizar `convertEventFormat` en `eventService.ts`
   - Añadir los campos en `EventDetailModel.tsx`

### 4. Integración con Backend
El calendario espera una API REST con el siguiente endpoint:
```
GET /api/events/
```

Respuesta esperada:
```json
{
    "id": number,
    "title": string,
    "start_date": string (ISO),
    "end_date": string (ISO),
    "type": string,
    "all_day": boolean,
    "description": string,
    "meeting_url": string  // URL de la reunión virtual
}
```

### Notas Importantes
- Todos los eventos son virtuales y requieren un enlace de reunión (`meeting_url`)
- No se utiliza campo de ubicación física ya que todos los eventos son online
- Los tipos de eventos están optimizados para reuniones virtuales
- El modal de detalles del evento muestra un botón directo para unirse a la reunión

## Mejores Prácticas

1. **Manejo de Errores**
   - Implementar fallback a datos mock en caso de error
   - Mostrar mensajes de error apropiados al usuario
   - Validar datos de entrada en componentes

2. **Rendimiento**
   - Usar React.memo para componentes que no necesitan actualizaciones frecuentes
   - Implementar paginación o carga infinita para grandes cantidades de eventos
   - Optimizar las llamadas a la API mediante caché

3. **Accesibilidad**
   - Mantener los atributos ARIA
   - Asegurar navegación por teclado
   - Mantener contraste de colores adecuado

4. **Mantenimiento**
   - Seguir la estructura de tipos establecida
   - Documentar cambios significativos
   - Mantener consistencia en el nombramiento de componentes y funciones