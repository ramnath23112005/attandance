import { Attendance, AttendanceDocument } from '../models/Attendance';
import { Timetable } from '../models/Timetable';
import { ApiError } from '../utils/ApiError';
import { getDayName, getWeekRange, getMonthRange, buildAttendanceSummary, calculatePercentage } from '../utils/helpers';
import { AttendanceStatus } from '../types';

export class AttendanceService {
  async mark(data: {
    userId: string;
    timetableId: string;
    date: Date;
    status: AttendanceStatus;
    markedBy: string;
  }) {
    const timetable = await Timetable.findById(data.timetableId);
    if (!timetable) throw ApiError.notFound('Timetable entry not found');

    const dateStr = data.date.toISOString().split('T')[0];
    const day = getDayName(data.date);

    const existing = await Attendance.findOne({
      userId: data.userId,
      date: { $gte: new Date(dateStr), $lt: new Date(new Date(dateStr).getTime() + 86400000) },
      period: timetable.period,
    });

    if (existing) {
      throw ApiError.conflict('Attendance already marked for this period');
    }

    return Attendance.create({
      userId: data.userId,
      timetableId: data.timetableId,
      date: data.date,
      day,
      period: timetable.period,
      subject: timetable.subject,
      status: data.status,
      markedBy: data.markedBy,
    });
  }

  async markBulk(data: {
    records: Array<{ userId: string; timetableId: string; status: AttendanceStatus }>;
    date: Date;
    markedBy: string;
  }) {
    const results: AttendanceDocument[] = [];
    const errors: Array<{ userId: string; reason: string }> = [];

    for (const record of data.records) {
      try {
        const result = await this.mark({
          userId: record.userId,
          timetableId: record.timetableId,
          date: data.date,
          status: record.status,
          markedBy: data.markedBy,
        });
        results.push(result);
      } catch (error) {
        errors.push({
          userId: record.userId,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { success: results, errors };
  }

  async update(id: string, status: AttendanceStatus, userId: string) {
    const record = await Attendance.findById(id);
    if (!record) throw ApiError.notFound('Attendance record not found');
    record.status = status;
    await record.save();
    return record;
  }

  async delete(id: string) {
    const record = await Attendance.findByIdAndDelete(id);
    if (!record) throw ApiError.notFound('Attendance record not found');
    return record;
  }

  async getByUser(
    userId: string,
    page = 1,
    limit = 20,
    filters?: { subject?: string; fromDate?: string; toDate?: string }
  ) {
    const query: Record<string, unknown> = { userId };

    if (filters?.subject) query.subject = filters.subject;
    if (filters?.fromDate || filters?.toDate) {
      query.date = {};
      if (filters.fromDate) query.date.$gte = new Date(filters.fromDate);
      if (filters.toDate) query.date.$lte = new Date(filters.toDate);
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Attendance.find(query)
        .populate('timetableId', 'subject room startTime endTime')
        .skip(skip)
        .limit(limit)
        .sort({ date: -1 }),
      Attendance.countDocuments(query),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getByDate(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    return Attendance.find({
      date: { $gte: new Date(dateStr), $lt: new Date(new Date(dateStr).getTime() + 86400000) },
    })
      .populate('userId', 'name email')
      .populate('timetableId', 'subject period room')
      .sort({ period: 1 });
  }

  async getOverallStats(userId: string) {
    const records = await Attendance.find({ userId });
    return buildAttendanceSummary(records);
  }

  async getSubjectStats(userId: string) {
    const records = await Attendance.find({ userId });

    const grouped: Record<string, Array<{ status: string }>> = {};
    for (const r of records) {
      if (!grouped[r.subject]) grouped[r.subject] = [];
      grouped[r.subject].push(r);
    }

    return Object.entries(grouped).map(([subject, subjectRecords]) => ({
      subject,
      ...buildAttendanceSummary(subjectRecords),
    }));
  }

  async getWeeklyStats(userId: string, date: Date = new Date()) {
    const { start, end } = getWeekRange(date);
    const records = await Attendance.find({
      userId,
      date: { $gte: start, $lte: end },
    });

    return {
      weekStart: start.toISOString().split('T')[0],
      weekEnd: end.toISOString().split('T')[0],
      ...buildAttendanceSummary(records),
    };
  }

  async getMonthlyStats(userId: string, date: Date = new Date()) {
    const { start, end } = getMonthRange(date);
    const records = await Attendance.find({
      userId,
      date: { $gte: start, $lte: end },
    });

    return {
      month: date.toLocaleString('default', { month: 'long' }),
      year: date.getFullYear(),
      ...buildAttendanceSummary(records),
    };
  }

  async getSemesterStats(userId: string, year: number, semester: number) {
    const { start, end } = this.getSemesterRange(year, semester);
    const records = await Attendance.find({
      userId,
      date: { $gte: start, $lte: end },
    });

    return {
      year,
      semester,
      ...buildAttendanceSummary(records),
    };
  }

  async getTrend(userId: string, months = 6) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const records = await Attendance.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    const monthlyMap: Record<string, { total: number; present: number }> = {};

    for (const r of records) {
      const key = `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[key]) monthlyMap[key] = { total: 0, present: 0 };
      monthlyMap[key].total++;
      if (r.status === AttendanceStatus.PRESENT) monthlyMap[key].present++;
    }

    return Object.entries(monthlyMap).map(([month, stats]) => ({
      month,
      ...stats,
      percentage: calculatePercentage(stats.present, stats.total),
    }));
  }

  async getHeatmap(userId: string, year: number, month: number) {
    const { start, end } = getMonthRange(new Date(year, month - 1));

    const records = await Attendance.find({
      userId,
      date: { $gte: start, $lte: end },
    });

    const heatmap: Record<string, string> = {};
    for (const r of records) {
      const dateKey = r.date.toISOString().split('T')[0];
      heatmap[dateKey] = r.status;
    }

    return heatmap;
  }

  async getPrediction(userId: string, targetPercentage: number) {
    const stats = await this.getOverallStats(userId);
    const remainingWeeks = 10;
    const lecturesPerWeek = 30;
    const totalRemaining = remainingWeeks * lecturesPerWeek;

    const currentTotal = stats.total;
    const currentPresent = stats.present;

    const requiredToReach = Math.ceil(
      (targetPercentage * (currentTotal + totalRemaining) - 100 * currentPresent) / 100
    );

    const maxSkips = totalRemaining - Math.max(0, requiredToReach);
    const projectedPresent = currentPresent + totalRemaining;
    const projectedTotal = currentTotal + totalRemaining;
    const projectedPercentage = calculatePercentage(projectedPresent, projectedTotal);

    return {
      currentPercentage: stats.percentage,
      targetPercentage,
      present: currentPresent,
      total: currentTotal,
      absent: stats.absent,
      leave: stats.leave,
      lecturesRequired: Math.max(0, requiredToReach),
      lecturesRemaining: totalRemaining,
      maxSkips: Math.max(0, maxSkips),
      isOnTrack: stats.percentage >= targetPercentage,
      projectedPercentage,
      warning: stats.percentage < targetPercentage
        ? `You need to attend ${requiredToReach} out of ${totalRemaining} remaining lectures to reach ${targetPercentage}%`
        : 'You are on track to maintain your attendance target',
    };
  }

  private getSemesterRange(year: number, semester: number): { start: Date; end: Date } {
    if (semester <= 2) {
      return {
        start: new Date(year, 5, 1),
        end: new Date(year, 11, 31, 23, 59, 59, 999),
      };
    }
    return {
      start: new Date(year, 0, 1),
      end: new Date(year, 5, 30, 23, 59, 59, 999),
    };
  }
}

export const attendanceService = new AttendanceService();
