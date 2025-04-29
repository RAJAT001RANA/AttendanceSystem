"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import type { UserRole } from '@/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[]; // Optional: Specify roles that can access
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // If not loading and no user, redirect to login
        router.push('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // If user exists but role is not allowed, redirect based on their role
        toast({
            title: 'Access Denied',
            description: 'You do not have permission to access this page.',
            variant: 'destructive',
        });
        if (user.role === 'faculty') {
            router.push('/faculty/dashboard');
        } else {
            router.push('/student/dashboard');
        }
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading || !user || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    // Show loading indicator while checking auth or if user is null/unauthorized before redirect
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // If user is authenticated and authorized (or no specific roles required), render the children
  return <>{children}</>;
}

// Helper function for toast (consider moving to a utils file)
import { toast as uiToast } from "@/hooks/use-toast";
const toast = uiToast;
