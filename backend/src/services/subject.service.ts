import { Subject } from '../models/Subject';
import { ApiError } from '../utils/ApiError';

export class SubjectService {
  async create(data: { code: string; name: string; department: string; semester: number }) {
    const existing = await Subject.findOne({ code: data.code });
    if (existing) throw ApiError.conflict('Subject code already exists');
    return Subject.create(data);
  }

  async getAll(page = 1, limit = 50, filters?: { department?: string; semester?: number }) {
    const query: Record<string, unknown> = { isActive: true };
    if (filters?.department) query.department = filters.department;
    if (filters?.semester) query.semester = filters.semester;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Subject.find(query).skip(skip).limit(limit).sort({ code: 1 }),
      Subject.countDocuments(query),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string) {
    const subject = await Subject.findById(id);
    if (!subject) throw ApiError.notFound('Subject not found');
    return subject;
  }

  async update(id: string, data: Partial<{ code: string; name: string; department: string; semester: number }>) {
    const subject = await Subject.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!subject) throw ApiError.notFound('Subject not found');
    return subject;
  }

  async delete(id: string) {
    const subject = await Subject.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!subject) throw ApiError.notFound('Subject not found');
    return subject;
  }
}

export const subjectService = new SubjectService();
