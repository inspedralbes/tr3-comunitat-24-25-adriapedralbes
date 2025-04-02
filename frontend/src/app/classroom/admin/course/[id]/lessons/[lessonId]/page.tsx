import type { Metadata } from 'next';
import EditLessonClient from './client';

export const metadata: Metadata = {
  title: 'Editar Lección',
  description: 'Página para editar una lección del curso',
};

interface Params {
  id: string;
  lessonId: string;
}

export default async function EditLessonPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const { id, lessonId } = resolvedParams;
  return <EditLessonClient courseId={id} lessonId={lessonId} />;
}
