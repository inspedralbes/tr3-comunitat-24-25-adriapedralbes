"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ArrowLeft } from 'lucide-react';
import { CourseWithLessons, Lesson } from '@/types/Lesson';

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

    // Obtener la lección activa
    const activeLesson = lessons.find(lesson => lesson.id === activeLessonId) || lessons[0];

    // Función para marcar una lección como completada o no completada
    const toggleLessonCompletion = (lessonId: string) => {
        const updatedLessons = lessons.map(lesson =>
            lesson.id === lessonId
                ? { ...lesson, isCompleted: !lesson.isCompleted }
                : lesson
        );

        setLessons(updatedLessons);

        // Calcular el nuevo progreso
        const completedCount = updatedLessons.filter(lesson => lesson.isCompleted).length;
        const newProgress = Math.round((completedCount / updatedLessons.length) * 100);
        setProgress(newProgress);
    };

    // Cambiar a otra lección
    const changeLesson = (lessonId: string) => {
        setActiveLessonId(lessonId);
    };

    // Navegar a la lección siguiente
    const goToNextLesson = () => {
        const currentIndex = lessons.findIndex(lesson => lesson.id === activeLessonId);
        if (currentIndex < lessons.length - 1) {
            setActiveLessonId(lessons[currentIndex + 1].id);
        }
    };

    // Navegar a la lección anterior
    const goToPrevLesson = () => {
        const currentIndex = lessons.findIndex(lesson => lesson.id === activeLessonId);
        if (currentIndex > 0) {
            setActiveLessonId(lessons[currentIndex - 1].id);
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
                    <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 bg-[#1F1F1E] rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <span className="text-zinc-400 text-xs">{progress}%</span>
                    </div>
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
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeLesson.isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-white/10 text-white/50 hover:bg-white/20'
                            }`}
                    >
                        <Check size={18} />
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

                {/* Texto descriptivo */}
                <div className="space-y-4 text-white/80">
                    {activeLesson.content.paragraphs.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}

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
        </div>
    );
};