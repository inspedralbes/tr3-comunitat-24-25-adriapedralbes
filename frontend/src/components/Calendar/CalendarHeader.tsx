import React from 'react';
import { ChevronLeft, ChevronRight, List, Calendar as CalendarIcon } from 'lucide-react';
import { getMonthName } from '@/utils/calendarUtils';

interface CalendarHeaderProps {
    year: number;
    month: number;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onTodayClick: () => void;
    onViewChange: (view: 'month' | 'list') => void;
    currentView: 'month' | 'list';
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    year,
    month,
    onPrevMonth,
    onNextMonth,
    onTodayClick,
    onViewChange,
    currentView
}) => {
    // Get current timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const cityName = timezone.split('/')[1]?.replace('_', ' ') || timezone;

    // Get current time for the header
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    return (
        <div className="bg-[#323230] rounded-lg p-4 mb-2">
            <div className="flex justify-between items-center mb-2">
                <button
                    className="px-3 py-1 bg-[#444] hover:bg-[#555] text-white text-sm rounded transition-colors"
                    onClick={onTodayClick}
                >
                    Today
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onPrevMonth}
                        className="p-1 rounded-full hover:bg-[#444] transition-colors"
                    >
                        <ChevronLeft size={20} className="text-white" />
                    </button>

                    <h2 className="text-xl font-medium text-white">
                        {getMonthName(month)} {year}
                    </h2>

                    <button
                        onClick={onNextMonth}
                        className="p-1 rounded-full hover:bg-[#444] transition-colors"
                    >
                        <ChevronRight size={20} className="text-white" />
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        className={`p-2 rounded ${currentView === 'list' ? 'bg-[#555]' : 'bg-[#444] hover:bg-[#555]'} transition-colors`}
                        onClick={() => onViewChange('list')}
                    >
                        <List size={16} className="text-white" />
                    </button>
                    <button
                        className={`p-2 rounded ${currentView === 'month' ? 'bg-[#555]' : 'bg-[#444] hover:bg-[#555]'} transition-colors`}
                        onClick={() => onViewChange('month')}
                    >
                        <CalendarIcon size={16} className="text-white" />
                    </button>
                </div>
            </div>

            <div className="text-sm text-gray-400">
                {currentTime} {cityName} time
            </div>
        </div>
    );
};