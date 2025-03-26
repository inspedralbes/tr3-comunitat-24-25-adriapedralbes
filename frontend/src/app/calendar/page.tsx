"use client";

import React, { useState, useEffect } from 'react';

import { Calendar } from '@/components/Calendar/Calendar';
import { EventDetailModal } from '@/components/Calendar/EventDetailModel';
import MainLayout from '@/components/layouts/MainLayout';
import { mockEvents } from '@/mockData/calendarEvents';
import { fetchEvents } from '@/services/eventService';
import { CalendarEvent } from '@/types/Calendar';

export default function CalendarPage() {
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [usingMockData, setUsingMockData] = useState(false);

    useEffect(() => {
        const getEvents = async () => {
            try {
                setIsLoading(true);
                setError(null);
                setUsingMockData(false);
                
                console.log("Fetching calendar events...");
                // Auto-use mock data on failure
                const fetchedEvents = await fetchEvents(undefined, undefined, undefined, true);
                
                // If fetchEvents returns mockEvents (due to API failure), we're using mock data
                if (fetchedEvents === mockEvents) {
                    setUsingMockData(true);
                }
                
                setEvents(fetchedEvents);
            } catch (err) {
                console.error("Failed to fetch events:", err);
                setError("Failed to load events. Please try again later.");
                setUsingMockData(true);
                setEvents(mockEvents); // Fallback to mock data
            } finally {
                setIsLoading(false);
            }
        };

        getEvents();
    }, []);

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
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                        <p>Error al cargar los eventos. Por favor, inténtelo de nuevo más tarde.</p>
                    </div>
                ) : usingMockData ? (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
                        <p>Usando datos de ejemplo. No se pudo conectar con el servidor.</p>
                    </div>
                ) : null}

                <Calendar
                    events={events}
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