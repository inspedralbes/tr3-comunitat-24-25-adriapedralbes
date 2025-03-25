"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import courseService from '@/services/courses';
import { Lesson } from '@/types/Course';
import MarkdownEditor from './MarkdownEditor/index';

interface LessonEditorProps {
  courseId: string;
  lessonId?: string;  // Opcional - si está presente, es modo edición
  initialData?: Partial<Lesson>;
}

export default function LessonEditor({ courseId, lessonId, initialData }: LessonEditorProps) {
  const router = useRouter();
  const isEditMode = !!lessonId;
  
  // Función para limpiar el contenido contaminado con código JS
  function cleanContentIfNeeded(text: string): string {
    // Si el contenido parece estar contaminado con código JavaScript
    if (text.includes('content: {') && 
        (text.includes('markdownToHtml(content)') || text.includes('extractVideoUrl(content)'))) {
      console.warn('Se detectó código JavaScript en el contenido. Limpiando...');
      
      // Intentar extraer el título (lo que hay después de # )
      const titleMatch = text.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : 'Nuevo contenido';
      
      // Devolver un contenido limpio con solo el título
      return `# ${title}\n\nContenido limpiado automáticamente.`;
    }
    
    return text;
  }
  
  // Convertir HTML a Markdown si hay datos iniciales
  const initialMarkdownContent = initialData?.content?.html 
    ? htmlToMarkdown(initialData.content.html, initialData.content.video_url)
    : '# Nuevo contenido\n\nComienza a escribir aquí...';
    
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(cleanContentIfNeeded(initialMarkdownContent));
  const [order, setOrder] = useState(initialData?.order || 0);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Función para extraer la URL del video desde el markdown
  function extractVideoUrl(markdown: string): string | null {
    // Buscar la URL de YouTube en un iframe
    const youtubeMatch = markdown.match(/src=["']https:\/\/www\.youtube\.com\/embed\/([^"'\s]+)["']/i);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Buscar la URL de Vimeo en un iframe
    const vimeoMatch = markdown.match(/src=["']https:\/\/player\.vimeo\.com\/video\/([^"'\s]+)["']/i);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    return null;
  }
  
  // Función para convertir HTML a Markdown (mejorada)
  function htmlToMarkdown(html: string, videoUrl?: string | null): string {
    // Si tenemos una URL de video directamente, crear un iframe para ella
    if (videoUrl) {
      const iframe = `<iframe src="${videoUrl}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`;
      
      // Si el HTML ya contiene este iframe, no necesitamos hacer nada especial
      if (html.includes(videoUrl)) {
        return processHtmlToMarkdown(html);
      }
      
      // Si no, vamos a agregar el iframe al principio
      return processHtmlToMarkdown(iframe + html);
    }
    
    // Si no tenemos una URL de video directa, procesamos el HTML normalmente
    return processHtmlToMarkdown(html);
  }
  
  // Procesa HTML a Markdown
  function processHtmlToMarkdown(html: string): string {
    // Si el HTML contiene un iframe de video, extráelo primero
    let videoIframe = '';
    
    // Buscar iframe de YouTube
    const youtubeIframeMatch = html.match(/<iframe[^>]*src=["']https:\/\/www\.youtube\.com\/embed\/([^"']+)["'][^>]*><\/iframe>/i);
    if (youtubeIframeMatch) {
      videoIframe = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${youtubeIframeMatch[1]}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }
    
    // Buscar iframe contenido en un div class="video-container"
    const videoContainerMatch = html.match(/<div[^>]*class=["']video-container["'][^>]*>\s*(<iframe[^>]*>[\s\S]*?<\/iframe>)\s*<\/div>/i);
    if (videoContainerMatch && videoContainerMatch[1]) {
      videoIframe = videoContainerMatch[1];
    }
    
    // Buscar cualquier iframe que no hayamos encontrado aún
    if (!videoIframe) {
      const iframeMatch = html.match(/<iframe[^>]*>[\s\S]*?<\/iframe>/i);
      if (iframeMatch) {
        videoIframe = iframeMatch[0];
      }
    }
    
    // Eliminar el iframe del HTML para la conversión normal
    let cleanHtml = html.replace(/<div[^>]*class=["']video-container["'][^>]*>[\s\S]*?<\/div>/g, '');
    cleanHtml = cleanHtml.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/g, '');
    
    // Convertir HTML a Markdown
    let markdown = cleanHtml
      // Encabezados
      .replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1\n\n')
      // Párrafos
      .replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n\n')
      // Formato de texto
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<code[^>]*>(.*?)<\/code>/g, '`$1`')
      // Listas
      .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/g, '$1\n')
      .replace(/<li[^>]*>(.*?)<\/li>/g, '- $1\n')
      // Enlaces
      .replace(/<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g, '[$2]($1)')
      // Saltos de línea
      .replace(/<br\/?>/g, '\n')
      // Bloques de código (pre)
      .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/g, function(match, code) {
        // Eliminar el escape de entidades HTML
        const processedCode = code
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&');
        return '```jsx\n' + processedCode + '\n```\n\n';
      });

    // Limpieza final
    markdown = markdown
      // Eliminar espacios y líneas extras
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Eliminar etiquetas HTML restantes
      .replace(/<\/?[^>]+(>|$)/g, '');
    
    // Si encontramos un video, añadirlo al principio del markdown
    if (videoIframe) {
      // Asegurarse de que el markdown comienza con el título si existe
      const titleMatch = markdown.match(/^#+\s+(.+)$/m);
      if (titleMatch) {
        const title = titleMatch[0];
        const rest = markdown.replace(title, '').trim();
        markdown = title + '\n\n' + videoIframe + '\n\n' + rest;
      } else {
        markdown = videoIframe + '\n\n' + markdown;
      }
    }

    return markdown;
  }
  
  // Función para convertir Markdown a HTML (mejorada)
  function markdownToHtml(markdown: string): string {
    // Buscar y extraer el iframe si existe
    let iframeMatch = markdown.match(/<iframe[^>]*>[\s\S]*?<\/iframe>/i);
    let iframeHtml = '';
    if (iframeMatch) {
      iframeHtml = iframeMatch[0];
      // Eliminar el iframe del markdown para procesarlo separadamente
      markdown = markdown.replace(iframeMatch[0], '');
    }
    
    // Eliminar nuestros marcadores especiales para los videos
    markdown = markdown.replace(/eeeeeeeeeeeee/g, '');
    markdown = markdown.replace(/\*\*eeeeeeeeeeeee\*\*/g, '');
    
    // Procesar el markdown normal
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
      // Código inline
      .replace(/`([^`]+)`/g, '<code class="bg-zinc-800 text-white px-1 py-0.5 rounded">$1</code>')
      // Bloques de código
      .replace(/```([a-z]*)\n([\s\S]*?)```/gm, function(match, lang, code) {
        return `<pre class="bg-zinc-800 p-4 rounded-md overflow-x-auto mb-4"><code class="text-white">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
      })
      // Párrafos (procesamos solo las líneas que no son parte de otros elementos)
      .replace(/^([^<].*?)$/gm, '<p class="text-white mb-4">$1</p>')
      // Eliminar párrafos vacíos
      .replace(/<p[^>]*><\/p>/g, '');
    
    // Manejar contenido HTML embebido (para videos)
    if (iframeHtml) {
      // Buscar donde insertar el iframe
      const h1Match = html.match(/<h1[^>]*>.*?<\/h1>/i);
      if (h1Match) {
        // Insertamos el iframe justo después del título principal
        html = html.replace(h1Match[0], h1Match[0] + iframeHtml);
      } else {
        // Si no hay título, insertamos al principio
        html = iframeHtml + html;
      }
    }
    
    return html;
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
      
      // Limpiar la vista previa de debug del código
      if (content.includes('content: {') && (content.includes('markdownToHtml(content)') || content.includes('extractVideoUrl(content)'))) {
        // Limpiar automáticamente el contenido en lugar de mostrar error
        const cleanedContent = cleanContentIfNeeded(content);
        setContent(cleanedContent);
        setErrorMessage('Se ha detectado y limpiado código JavaScript en el contenido. Por favor revisa el contenido antes de guardar.');
        setSaving(false);
        return;
      }
    
      const lessonData = {
        title,
        content: { 
          html: markdownToHtml(content),
          video_url: extractVideoUrl(content) // Extraer URL del video si existe
        },
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

  const editorPlaceholder = `# Título

Comienza a escribir contenido con formato **Markdown** aquí...

## Ejemplo básico

\`\`\`jsx
// Tu código aquí
const ejemplo = () => {
  return <div>Ejemplo</div>;
};
\`\`\``;

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
          <MarkdownEditor
            value={content}
            onChange={setContent}
            height="500px"
            placeholder={editorPlaceholder}
          />
        </div>
      </form>
    </div>
  );
}
