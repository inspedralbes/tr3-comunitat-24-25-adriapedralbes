"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { CourseGrid } from '@/components/Classroom/CourseGrid';
import { CourseDetail } from '@/components/Classroom/Courses/CourseDetail';
import MainLayout from '@/components/layouts/MainLayout';
import { default as authService, UserProfile } from '@/services/auth';
import { default as courseService } from '@/services/courses';
import { default as subscriptionService } from '@/services/subscription';
import { default as userProgressService } from '@/services/userProgress';
import { Course } from '@/types/Course';
import { CourseWithLessons, Lesson } from '@/types/Lesson';

export default function ClassroomPage() {
    const router = useRouter();
    
    // Estado para el usuario
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    // Estado para los cursos
    // Definimos un tipo para los cursos formateados que usamos internamente
    type FormattedCourse = {
        id: string;
        title: string;
        description: string;
        imageUrl: string;
        progress: number;
        lessonsCount: number;
        isPrivate: boolean;
    };
    
    const [courses, setCourses] = useState<FormattedCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    // Estado para manejar el curso seleccionado
    const [selectedCourse, setSelectedCourse] = useState<CourseWithLessons | null>(null);

    // Verificar autenticación y suscripción
    useEffect(() => {
        // Función para verificar autenticación y suscripción al cargar la página
        const checkAuth = async () => {
            setLoading(true);
            
            // Verificar si está autenticado
            if (!authService.isAuthenticated()) {
                router.push('/perfil');
                return;
            }
            
            try {
                // Obtener perfil del usuario
                const profile = await authService.getProfile();
                setUserProfile(profile);
                setIsAdmin(profile.is_staff || profile.is_superuser || false);
                
                // Verificar suscripción
                const subscriptionStatus = await subscriptionService.getSubscriptionStatus().catch(error => {
                    console.error('Error al verificar suscripción:', error);
                    // En caso de error, permitimos acceso temporal
                    return { has_subscription: true, subscription_status: 'temp_access', start_date: null, end_date: null };
                });
                
                console.warn('Estado de suscripción:', subscriptionStatus);
                
                // Si no tiene suscripción, redirigir a la página de perfil
                if (!subscriptionStatus.has_subscription) {
                    console.warn('Usuario sin suscripción, redirigiendo al perfil');
                    router.push('/perfil');
                    return;
                }
            } catch (error) {
                console.error('Error general al verificar acceso:', error);
            }
            // No establecemos loading en false aquí, lo hará el efecto de carga de datos
        };
        
        checkAuth();
    }, [router]);
    
    // Cargar progreso del usuario para todos los cursos
    useEffect(() => {
        const fetchUserProgress = async () => {
            if (!userProfile) return;
            
            try {
                // Solo intentar obtener el progreso si el usuario está autenticado
                if (authService.isAuthenticated()) {
                    const userProgressData = await userProgressService.getUserProgress();
                    // Procesamos y asociamos el progreso a los cursos
                    if (Array.isArray(userProgressData) && userProgressData.length > 0) {
                        setCourses(prevCourses => {
                            // Crear un mapa para acceso rápido
                            const progressMap = new Map(
                                userProgressData.map(progress => [progress.course_id, progress])
                            );
                            
                            // Actualizar el progreso de cada curso
                            return prevCourses.map(course => {
                                const courseProgress = progressMap.get(course.id);
                                if (courseProgress) {
                                    return {
                                        ...course,
                                        progress: courseProgress.progress_percentage || 0
                                    } as FormattedCourse;
                                }
                                return course;
                            });
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching user progress:', error);
                // No mostrar error al usuario para no interrumpir la UX
            }
        };

        // Esperar a que se carguen los cursos antes de intentar actualizar el progreso
        if (courses.length > 0) {
            fetchUserProgress();
        }
    }, [userProfile, courses.length]);

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
                    lessonsCount: course.lessons_count || 0,
                    isPrivate: false // Todos los cursos son públicos según el requerimiento
                }));
                
                setCourses(formattedCourses as FormattedCourse[]);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    // Manejador para cuando un curso es seleccionado
    const handleCourseClick = (courseId: string | number): void => {
        // Convertimos courseId a string si es un número
        const courseIdStr = courseId.toString();
        
        (async () => {
        try {
            setLoading(true);
            
            // Obtener detalle del curso
            const courseDetail = await courseService.getCourseById(courseIdStr);
            
            // Verificar que tenemos lecciones
            const lessons = Array.isArray(courseDetail.lessons) ? courseDetail.lessons : [];
            
            // Formatear las lecciones para el componente CourseDetail
            const formattedLessons: Lesson[] = lessons.map((lesson) => {
                console.warn('Contenido de lección:', lesson.content);
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
            console.error(`Error fetching course ${courseIdStr}:`, error);
        } finally {
            setLoading(false);
        }
        })();
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
                {/* Enlace a administración de cursos (solo para administradores) */}
                {isAdmin && (
                    <div className="flex justify-end mb-4">
                        <Link 
                            href="/classroom/admin" 
                            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                        >
                            Administrar cursos
                        </Link>
                    </div>
                )}

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