import React from 'react';

import { CalendarEvent as CalendarEventType } from '@/types/Calendar';
import { formatTime, getEventColor } from '@/utils/calendarUtils';

interface CalendarEventProps {
    event: CalendarEventType;
    onClick?: (event: CalendarEventType) => void;
}

export const CalendarEvent: React.FC<CalendarEventProps> = ({ event, onClick }) => {
    const handleClick = () => {
        if (onClick) {
            onClick(event);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (onClick) {
                onClick(event);
            }
        }
    };

    return (
        <div
            className={`px-1 py-0.5 text-xs text-white rounded truncate cursor-pointer hover:opacity-90 transition-opacity ${getEventColor(event.type)}`}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`Event: ${event.title} at ${formatTime(event.start)}`}
        >
            <span className="mr-1">{formatTime(event.start)}</span>
            <span className="truncate">- {event.title}</span>
        </div>
    );
};