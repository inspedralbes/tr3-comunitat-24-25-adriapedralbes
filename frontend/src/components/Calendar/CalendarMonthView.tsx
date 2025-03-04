import React from 'react';
import { MonthData, CalendarEvent } from '@/types/Calendar';
import { CalendarDay } from './CalendarDay';
import { getDayName } from '@/utils/calendarUtils';

interface CalendarMonthViewProps {
    monthData: MonthData;
    onEventClick?: (event: CalendarEvent) => void;
}

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
    monthData,
    onEventClick
}) => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="bg-[#1F1F1E] rounded-lg overflow-hidden border border-[#333]">
            {/* Cabecera con los nombres de los días */}
            <div className="grid grid-cols-7 bg-[#2C2C2A]">
                {dayNames.map((day, index) => (
                    <div key={day} className="p-2 text-center text-white font-medium border-r border-[#333] last:border-r-0">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid de días */}
            <div className="grid grid-cols-7">
                {monthData.days.map((day, index) => (
                    <CalendarDay
                        key={index}
                        day={day}
                        onEventClick={onEventClick}
                    />
                ))}
            </div>
        </div>
    );
};