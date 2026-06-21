import { Timetable, TimetableDocument } from '../models/Timetable';
import { Subject } from '../models/Subject';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';

export class TimetableService {
  async create(data: {
    day: string;
    period: string;
    periodOrder: number;
    subject: string;
    subjectId: string;
    faculty: string;
    facultyId: string;
    room: string;
    section: string;
    startTime: string;
    endTime: string;
  }) {
    const [subject, faculty] = await Promise.all([
      Subject.findById(data.subjectId),
      User.findById(data.facultyId),
    ]);

    if (!subject) throw ApiError.notFound('Subject not found');
    if (!faculty) throw ApiError.notFound('Faculty not found');

    const existing = await Timetable.findOne({
      day: data.day,
      periodOrder: data.periodOrder,
      section: data.section,
      isActive: true,
    });

    if (existing) {
      throw ApiError.conflict('A timetable entry already exists for this slot');
    }

    return Timetable.create(data);
  }

  async getAll(page = 1, limit = 50, filters?: { day?: string; section?: string; facultyId?: string }) {
    const query: Record<string, unknown> = { isActive: true };

    if (filters?.day) query.day = filters.day;
    if (filters?.section) query.section = filters.section;
    if (filters?.facultyId) query.facultyId = filters.facultyId;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Timetable.find(query)
        .populate('subjectId', 'code name')
        .populate('facultyId', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ day: 1, periodOrder: 1 }),
      Timetable.countDocuments(query),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string) {
    const entry = await Timetable.findById(id)
      .populate('subjectId', 'code name')
      .populate('facultyId', 'name email');
    if (!entry) throw ApiError.notFound('Timetable entry not found');
    return entry;
  }

  async getByDay(day: string) {
    return Timetable.find({ day, isActive: true })
      .populate('subjectId', 'code name')
      .populate('facultyId', 'name email')
      .sort({ periodOrder: 1 });
  }

  async getByFaculty(facultyId: string) {
    return Timetable.find({ facultyId, isActive: true })
      .populate('subjectId', 'code name')
      .sort({ day: 1, periodOrder: 1 });
  }

  async update(id: string, data: Partial<TimetableDocument>) {
    const entry = await Timetable.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!entry) throw ApiError.notFound('Timetable entry not found');
    return entry;
  }

  async delete(id: string) {
    const entry = await Timetable.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!entry) throw ApiError.notFound('Timetable entry not found');
    return entry;
  }

  async getWeeklyTimetable() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const result: Record<string, TimetableDocument[]> = {};

    for (const day of days) {
      result[day] = await Timetable.find({ day, isActive: true })
        .populate('subjectId', 'code name')
        .populate('facultyId', 'name email')
        .sort({ periodOrder: 1 });
    }

    return result;
  }
}

export const timetableService = new TimetableService();
