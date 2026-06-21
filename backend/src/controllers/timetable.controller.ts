import { Request, Response } from 'express';
import { timetableService } from '../services/timetable.service';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const entry = await timetableService.create(req.body);
  res.status(201).json({ success: true, data: entry });
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const filters = {
    day: req.query.day as string | undefined,
    section: req.query.section as string | undefined,
    facultyId: req.query.facultyId as string | undefined,
  };
  const result = await timetableService.getAll(page, limit, filters);
  res.status(200).json({ success: true, ...result });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const entry = await timetableService.getById(req.params.id);
  res.status(200).json({ success: true, data: entry });
});

export const getByDay = asyncHandler(async (req: Request, res: Response) => {
  const entries = await timetableService.getByDay(req.params.day);
  res.status(200).json({ success: true, data: entries });
});

export const getWeekly = asyncHandler(async (_req: Request, res: Response) => {
  const timetable = await timetableService.getWeeklyTimetable();
  res.status(200).json({ success: true, data: timetable });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const entry = await timetableService.update(req.params.id, req.body);
  res.status(200).json({ success: true, data: entry });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await timetableService.delete(req.params.id);
  res.status(200).json({ success: true, message: 'Timetable entry deleted' });
});
