"use client";

import React, { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { CourseGrid, Course } from '@/components/Classroom/CourseGrid';
import { CourseDetail } from '@/components/Classroom/Courses/CourseDetail';
import { mockCourses, mockCoursesWithLessons } from '@/mockData/mockCoursesData';
import { CourseWithLessons } from '@/types/Lesson';

export default function ClassroomPage() {
    // Estado para manejar el curso seleccionado
    const [selectedCourse, setSelectedCourse] = useState<CourseWithLessons | null>(null);

    // Manejador para cuando un curso es seleccionado
    const handleCourseClick = (courseId: number | string) => {
        const course = mockCoursesWithLessons.find(course => course.id === courseId);
        if (course) {
            setSelectedCourse(course);
        } else {
            // Si no se encuentra en la versión con lecciones, buscar en la versión simple
            const simpleCourse = mockCourses.find(course => course.id === courseId);
            if (simpleCourse) {
                // Convertir a CourseWithLessons con lecciones vacías (o crear lecciones por defecto)
                const convertedCourse: CourseWithLessons = {
                    ...simpleCourse,
                    lessons: [] // Aquí podrías generar lecciones predeterminadas si lo deseas
                };
                setSelectedCourse(convertedCourse);
            }
        }
    };

    // Manejador para volver a la lista de cursos
    const handleBackToList = () => {
        setSelectedCourse(null);
    };

    return (
        <MainLayout activeTab="classroom">
            {/* Contenido principal */}
            <div className="container mx-auto px-4 max-w-6xl pt-6 sm:pt-8 pb-10">
                {selectedCourse ? (
                    // Vista detallada del curso
                    <CourseDetail
                        course={selectedCourse}
                        onBack={handleBackToList}
                    />
                ) : (
                    // Lista de cursos
                    <CourseGrid
                        courses={mockCourses}
                        onCourseClick={handleCourseClick}
                    />
                )}
            </div>
        </MainLayout>
    );
}