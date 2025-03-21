import { CalendarDay, CalendarEvent, MonthData } from "@/types/Calendar";

// Obtener los días para un mes específico, incluyendo días del mes anterior y siguiente para completar las semanas
export const getMonthData = (year: number, month: number, events: CalendarEvent[]): MonthData => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Día de la semana en que empieza el mes (0 = domingo, 1 = lunes, etc.)
    let firstDayOfWeek = firstDay.getDay();
    // Ajustamos para que la semana comience en lunes (0 = lunes)
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const daysInMonth = lastDay.getDate();
    const days: CalendarDay[] = [];

    // Días del mes anterior para completar la primera semana
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();

    for (let i = 0; i < firstDayOfWeek; i++) {
        const date = new Date(prevMonthYear, prevMonth, daysInPrevMonth - firstDayOfWeek + i + 1);
        days.push({
            date,
            isCurrentMonth: false,
            isToday: isSameDay(date, new Date()),
            events: getEventsForDay(date, events)
        });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        days.push({
            date,
            isCurrentMonth: true,
            isToday: isSameDay(date, new Date()),
            events: getEventsForDay(date, events)
        });
    }

    // Días del mes siguiente para completar la última semana
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    const remainingDays = 42 - days.length; // 6 semanas completas

    for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(nextMonthYear, nextMonth, i);
        days.push({
            date,
            isCurrentMonth: false,
            isToday: isSameDay(date, new Date()),
            events: getEventsForDay(date, events)
        });
    }

    return {
        year,
        month,
        days
    };
};

// Verificar si dos fechas corresponden al mismo día
export const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

// Obtener los eventos para un día específico
export const getEventsForDay = (date: Date, events: CalendarEvent[]): CalendarEvent[] => {
    return events.filter(event => isSameDay(event.start, date));
};

// Obtener el nombre del mes
export const getMonthName = (month: number): string => {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month];
};

// Obtener el nombre corto del día de la semana
export const getDayName = (day: number): string => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return dayNames[day];
};

// Obtener el color para un tipo de evento
export const getEventColor = (type: string): string => {
    switch (type) {
        case 'english':
            return 'bg-blue-600';
        case 'masterclass':
            return 'bg-purple-600';
        case 'workshop':
            return 'bg-green-600';
        case 'mockinterview':
            return 'bg-indigo-600';
        default:
            return 'bg-gray-600';
    }
};

// Formatear hora (24h a 12h con am/pm)
export const formatTime = (date: Date): string => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';

    hours = hours % 12;
    hours = hours ? hours : 12; // La hora '0' debe ser '12'

    const minutesStr = minutes < 10 ? '0' + minutes : minutes;

    return hours + (minutes > 0 ? ':' + minutesStr : '') + ampm;
};