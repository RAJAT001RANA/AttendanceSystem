"use client";

import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AttendanceRecord } from '@/types';
import { AttendanceStatusBadge } from './attendance-status-badge';
import { format } from 'date-fns';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  caption?: string;
  showStudentName?: boolean; // Option to show student name column (for faculty)
}

export function AttendanceTable({ records, caption = "Attendance Records", showStudentName = false }: AttendanceTableProps) {

  if (!records || records.length === 0) {
    return <p className="text-center text-muted-foreground mt-4">{caption}: No records found.</p>;
  }

  return (
    <Table>
      <TableCaption>{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          {showStudentName && <TableHead>Student Name</TableHead>}
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Time Marked</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record.id}>
             {showStudentName && <TableCell className="font-medium">{record.studentName}</TableCell>}
            <TableCell>{format(new Date(record.date), 'PPP')}</TableCell> {/* Format date nicely */}
            <TableCell>
              <AttendanceStatusBadge status={record.status} />
            </TableCell>
            <TableCell className="text-right">
              {format(new Date(record.timestamp), 'p')} {/* Format time */}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
