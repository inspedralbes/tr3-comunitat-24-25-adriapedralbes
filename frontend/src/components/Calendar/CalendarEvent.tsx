'use client';

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

  const getEventTypeText = (type: string) => {
    const types = {
      english: 'Inglés',
      masterclass: 'Masterclass',
      workshop: 'Taller',
      mockinterview: 'Entrevista simulada',
      other: 'Otro'
    };
    return types[type as keyof typeof types] || type;
  };

  const getEventIcon = (type: string) => {
    const icons = {
      english: '🗣️',
      masterclass: '👨‍🏫',
      workshop: '🛠️',
      mockinterview: '💼',
      other: '📅'
    };
    return icons[type as keyof typeof icons] || '📅';
  };

  return (
    <div
      className={`group relative flex flex-col gap-0.5 p-1.5 text-sm text-white 
        rounded-lg cursor-pointer transition-all duration-200 ease-in-out
        hover:shadow-lg hover:scale-[1.02] active:scale-100 
        ${getEventColor(event.type)} hover:ring-2 hover:ring-white/20`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Evento: ${event.title} a las ${formatTime(event.start)}`}
    >
      {/* Contenedor principal con efecto de glassmorphism en hover */}
      <div className="relative z-10">
        {/* Título y tipo */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-shrink-0 text-base leading-none filter drop-shadow-sm">
            {getEventIcon(event.type)}
          </span>
          <span className="font-medium truncate pr-6">
            {event.title}
          </span>
          {event.meetingUrl && (
            <span className="absolute right-0 top-0.5 text-base leading-none opacity-75">
              🎥
            </span>
          )}
        </div>

        {/* Hora */}
        <div className="flex items-center gap-1 mt-0.5 text-xs text-white/90">
          {event.allDay ? (
            <span className="inline-flex items-center gap-1">
              <span className="text-white/75">📅</span>
              Todo el día
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <span className="text-white/75">⏰</span>
              {formatTime(event.start)}
              {event.end && ` - ${formatTime(event.end)}`}
            </span>
          )}
        </div>

        {/* Descripción (visible en hover) */}
        {event.description && (
          <div className="mt-1 text-xs opacity-0 group-hover:opacity-90 transition-opacity line-clamp-1 text-white/90">
            <span className="inline-flex items-center gap-1">
              <span className="text-white/75">📝</span>
              {event.description}
            </span>
          </div>
        )}
      </div>

      {/* Efectos visuales */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/10 rounded-full" />
    </div>
  );
};

export default CalendarEvent;