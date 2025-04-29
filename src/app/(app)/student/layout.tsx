"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/shared/protected-route';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  // Protect this entire section, only allow 'student' role
  return (
    <ProtectedRoute allowedRoles={['student']}>
      {children}
    </ProtectedRoute>
  );
}
