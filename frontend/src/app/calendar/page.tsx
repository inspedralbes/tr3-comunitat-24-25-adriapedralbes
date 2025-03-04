"use client";

import React, { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { Calendar } from '@/components/Calendar/Calendar';
import { EventDetailModal } from '@/components/Calendar/EventDetailModel';
import { mockEvents } from '@/mockData/calendarEvents';
import { CalendarEvent } from '@/types/Calendar';

export default function CalendarPage() {
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <MainLayout activeTab="calendar">
            <div className="container mx-auto px-4 max-w-6xl pt-6 sm:pt-8 pb-10">
                <Calendar
                    events={mockEvents}
                    onEventClick={handleEventClick}
                />

                <EventDetailModal
                    event={selectedEvent}
                    isOpen={isModalOpen}
                    onClose={closeModal}
                />
            </div>
        </MainLayout>
    );
}