import React from 'react';
import { CalendarDay as CalendarDayType, CalendarEvent } from '@/types/Calendar';
import { CalendarEvent as CalendarEventComponent } from './CalendarEvent';

interface CalendarDayProps {
    day: CalendarDayType;
    onEventClick?: (event: CalendarEvent) => void;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({ day, onEventClick }) => {
    const { date, isCurrentMonth, isToday, events } = day;

    return (
        <div className={`border-t border-l border-[#333] p-1 min-h-24 ${isCurrentMonth ? 'bg-[#323230]' : 'bg-[#262624] opacity-50'}`}>
            <div className="flex justify-between items-center mb-1">
                <span
                    className={`text-sm ${isToday
                            ? 'font-bold text-blue-400 bg-blue-900/20 rounded-full w-6 h-6 flex items-center justify-center'
                            : isCurrentMonth ? 'text-white' : 'text-gray-500'
                        }`}
                >
                    {date.getDate()}
                </span>
                {isToday && <span className="text-xs text-blue-400">Today</span>}
            </div>

            <div className="space-y-1">
                {events.map((event) => (
                    <CalendarEventComponent
                        key={event.id}
                        event={event}
                        onClick={() => onEventClick && onEventClick(event)}
                    />
                ))}
            </div>
        </div>
    );
};