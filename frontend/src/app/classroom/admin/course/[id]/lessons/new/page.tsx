import React from 'react';
import NewLessonClient from './client';

interface Params {
  id: string;
}

export default async function NewLessonPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const courseId = resolvedParams.id;
  
  return <NewLessonClient courseId={courseId} />;
}
