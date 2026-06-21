import { z } from 'zod';

export const createSubjectSchema = z.object({
  code: z
    .string()
    .min(1, 'Subject code is required')
    .max(20, 'Subject code must not exceed 20 characters'),
  name: z.string().min(1, 'Subject name is required').max(200, 'Subject name must not exceed 200 characters'),
  department: z.string().min(1, 'Department is required'),
  semester: z.number().int().min(1, 'Semester must be at least 1').max(8, 'Semester must not exceed 8'),
});

export const updateSubjectSchema = createSubjectSchema.partial();
