export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end?: Date;
    type: 'english' | 'masterclass' | 'workshop' | 'mockinterview' | 'other';
    color?: string;
    allDay?: boolean;
}

export type ViewMode = 'month' | 'week' | 'day' | 'list';

export interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    events: CalendarEvent[];
}

export interface MonthData {
    year: number;
    month: number; // 0-11
    days: CalendarDay[];
}