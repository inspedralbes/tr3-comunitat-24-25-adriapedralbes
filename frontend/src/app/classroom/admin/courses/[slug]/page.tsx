"use client";

import React, { useState, useEffect, use } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import CourseEditor from '@/components/Classroom/Admin/CourseEditor';
import courseService from '@/services/courses';
import { Course } from '@/types/Course';

export default function EditCoursePage({ params }: { params: { slug: string } }) {
  // Usando React.use para desenvolver el objeto params
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.slug;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const courseData = await courseService.getCourseById(courseId);
        setCourse(courseData);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('No se pudo cargar el curso. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <MainLayout activeTab="classroom">
        <div className="container mx-auto px-4 max-w-6xl pt-6 sm:pt-8 pb-10">
          <h1 className="text-2xl font-bold text-white mb-6">Cargando curso...</h1>
        </div>
      </MainLayout>
    );
  }

  if (error || !course) {
    return (
      <MainLayout activeTab="classroom">
        <div className="container mx-auto px-4 max-w-6xl pt-6 sm:pt-8 pb-10">
          <h1 className="text-2xl font-bold text-white mb-6">Error</h1>
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-md">
            {error || 'No se pudo encontrar el curso solicitado.'}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout activeTab="classroom">
      <div className="container mx-auto px-4 max-w-6xl pt-6 sm:pt-8 pb-10">
        <h1 className="text-2xl font-bold text-white mb-6">Editar Curso: {course.title}</h1>
        
        <CourseEditor 
          courseId={courseId}
          initialData={course}
        />
      </div>
    </MainLayout>
  );
}
