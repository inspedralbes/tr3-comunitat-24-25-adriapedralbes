"use client";

import React, { useRef } from 'react';
import { Lesson } from '@/types/Course';

interface LessonViewerProps {
  lesson: Lesson;
}

export default function LessonViewer({ lesson }: LessonViewerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
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

  // Renderizar el video si existe
  const renderVideo = () => {
    if (!lesson?.content?.video_url) {
      return null;
    }

    return (
      <div className="mb-8" ref={videoRef}>
        <h2 className="text-xl font-bold mb-3 text-white">Video explicativo</h2>
        <div className="relative aspect-video w-full bg-zinc-900 rounded-lg overflow-hidden">
          <iframe 
            src={lesson.content.video_url} 
            className="absolute inset-0 w-full h-full" 
            title="Video explicativo"
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      </div>
    );
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
        {renderVideo()}
        {renderContent()}
      </div>
    </div>
  );
}
