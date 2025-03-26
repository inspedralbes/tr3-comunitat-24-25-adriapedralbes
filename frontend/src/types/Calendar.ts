export interface CalendarEvent {
    id: number;
    title: string;
    start: Date;
    end?: Date;
    type: 'english' | 'masterclass' | 'workshop' | 'mockinterview' | 'other';
    color?: string;
    allDay?: boolean;
    description?: string;
    meetingUrl?: string;
}

export type ViewMode = 'month' | 'week' | 'day' | 'list';

export type HeaderViewMode = 'month' | 'list';

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