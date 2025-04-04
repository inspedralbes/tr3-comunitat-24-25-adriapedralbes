import React from 'react';

import { CourseCard } from './CourseCard';

export interface Course {
    id: number | string;
    title: string;
    description?: string;
    imageUrl: string;
    progress: number;
    isPrivate: boolean;
    lessonsCount?: number; // Añadir campo para número de lecciones
}

interface CourseGridProps {
    courses: Course[];
    onCourseClick?: (courseId: number | string) => void;
}

export const CourseGrid: React.FC<CourseGridProps> = ({
    courses,
    onCourseClick
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
                <CourseCard
                    key={course.id}
                    id={typeof course.id === 'string' ? course.id : course.id.toString()}
                    title={course.title}
                    description={course.description}
                    imageUrl={course.imageUrl}
                    progress={course.progress}
                    lessonsCount={course.lessonsCount}
                    isPrivate={course.isPrivate}
                    onClick={() => onCourseClick && onCourseClick(course.id)}
                />
            ))}
        </div>
    );
};