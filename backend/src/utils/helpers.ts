import { AttendanceStatus } from '../types';

export function getDayName(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100 * 100) / 100;
}

export function getWeekRange(date: Date): { start: Date; end: Date } {
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(date);
  start.setDate(date.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export function getSemesterRange(year: number, semester: number): { start: Date; end: Date } {
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

export function buildAttendanceSummary(records: { status: string }[]) {
  const total = records.length;
  const present = records.filter((r) => r.status === AttendanceStatus.PRESENT).length;
  const absent = records.filter((r) => r.status === AttendanceStatus.ABSENT).length;
  const leave = records.filter((r) => r.status === AttendanceStatus.LEAVE).length;
  const percentage = calculatePercentage(present, total);

  return { total, present, absent, leave, percentage };
}
