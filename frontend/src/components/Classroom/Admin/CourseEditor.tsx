"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import api from '@/services/api';
import courseService from '@/services/courses';
import { Course } from '@/types/Course';

interface CourseEditorProps {
  courseId?: string;  // Opcional - si está presente, es modo edición
  initialData?: Partial<Course>;
}

export default function CourseEditor({ courseId, initialData }: CourseEditorProps) {
  const router = useRouter();
  const isEditMode = !!courseId;
  
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [progress, setProgress] = useState(initialData?.progress_percentage || 0);
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnail_url || '');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Manejar la carga de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      
      // Mostrar una vista previa
      const reader = new FileReader();
      reader.onload = () => {
        setThumbnailUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
      
      // Log de depuración
      console.log('Enviando datos del curso:', { title, description });
      
      let courseData: any = {
        title,
        description
        // El progreso no se envía ya que se calcula automáticamente
      };

      let newCourseId = courseId;

      if (isEditMode) {
        // Modo edición
        console.log(`Actualizando curso ${courseId}`);
        await courseService.updateCourse(courseId!, courseData);
      } else {
        // Modo creación
        console.log('Creando nuevo curso');
        const newCourse = await courseService.createCourse(courseData);
        console.log('Respuesta al crear curso:', newCourse);
        newCourseId = newCourse.id;
      }

      // Si hay un archivo de thumbnail, cargarlo
      if (thumbnailFile && newCourseId) {
        console.log(`Cargando thumbnail para curso ${newCourseId}`);
        
        try {
          // Usar nuestro servicio de carga de imágenes local
          const { default: imageUploadService } = await import('@/services/imageUpload');
          const uploadResult = await imageUploadService.uploadImage(thumbnailFile, 'course_thumbnail');
          console.log('Thumbnail cargado exitosamente:', uploadResult.url);
          
          // Actualizar el curso con la URL del thumbnail
          // Incluimos el título obligatorio para evitar el error 400
          // Enviar la URL al endpoint específico de upload_thumbnail
          try {
            // Mostrar los datos que vamos a enviar para depuración
            console.log('Enviando URL de thumbnail al servidor:', uploadResult.url);
            
            const formData = new FormData();
            formData.append('thumbnail_url', uploadResult.url);
            
            // Llamar al endpoint específico para thumbnail
            const updateResponse = await api.upload(`courses/${newCourseId}/upload_thumbnail/`, formData);
            
            console.log('Respuesta del servidor al actualizar thumbnail:', updateResponse);
            console.log('Thumbnail actualizado correctamente en el servidor');
          } catch (uploadError) {
            console.error('Error al actualizar thumbnail en el servidor:', uploadError);
          }
          
        } catch (uploadError) {
          console.error('Error al cargar el thumbnail:', uploadError);
          // Continuamos aunque falle la carga del thumbnail
        }
      }

      // Redirigir a la página de administración de cursos
      router.push('/classroom/admin');
    } catch (error: any) {
      console.error('Error saving course:', error);
      setErrorMessage(
        `Error al guardar el curso: ${error.message || 'Error desconocido'}. ` +
        'Verifica los campos e intenta nuevamente.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.push('/classroom/admin')}
          className="text-white/70 hover:text-white flex items-center gap-1"
        >
          <ArrowLeft size={16} />
          <span>Volver a cursos</span>
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={18} />
          <span>{saving ? 'Guardando...' : 'Guardar Curso'}</span>
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
                Título del curso
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#1F1F1E] border border-white/10 rounded-md px-4 py-2 text-white"
                placeholder="Introduce el título del curso"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-white/70 mb-1">
                Descripción
              </label>
              <textarea
                id="description"
                value={description || ''}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#1F1F1E] border border-white/10 rounded-md px-4 py-2 text-white min-h-[100px]"
                placeholder="Introduce una descripción para el curso"
              />
            </div>
            
            <div>
              <label htmlFor="progress" className="block text-white/70 mb-1">
                Progreso (%) - Calculado automáticamente
              </label>
              <p className="text-sm text-white/60 italic mb-2">
                Este valor se calcula automáticamente según el avance del usuario en el curso
              </p>
              <div className="w-full bg-[#1F1F1E] border border-white/10 rounded-md px-4 py-2 text-white">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#2D2D2C] rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="text-zinc-400">{progress}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-white/70 mb-1">
                Imagen de portada
              </label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <label className="flex flex-col items-center justify-center w-full h-32 bg-[#1F1F1E] border border-white/10 border-dashed rounded-md cursor-pointer hover:bg-[#292928]">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-white/50 mb-2" />
                      <p className="text-sm text-white/70">
                        <span className="font-medium">Haz clic para subir</span> o arrastra y suelta
                      </p>
                      <p className="text-xs text-white/50">PNG, JPG (MAX. 2MB)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/png, image/jpeg" 
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                
                {thumbnailUrl && (
                  <div className="w-32 h-32 relative bg-[#1F1F1E] border border-white/10 rounded-md overflow-hidden">
                    <img 
                      src={thumbnailUrl} 
                      alt="Vista previa" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
