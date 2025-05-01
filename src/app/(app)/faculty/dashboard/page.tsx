
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { getAttendanceRecords } from '@/lib/attendance'; // Using the same function, it handles roles
import type { AttendanceRecord } from '@/types';
import { Loader2, Users, CalendarCheck, Activity } from 'lucide-react';
import { AttendanceTable } from '@/components/shared/attendance-table';
import { getTodayDateString } from '@/lib/attendance'; // Import helper
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Label } from "recharts"; // Import Recharts components

export default function FacultyDashboardPage() {
  const { user } = useAuth();
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<{ totalStudents: number; todayPresent: number; todayAbsent: number; todayLate: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (user && user.role === 'faculty') {
        setIsLoading(true);
        try {
          const records = await getAttendanceRecords(user.id, user.role); // Faculty gets all
          setAllAttendance(records);

          // Calculate Stats
          const todayStr = getTodayDateString();
          const todaysRecords = records.filter(r => r.date === todayStr);
          const uniqueStudentIds = new Set(records.map(r => r.studentId)); // Estimate total students from records

          setStats({
            totalStudents: uniqueStudentIds.size, // Basic count based on records seen
            todayPresent: todaysRecords.filter(r => r.status === 'present').length,
            todayAbsent: todaysRecords.filter(r => r.status === 'absent').length,
            todayLate: todaysRecords.filter(r => r.status === 'late').length,
          });

        } catch (error) {
          console.error("Failed to fetch attendance data:", error);
          // Handle error display
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchData();
  }, [user]);

  const recentActivity = allAttendance.slice(0, 7); // Get last 7 records for recent activity

  // Prepare data for the pie chart
  const chartData = React.useMemo(() => {
    if (!stats) return [];
    const totalTodayMarked = stats.todayPresent + stats.todayAbsent + stats.todayLate;
    if (totalTodayMarked === 0) return []; // Avoid division by zero and empty chart

    return [
      { status: 'present', count: stats.todayPresent, fill: "hsl(var(--chart-1))" }, // Greenish
      { status: 'absent', count: stats.todayAbsent, fill: "hsl(var(--chart-2))" }, // Reddish
      { status: 'late', count: stats.todayLate, fill: "hsl(var(--chart-3))" }, // Yellowish
    ].filter(item => item.count > 0); // Only include statuses with counts > 0
  }, [stats]);

  const chartConfig = {
      present: { label: "Present", color: "hsl(var(--chart-1))" },
      absent: { label: "Absent", color: "hsl(var(--chart-2))" },
      late: { label: "Late", color: "hsl(var(--chart-3))" },
  } satisfies ChartConfig;

  const totalTodayStudentsMarked = chartData.reduce((acc, curr) => acc + curr.count, 0);


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Faculty Dashboard</h1>
      <p className="text-muted-foreground">Overview of attendance and recent activity.</p>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
           {stats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalStudents}</div>
                    <p className="text-xs text-muted-foreground">Based on attendance records</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Present</CardTitle>
                    <CalendarCheck className="h-4 w-4" style={{ color: 'hsl(var(--chart-1))' }} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.todayPresent}</div>
                     <p className="text-xs text-muted-foreground">
                      {stats.todayAbsent > 0 || stats.todayLate > 0 ? `+ ${stats.todayAbsent} Absent, ${stats.todayLate} Late` : 'All marked present'}
                    </p>
                </CardContent>
                </Card>
                 <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Absent</CardTitle>
                     <CalendarCheck className="h-4 w-4" style={{ color: 'hsl(var(--chart-2))' }} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.todayAbsent}</div>
                     <p className="text-xs text-muted-foreground">Students marked absent today</p>
                </CardContent>
                </Card>
                 <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Late</CardTitle>
                     <CalendarCheck className="h-4 w-4" style={{ color: 'hsl(var(--chart-3))' }} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.todayLate}</div>
                     <p className="text-xs text-muted-foreground">Students marked late today</p>
                </CardContent>
                </Card>
            </div>
           )}

          <div className="grid gap-6 md:grid-cols-2">
              {/* Attendance Chart */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Today's Attendance Breakdown</CardTitle>
                   <CardDescription>Distribution of Present, Absent, and Late students marked today.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                   {chartData.length > 0 ? (
                     <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel indicator="dot" />}
                            />
                            <Pie
                                data={chartData}
                                dataKey="count"
                                nameKey="status"
                                innerRadius={60}
                                strokeWidth={5}
                            >
                                <Label
                                    content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                        <text
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            <tspan
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            className="fill-foreground text-3xl font-bold"
                                            >
                                            {totalTodayStudentsMarked.toLocaleString()}
                                            </tspan>
                                            <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) + 24}
                                            className="fill-muted-foreground"
                                            >
                                            Marked
                                            </tspan>
                                        </text>
                                        )
                                    }
                                    }}
                                />
                                {chartData.map((entry) => (
                                    <Cell key={`cell-${entry.status}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                   ) : (
                    <div className="flex items-center justify-center h-full py-10">
                        <p className="text-muted-foreground">No attendance marked for today yet.</p>
                    </div>
                   )}
                </CardContent>
              </Card>

             {/* Recent Activity Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Attendance Activity</CardTitle>
                  <CardDescription>Showing the last 7 attendance records marked.</CardDescription>
                </CardHeader>
                <CardContent>
                  <AttendanceTable records={recentActivity} caption="Recent Activity" showStudentName={true}/>
                </CardContent>
              </Card>
          </div>
        </>
      )}
    </div>
  );
}
