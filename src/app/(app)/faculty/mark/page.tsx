"use client";

import React, { useState } from 'react';
import { FaceRecognition } from '@/components/shared/face-recognition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, Clock } from 'lucide-react'; // Using UserCheck for confirmed attendance

export default function MarkAttendancePage() {
  const [lastMarked, setLastMarked] = useState<{ id: string; name: string } | null>(null);

  const handleAttendanceMarked = (studentId: string, studentName: string) => {
    setLastMarked({ id: studentId, name: studentName });
     // Optionally, clear after a few seconds
    // setTimeout(() => setLastMarked(null), 5000);
  };

  return (
    <div className="space-y-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-primary text-center">Mark Student Attendance</h1>
      <p className="text-muted-foreground text-center">Use the camera to recognize a student and mark their attendance for today.</p>

      <div className="w-full max-w-lg flex flex-col md:flex-row gap-6">
         {/* Face Recognition Component */}
         <div className="flex-1">
            <FaceRecognition onAttendanceMarked={handleAttendanceMarked} />
         </div>


         {/* Display Last Marked Student (Optional) */}
         <div className="md:w-1/3">
             <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5" /> Last Marked
                    </CardTitle>
                    <CardDescription>Most recently marked student.</CardDescription>
                </CardHeader>
                <CardContent className="min-h-[80px] flex items-center justify-center">
                     {lastMarked ? (
                        <div className="text-center">
                             <UserCheck className="h-8 w-8 mx-auto text-green-500 mb-2" />
                            <p className="font-semibold">{lastMarked.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {lastMarked.id}</p>
                            <p className="text-xs text-muted-foreground">Marked Present</p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No student marked yet.</p>
                    )}
                </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
