"use client";

import React, { useState, useEffect } from 'react';

import { CalendarEvent, MonthData } from '@/types/Calendar';
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
    const [viewMode, setViewMode] = useState<'month' | 'list'>('month');

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

    const handleViewChange = (view: 'month' | 'list') => {
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

            {/* Aquí se pueden agregar otras vistas (semana, día, lista) */}
        </div>
    );
};