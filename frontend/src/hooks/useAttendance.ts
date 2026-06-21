import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../services/attendance.service';
import { MarkAttendancePayload, BulkAttendancePayload, AttendanceStatus } from '../types';

export function useAttendanceStats(userId?: string) {
  return {
    overall: useQuery({
      queryKey: ['attendance', 'overall', userId],
      queryFn: () => attendanceService.getOverallStats(userId),
    }),
    bySubject: useQuery({
      queryKey: ['attendance', 'bySubject', userId],
      queryFn: () => attendanceService.getSubjectStats(userId),
    }),
    weekly: useQuery({
      queryKey: ['attendance', 'weekly', userId],
      queryFn: () => attendanceService.getWeeklyStats(userId),
    }),
    monthly: useQuery({
      queryKey: ['attendance', 'monthly', userId],
      queryFn: () => attendanceService.getMonthlyStats(userId),
    }),
  };
}

export function useAttendanceTrend(userId?: string, months = 6) {
  return useQuery({
    queryKey: ['attendance', 'trend', userId, months],
    queryFn: () => attendanceService.getTrend(userId, months),
  });
}

export function useAttendanceHeatmap(userId?: string, year?: number, month?: number) {
  return useQuery({
    queryKey: ['attendance', 'heatmap', userId, year, month],
    queryFn: () => attendanceService.getHeatmap(userId, year, month),
  });
}

export function useAttendancePrediction(userId?: string, target = 75) {
  return useQuery({
    queryKey: ['attendance', 'prediction', userId, target],
    queryFn: () => attendanceService.getPrediction(userId, target),
  });
}

export function useAttendanceRecords(userId?: string, page = 1, filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['attendance', 'records', userId, page, filters],
    queryFn: () => attendanceService.getByUser(userId, page, 20, filters as Record<string, string>),
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MarkAttendancePayload) => attendanceService.mark(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}

export function useMarkBulkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkAttendancePayload) => attendanceService.markBulk(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AttendanceStatus }) =>
      attendanceService.update(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}
