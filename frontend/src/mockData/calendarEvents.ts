import { CalendarEvent } from "@/types/Calendar";

// Función auxiliar para crear fechas
const createDate = (year: number, month: number, day: number, hour: number, minute: number = 0): Date => {
    return new Date(year, month, day, hour, minute);
};

// Mock de eventos para el calendario
export const mockEvents: CalendarEvent[] = [
    {
        id: 1,
        title: "Mock Interview",
        start: createDate(2025, 2, 24, 18), // 24 de marzo, 6pm
        type: "mockinterview"
    },
    {
        id: 2,
        title: "Workshop",
        start: createDate(2025, 2, 26, 18, 30), // 26 de marzo, 6:30pm
        type: "workshop"
    },
    {
        id: 3,
        title: "English (Advanced)",
        start: createDate(2025, 2, 27, 14, 30), // 27 de marzo, 2:30pm
        type: "english"
    },
    {
        id: 4,
        title: "English (Intermediate)",
        start: createDate(2025, 2, 4, 14, 30), // 4 de abril, 2:30pm
        type: "english"
    },
    {
        id: 5,
        title: "English (Beginner)",
        start: createDate(2025, 2, 6, 14, 30), // 6 de abril, 2:30pm
        type: "english"
    },
    {
        id: 6,
        title: "Mock Interview",
        start: createDate(2025, 2, 10, 18), // 10 de abril, 6pm
        type: "mockinterview"
    },
    {
        id: 7,
        title: "Masterclass",
        start: createDate(2025, 2, 12, 18, 30), // 12 de abril, 6:30pm
        type: "masterclass"
    },
    {
        id: 8,
        title: "English (Intermediate)",
        start: createDate(2025, 2, 13, 14, 30), // 13 de abril, 2:30pm
        type: "english"
    },
    {
        id: 9,
        title: "Mock Interview",
        start: createDate(2025, 2, 17, 18), // 17 de abril, 6pm
        type: "mockinterview"
    },
    {
        id: 10,
        title: "English (Advanced)",
        start: createDate(2025, 2, 18, 14, 30), // 18 de abril, 2:30pm
        type: "english"
    },
    {
        id: 11,
        title: "Masterclass",
        start: createDate(2025, 2, 19, 18, 30), // 19 de abril, 6:30pm
        type: "masterclass"
    },
    {
        id: 12,
        title: "English (Beginner)",
        start: createDate(2025, 2, 20, 14, 30), // 20 de abril, 2:30pm
        type: "english"
    },
    {
        id: 13,
        title: "Mock Interview",
        start: createDate(2025, 2, 24, 18), // 24 de abril, 6pm
        type: "mockinterview"
    },
    {
        id: 14,
        title: "English (Intermediate)",
        start: createDate(2025, 2, 27, 14, 30), // 27 de abril, 2:30pm
        type: "english"
    },
    {
        id: 15,
        title: "Mock Interview",
        start: createDate(2025, 2, 31, 18), // 31 de abril, 6pm
        type: "mockinterview"
    },
    {
        id: 16,
        title: "English (Advanced)",
        start: createDate(2025, 3, 1, 14, 30), // 1 de mayo, 2:30pm
        type: "english"
    },
    {
        id: 17,
        title: "English (Beginner)",
        start: createDate(2025, 3, 3, 14, 30), // 3 de mayo, 2:30pm
        type: "english"
    }
];