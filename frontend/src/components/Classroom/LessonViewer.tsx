"use client";

import React from 'react';
import { Lesson } from '@/types/Course';

interface LessonViewerProps {
  lesson: Lesson;
}

export default function LessonViewer({ lesson }: LessonViewerProps) {
  // Función para aplicar estilos adicionales a los elementos HTML
  const enhanceHtml = (html: string): string => {
    // Añadir clases CSS para mejorar la visualización
    return html
      // Encabezados
      .replace(/<h1>/g, '<h1 class="text-2xl font-bold mb-4 text-white">')
      .replace(/<h2>/g, '<h2 class="text-xl font-bold mb-3 text-white">')
      .replace(/<h3>/g, '<h3 class="text-lg font-bold mb-2 text-white">')
      // Párrafos
      .replace(/<p>/g, '<p class="text-white mb-4">')
      // Listas
      .replace(/<li>/g, '<li class="text-white mb-1">')
      .replace(/<ul>/g, '<ul class="list-disc pl-5 mb-4">')
      .replace(/<ol>/g, '<ol class="list-decimal pl-5 mb-4">')
      // Enlaces
      .replace(/<a /g, '<a class="text-blue-400 hover:underline" ');
  };

  // Renderizar el contenido HTML de la lección
  const renderContent = () => {
    if (!lesson?.content?.html) {
      return <p className="text-gray-400">Esta lección no tiene contenido</p>;
    }

    const enhancedHtml = enhanceHtml(lesson.content.html);
    return <div dangerouslySetInnerHTML={{ __html: enhancedHtml }} />;
  };

  return (
    <div className="lesson-content">
      <h1 className="text-2xl font-bold mb-6 text-white">{lesson.title}</h1>
      <div className="prose prose-invert max-w-none">
        {renderContent()}
      </div>
    </div>
  );
}
