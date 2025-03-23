import api from '../api';
import { Course, CourseDetail, Lesson, LessonDetail } from '@/types/Course';

export const courseService = {
  // Get all courses
  getAllCourses: async (): Promise<Course[]> => {
    try {
      const response = await api.get('courses/');
      // Verificar la estructura de la respuesta y asegurarnos de devolver un array
      if (Array.isArray(response)) {
        return response;
      } else if (response && Array.isArray(response.results)) {
        // Si la API devuelve una estructura paginada
        return response.results;
      } else if (response && typeof response === 'object') {
        // En caso de que la API devuelva un objeto con los cursos
        console.warn('Unexpected API response format, trying to extract courses');
        // Intentar buscar un array en alguna propiedad
        const possibleArrays = Object.values(response).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          return possibleArrays[0] as Course[];
        }
      }
      // Si no podemos extraer un array, devolvemos un array vacío
      console.error('Could not extract courses array from API response', response);
      return [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  // Create a new course
  createCourse: async (courseData: Partial<Course>): Promise<Course> => {
    try {
      console.log('Llamando a API para crear curso con datos:', courseData);
      const response = await api.post('courses/', courseData);
      console.log('Respuesta de API al crear curso:', response);
      
      if (response && typeof response === 'object') {
        return response;
      }
      throw new Error('Invalid response from API when creating course');
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  // Update an existing course
  updateCourse: async (id: string, courseData: Partial<Course>): Promise<Course> => {
    try {
      const response = await api.patch(`courses/${id}/`, courseData);
      if (response && typeof response === 'object') {
        return response;
      }
      throw new Error('Invalid response from API when updating course');
    } catch (error) {
      console.error(`Error updating course ${id}:`, error);
      throw error;
    }
  },

  // Delete a course
  deleteCourse: async (id: string): Promise<void> => {
    try {
      await api.delete(`courses/${id}/`);
    } catch (error) {
      console.error(`Error deleting course ${id}:`, error);
      throw error;
    }
  },

  // Get a specific course by ID
  getCourseById: async (id: string): Promise<CourseDetail> => {
    try {
      const response = await api.get(`courses/${id}/`);
      // Verificar que la respuesta es un objeto curso
      if (response && typeof response === 'object') {
        // Asegurarnos de que lessons es un array
        if (response.lessons && !Array.isArray(response.lessons)) {
          console.warn('Lessons property is not an array:', response.lessons);
          response.lessons = [];
        }
        return response;
      }
      throw new Error('Invalid course data returned from API');
    } catch (error) {
      console.error(`Error fetching course ${id}:`, error);
      throw error;
    }
  },

  // Get lessons for a specific course
  getLessonsByCourse: async (courseId: string): Promise<LessonDetail[]> => {
    try {
      const response = await api.get(`courses/${courseId}/lessons/`);
      // Verificar que la respuesta es un array
      if (Array.isArray(response)) {
        return response;
      } else if (response && typeof response === 'object' && Array.isArray(response.results)) {
        // Si la API devuelve una estructura paginada
        return response.results;
      }
      console.error('Unexpected lessons response format:', response);
      return [];
    } catch (error) {
      console.error(`Error fetching lessons for course ${courseId}:`, error);
      throw error;
    }
  },

  // Get specific lesson by ID
  getLessonById: async (id: string): Promise<Lesson> => {
    try {
      const response = await api.get(`lessons/${id}/`);
      // Verificar que la respuesta contiene datos de la lección
      if (response && typeof response === 'object') {
        // Asegurar que content es un objeto
        if (!response.content || typeof response.content !== 'object') {
          response.content = { html: '' };
        }
        return response;
      }
      throw new Error('Invalid lesson data returned from API');
    } catch (error) {
      console.error(`Error fetching lesson ${id}:`, error);
      throw error;
    }
  },
  
  // Alias para getLessonById (para mayor claridad)
  getLesson: async (id: string): Promise<Lesson> => {
    return courseService.getLessonById(id);
  },

  // Create a new lesson
  createLesson: async (lessonData: Partial<Lesson>): Promise<Lesson> => {
    try {
      const response = await api.post('lessons/', lessonData);
      return response;
    } catch (error) {
      console.error('Error creating lesson:', error);
      throw error;
    }
  },

  // Update an existing lesson
  updateLesson: async (id: string, lessonData: Partial<Lesson>): Promise<Lesson> => {
    try {
      const response = await api.patch(`lessons/${id}/`, lessonData);
      return response;
    } catch (error) {
      console.error(`Error updating lesson ${id}:`, error);
      throw error;
    }
  },

  // Delete a lesson
  deleteLesson: async (id: string): Promise<void> => {
    try {
      await api.delete(`lessons/${id}/`);
    } catch (error) {
      console.error(`Error deleting lesson ${id}:`, error);
      throw error;
    }
  }
};

export default courseService;
