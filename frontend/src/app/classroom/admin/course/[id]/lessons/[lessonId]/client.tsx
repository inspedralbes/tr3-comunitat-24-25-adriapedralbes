"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import LessonEditor from '@/components/Classroom/Admin/LessonEditor';
import courseService from '@/services/courses';
import { Lesson } from '@/types/Course';

interface EditLessonClientProps {
  courseId: string;
  lessonId: string;
}

export default function EditLessonClient({ courseId, lessonId }: EditLessonClientProps) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const lessonData = await courseService.getLessonById(lessonId);
        setLesson(lessonData);
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError('No se pudo cargar la lección. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  if (loading) {
    return (
      <MainLayout activeTab="classroom">
        <div className="container mx-auto px-4 max-w-6xl pt-6 sm:pt-8 pb-10">
          <h1 className="text-2xl font-bold text-white mb-6">Cargando lección...</h1>
        </div>
      </MainLayout>
    );
  }

  if (error || !lesson) {
    return (
      <MainLayout activeTab="classroom">
        <div className="container mx-auto px-4 max-w-6xl pt-6 sm:pt-8 pb-10">
          <h1 className="text-2xl font-bold text-white mb-6">Error</h1>
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-md">
            {error || 'No se pudo encontrar la lección solicitada.'}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout activeTab="classroom">
      <div className="container mx-auto px-4 max-w-6xl pt-6 sm:pt-8 pb-10">
        <h1 className="text-2xl font-bold text-white mb-6">Editar Lección: {lesson.title}</h1>
        
        <LessonEditor 
          courseId={courseId}
          lessonId={lessonId}
          initialData={lesson}
        />
      </div>
    </MainLayout>
  );
}