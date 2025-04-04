"use client";

import React from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import LessonEditor from '@/components/Classroom/Admin/LessonEditor';

interface NewLessonClientProps {
  courseId: string;
}

export default function NewLessonClient({ courseId }: NewLessonClientProps) {
  return (
    <MainLayout activeTab="classroom">
      <div className="container mx-auto px-4 max-w-6xl pt-6 sm:pt-8 pb-10">
        <h1 className="text-2xl font-bold text-white mb-6">Crear Nueva Lección</h1>
        
        <LessonEditor courseId={courseId} />
      </div>
    </MainLayout>
  );
}
