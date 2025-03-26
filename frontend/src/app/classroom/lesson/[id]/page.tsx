"use client";

import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import LessonViewer from '@/components/Classroom/LessonViewer';
import MainLayout from '@/components/layouts/MainLayout';
import { default as courseService } from '@/services/courses';
import { Lesson } from '@/types/Course';


export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const lessonId = params.id as string;
        const lessonData = await courseService.getLesson(lessonId);
        setLesson(lessonData);
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError('No se pudo cargar la lección. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchLesson();
    }
  }, [params.id]);

  const handleGoBack = () => {
    if (lesson?.course) {
      router.push(`/classroom/courses/${lesson.course}`);
    } else {
      router.push('/classroom');
    }
  };

  return (
    <MainLayout activeTab="classroom">
      <div className="container mx-auto px-4 max-w-4xl pt-6 sm:pt-8 pb-10">
        <button
          onClick={handleGoBack}
          className="text-white/70 hover:text-white flex items-center gap-1 mb-6"
        >
          <ArrowLeft size={16} />
          <span>Volver al curso</span>
        </button>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-md">
            {error}
          </div>
        ) : lesson ? (
          <LessonViewer lesson={lesson} />
        ) : (
          <div className="text-center py-12">
            <p className="text-white/70">No se encontró la lección</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
