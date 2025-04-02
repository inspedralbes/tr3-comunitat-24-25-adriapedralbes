import React from 'react';
import EditCourseClient from './client';

interface Params {
  slug: string;
}

export default async function EditCoursePage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const courseId = resolvedParams.slug;
  
  return <EditCourseClient courseId={courseId} />;
}
