"use client";

import React from 'react';
import { Home, CalendarCheck, Users, LogOut, Camera, UserCog } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/auth-context';
import { ProtectedRoute } from '@/components/shared/protected-route';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'; // Import Tooltip components

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Determine sidebar items based on user role
  const sidebarItems = user?.role === 'faculty'
    ? [
        { href: '/faculty/dashboard', label: 'Dashboard', icon: Home },
        { href: '/faculty/attendance', label: 'Manage Attendance', icon: CalendarCheck },
        { href: '/faculty/students', label: 'View Students', icon: Users },
        { href: '/faculty/mark', label: 'Mark Attendance', icon: Camera }, // Added Mark Attendance for Faculty
      ]
    : [
        { href: '/student/dashboard', label: 'My Dashboard', icon: Home },
        { href: '/student/attendance', label: 'My Attendance', icon: CalendarCheck },
        { href: '/student/profile', label: 'My Profile', icon: UserCog }, // Added Profile for Student
      ];

  const getInitials = (name: string = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
     <ProtectedRoute>
      <SidebarProvider defaultOpen>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-3 px-1 py-2">
               {/* Simple Logo Placeholder */}
               <div className="flex items-center justify-center h-8 w-8 rounded-full bg-sidebar-accent text-sidebar-accent-foreground font-bold">
                 FA
               </div>
               <span className="text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                 FaceAttend
               </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      className="justify-start"
                      tooltip={item.label} // Add tooltip text
                    >
                      <Link href={item.href}>
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
             <SidebarMenu>
               <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleLogout}
                    className="justify-start w-full"
                    tooltip="Logout" // Add tooltip text
                  >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
             </SidebarMenu>
            <div className="flex items-center gap-3 p-2 border-t border-sidebar-border mt-2">
               <Tooltip>
                 <TooltipTrigger asChild>
                   <Avatar className="h-8 w-8">
                     {/* Placeholder image or use a real one if available */}
                     <AvatarImage src={`https://picsum.photos/seed/${user?.id}/40/40`} alt={user?.name} />
                     <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                   </Avatar>
                 </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    <p>{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                 </TooltipContent>
               </Tooltip>
              <div className="flex flex-col text-sm group-data-[collapsible=icon]:hidden">
                <span className="font-medium text-sidebar-foreground">{user?.name}</span>
                <span className="text-xs text-sidebar-foreground/70">{user?.email}</span>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6 md:hidden">
             {/* Mobile header: Trigger + Title (optional) */}
             <SidebarTrigger />
             <h1 className="text-xl font-semibold text-primary">FaceAttend</h1>
          </header>
          <main className="flex-1 p-4 sm:p-6">
             {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
