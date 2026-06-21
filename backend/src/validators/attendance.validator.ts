import { z } from 'zod';
import { AttendanceStatus } from '../types';

export const markAttendanceSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  timetableId: z.string().min(1, 'Timetable ID is required'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  status: z.nativeEnum(AttendanceStatus),
});

export const bulkAttendanceSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  records: z
    .array(
      z.object({
        userId: z.string().min(1, 'User ID is required'),
        timetableId: z.string().min(1, 'Timetable ID is required'),
        status: z.nativeEnum(AttendanceStatus),
      })
    )
    .min(1, 'At least one record is required'),
});

export const updateAttendanceSchema = z.object({
  status: z.nativeEnum(AttendanceStatus),
});
