"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User, Mail } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import type { User as Student } from '@/types'; // Rename User to Student for clarity here
import { getMockUsers } from '@/lib/auth'; // Import function to get mock users

export default function ViewStudentsPage() {
  const { user } = useAuth(); // Faculty user
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      setIsLoading(true);
       try {
         // Fetch mock users using the function
         const allUsers = await getMockUsers();
         // Filter mock users to get only students
         const studentList = allUsers.filter(u => u.role === 'student');
         setStudents(studentList);
       } catch (error) {
          console.error("Failed to fetch students:", error);
          // Optionally, show an error message to the user
       } finally {
            setIsLoading(false);
       }
    }

    if (user && user.role === 'faculty') {
      fetchStudents();
    }
  }, [user]);

   const getInitials = (name: string = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">View Students</h1>
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>A list of all registered students.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
             <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Avatar</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>ID</TableHead>
                    {/* Add more columns as needed, e.g., View Attendance Button */}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.length === 0 ? (
                         <TableRow>
                            <TableCell colSpan={4} className="text-center h-24">
                                No students found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        students.map((student) => (
                        <TableRow key={student.id}>
                             <TableCell>
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={`https://picsum.photos/seed/${student.id}/40/40`} alt={student.name} />
                                    <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                                </Avatar>
                            </TableCell>
                            <TableCell className="font-medium">
                                <User className="inline-block mr-1 h-3.5 w-3.5 align-text-bottom text-muted-foreground" />
                                {student.name}
                            </TableCell>
                            <TableCell>
                                <Mail className="inline-block mr-1 h-3.5 w-3.5 align-text-bottom text-muted-foreground" />
                                {student.email}
                            </TableCell>
                             <TableCell className="text-muted-foreground text-xs">{student.id}</TableCell>
                            {/* Example: Add button to view specific student attendance */}
                            {/* <TableCell><Button variant="outline" size="sm">View Attendance</Button></TableCell> */}
                        </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
