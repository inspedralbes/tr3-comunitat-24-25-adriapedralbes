"use client";

import React from 'react';
import AdminRoute from '@/components/Auth/AdminRoute';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoute>
      {children}
    </AdminRoute>
  );
}
