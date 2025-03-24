'use client';

import { X } from 'lucide-react';
import React from 'react';

import { CalendarEvent } from '@/types/Calendar';
import { formatTime, getEventColor } from '@/utils/calendarUtils';

interface EventDetailModalProps {
    event: CalendarEvent | null;
    isOpen: boolean;
    onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
    event,
    isOpen,
    onClose
}) => {
    if (!isOpen || !event) return null;

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('es', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }).format(date);
    };

    const eventTypeLabel = () => {
        const types = {
            english: 'Clase de Inglés',
            masterclass: 'Masterclass',
            workshop: 'Taller',
            mockinterview: 'Entrevista simulada',
            other: 'Evento'
        };
        return types[event.type as keyof typeof types] || 'Evento';
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

    const getDuration = (start: Date, end?: Date) => {
        if (!end) return '60 minutos';
        const diff = end.getTime() - start.getTime();
        const minutes = Math.round(diff / 1000 / 60);
        if (minutes < 60) return `${minutes} minutos`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 
            ? `${hours} hora${hours > 1 ? 's' : ''} y ${remainingMinutes} minutos`
            : `${hours} hora${hours > 1 ? 's' : ''}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div 
                className="bg-[#2C2C2A] rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header con el tipo de evento */}
                <div className={`${getEventColor(event.type)} p-6 flex items-center gap-3`}>
                    <span className="text-2xl">{getEventIcon(event.type)}</span>
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-1">{event.title}</h2>
                        <span className="text-sm text-white/90">{eventTypeLabel()}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-black/20 rounded-lg"
                        aria-label="Cerrar"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Fecha y hora */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-white">
                            <span className="text-xl">📅</span>
                            <div>
                                <p className="capitalize font-medium">{formatDate(event.start)}</p>
                                <p className="text-sm text-gray-400">
                                    {event.allDay ? (
                                        'Todo el día'
                                    ) : (
                                        <>
                                            {formatTime(event.start)}
                                            {event.end && ` - ${formatTime(event.end)}`}
                                            <span className="text-gray-500 ml-2">
                                                ({getDuration(event.start, event.end)})
                                            </span>
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Descripción */}
                    {event.description && (
                        <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-gray-300 text-sm leading-relaxed">{event.description}</p>
                        </div>
                    )}

                    {/* Botón de unirse */}
                    {event.meetingUrl && (
                        <a 
                            href={event.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${getEventColor(event.type)} hover:opacity-90 text-white py-3 px-4 rounded-lg transition-all w-full flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl active:transform active:scale-95`}
                        >
                            🎥 Unirse a la reunión
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};