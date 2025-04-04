/**
 * Datos de ejemplo para usar durante el desarrollo mientras el backend
 * implementa los endpoints necesarios.
 */

import { CourseProgress, LessonProgress } from './userProgress';

// Mocks de progreso para lecciones
export const MOCK_LESSON_PROGRESS: Record<string, LessonProgress[]> = {
  // Mock para el curso con ID "1"
  "1": [
    { lesson_id: "1", completed: true, completion_date: "2023-03-24T10:00:00Z" },
    { lesson_id: "2", completed: false },
    { lesson_id: "3", completed: false },
    { lesson_id: "4", completed: false }
  ],
  // Mock para el curso con ID "2"
  "2": [
    { lesson_id: "5", completed: true, completion_date: "2023-03-23T14:30:00Z" },
    { lesson_id: "6", completed: true, completion_date: "2023-03-23T15:45:00Z" },
    { lesson_id: "7", completed: false },
    { lesson_id: "8", completed: false }
  ]
};

// Mocks de progreso para cursos
export const MOCK_COURSE_PROGRESS: CourseProgress[] = [
  {
    course_id: "1",
    progress_percentage: 25,
    last_accessed_at: "2023-03-24T10:30:00Z",
    completed_lessons: MOCK_LESSON_PROGRESS["1"]
  },
  {
    course_id: "2",
    progress_percentage: 50,
    last_accessed_at: "2023-03-23T16:00:00Z",
    completed_lessons: MOCK_LESSON_PROGRESS["2"]
  }
];

// Función para obtener progreso mock de un curso específico
export const getMockCourseProgress = (courseId: string): CourseProgress => {
  const mockCourse = MOCK_COURSE_PROGRESS.find(course => course.course_id === courseId);
  
  if (mockCourse) {
    return mockCourse;
  }
  
  // Si no existe, crear un progreso vacío
  return {
    course_id: courseId,
    progress_percentage: 0,
    last_accessed_at: new Date().toISOString(),
    completed_lessons: []
  };
};

export default {
  MOCK_LESSON_PROGRESS,
  MOCK_COURSE_PROGRESS,
  getMockCourseProgress
};
