"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import courseService from '@/services/courses';
import { Lesson } from '@/types/Course';

interface LessonEditorProps {
  courseId: string;
  lessonId?: string;  // Opcional - si está presente, es modo edición
  initialData?: Partial<Lesson>;
}

export default function LessonEditor({ courseId, lessonId, initialData }: LessonEditorProps) {
  const router = useRouter();
  const isEditMode = !!lessonId;
  
  // Convertir HTML a Markdown si hay datos iniciales
  const initialMarkdownContent = initialData?.content?.html 
    ? htmlToMarkdown(initialData.content.html)
    : '# Nuevo contenido\n\nComienza a escribir aquí...';
    
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialMarkdownContent);
  const [order, setOrder] = useState(initialData?.order || 0);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Función para convertir HTML a Markdown (simplificada)
  function htmlToMarkdown(html: string): string {
    // Esta es una conversión muy simplificada
    return html
      .replace(/<h1>(.*?)<\/h1>/g, '# $1')
      .replace(/<h2>(.*?)<\/h2>/g, '## $1')
      .replace(/<h3>(.*?)<\/h3>/g, '### $1')
      .replace(/<p>(.*?)<\/p>/g, '$1\n')
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<ul>(.*?)<\/ul>/gs, '$1')
      .replace(/<li>(.*?)<\/li>/g, '- $1\n')
      .replace(/<br\/?>/g, '\n');
  }
  
  // Función para convertir Markdown a HTML (mejorada)
  function markdownToHtml(markdown: string): string {
    // Usamos una función mejorada para mejor formato
    // Procesamos líneas vacías primero para mantener los párrafos separados
    let html = markdown
      // Headers
      .replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold mb-4 text-white">$1</h1>')
      .replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold mb-3 text-white">$1</h2>')
      .replace(/^### (.*?)$/gm, '<h3 class="text-lg font-bold mb-2 text-white">$1</h3>')
      // Listas
      .replace(/^- (.*?)$/gm, '<li class="text-white mb-1">$1</li>')
      // Procesamos las listas para agrupar los elementos
      .replace(/(<li[^>]*>.*?<\/li>\n)+/g, function(match) {
        return '<ul class="list-disc pl-5 mb-4">' + match + '</ul>';
      })
      // Estilos de texto
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Enlaces
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-400 hover:underline">$1</a>')
      // Párrafos (procesamos solo las líneas que no son parte de otros elementos)
      .replace(/^([^<].*?)$/gm, '<p class="text-white mb-4">$1</p>')
      // Eliminar párrafos vacíos
      .replace(/<p[^>]*><\/p>/g, '');
    
    return html;
  }
  
  // Función para renderizar Markdown como HTML en el cliente
  function renderMarkdown(markdown: string): React.ReactNode {
    // Convertir el markdown a HTML
    const html = markdownToHtml(markdown);
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setErrorMessage('El título es obligatorio');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');
    
      // Validar contenido
      if (!content.trim()) {
        setErrorMessage('El contenido de la lección no puede estar vacío');
        return;
      }
    
      const lessonData = {
        title,
        content: { html: markdownToHtml(content) },
        order: Number(order),
        course: courseId
      };

      if (isEditMode) {
        // Modo edición
        await courseService.updateLesson(lessonId, lessonData);
      } else {
        // Modo creación
        await courseService.createLesson(lessonData);
      }

      // Redirigir a la página de administración de lecciones
      router.push(`/classroom/admin/course/${courseId}/lessons`);
    } catch (error: any) {
      console.error('Error saving lesson:', error);
      setErrorMessage(error.message || 'Error al guardar la lección');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.push(`/classroom/admin/course/${courseId}/lessons`)}
          className="text-white/70 hover:text-white flex items-center gap-1"
        >
          <ArrowLeft size={16} />
          <span>Volver a lecciones</span>
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={18} />
          <span>{saving ? 'Guardando...' : 'Guardar Lección'}</span>
        </button>
      </div>
      
      {errorMessage && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-md mb-4">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#323230] rounded-lg p-6 border border-white/10">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-white/70 mb-1">
                Título de la lección
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#1F1F1E] border border-white/10 rounded-md px-4 py-2 text-white"
                placeholder="Introduce el título de la lección"
              />
            </div>
            
            <div>
              <label htmlFor="order" className="block text-white/70 mb-1">
                Orden
              </label>
              <input
                id="order"
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full bg-[#1F1F1E] border border-white/10 rounded-md px-4 py-2 text-white"
                placeholder="Orden de la lección"
                min="0"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-[#323230] rounded-lg p-6 border border-white/10">
          <label className="block text-white/70 mb-3">
            Contenido de la lección
          </label>
          
          {/* Editor Markdown y Vista previa */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white/70 text-sm mb-2">Editor Markdown</h3>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-96 bg-[#1F1F1E] border border-white/10 rounded-md px-4 py-2 text-white font-mono text-sm"
                placeholder="# Título

Comienza a escribir contenido con formato **Markdown** aquí...

- Elemento de lista
- Otro elemento"
              />
            </div>
            
            <div>
              <h3 className="text-white/70 text-sm mb-2">Vista previa</h3>
              <div className="border border-white/10 rounded-md h-96 overflow-auto p-4 bg-[#323230]">
                {content ? (
                  <div className="prose max-w-none prose-invert">
                    {renderMarkdown(content)}
                  </div>
                ) : (
                  <p className="text-gray-400">No hay contenido para mostrar</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
