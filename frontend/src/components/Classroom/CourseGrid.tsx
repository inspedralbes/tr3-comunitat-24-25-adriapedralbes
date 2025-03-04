import React from 'react';
import { CourseCard } from './CourseCard';

export interface Course {
    id: number | string;
    title: string;
    description?: string;
    imageUrl: string;
    progress: number;
    isPrivate: boolean;
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
                    title={course.title}
                    description={course.description}
                    imageUrl={course.imageUrl}
                    progress={course.progress}
                    isPrivate={course.isPrivate}
                    onClick={() => onCourseClick && onCourseClick(course.id)}
                />
            ))}
        </div>
    );
};