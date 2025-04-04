import React from 'react';
import AdminCourseLessonsClient from './client';

interface Params {
  id: string;
}

export default async function AdminCourseLessonsPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const courseId = resolvedParams.id;
  
  return <AdminCourseLessonsClient courseId={courseId} />;
}
