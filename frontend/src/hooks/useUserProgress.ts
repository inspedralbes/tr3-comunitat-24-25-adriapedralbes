"use client";

import { useCallback, useEffect, useState } from 'react';

import userProgressService, { CourseProgress, LessonProgress } from '@/services/userProgress';

export const useUserProgress = (courseId?: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  // Función para cargar el progreso del curso
  const loadProgress = useCallback(async () => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`Cargando progreso real del curso ${courseId}...`);
      const courseProgress = await userProgressService.getCourseProgress(courseId);
      
      setProgress(courseProgress);
      setProgressPercentage(courseProgress.progress_percentage || 0);
      
      // Crear conjunto de IDs de lecciones completadas
      const completedIds = new Set(
        courseProgress.completed_lessons
          ?.filter(lp => lp.completed)
          .map(lp => lp.lesson_id) || []
      );
      
      setCompletedLessons(completedIds);
      console.log(`Progreso cargado: ${completedIds.size} lecciones completadas, ${courseProgress.progress_percentage}%`);
    } catch (err) {
      console.error('Error al cargar el progreso del curso:', err);
      setError(err instanceof Error ? err : new Error('Error al cargar el progreso'));
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  // Cargar progreso del usuario al iniciar o cuando cambia el courseId
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Verificar si una lección está completada
  const isLessonCompleted = useCallback((lessonId: string) => {
    return completedLessons.has(lessonId);
  }, [completedLessons]);

  // Marcar una lección como completada
  const markLessonAsCompleted = useCallback(async (lessonId: string) => {
    if (!courseId) return false;
    
    try {
      setIsSaving(true);
      console.log(`Marcando lección ${lessonId} como completada...`);
      
      const result = await userProgressService.markLessonAsCompleted(courseId, lessonId);
      
      // Actualizar estado local inmediatamente para respuesta instantánea en la UI
      const newCompletedLessons = new Set(completedLessons);
      newCompletedLessons.add(lessonId);
      setCompletedLessons(newCompletedLessons);
      
      // Recargar el progreso completo para actualizaciones
      await loadProgress();
      
      console.log(`Lección ${lessonId} marcada como completada.`);
      return true;
    } catch (err) {
      console.error('Error al marcar la lección como completada:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [courseId, completedLessons, loadProgress]);

  // Marcar una lección como no completada
  const markLessonAsNotCompleted = useCallback(async (lessonId: string) => {
    if (!courseId) return false;
    
    try {
      setIsSaving(true);
      console.log(`Marcando lección ${lessonId} como no completada...`);
      
      const result = await userProgressService.markLessonAsNotCompleted(courseId, lessonId);
      
      // Actualizar estado local inmediatamente
      const newCompletedLessons = new Set(completedLessons);
      newCompletedLessons.delete(lessonId);
      setCompletedLessons(newCompletedLessons);
      
      // Recargar el progreso completo
      await loadProgress();
      
      console.log(`Lección ${lessonId} marcada como no completada.`);
      return true;
    } catch (err) {
      console.error('Error al marcar la lección como no completada:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [courseId, completedLessons, loadProgress]);
  
  // Alternar el estado de completado de una lección
  const toggleLessonCompletion = useCallback(async (lessonId: string) => {
    if (isLessonCompleted(lessonId)) {
      return markLessonAsNotCompleted(lessonId);
    } else {
      return markLessonAsCompleted(lessonId);
    }
  }, [isLessonCompleted, markLessonAsCompleted, markLessonAsNotCompleted]);

  // Registrar tiempo pasado en una lección
  const trackLessonTime = useCallback(async (lessonId: string, timeInSeconds: number) => {
    if (!courseId) return;
    
    try {
      await userProgressService.updateLessonTimeSpent(courseId, lessonId, timeInSeconds);
    } catch (err) {
      console.error('Error al registrar tiempo de lección:', err);
    }
  }, [courseId]);

  return {
    loading,
    error,
    progress,
    isSaving,
    progressPercentage,
    completedLessons: Array.from(completedLessons),
    isLessonCompleted,
    markLessonAsCompleted,
    markLessonAsNotCompleted,
    toggleLessonCompletion,
    trackLessonTime,
    refreshProgress: loadProgress
  };
};

export default useUserProgress;
