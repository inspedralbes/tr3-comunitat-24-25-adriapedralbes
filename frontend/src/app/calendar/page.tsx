"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Calendar } from '@/components/Calendar/Calendar';
import { EventDetailModal } from '@/components/Calendar/EventDetailModel';
import MainLayout from '@/components/layouts/MainLayout';
import { mockEvents } from '@/mockData/calendarEvents';
import { authService } from '@/services/auth';
import { fetchEvents } from '@/services/eventService';
import subscriptionService from '@/services/subscription';
import { CalendarEvent } from '@/types/Calendar';

export default function CalendarPage() {
    const router = useRouter();
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [usingMockData, setUsingMockData] = useState(false);

    // Verificar autenticación y suscripción
    useEffect(() => {
        // Función para verificar autenticación y suscripción al cargar la página
        const checkAuth = async () => {
            setIsLoading(true);

            // Verificar si está autenticado
            if (!authService.isAuthenticated()) {
                router.push('/perfil');
                return;
            }

            try {
                // Verificar suscripción
                const subscriptionStatus = await subscriptionService.getSubscriptionStatus().catch(error => {
                    console.error('Error al verificar suscripción:', error);
                    // En caso de error, permitimos acceso temporal
                    return { has_subscription: true, subscription_status: 'temp_access', start_date: null, end_date: null };
                });

                console.warn('Estado de suscripción:', subscriptionStatus);

                // Si no tiene suscripción, redirigir a la página de perfil
                if (!subscriptionStatus.has_subscription) {
                    console.warn('Usuario sin suscripción, redirigiendo al perfil');
                    router.push('/perfil');
                    return;
                }

                // Continuar con la carga de datos
                getEvents();
            } catch (error) {
                console.error('Error general al verificar acceso:', error);
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    // Función para cargar eventos del calendario
    const getEvents = async () => {
        try {
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