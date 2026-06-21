import { apiGet, apiPost, apiPut, apiDelete } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import {
  ApiResponse,
  AttendanceRecord,
  AttendanceSummary,
  SubjectAttendance,
  WeeklyStats,
  MonthlyStats,
  SemesterStats,
  TrendData,
  HeatmapData,
  PredictionResult,
  MarkAttendancePayload,
  BulkAttendancePayload,
  AttendanceStatus,
  Pagination,
} from '../types';

class AttendanceService {
  async mark(payload: MarkAttendancePayload): Promise<AttendanceRecord> {
    const response = await apiPost<AttendanceRecord>(ENDPOINTS.ATTENDANCE.BASE, payload);
    if (!response.data) throw new Error('Failed to mark attendance');
    return response.data;
  }

  async markBulk(payload: BulkAttendancePayload): Promise<{ success: AttendanceRecord[]; errors: unknown[] }> {
    const response = await apiPost<{ success: AttendanceRecord[]; errors: unknown[] }>(
      ENDPOINTS.ATTENDANCE.BULK,
      payload
    );
    if (!response.data) throw new Error('Bulk marking failed');
    return response.data;
  }

  async update(id: string, status: AttendanceStatus): Promise<AttendanceRecord> {
    const response = await apiPut<AttendanceRecord>(ENDPOINTS.ATTENDANCE.RECORD(id), { status });
    if (!response.data) throw new Error('Failed to update attendance');
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiDelete(ENDPOINTS.ATTENDANCE.RECORD(id));
  }

  async getByUser(
    userId?: string,
    page = 1,
    limit = 20,
    filters?: { subject?: string; fromDate?: string; toDate?: string }
  ): Promise<{ data: AttendanceRecord[]; pagination: Pagination }> {
    const response = await apiGet<AttendanceRecord[]>(ENDPOINTS.ATTENDANCE.BY_USER(userId), {
      page,
      limit,
      ...filters,
    });
    return response as { data: AttendanceRecord[]; pagination: Pagination };
  }

  async getByDate(date: string): Promise<AttendanceRecord[]> {
    const response = await apiGet<AttendanceRecord[]>(ENDPOINTS.ATTENDANCE.BY_DATE, { date });
    return response.data || [];
  }

  async getOverallStats(userId?: string): Promise<AttendanceSummary> {
    const response = await apiGet<AttendanceSummary>(ENDPOINTS.ATTENDANCE.STATS.OVERALL, { userId });
    if (!response.data) throw new Error('Failed to fetch stats');
    return response.data;
  }

  async getSubjectStats(userId?: string): Promise<SubjectAttendance[]> {
    const response = await apiGet<SubjectAttendance[]>(ENDPOINTS.ATTENDANCE.STATS.SUBJECT, { userId });
    return response.data || [];
  }

  async getWeeklyStats(userId?: string, date?: string): Promise<WeeklyStats> {
    const response = await apiGet<WeeklyStats>(ENDPOINTS.ATTENDANCE.STATS.WEEKLY, { userId, date });
    if (!response.data) throw new Error('Failed to fetch weekly stats');
    return response.data;
  }

  async getMonthlyStats(userId?: string, date?: string): Promise<MonthlyStats> {
    const response = await apiGet<MonthlyStats>(ENDPOINTS.ATTENDANCE.STATS.MONTHLY, { userId, date });
    if (!response.data) throw new Error('Failed to fetch monthly stats');
    return response.data;
  }

  async getSemesterStats(userId?: string, year?: number, semester?: number): Promise<SemesterStats> {
    const response = await apiGet<SemesterStats>(ENDPOINTS.ATTENDANCE.STATS.SEMESTER, {
      userId,
      year,
      semester,
    });
    if (!response.data) throw new Error('Failed to fetch semester stats');
    return response.data;
  }

  async getTrend(userId?: string, months = 6): Promise<TrendData[]> {
    const response = await apiGet<TrendData[]>(ENDPOINTS.ATTENDANCE.STATS.TREND, { userId, months });
    return response.data || [];
  }

  async getHeatmap(userId?: string, year?: number, month?: number): Promise<HeatmapData> {
    const response = await apiGet<HeatmapData>(ENDPOINTS.ATTENDANCE.STATS.HEATMAP, {
      userId,
      year,
      month,
    });
    return response.data || {};
  }

  async getPrediction(userId?: string, target = 75): Promise<PredictionResult> {
    const response = await apiGet<PredictionResult>(ENDPOINTS.ATTENDANCE.STATS.PREDICTION, {
      userId,
      target,
    });
    if (!response.data) throw new Error('Failed to fetch prediction');
    return response.data;
  }
}

export const attendanceService = new AttendanceService();
