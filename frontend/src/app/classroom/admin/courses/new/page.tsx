"use client";

import React from 'react';

import CourseEditor from '@/components/Classroom/Admin/CourseEditor';
import MainLayout from '@/components/layouts/MainLayout';

export default function NewCoursePage() {
  return (
    <MainLayout activeTab="classroom">
      <div className="container mx-auto px-4 max-w-6xl pt-6 sm:pt-8 pb-10">
        <h1 className="text-2xl font-bold text-white mb-6">Crear Nuevo Curso</h1>
        
        <CourseEditor />
      </div>
    </MainLayout>
  );
}
