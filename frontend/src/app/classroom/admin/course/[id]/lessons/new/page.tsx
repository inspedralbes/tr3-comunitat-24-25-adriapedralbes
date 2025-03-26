"use client";

import { useParams } from 'next/navigation';
import React from 'react';

import LessonEditor from '@/components/Classroom/Admin/LessonEditor';
import MainLayout from '@/components/layouts/MainLayout';

export default function NewLessonPage() {
  const params = useParams();
  const courseId = params.id as string;

  return (
    <MainLayout activeTab="classroom">
      <div className="container mx-auto px-4 max-w-6xl pt-6 sm:pt-8 pb-10">
        <h1 className="text-2xl font-bold text-white mb-6">Crear Nueva Lección</h1>
        
        <LessonEditor courseId={courseId} />
      </div>
    </MainLayout>
  );
}
