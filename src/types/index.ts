export type UserRole = 'student' | 'faculty';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // faceDataUri?: string; // Optional: Store face data URI or reference
}

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string; // For easier display
  date: string; // ISO string format (e.g., "2024-07-27")
  status: AttendanceStatus;
  timestamp: number; // Unix timestamp
}
