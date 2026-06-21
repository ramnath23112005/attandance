import { z } from 'zod';

export const createTimetableSchema = z.object({
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
  period: z.string().min(1, 'Period is required'),
  periodOrder: z.number().int().min(1, 'Period order must be at least 1'),
  subject: z.string().min(1, 'Subject is required'),
  subjectId: z.string().min(1, 'Subject ID is required'),
  faculty: z.string().min(1, 'Faculty name is required'),
  facultyId: z.string().min(1, 'Faculty ID is required'),
  room: z.string().min(1, 'Room is required'),
  section: z.string().min(1, 'Section is required'),
  startTime: z.string().regex(/^\d{1,2}:\d{2}$/, 'Start time must be in HH:MM format'),
  endTime: z.string().regex(/^\d{1,2}:\d{2}$/, 'End time must be in HH:MM format'),
});

export const updateTimetableSchema = createTimetableSchema.partial();
