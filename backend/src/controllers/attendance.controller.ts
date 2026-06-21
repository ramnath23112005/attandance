import { Response } from 'express';
import { attendanceService } from '../services/attendance.service';
import { AuthRequest, AttendanceStatus } from '../types';
import { asyncHandler } from '../utils/asyncHandler';

export const mark = asyncHandler(async (req: AuthRequest, res: Response) => {
  const record = await attendanceService.mark({
    ...req.body,
    date: new Date(req.body.date),
    markedBy: req.user!.userId,
  });
  res.status(201).json({ success: true, data: record });
});

export const markBulk = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await attendanceService.markBulk({
    records: req.body.records,
    date: new Date(req.body.date),
    markedBy: req.user!.userId,
  });
  res.status(201).json({ success: true, data: result });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const record = await attendanceService.update(
    req.params.id,
    req.body.status as AttendanceStatus,
    req.user!.userId
  );
  res.status(200).json({ success: true, data: record });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  await attendanceService.delete(req.params.id);
  res.status(200).json({ success: true, message: 'Attendance record deleted' });
});

export const getByUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.userId || req.user!.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const filters = {
    subject: req.query.subject as string | undefined,
    fromDate: req.query.fromDate as string | undefined,
    toDate: req.query.toDate as string | undefined,
  };
  const result = await attendanceService.getByUser(userId, page, limit, filters);
  res.status(200).json({ success: true, ...result });
});

export const getByDate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const date = new Date(req.query.date as string) || new Date();
  const records = await attendanceService.getByDate(date);
  res.status(200).json({ success: true, data: records });
});

export const getOverallStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.userId || req.user!.userId;
  const stats = await attendanceService.getOverallStats(userId);
  res.status(200).json({ success: true, data: stats });
});

export const getSubjectStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.userId || req.user!.userId;
  const stats = await attendanceService.getSubjectStats(userId);
  res.status(200).json({ success: true, data: stats });
});

export const getWeeklyStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.userId || req.user!.userId;
  const date = req.query.date ? new Date(req.query.date as string) : new Date();
  const stats = await attendanceService.getWeeklyStats(userId, date);
  res.status(200).json({ success: true, data: stats });
});

export const getMonthlyStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.userId || req.user!.userId;
  const date = req.query.date ? new Date(req.query.date as string) : new Date();
  const stats = await attendanceService.getMonthlyStats(userId, date);
  res.status(200).json({ success: true, data: stats });
});

export const getSemesterStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.userId || req.user!.userId;
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const semester = parseInt(req.query.semester as string) || 1;
  const stats = await attendanceService.getSemesterStats(userId, year, semester);
  res.status(200).json({ success: true, data: stats });
});

export const getTrend = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.userId || req.user!.userId;
  const months = parseInt(req.query.months as string) || 6;
  const trend = await attendanceService.getTrend(userId, months);
  res.status(200).json({ success: true, data: trend });
});

export const getHeatmap = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.userId || req.user!.userId;
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
  const heatmap = await attendanceService.getHeatmap(userId, year, month);
  res.status(200).json({ success: true, data: heatmap });
});

export const getPrediction = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.userId || req.user!.userId;
  const targetPercentage = parseFloat(req.query.target as string) || 75;
  const prediction = await attendanceService.getPrediction(userId, targetPercentage);
  res.status(200).json({ success: true, data: prediction });
});
