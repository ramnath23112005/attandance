import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.status(200).json({ success: true, data: result });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshToken(refreshToken);
  res.status(200).json({ success: true, data: tokens });
});

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await authService.getProfile(req.user!.userId);
  res.status(200).json({ success: true, data: user });
});

export const getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await authService.getAllUsers(page, limit);
  res.status(200).json({ success: true, ...result });
});
