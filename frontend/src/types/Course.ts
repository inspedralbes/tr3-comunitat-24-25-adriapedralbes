export interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  lessons_count: number;
}

export interface CourseDetail extends Course {
  lessons: LessonDetail[];
}

export interface Lesson {
  id: string;
  title: string;
  content: {
    html: string;
    video_url?: string;
  };
  order: number;
  created_at: string;
  updated_at: string;
  course: string;
}

export interface LessonDetail {
  id: string;
  title: string;
  content: {
    html: string;
    video_url?: string;
  };
  order: number;
  created_at: string;
  updated_at: string;
}
