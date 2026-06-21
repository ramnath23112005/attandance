import { Request } from 'express';

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

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttendance {
  _id: string;
  userId: string;
  timetableId: string;
  date: Date;
  day: string;
  period: string;
  subject: string;
  status: AttendanceStatus;
  markedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITimetable {
  _id: string;
  day: string;
  period: string;
  subject: string;
  faculty: string;
  facultyId: string;
  room: string;
  section: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubject {
  _id: string;
  code: string;
  name: string;
  department: string;
  semester: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  leave: number;
  percentage: number;
}

export interface SubjectAttendance {
  subject: string;
  total: number;
  present: number;
  absent: number;
  leave: number;
  percentage: number;
}

export interface WeeklyAttendance {
  week: string;
  startDate: string;
  endDate: string;
  total: number;
  present: number;
  absent: number;
  leave: number;
  percentage: number;
}

export interface MonthlyAttendance {
  month: string;
  year: number;
  total: number;
  present: number;
  absent: number;
  leave: number;
  percentage: number;
}

export interface PredictionResult {
  currentPercentage: number;
  targetPercentage: number;
  present: number;
  total: number;
  lecturesRequired: number;
  lecturesRemaining: number;
  maxSkips: number;
  isOnTrack: boolean;
}
