"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/shared/protected-route';

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  // Protect this entire section, only allow 'faculty' role
  return (
    <ProtectedRoute allowedRoles={['faculty']}>
      {children}
    </ProtectedRoute>
  );
}
