"use client";

import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Code, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Eye, 
  EyeOff, 
  Heading1, 
  Heading2, 
  Heading3 
} from 'lucide-react';
import VideoButton from './VideoButton';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export default function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder = 'Comienza a escribir contenido con formato **Markdown** aquí...',
  height = '500px'
}: MarkdownEditorProps) {
  const [markdownValue, setMarkdownValue] = useState(value);
  const [showPreview, setShowPreview] = useState(true);
  const [previewHtml, setPreviewHtml] = useState('');
  const [selectedTab, setSelectedTab] = useState<'write' | 'preview'>('write');
  
  // Convertir markdown a HTML para la vista previa
  function markdownToHtml(markdown: string): string {
    try {
      // Extraer el HTML de los videos si existe
      let videoHtml = '';
      let contentWithoutVideo = markdown;
      
      // Extraer HTML de divs de video si existen
      const videoDiv = markdown.match(/<div[^>]*class="?video-container"?[^>]*>[\s\S]*?<\/div>/gi);
      if (videoDiv && videoDiv.length > 0) {
        videoHtml = videoDiv[0];
        // Eliminar el div del contenido para procesarlo por separado
        contentWithoutVideo = markdown.replace(videoDiv[0], '');
      }
      
      // Si no encontramos un div, buscar el iframe directamente
      if (!videoHtml) {
        const iframe = markdown.match(/<iframe[\s\S]*?<\/iframe>/gi);
        if (iframe && iframe.length > 0) {
          videoHtml = iframe[0];
          // Eliminar el iframe del contenido para procesarlo por separado
          contentWithoutVideo = markdown.replace(iframe[0], '');
        }
      }
      
      // Limpiar texto de marcadores (si existe por error)
      contentWithoutVideo = contentWithoutVideo.replace(/eeeeeeeeeeeee/g, '');
      contentWithoutVideo = contentWithoutVideo.replace(/\*\*eeeeeeeeeeeee\*\*/g, '');
      
      // Procesar el markdown normal
      let html = contentWithoutVideo
        // Headers
        .replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold mb-4 text-white">$1</h1>')
        .replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold mb-3 text-white">$1</h2>')
        .replace(/^### (.*?)$/gm, '<h3 class="text-lg font-bold mb-2 text-white">$1</h3>')
        // Estilos de texto
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Párrafos simples (evitando que coincida con otros elementos)
        .replace(/^([^<#`\-\*\d].*?)$/gm, '<p class="text-white mb-4">$1</p>')
        // Código inline
        .replace(/`([^`]+)`/g, '<code class="bg-zinc-800 px-1 py-0.5 rounded text-white">$1</code>')
        // Bloques de código
        .replace(/```([a-z]*)\n([\s\S]*?)```/gm, function(match, lang, code) {
          return `<pre class="bg-zinc-800 p-4 rounded-md overflow-x-auto mb-4"><code class="text-white">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
        })
        // Listas no ordenadas
        .replace(/^- (.*?)$/gm, '<li class="text-white mb-1">$1</li>')
        // Procesamos las listas para agrupar los elementos
        .replace(/(<li[^>]*>.*?<\/li>\n)+/g, function(match) {
          return '<ul class="list-disc pl-5 mb-4">' + match + '</ul>';
        });
      
      // Insertar el video al principio o después del primer encabezado
      if (videoHtml) {
        // Buscar el primer encabezado
        const firstHeading = html.match(/<h[1-3][^>]*>.*?<\/h[1-3]>/i);
        if (firstHeading) {
          // Insertar después del primer encabezado
          html = html.replace(firstHeading[0], `${firstHeading[0]}\n${videoHtml}`);
        } else {
          // Si no hay encabezado, insertar al principio
          html = `${videoHtml}\n${html}`;
        }
      }
      
      return html;
    } catch (e) {
      console.error('Error en markdownToHtml:', e);
      return '<p class="text-red-500">Error al procesar el markdown</p>';
    }
  }
  
  // Actualizar el estado cuando cambia el valor externo
  useEffect(() => {
    setMarkdownValue(value);
  }, [value]);

  // Actualizar la vista previa cuando cambia el markdown
  useEffect(() => {
    try {
      const html = markdownToHtml(markdownValue);
      setPreviewHtml(html);
    } catch (error) {
      console.error('Error al generar la vista previa:', error);
      setPreviewHtml('<p class="text-red-500">Error al generar la vista previa</p>');
    }
  }, [markdownValue]);

  // Manejar cambios en el textarea
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMarkdownValue(newValue);
    onChange(newValue);
  };

  // Insertar formato al texto seleccionado
  const insertFormat = (format: string) => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdownValue.substring(start, end);
    let formattedText = '';
    let cursorOffset = 0;  // Para posicionar el cursor después de la inserción

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        if (!selectedText) cursorOffset = 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        if (!selectedText) cursorOffset = 1;
        break;
      case 'h1':
        formattedText = `# ${selectedText}`;
        if (!selectedText) cursorOffset = 2;
        break;
      case 'h2':
        formattedText = `## ${selectedText}`;
        if (!selectedText) cursorOffset = 3;
        break;
      case 'h3':
        formattedText = `### ${selectedText}`;
        if (!selectedText) cursorOffset = 4;
        break;
      case 'ul':
        formattedText = `- ${selectedText}`;
        if (!selectedText) cursorOffset = 2;
        break;
      case 'ol':
        formattedText = `1. ${selectedText}`;
        if (!selectedText) cursorOffset = 3;
        break;
      case 'code':
        if (selectedText.includes('\n')) {
          formattedText = `\`\`\`jsx\n${selectedText}\n\`\`\``;
          if (!selectedText) cursorOffset = 7; // Posicionar después de ```jsx\n
        } else {
          formattedText = `\`${selectedText}\``;
          if (!selectedText) cursorOffset = 1;
        }
        break;
      case 'link':
        formattedText = `[${selectedText || 'Texto del enlace'}](https://)`;
        if (!selectedText) cursorOffset = 18; // Posicionar después de [ en "Texto del enlace"
        break;
      case 'image':
        formattedText = `![${selectedText || 'Texto alternativo'}](url)`;
        if (!selectedText) cursorOffset = 20; // Posicionar después de ! en "Texto alternativo"
        break;
      default:
        formattedText = selectedText;
    }

    const newValue = markdownValue.substring(0, start) + formattedText + markdownValue.substring(end);
    setMarkdownValue(newValue);
    onChange(newValue);
    
    // Volver a enfocar el textarea y posicionar el cursor adecuadamente
    setTimeout(() => {
      textarea.focus();
      if (!selectedText && cursorOffset > 0) {
        // Si no hay texto seleccionado, posicionar el cursor dentro de las etiquetas
        textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
      } else {
        // Si hay texto seleccionado, seleccionar todo el texto formateado
        textarea.setSelectionRange(start, start + formattedText.length);
      }
    }, 0);
  };

  // Función para insertar HTML de video
  const handleVideoInsert = (videoHtml: string) => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    // Verificar si hay texto seleccionado
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // Insertar el HTML del video
    const newValue = markdownValue.substring(0, start) + videoHtml + markdownValue.substring(end);
    setMarkdownValue(newValue);
    onChange(newValue);
    
    // Actualizar la posición del cursor
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + videoHtml.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  return (
    <div className="markdown-editor-container border border-zinc-700 rounded-lg overflow-hidden bg-zinc-900">
      {/* Barra de herramientas */}
      <div className="markdown-toolbar flex items-center p-2 border-b border-zinc-700 bg-zinc-800 gap-1 flex-wrap">
        <div className="toolbar-group flex items-center border-r border-zinc-600 pr-2 mr-2">
          <button
            type="button"
            className="toolbar-button p-1.5 rounded hover:bg-zinc-700 text-white/80 hover:text-white"
            onClick={() => insertFormat('h1')}
            title="Título grande (H1)"
          >
            <Heading1 size={18} />
          </button>
          <button
            type="button"
            className="toolbar-button p-1.5 rounded hover:bg-zinc-700 text-white/80 hover:text-white"
            onClick={() => insertFormat('h2')}
            title="Subtítulo (H2)"
          >
            <Heading2 size={18} />
          </button>
          <button
            type="button"
            className="toolbar-button p-1.5 rounded hover:bg-zinc-700 text-white/80 hover:text-white"
            onClick={() => insertFormat('h3')}
            title="Subtítulo pequeño (H3)"
          >
            <Heading3 size={18} />
          </button>
        </div>
        
        <div className="toolbar-group flex items-center border-r border-zinc-600 pr-2 mr-2">
          <button
            type="button"
            className="toolbar-button p-1.5 rounded hover:bg-zinc-700 text-white/80 hover:text-white"
            onClick={() => insertFormat('bold')}
            title="Negrita (Ctrl+B)"
          >
            <Bold size={18} />
          </button>
          <button
            type="button"
            className="toolbar-button p-1.5 rounded hover:bg-zinc-700 text-white/80 hover:text-white"
            onClick={() => insertFormat('italic')}
            title="Cursiva (Ctrl+I)"
          >
            <Italic size={18} />
          </button>
        </div>
        
        <div className="toolbar-group flex items-center border-r border-zinc-600 pr-2 mr-2">
          <button
            type="button"
            className="toolbar-button p-1.5 rounded hover:bg-zinc-700 text-white/80 hover:text-white"
            onClick={() => insertFormat('ul')}
            title="Lista con viñetas"
          >
            <List size={18} />
          </button>
          <button
            type="button"
            className="toolbar-button p-1.5 rounded hover:bg-zinc-700 text-white/80 hover:text-white"
            onClick={() => insertFormat('ol')}
            title="Lista numerada"
          >
            <ListOrdered size={18} />
          </button>
        </div>
        
        <div className="toolbar-group flex items-center border-r border-zinc-600 pr-2 mr-2">
          <button
            type="button"
            className="toolbar-button p-1.5 rounded hover:bg-zinc-700 text-white/80 hover:text-white"
            onClick={() => insertFormat('link')}
            title="Insertar enlace"
          >
            <LinkIcon size={18} />
          </button>
          <button
            type="button"
            className="toolbar-button p-1.5 rounded hover:bg-zinc-700 text-white/80 hover:text-white"
            onClick={() => insertFormat('image')}
            title="Insertar imagen"
          >
            <ImageIcon size={18} />
          </button>
          <VideoButton onInsert={handleVideoInsert} />
        </div>
        
        <div className="toolbar-group flex items-center">
          <button
            type="button"
            className="toolbar-button p-1.5 rounded hover:bg-zinc-700 text-white/80 hover:text-white"
            onClick={() => insertFormat('code')}
            title="Insertar código o bloque de código"
          >
            <Code size={18} />
          </button>
        </div>
        
        <div className="ml-auto">
          <button
            type="button"
            className={`toolbar-button p-1.5 rounded flex items-center gap-1 ${showPreview ? 'bg-zinc-700 text-white' : 'text-white/70 hover:text-white hover:bg-zinc-700'}`}
            onClick={() => setShowPreview(!showPreview)}
            title={showPreview ? "Ocultar vista previa" : "Mostrar vista previa"}
          >
            {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
            <span className="text-sm hidden sm:inline">{showPreview ? "Ocultar vista previa" : "Mostrar vista previa"}</span>
          </button>
        </div>
      </div>

      {/* Pestañas (para móvil) */}
      <div className="md:hidden flex border-b border-zinc-700">
        <button
          className={`flex-1 py-2 text-center ${selectedTab === 'write' ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-white/70'}`}
          onClick={() => setSelectedTab('write')}
        >
          Editar
        </button>
        <button
          className={`flex-1 py-2 text-center ${selectedTab === 'preview' ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-white/70'}`}
          onClick={() => setSelectedTab('preview')}
        >
          Vista previa
        </button>
      </div>

      {/* Área de edición y vista previa */}
      <div className={`flex flex-col md:flex-row ${selectedTab === 'preview' ? 'md:flex' : ''}`}>
        {/* Editor */}
        <div 
          className={`flex-1 ${(selectedTab === 'preview' && 'hidden md:block') || (selectedTab === 'write' && 'block')}`}
        >
          <textarea
            id="markdown-editor"
            className="w-full p-4 bg-zinc-900 text-white font-mono resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={markdownValue}
            onChange={handleChange}
            placeholder={placeholder}
            spellCheck="false"
            style={{ height }}
          ></textarea>
        </div>
        
        {/* Vista previa */}
        {showPreview && (
          <div 
            className={`flex-1 border-l border-zinc-700 ${(selectedTab === 'write' && 'hidden md:block') || (selectedTab === 'preview' && 'block')}`}
          >
            <div className="preview-header bg-zinc-800 py-2 px-4 border-b border-zinc-700">
              <h3 className="text-sm font-medium text-white/80">Vista previa</h3>
            </div>
            <div 
              className="preview-content p-4 overflow-y-auto prose prose-invert prose-headings:mt-4 prose-headings:mb-2 max-w-none"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
              style={{ height: `calc(${height} - 36px)` }}
            ></div>
          </div>
        )}
      </div>
      
      {/* Ayuda sobre Markdown */}
      <div className="p-2 border-t border-zinc-700 bg-zinc-800 text-white/60 text-xs">
        <details>
          <summary className="cursor-pointer hover:text-white flex items-center">
            <ChevronDown size={14} className="inline-block mr-1" /> 
            Guía rápida de Markdown
          </summary>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-zinc-700">
            <div>
              <p><code className="bg-zinc-900 px-1 rounded"># Título</code> → Título H1</p>
              <p><code className="bg-zinc-900 px-1 rounded">## Subtítulo</code> → Título H2</p>
              <p><code className="bg-zinc-900 px-1 rounded">**negrita**</code> → <strong>negrita</strong></p>
              <p><code className="bg-zinc-900 px-1 rounded">*cursiva*</code> → <em>cursiva</em></p>
            </div>
            <div>
              <p><code className="bg-zinc-900 px-1 rounded">- elemento</code> → Lista con viñetas</p>
              <p><code className="bg-zinc-900 px-1 rounded">1. elemento</code> → Lista numerada</p>
              <p><code className="bg-zinc-900 px-1 rounded">[enlace](url)</code> → <a href="#" className="text-blue-400">enlace</a></p>
              <p><code className="bg-zinc-900 px-1 rounded">![alt](url)</code> → Imagen</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p><code className="bg-zinc-900 px-1 rounded">`código`</code> → <code className="bg-zinc-900 px-1 rounded">código</code></p>
              <p><code className="bg-zinc-900 px-1 rounded">```jsx ... ```</code> → Bloque de código</p>
              <p>Usa el botón de video para insertar videos</p>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};
