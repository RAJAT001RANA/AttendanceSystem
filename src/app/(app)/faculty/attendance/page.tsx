"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { getAttendanceRecords } from '@/lib/attendance';
import type { AttendanceRecord } from '@/types';
import { Loader2 } from 'lucide-react';
import { AttendanceTable } from '@/components/shared/attendance-table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react'; // Icon for export

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      clearTimeout(timeout);
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
}


export default function ManageAttendancePage() {
  const { user } = useAuth();
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // 'all', 'present', 'absent', 'late'
  const [dateFilter, setDateFilter] = useState(''); // YYYY-MM-DD

   // Debounced search term update
  const debouncedSetSearchTerm = React.useCallback(debounce(setSearchTerm, 300), []);


  useEffect(() => {
    async function fetchData() {
      if (user && user.role === 'faculty') {
        setIsLoading(true);
        try {
          const records = await getAttendanceRecords(user.id, user.role);
          setAllRecords(records);
          setFilteredRecords(records); // Initially show all
        } catch (error) {
          console.error("Failed to fetch attendance data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchData();
  }, [user]);

   // Filtering logic
  useEffect(() => {
    let result = allRecords;

    // Filter by search term (student name)
    if (searchTerm) {
      result = result.filter(record =>
        record.studentName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
       result = result.filter(record => record.status === statusFilter);
    }

     // Filter by date
    if (dateFilter) {
      result = result.filter(record => record.date === dateFilter);
    }


    setFilteredRecords(result);
  }, [searchTerm, statusFilter, dateFilter, allRecords]);

  const handleExport = () => {
     // Basic CSV export implementation
     if (filteredRecords.length === 0) {
         alert("No data to export.");
         return;
     }

     const headers = ["Student Name", "Date", "Status", "Time Marked"];
     const rows = filteredRecords.map(record => [
         record.studentName,
         record.date,
         record.status,
         new Date(record.timestamp).toLocaleTimeString() // Format time
     ]);

     let csvContent = "data:text/csv;charset=utf-8,"
         + headers.join(",") + "\n"
         + rows.map(e => e.join(",")).join("\n");

     const encodedUri = encodeURI(csvContent);
     const link = document.createElement("a");
     link.setAttribute("href", encodedUri);
     link.setAttribute("download", `attendance_records_${new Date().toISOString().split('T')[0]}.csv`);
     document.body.appendChild(link); // Required for FF

     link.click(); // This will download the data file
     document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <h1 className="text-3xl font-bold text-primary">Manage Attendance</h1>
          <Button onClick={handleExport} variant="outline" size="sm" disabled={isLoading || filteredRecords.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
      </div>


      <Card>
        <CardHeader>
          <CardTitle>All Attendance Records</CardTitle>
          <CardDescription>View, filter, and manage all student attendance records.</CardDescription>
           {/* Filter Controls */}
          <div className="mt-4 flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Filter by student name..."
                onChange={(e) => debouncedSetSearchTerm(e.target.value)}
                className="max-w-sm"
              />
               <Input
                type="date"
                placeholder="Filter by date"
                onChange={(e) => setDateFilter(e.target.value)}
                 className="max-w-[200px]"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                </SelectContent>
              </Select>

          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <AttendanceTable
              records={filteredRecords}
              caption="Filtered Attendance Records"
              showStudentName={true} // Faculty should see names
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
