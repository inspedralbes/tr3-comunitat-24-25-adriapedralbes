"use client";

import { Check, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

import { toast } from '@/components/ui/toast';
import { default as authService } from '@/services/auth';
import { default as userProgressService } from '@/services/userProgress';
import { CourseWithLessons, Lesson } from '@/types/Lesson';

import { default as ProgressIndicator } from '../ProgressIndicator';

interface CourseDetailProps {
    course: CourseWithLessons;
    onBack: () => void;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({ course, onBack }) => {
    // Estado para la lección actualmente seleccionada
    const [activeLessonId, setActiveLessonId] = useState<string>(
        // Inicializar con la primera lección o con una lección completada si existe
        course.lessons.find(lesson => !lesson.isCompleted)?.id || course.lessons[0].id
    );

    // Estado para las lecciones (para poder marcarlas como completadas)
    const [lessons, setLessons] = useState<Lesson[]>(course.lessons);

    // Estado para el progreso del curso
    const [progress, setProgress] = useState<number>(course.progress);
    
    // Estado para indicar si está guardando el progreso
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // Cargar progreso desde la API al iniciar
    useEffect(() => {
        const loadUserProgress = async () => {
            try {
                // Verificar que el usuario esté autenticado antes de intentar obtener el progreso
                if (!authService.isAuthenticated()) return;
                
                // Obtener el progreso guardado para este curso
                // Convertimos a string para garantizar la compatibilidad de tipos
                const courseProgress = await userProgressService.getCourseProgress(String(course.id));
                
                // Actualizar las lecciones completadas según el progreso guardado
                if (courseProgress && courseProgress.completed_lessons) {
                    const completedLessonIds = new Set(
                        courseProgress.completed_lessons
                            .filter(lp => lp.completed)
                            .map(lp => lp.lesson_id)
                    );
                    
                    // Actualizar el estado local con las lecciones completadas
                    setLessons(prevLessons => 
                        prevLessons.map(lesson => ({
                            ...lesson,
                            isCompleted: completedLessonIds.has(lesson.id)
                        }))
                    );
                    
                    // Actualizar el progreso con el valor de la API
                    setProgress(courseProgress.progress_percentage || 0);
                }
            } catch (error) {
                console.error('Error al cargar el progreso del usuario:', error);
                // No mostrar error al usuario para no interrumpir su experiencia
            }
        };
        
        loadUserProgress();
    }, [course.id]);

    // Obtener la lección activa
    const activeLesson = lessons.find(lesson => lesson.id === activeLessonId) || lessons[0];

    // Función para marcar una lección como completada o no completada
    const toggleLessonCompletion = async (lessonId: string) => {
        // Encontrar la lección actual
        const lesson = lessons.find(l => l.id === lessonId);
        if (!lesson) return;
        
        // Determinar el nuevo estado de completado
        const newCompletionStatus = !lesson.isCompleted;
        
        try {
            setIsSaving(true);
            
            // Actualizar en la base de datos
            if (newCompletionStatus) {
                await userProgressService.markLessonAsCompleted(String(course.id), lessonId);
            } else {
                await userProgressService.markLessonAsNotCompleted(String(course.id), lessonId);
            }
            
            // Actualizar estado local
            const updatedLessons = lessons.map(l =>
                l.id === lessonId
                    ? { ...l, isCompleted: newCompletionStatus }
                    : l
            );
            
            setLessons(updatedLessons);
            
            // Calcular el nuevo progreso
            const completedCount = updatedLessons.filter(l => l.isCompleted).length;
            const newProgress = Math.round((completedCount / updatedLessons.length) * 100);
            setProgress(newProgress);
            
            // Mostrar notificación de éxito
            toast.success(newCompletionStatus 
                ? "Lección marcada como completada" 
                : "Lección marcada como no completada"
            );
        } catch (error) {
            console.error('Error al actualizar el progreso de la lección:', error);
            toast.error("No se pudo actualizar el progreso. Inténtalo de nuevo.");
        } finally {
            setIsSaving(false);
        }
    };

    // Cambiar a otra lección
    const changeLesson = (lessonId: string) => {
        setActiveLessonId(lessonId);
    };

    // Navegar a la lección siguiente (se mantiene para posible uso futuro)
    const _goToNextLesson = () => {
        const currentIndex = lessons.findIndex(lesson => lesson.id === activeLessonId);
        if (currentIndex < lessons.length - 1) {
            setActiveLessonId(lessons[currentIndex + 1].id);
        }
    };

    // Navegar a la lección anterior (se mantiene para posible uso futuro)
    const _goToPrevLesson = () => {
        const currentIndex = lessons.findIndex(lesson => lesson.id === activeLessonId);
        if (currentIndex > 0) {
            setActiveLessonId(lessons[currentIndex - 1].id);
        }
    };

    // Manejador del teclado para las lecciones
    const handleLessonKeyDown = (e: React.KeyboardEvent, lessonId: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            changeLesson(lessonId);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 w-full">
            {/* Navegación lateral (izquierda) */}
            <div className="w-full md:w-72 flex-shrink-0">
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-4">
                        <button
                            onClick={onBack}
                            className="text-white/70 hover:text-white flex items-center gap-1 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            <span>Volver</span>
                        </button>
                    </div>

                    <h2 className="text-xl font-medium text-white mb-2">{course.title}</h2>
                    <ProgressIndicator 
                        progress={progress || 0}
                        lessonsCount={lessons.length}
                        completedLessons={lessons.filter(l => l.isCompleted).length}
                        variant="detailed"
                        className="mb-4 mt-3"
                    />
                </div>

                {/* Menú de módulos del curso */}
                <div className="space-y-1">
                    {lessons.map((lesson) => (
                        <div
                            key={lesson.id}
                            className={`px-4 py-3 rounded-md cursor-pointer flex justify-between items-center ${lesson.id === activeLessonId
                                ? 'bg-amber-500 text-black font-medium'
                                : 'hover:bg-[#323230] text-white/80'
                                } transition-colors`}
                            onClick={() => changeLesson(lesson.id)}
                            onKeyDown={(e) => handleLessonKeyDown(e, lesson.id)}
                            tabIndex={0}
                            role="button"
                            aria-label={`Lección: ${lesson.title} ${lesson.isCompleted ? '(completada)' : ''}`}
                        >
                            <span>{lesson.title}</span>
                            {lesson.isCompleted && (
                                <Check
                                    className={`flex-shrink-0 ${lesson.id === activeLessonId ? 'text-black' : 'text-green-400'
                                        }`}
                                    size={18}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Contenido principal (derecha) */}
            <div className="flex-1 bg-[#323230] rounded-lg p-6 border border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-medium text-white">{activeLesson.content.heading}</h1>
                    <button
                        onClick={() => toggleLessonCompletion(activeLessonId)}
                        disabled={isSaving}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeLesson.isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-white/10 text-white/50 hover:bg-white/20'
                            } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={activeLesson.isCompleted ? "Marcar como no completada" : "Marcar como completada"}
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Check size={18} />
                        )}
                    </button>
                </div>

                {activeLesson.content.subheading && (
                    <h2 className="text-xl font-medium text-white mb-4">{activeLesson.content.subheading}</h2>
                )}

                {/* Banner del curso */}
                {activeLesson.content.imageUrl && (
                    <div className="mb-6 rounded-lg overflow-hidden">
                        <div className="relative w-full h-64 bg-indigo-900">
                            <Image
                                src={activeLesson.content.imageUrl}
                                alt={activeLesson.title}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <h3 className="text-4xl font-bold text-white">DevAccelerator™</h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contenido HTML si existe */}
                {activeLesson.content.html && (
                    <div className="lesson-content text-white/80 prose prose-invert max-w-none"
                         dangerouslySetInnerHTML={{ __html: activeLesson.content.html }}
                    ></div>
                )}

                {/* Texto descriptivo */}
                {activeLesson.content.paragraphs && activeLesson.content.paragraphs.length > 0 && (
                    <div className="space-y-4 text-white/80">
                        {activeLesson.content.paragraphs.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                )}

                {/* Call to action si existe */}
                {activeLesson.content.callToAction && (
                    <div className="pt-6">
                        <Link
                            href={activeLesson.content.callToAction.url}
                            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                        >
                            {activeLesson.content.callToAction.text}
                        </Link>
                    </div>
                )}

                {/* URL si existe */}
                {activeLesson.content.callToAction?.url && (
                    <p className="text-blue-400 hover:underline pt-4">
                        <Link href={activeLesson.content.callToAction.url}>
                            {activeLesson.content.callToAction.url}
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
};