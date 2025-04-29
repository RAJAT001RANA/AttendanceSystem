import type { AttendanceRecord, UserRole, AttendanceStatus } from '@/types';
import { getUserById } from './auth'; // Assuming you have a way to get user details

// --- Mock Database ---
let mockAttendanceRecords: AttendanceRecord[] = [
  { id: 'att1', studentId: 'student1', studentName: 'Alice Smith', date: '2024-07-26', status: 'present', timestamp: new Date('2024-07-26T09:05:00').getTime() },
  { id: 'att2', studentId: 'student2', studentName: 'Bob Johnson', date: '2024-07-26', status: 'absent', timestamp: new Date('2024-07-26T09:00:00').getTime() },
  { id: 'att3', studentId: 'student1', studentName: 'Alice Smith', date: '2024-07-27', status: 'late', timestamp: new Date('2024-07-27T09:15:00').getTime() },
  { id: 'att4', studentId: 'student2', studentName: 'Bob Johnson', date: '2024-07-27', status: 'present', timestamp: new Date('2024-07-27T08:58:00').getTime() },
];

let nextAttendanceId = 5;

// --- Mock Attendance Functions ---

/**
 * Gets attendance records based on user role.
 * Students get their own records. Faculty gets all records.
 */
export async function getAttendanceRecords(userId: string, userRole: UserRole): Promise<AttendanceRecord[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  if (userRole === 'student') {
    return mockAttendanceRecords.filter(record => record.studentId === userId)
      .sort((a, b) => b.timestamp - a.timestamp); // Sort descending by time
  } else if (userRole === 'faculty') {
    return [...mockAttendanceRecords].sort((a, b) => b.timestamp - a.timestamp); // Return all, sorted
  }
  return []; // Should not happen with valid roles
}

/**
 * Gets attendance records for a specific student (for faculty use).
 */
export async function getStudentAttendance(studentId: string): Promise<AttendanceRecord[]> {
   await new Promise(resolve => setTimeout(resolve, 300));
   return mockAttendanceRecords.filter(record => record.studentId === studentId)
       .sort((a, b) => b.timestamp - a.timestamp);
}


/**
 * Marks attendance for a student on a given date.
 * In a real app, facial recognition would trigger this.
 * Here, we simulate it.
 */
export async function markAttendance(studentId: string, date: string, status: AttendanceStatus): Promise<AttendanceRecord> {
  // Simulate network delay and processing
  await new Promise(resolve => setTimeout(resolve, 600));

  const student = await getUserById(studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  // Check if a record already exists for this student on this date
  const existingRecordIndex = mockAttendanceRecords.findIndex(
    record => record.studentId === studentId && record.date === date
  );

  const newRecord: AttendanceRecord = {
    id: `att${nextAttendanceId++}`,
    studentId: studentId,
    studentName: student.name,
    date: date,
    status: status,
    timestamp: new Date().getTime(), // Use current time for marking
  };

  if (existingRecordIndex > -1) {
    // Update existing record
    mockAttendanceRecords[existingRecordIndex] = { ...mockAttendanceRecords[existingRecordIndex], status: status, timestamp: newRecord.timestamp };
     return mockAttendanceRecords[existingRecordIndex];
  } else {
    // Add new record
    mockAttendanceRecords.push(newRecord);
    return newRecord;
  }
}


// --- Helper Functions ---

export function getTodayDateString(): string {
  const today = new Date();
  // Format as YYYY-MM-DD
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
