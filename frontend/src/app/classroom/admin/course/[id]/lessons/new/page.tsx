"use client";

import React, { use } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import LessonEditor from '@/components/Classroom/Admin/LessonEditor';

export default function NewLessonPage({ params }: { params: { id: string } }) {
  // Usando React.use para desenvolver el objeto params
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.id;

  return (
    <MainLayout activeTab="classroom">
      <div className="container mx-auto px-4 max-w-6xl pt-6 sm:pt-8 pb-10">
        <h1 className="text-2xl font-bold text-white mb-6">Crear Nueva Lección</h1>
        
        <LessonEditor courseId={courseId} />
      </div>
    </MainLayout>
  );
}
