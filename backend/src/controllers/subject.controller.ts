import { Request, Response } from 'express';
import { subjectService } from '../services/subject.service';
import { asyncHandler } from '../utils/asyncHandler';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const subject = await subjectService.create(req.body);
  res.status(201).json({ success: true, data: subject });
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const filters = {
    department: req.query.department as string | undefined,
    semester: req.query.semester ? parseInt(req.query.semester as string) : undefined,
  };
  const result = await subjectService.getAll(page, limit, filters);
  res.status(200).json({ success: true, ...result });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const subject = await subjectService.getById(req.params.id);
  res.status(200).json({ success: true, data: subject });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const subject = await subjectService.update(req.params.id, req.body);
  res.status(200).json({ success: true, data: subject });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await subjectService.delete(req.params.id);
  res.status(200).json({ success: true, message: 'Subject deleted' });
});
