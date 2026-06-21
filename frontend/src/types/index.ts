export enum UserRole {
  ADMIN = 'admin',
  FACULTY = 'faculty',
  STUDENT = 'student',
}

export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  LEAVE = 'Leave',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    department?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface Subject {
  _id: string;
  code: string;
  name: string;
  department: string;
  semester: number;
  isActive: boolean;
}

export interface TimetableEntry {
  _id: string;
  day: string;
  period: string;
  periodOrder: number;
  subject: string;
  subjectId: Subject | string;
  faculty: string;
  facultyId: User | string;
  room: string;
  section: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface WeeklyTimetable {
  [day: string]: TimetableEntry[];
}

export interface AttendanceRecord {
  _id: string;
  userId: string | User;
  timetableId: string | TimetableEntry;
  date: string;
  day: string;
  period: string;
  subject: string;
  status: AttendanceStatus;
  markedBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  leave: number;
  percentage: number;
}

export interface SubjectAttendance extends AttendanceSummary {
  subject: string;
}

export interface WeeklyStats extends AttendanceSummary {
  weekStart: string;
  weekEnd: string;
}

export interface MonthlyStats extends AttendanceSummary {
  month: string;
  year: number;
}

export interface SemesterStats extends AttendanceSummary {
  year: number;
  semester: number;
}

export interface TrendData {
  month: string;
  total: number;
  present: number;
  percentage: number;
}

export interface HeatmapData {
  [date: string]: string;
}

export interface PredictionResult {
  currentPercentage: number;
  targetPercentage: number;
  present: number;
  total: number;
  absent: number;
  leave: number;
  lecturesRequired: number;
  lecturesRemaining: number;
  maxSkips: number;
  isOnTrack: boolean;
  projectedPercentage: number;
  warning: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: Pagination;
}

export interface MarkAttendancePayload {
  userId: string;
  timetableId: string;
  date: string;
  status: AttendanceStatus;
}

export interface BulkAttendancePayload {
  date: string;
  records: Array<{
    userId: string;
    timetableId: string;
    status: AttendanceStatus;
  }>;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  department?: string;
}
