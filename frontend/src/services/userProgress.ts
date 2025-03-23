import api from './api';
import { MOCK_COURSE_PROGRESS, getMockCourseProgress } from './mockData';

// Flag para habilitar datos mock durante el desarrollo
// Cambiamos a false para usar los datos reales
const USE_MOCK_DATA = false;

// Objeto global para almacenar el estado mock durante la sesión
const mockSessionState: Record<string, CourseProgress> = {};

// Función para actualizar el estado mock
const updateMockState = (courseId: string, lessonId: string, completed: boolean): CourseProgress => {
  // Obtener el estado actual o crear uno nuevo
  if (!mockSessionState[courseId]) {
    mockSessionState[courseId] = {
      ...getMockCourseProgress(courseId)
    };
  }
  
  const courseProgress = mockSessionState[courseId];
  
  // Encontrar la lección a actualizar o añadir una nueva
  const lessonIndex = courseProgress.completed_lessons.findIndex(l => l.lesson_id === lessonId);
  
  if (lessonIndex >= 0) {
    // Actualizar lección existente
    courseProgress.completed_lessons[lessonIndex] = {
      ...courseProgress.completed_lessons[lessonIndex],
      completed,
      completion_date: completed ? new Date().toISOString() : undefined
    };
  } else {
    // Añadir nueva lección
    courseProgress.completed_lessons.push({
      lesson_id: lessonId,
      completed,
      completion_date: completed ? new Date().toISOString() : undefined
    });
  }
  
  // Recalcular el porcentaje de progreso
  const totalLessons = courseProgress.completed_lessons.length;
  const completedLessons = courseProgress.completed_lessons.filter(l => l.completed).length;
  courseProgress.progress_percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  
  // Actualizar fecha de último acceso
  courseProgress.last_accessed_at = new Date().toISOString();
  
  return courseProgress;
};

export interface LessonProgress {
  lesson_id: string;
  completed: boolean;
  completion_date?: string;
  time_spent_seconds?: number;
}

export interface CourseProgress {
  course_id: string;
  progress_percentage: number;
  last_accessed_at: string;
  completed_lessons: LessonProgress[];
}

export interface UpdateLessonProgressPayload {
  lesson_id: string;
  completed: boolean;
  time_spent_seconds?: number;
}

export const userProgressService = {
  // Obtener el progreso del usuario para todos los cursos
  getUserProgress: async (): Promise<CourseProgress[]> => {
    // Si estamos usando datos mock, devolvemos directamente los datos de ejemplo
    if (USE_MOCK_DATA) {
      console.log('Usando datos mock para progreso de usuario');
      // Usar datos de la sesión si hay, o los predeterminados
      const mockData = Object.keys(mockSessionState).length > 0 
        ? Object.values(mockSessionState)
        : MOCK_COURSE_PROGRESS;
      
      return mockData;
    }

    try {
      // Obtener todos los progresos de cursos del usuario
      const response = await api.get('user/courses/progress/');
      
      // Transformar la respuesta del API a nuestro formato CourseProgress
      const courseProgressList: CourseProgress[] = Array.isArray(response) ? response.map(item => ({
        course_id: item.course,
        progress_percentage: item.progress_percentage,
        last_accessed_at: item.last_accessed_at,
        completed_lessons: item.completed_lessons.map((lesson: any) => ({
          lesson_id: lesson.lesson_id,
          completed: lesson.completed,
          completion_date: lesson.completion_date,
          time_spent_seconds: lesson.time_spent_seconds
        }))
      })) : [];
      
      return courseProgressList;
    } catch (error) {
      console.error('Error al obtener el progreso del usuario:', error);
      // Retornar array vacío en vez de propagar el error
      return [];
    }
  },

  // Obtener el progreso del usuario para un curso específico
  getCourseProgress: async (courseId: string): Promise<CourseProgress> => {
    // Si estamos usando datos mock, devolvemos datos de ejemplo para este curso
    if (USE_MOCK_DATA) {
      console.log(`Usando datos mock para progreso del curso ${courseId}`);
      // Usar datos de la sesión si hay, o los predeterminados
      return mockSessionState[courseId] || getMockCourseProgress(courseId);
    }

    try {
      // Obtener progreso del curso desde la API
      const response = await api.get(`user/courses/progress/${courseId}/`);
      
      // Transformar la respuesta a nuestro formato CourseProgress
      const courseProgress: CourseProgress = {
        course_id: response.course,
        progress_percentage: response.progress_percentage,
        last_accessed_at: response.last_accessed_at,
        completed_lessons: response.completed_lessons.map((lesson: any) => ({
          lesson_id: lesson.lesson_id,
          completed: lesson.completed,
          completion_date: lesson.completion_date,
          time_spent_seconds: lesson.time_spent_seconds
        }))
      };
      
      return courseProgress;
    } catch (error) {
      console.error(`Error al obtener el progreso del curso ${courseId}:`, error);
      // Retornar un objeto de progreso vacío en vez de propagar el error
      return {
        course_id: courseId,
        progress_percentage: 0,
        last_accessed_at: new Date().toISOString(),
        completed_lessons: []
      };
    }
  },

  // Actualizar el progreso de una lección
  updateLessonProgress: async (courseId: string, data: UpdateLessonProgressPayload): Promise<LessonProgress> => {
    // Si estamos usando datos mock, simulamos una actualización
    if (USE_MOCK_DATA) {
      console.log(`Simulando actualización de progreso para la lección ${data.lesson_id} del curso ${courseId}`);
      
      // Actualizar el estado mock y persistirlo para esta sesión
      updateMockState(courseId, data.lesson_id, data.completed);
      
      return {
        lesson_id: data.lesson_id,
        completed: data.completed,
        completion_date: data.completed ? new Date().toISOString() : undefined,
        time_spent_seconds: data.time_spent_seconds
      };
    }

    try {
      // Enviar la actualización a la API
      // Si la lección está completada, usamos mark_lesson_complete
      // Si no, usamos mark_lesson_incomplete
      const endpoint = data.completed 
        ? `user/courses/progress/${courseId}/mark_lesson_complete/`
        : `user/courses/progress/${courseId}/mark_lesson_incomplete/`;
      
      const response = await api.post(endpoint, { lesson_id: data.lesson_id });
      
      // Buscar la lección actualizada en la respuesta
      const updatedLesson = response.completed_lessons.find(
        (lesson: any) => lesson.lesson_id === data.lesson_id
      );
      
      if (!updatedLesson) {
        throw new Error('No se recibió información actualizada de la lección');
      }
      
      return {
        lesson_id: updatedLesson.lesson_id,
        completed: updatedLesson.completed,
        completion_date: updatedLesson.completion_date,
        time_spent_seconds: updatedLesson.time_spent_seconds
      };
    } catch (error) {
      console.error('Error al actualizar el progreso de la lección:', error);
      throw error;
    }
  },

  // Marcar una lección como completada
  markLessonAsCompleted: async (courseId: string, lessonId: string): Promise<LessonProgress> => {
    return userProgressService.updateLessonProgress(courseId, {
      lesson_id: lessonId,
      completed: true
    });
  },

  // Marcar una lección como no completada
  markLessonAsNotCompleted: async (courseId: string, lessonId: string): Promise<LessonProgress> => {
    return userProgressService.updateLessonProgress(courseId, {
      lesson_id: lessonId,
      completed: false
    });
  },

  // Actualizar el tiempo transcurrido en una lección
  updateLessonTimeSpent: async (courseId: string, lessonId: string, timeSpentSeconds: number): Promise<LessonProgress> => {
    // Para actualizar el tiempo, necesitamos usar la API de progreso de lecciones directamente
    if (USE_MOCK_DATA) {
      // Simular actualización de tiempo en modo mock
      console.log(`Simulando actualización de tiempo para la lección ${lessonId}: ${timeSpentSeconds} segundos`);
      return {
        lesson_id: lessonId,
        completed: false,
        time_spent_seconds: timeSpentSeconds
      };
    }
    
    try {
      // Primero verificamos si existe un registro para esta lección
      const lessonsResponse = await api.get(`user/lessons/progress/?lesson_id=${lessonId}`);
      
      if (Array.isArray(lessonsResponse) && lessonsResponse.length > 0) {
        // Actualizar registro existente
        const lessonProgress = lessonsResponse[0];
        const updatedResponse = await api.patch(`user/lessons/progress/${lessonProgress.id}/`, {
          time_spent_seconds: timeSpentSeconds
        });
        
        return {
          lesson_id: updatedResponse.lesson,
          completed: updatedResponse.completed,
          completion_date: updatedResponse.completion_date,
          time_spent_seconds: updatedResponse.time_spent_seconds
        };
      } else {
        // Crear nuevo registro
        const response = await api.post('user/lessons/progress/', {
          lesson: lessonId,
          completed: false,
          time_spent_seconds: timeSpentSeconds
        });
        
        return {
          lesson_id: response.lesson,
          completed: response.completed,
          completion_date: response.completion_date,
          time_spent_seconds: response.time_spent_seconds
        };
      }
    } catch (error) {
      console.error(`Error al actualizar tiempo de lección ${lessonId}:`, error);
      throw error;
    }
  }
};

export default userProgressService;
