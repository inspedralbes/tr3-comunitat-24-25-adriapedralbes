"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { CourseGrid } from '@/components/Classroom/CourseGrid';
import { CourseDetail } from '@/components/Classroom/Courses/CourseDetail';
import MainLayout from '@/components/layouts/MainLayout';
import courseService from '@/services/courses';
import { Course } from '@/types/Course';
import { CourseWithLessons, Lesson } from '@/types/Lesson';

export default function ClassroomPage() {
    // Estado para los cursos
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    // Estado para manejar el curso seleccionado
    const [selectedCourse, setSelectedCourse] = useState<CourseWithLessons | null>(null);

    // Cargar cursos al inicializar la página
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const coursesData = await courseService.getAllCourses();
                
                // Asegurarnos de que tenemos un array
                if (!Array.isArray(coursesData)) {
                    console.error('Unexpected data format from API:', coursesData);
                    setCourses([]);
                    return;
                }
                
                // Convertir formato de API a formato para CourseGrid
                const formattedCourses = coursesData.map((course: Course) => ({
                    id: course.id,
                    title: course.title,
                    description: course.description || '',
                    imageUrl: course.thumbnail_url || '/api/placeholder/600/400',
                    progress: course.progress_percentage,
                    isPrivate: false // Todos los cursos son públicos según el requerimiento
                }));
                
                setCourses(formattedCourses);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    // Manejador para cuando un curso es seleccionado
    const handleCourseClick = async (courseId: string) => {
        try {
            setLoading(true);
            
            // Obtener detalle del curso
            const courseDetail = await courseService.getCourseById(courseId);
            
            // Verificar que tenemos lecciones
            const lessons = Array.isArray(courseDetail.lessons) ? courseDetail.lessons : [];
            
            // Formatear las lecciones para el componente CourseDetail
            const formattedLessons: Lesson[] = lessons.map((lesson: any) => {
                console.log('Contenido de lección:', lesson.content);
                return {
                    id: lesson.id,
                    title: lesson.title,
                    content: {
                        heading: lesson.title,
                        paragraphs: [],
                        html: typeof lesson.content === 'object' ? lesson.content.html : ''
                    },
                    isCompleted: false,
                    order: lesson.order
                };
            });
            
            // Crear objeto CourseWithLessons
            const courseWithLessons: CourseWithLessons = {
                id: courseDetail.id,
                title: courseDetail.title,
                description: courseDetail.description || '',
                imageUrl: courseDetail.thumbnail_url || '/api/placeholder/600/400',
                progress: courseDetail.progress_percentage,
                isPrivate: false, // Todos son públicos según requerimientos
                lessons: formattedLessons
            };
            
            setSelectedCourse(courseWithLessons);
        } catch (error) {
            console.error(`Error fetching course ${courseId}:`, error);
        } finally {
            setLoading(false);
        }
    };

    // Manejador para volver a la lista de cursos
    const handleBackToList = () => {
        setSelectedCourse(null);
    };

    if (loading && !selectedCourse && courses.length === 0) {
        return (
            <MainLayout activeTab="classroom">
                <div className="container mx-auto px-4 max-w-6xl pt-6 sm:pt-8 pb-10 flex justify-center items-center min-h-[60vh]">
                    <p className="text-lg text-white/70">Cargando cursos...</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout activeTab="classroom">
            {/* Contenido principal */}
            <div className="container mx-auto px-4 max-w-6xl pt-6 sm:pt-8 pb-10">
                {/* Enlace a administración de cursos */}
                <div className="flex justify-end mb-4">
                    <Link 
                        href="/classroom/admin" 
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                    >
                        Administrar cursos
                    </Link>
                </div>

                {selectedCourse ? (
                    // Vista detallada del curso
                    <CourseDetail
                        course={selectedCourse}
                        onBack={handleBackToList}
                    />
                ) : (
                    // Lista de cursos
                    <CourseGrid
                        courses={courses}
                        onCourseClick={handleCourseClick}
                    />
                )}
            </div>
        </MainLayout>
    );
}