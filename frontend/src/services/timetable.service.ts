import { apiGet, apiPost, apiPut, apiDelete } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { ApiResponse, TimetableEntry, WeeklyTimetable, Pagination } from '../types';

class TimetableService {
  async getAll(
    page = 1,
    limit = 50,
    filters?: { day?: string; section?: string; facultyId?: string }
  ): Promise<{ data: TimetableEntry[]; pagination: Pagination }> {
    const response = await apiGet<TimetableEntry[]>(ENDPOINTS.TIMETABLE.BASE, {
      page,
      limit,
      ...filters,
    });
    return response as { data: TimetableEntry[]; pagination: Pagination };
  }

  async getWeekly(): Promise<WeeklyTimetable> {
    const response = await apiGet<WeeklyTimetable>(ENDPOINTS.TIMETABLE.WEEKLY);
    return response.data || {};
  }

  async getByDay(day: string): Promise<TimetableEntry[]> {
    const response = await apiGet<TimetableEntry[]>(ENDPOINTS.TIMETABLE.BY_DAY(day));
    return response.data || [];
  }

  async getById(id: string): Promise<TimetableEntry> {
    const response = await apiGet<TimetableEntry>(ENDPOINTS.TIMETABLE.BY_ID(id));
    if (!response.data) throw new Error('Timetable entry not found');
    return response.data;
  }

  async create(data: Omit<TimetableEntry, '_id' | 'isActive' | 'createdAt' | 'updatedAt'>): Promise<TimetableEntry> {
    const response = await apiPost<TimetableEntry>(ENDPOINTS.TIMETABLE.BASE, data);
    if (!response.data) throw new Error('Failed to create timetable entry');
    return response.data;
  }

  async update(id: string, data: Partial<TimetableEntry>): Promise<TimetableEntry> {
    const response = await apiPut<TimetableEntry>(ENDPOINTS.TIMETABLE.BY_ID(id), data);
    if (!response.data) throw new Error('Failed to update timetable entry');
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiDelete(ENDPOINTS.TIMETABLE.BY_ID(id));
  }
}

export const timetableService = new TimetableService();
