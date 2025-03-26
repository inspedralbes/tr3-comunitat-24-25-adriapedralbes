"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit, Plus, Trash2 } from 'lucide-react';
import MainLayout from '@/components/layouts/MainLayout';
import courseService from '@/services/courses';
import { Course } from '@/types/Course';

export default function AdminClassroomPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await courseService.getAllCourses();
        
        // Verificar que los datos son un array
        if (Array.isArray(data)) {
          setCourses(data);
        } else {
          console.error('Unexpected data format from API:', data);
          setCourses([]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <MainLayout activeTab="classroom">
      <div className="container mx-auto px-4 max-w-6xl pt-6 sm:pt-8 pb-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Administrar Cursos</h1>
          <Link 
            href="/classroom/admin/courses/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Nuevo Curso</span>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-white/70">Cargando cursos...</p>
          </div>
        ) : (
          <div className="bg-[#323230] rounded-lg overflow-hidden border border-white/10">
            <table className="w-full text-left text-white/90">
              <thead className="bg-[#1F1F1E] text-white/70 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Título</th>
                  <th className="px-6 py-3">Descripción</th>
                  <th className="px-6 py-3">Lecciones</th>
                  <th className="px-6 py-3">Progreso</th>
                  <th className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-[#3A3A38]">
                    <td className="px-6 py-4 font-medium">{course.title}</td>
                    <td className="px-6 py-4 line-clamp-1">{course.description || 'Sin descripción'}</td>
                    <td className="px-6 py-4">{course.lessons_count}</td>
                    <td className="px-6 py-4">{course.progress_percentage}%</td>
                    <td className="px-6 py-4 flex gap-2">
                      <Link 
                        href={`/classroom/admin/courses/${course.id}`} 
                        className="text-yellow-500 hover:text-yellow-400"
                        title="Editar curso"
                      >
                        <Edit size={18} />
                      </Link>
                      <Link 
                        href={`/classroom/admin/course/${course.id}/lessons`} 
                        className="text-blue-500 hover:text-blue-400"
                        title="Administrar lecciones"
                      >
                        <Plus size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}

                {courses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-white/50">
                      No hay cursos disponibles. Crea un nuevo curso para comenzar.
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
