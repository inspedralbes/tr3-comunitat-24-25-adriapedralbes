import React from 'react';
import { X } from 'lucide-react';
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
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const eventTypeLabel = () => {
        switch (event.type) {
            case 'english':
                return 'English Class';
            case 'masterclass':
                return 'Masterclass';
            case 'workshop':
                return 'Workshop';
            case 'mockinterview':
                return 'Mock Interview';
            default:
                return 'Event';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-[#2C2C2A] rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X size={20} />
                </button>

                <div className="mb-4">
                    <span className={`inline-block px-2 py-1 text-xs text-white rounded ${getEventColor(event.type)}`}>
                        {eventTypeLabel()}
                    </span>
                </div>

                <h2 className="text-xl font-semibold text-white mb-1">{event.title}</h2>
                <p className="text-gray-300 mb-4">{formatDate(event.start)}</p>

                <div className="border-t border-gray-700 pt-4">
                    <div className="flex items-start mb-3">
                        <div className="text-gray-400 w-20">Time:</div>
                        <div className="text-white">{formatTime(event.start)}</div>
                    </div>

                    <div className="flex items-start mb-3">
                        <div className="text-gray-400 w-20">Duration:</div>
                        <div className="text-white">60 minutes</div>
                    </div>

                    <div className="flex items-start">
                        <div className="text-gray-400 w-20">Location:</div>
                        <div className="text-white">Online (Zoom)</div>
                    </div>
                </div>

                <div className="mt-6 border-t border-gray-700 pt-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors w-full">
                        Join Session
                    </button>
                </div>
            </div>
        </div>
    );
};