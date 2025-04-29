"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { getAttendanceRecords } from '@/lib/attendance';
import { AttendanceRecord } from '@/types';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { AttendanceTable } from '@/components/shared/attendance-table';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<{ present: number; absent: number; late: number; total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (user) {
        setIsLoading(true);
        try {
          const records = await getAttendanceRecords(user.id, user.role);
          // Take the 5 most recent records for the dashboard view
          setRecentAttendance(records.slice(0, 5));

          // Calculate summary
          const presentCount = records.filter(r => r.status === 'present').length;
          const absentCount = records.filter(r => r.status === 'absent').length;
          const lateCount = records.filter(r => r.status === 'late').length;
          setSummary({
            present: presentCount,
            absent: absentCount,
            late: lateCount,
            total: records.length,
           });

        } catch (error) {
          console.error("Failed to fetch attendance data:", error);
          // Handle error display if needed
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchData();
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Welcome, {user?.name}!</h1>
      <p className="text-muted-foreground">Here's a quick overview of your attendance.</p>

       {isLoading ? (
         <div className="flex justify-center items-center py-10">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
       ) : (
       <>
        {/* Attendance Summary Cards */}
         {summary && summary.total > 0 && (
            <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present Days</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.present}</div>
                <p className="text-xs text-muted-foreground">
                  out of {summary.total} recorded days
                </p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.absent}</div>
                 <p className="text-xs text-muted-foreground">
                  out of {summary.total} recorded days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Late Days</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.late}</div>
                 <p className="text-xs text-muted-foreground">
                  out of {summary.total} recorded days
                </p>
              </CardContent>
            </Card>
          </div>
         )}

        {/* Recent Attendance Table */}
        <Card>
            <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
            <CardDescription>Showing your last 5 attendance records.</CardDescription>
            </CardHeader>
            <CardContent>
                 <AttendanceTable records={recentAttendance} caption="Your Recent Attendance" />
            </CardContent>
        </Card>
        </>
       )}
    </div>
  );
}
