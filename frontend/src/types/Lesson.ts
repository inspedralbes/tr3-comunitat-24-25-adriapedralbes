export interface Lesson {
    id: string;
    title: string;
    content: {
        heading: string;
        subheading?: string;
        imageUrl?: string;
        paragraphs: string[];
        callToAction?: {
            text: string;
            url: string;
        };
        html?: string;
    };
    isCompleted: boolean;
    order?: number;
    created_at?: string;
    updated_at?: string;
}

// Actualizar interfaz Course para incluir lecciones
export interface CourseWithLessons {
    id: number | string;
    title: string;
    description?: string;
    imageUrl: string;
    progress: number;
    isPrivate: boolean;
    lessons: Lesson[];
}