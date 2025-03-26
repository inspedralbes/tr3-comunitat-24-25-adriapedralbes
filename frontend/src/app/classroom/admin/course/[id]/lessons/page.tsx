"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Plus, Trash2 } from 'lucide-react';
import MainLayout from '@/components/layouts/MainLayout';
import courseService from '@/services/courses';
import { Course, CourseDetail, Lesson } from '@/types/Course';

export default function AdminCourseLessonsPage({ params }: { params: { id: string } }) {
  // Usando React.use para desenvolver el objeto params
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.id;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const courseData = await courseService.getCourseById(courseId);
        setCourse(courseData);
        setLessons(courseData.lessons || []);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta lección? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await courseService.deleteLesson(lessonId);
      // Actualizar la lista de lecciones después de eliminar
      setLessons(lessons.filter(lesson => lesson.id !== lessonId));
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Error al eliminar la lección. Inténtalo de nuevo.');
    }
  };

  return (
    <MainLayout activeTab="classroom">
      <div className="container mx-auto px-4 max-w-6xl pt-6 sm:pt-8 pb-10">
        <Link 
          href="/classroom/admin"
          className="text-white/70 hover:text-white flex items-center gap-1 mb-6"
        >
          <ArrowLeft size={16} />
          <span>Volver a la lista de cursos</span>
        </Link>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">
            {loading ? 'Cargando...' : `Lecciones: ${course?.title || ''}`}
          </h1>
          
          <Link 
            href={`/classroom/admin/course/${courseId}/lessons/new`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Nueva Lección</span>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10 bg-[#323230] rounded-lg">
            <p className="text-white/70">Cargando lecciones...</p>
          </div>
        ) : (
          <div className="bg-[#323230] rounded-lg overflow-hidden border border-white/10">
            <table className="w-full text-left text-white/90">
              <thead className="bg-[#1F1F1E] text-white/70 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Orden</th>
                  <th className="px-6 py-3">Título</th>
                  <th className="px-6 py-3">Fecha de creación</th>
                  <th className="px-6 py-3">Última actualización</th>
                  <th className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {lessons.sort((a, b) => a.order - b.order).map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-[#3A3A38]">
                    <td className="px-6 py-4 font-medium">{lesson.order}</td>
                    <td className="px-6 py-4 font-medium">{lesson.title}</td>
                    <td className="px-6 py-4">
                      {lesson.created_at ? new Date(lesson.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {lesson.updated_at ? new Date(lesson.updated_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <Link 
                        href={`/classroom/admin/course/${courseId}/lessons/${lesson.id}`} 
                        className="text-yellow-500 hover:text-yellow-400"
                        title="Editar lección"
                      >
                        <Edit size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="text-red-500 hover:text-red-400"
                        title="Eliminar lección"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}

                {lessons.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-white/50">
                      Este curso no tiene lecciones. Agrega una nueva lección para empezar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
