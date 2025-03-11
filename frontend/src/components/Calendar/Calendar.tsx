"use client";

import React, { useState, useEffect } from 'react';

import { CalendarEvent, HeaderViewMode, MonthData, ViewMode } from '@/types/Calendar';
import { getMonthData } from '@/utils/calendarUtils';

import { CalendarHeader } from './CalendarHeader';
import { CalendarMonthView } from './CalendarMonthView';

interface CalendarProps {
    events: CalendarEvent[];
    onEventClick?: (event: CalendarEvent) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ events, onEventClick }) => {
    // Estado para la fecha actual del calendario
    const [currentDate, setCurrentDate] = useState(new Date());
    const [monthData, setMonthData] = useState<MonthData | null>(null);
    const [viewMode, setViewMode] = useState<HeaderViewMode>('month');

    useEffect(() => {
        // Generar los datos del mes actual
        setMonthData(getMonthData(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            events
        ));
    }, [currentDate, events]);

    // Handlers para la navegación
    const handlePrevMonth = () => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() - 1);
            return newDate;
        });
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + 1);
            return newDate;
        });
    };

    const handleTodayClick = () => {
        setCurrentDate(new Date());
    };

    const handleViewChange = (view: HeaderViewMode) => {
        setViewMode(view);
    };

    if (!monthData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="w-full">
            <CalendarHeader
                year={monthData.year}
                month={monthData.month}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onTodayClick={handleTodayClick}
                onViewChange={(view) => handleViewChange(view)}
                currentView={viewMode}
            />

            {viewMode === 'month' && (
                <CalendarMonthView
                    monthData={monthData}
                    onEventClick={onEventClick}
                />
            )}

            {viewMode === 'list' && (
                // Placeholder para la vista de lista
                <div className="p-4">
                    <h3 className="text-lg font-medium">Vista de Lista</h3>
                    <p>Vista de lista no implementada aún.</p>
                </div>
            )}
        </div>
    );
};