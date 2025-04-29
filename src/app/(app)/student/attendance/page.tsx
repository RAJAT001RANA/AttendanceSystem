"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { getAttendanceRecords } from '@/lib/attendance';
import type { AttendanceRecord } from '@/types';
import { Loader2 } from 'lucide-react';
import { AttendanceTable } from '@/components/shared/attendance-table';

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (user) {
        setIsLoading(true);
        try {
          const records = await getAttendanceRecords(user.id, user.role);
          setAttendanceRecords(records);
        } catch (error) {
          console.error("Failed to fetch attendance data:", error);
          // Consider adding user feedback here (e.g., using toast)
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchData();
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">My Attendance History</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Records</CardTitle>
          <CardDescription>View your complete attendance history below.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <AttendanceTable records={attendanceRecords} caption="Complete Attendance History" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
