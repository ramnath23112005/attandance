import { apiGet, apiPost, apiPut, apiDelete } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { ApiResponse, Subject, Pagination } from '../types';

class SubjectService {
  async getAll(
    page = 1,
    limit = 50,
    filters?: { department?: string; semester?: number }
  ): Promise<{ data: Subject[]; pagination: Pagination }> {
    const response = await apiGet<Subject[]>(ENDPOINTS.SUBJECTS.BASE, {
      page,
      limit,
      ...filters,
    });
    return response as { data: Subject[]; pagination: Pagination };
  }

  async getById(id: string): Promise<Subject> {
    const response = await apiGet<Subject>(ENDPOINTS.SUBJECTS.BY_ID(id));
    if (!response.data) throw new Error('Subject not found');
    return response.data;
  }

  async create(data: Omit<Subject, '_id' | 'isActive' | 'createdAt' | 'updatedAt'>): Promise<Subject> {
    const response = await apiPost<Subject>(ENDPOINTS.SUBJECTS.BASE, data);
    if (!response.data) throw new Error('Failed to create subject');
    return response.data;
  }

  async update(id: string, data: Partial<Subject>): Promise<Subject> {
    const response = await apiPut<Subject>(ENDPOINTS.SUBJECTS.BY_ID(id), data);
    if (!response.data) throw new Error('Failed to update subject');
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiDelete(ENDPOINTS.SUBJECTS.BY_ID(id));
  }
}

export const subjectService = new SubjectService();
