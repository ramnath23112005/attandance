import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Subject } from '../models/Subject';
import { Timetable } from '../models/Timetable';
import { Attendance } from '../models/Attendance';
import { UserRole, AttendanceStatus } from '../types';
import { config } from '../config';
import { asyncHandler } from '../utils/asyncHandler';

export const seedDatabase = asyncHandler(async (_req: Request, res: Response) => {
  await Promise.all([
    User.deleteMany({}),
    Subject.deleteMany({}),
    Timetable.deleteMany({}),
    Attendance.deleteMany({}),
  ]);

  const hashedPassword = await bcrypt.hash('Password123', config.bcrypt.saltRounds);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@attandance.com',
    password: hashedPassword,
    role: UserRole.ADMIN,
    department: 'Administration',
  });

  const faculty1 = await User.create({
    name: 'Dr. Sharma',
    email: 'sharma@attandance.com',
    password: hashedPassword,
    role: UserRole.FACULTY,
    department: 'Computer Science',
  });

  const faculty2 = await User.create({
    name: 'Prof. Patel',
    email: 'patel@attandance.com',
    password: hashedPassword,
    role: UserRole.FACULTY,
    department: 'Electronics',
  });

  const student1 = await User.create({
    name: 'Ramnath G K',
    email: 'ramnath@attandance.com',
    password: hashedPassword,
    role: UserRole.STUDENT,
    department: 'Computer Science',
  });

  const student2 = await User.create({
    name: 'Student User',
    email: 'student@attandance.com',
    password: hashedPassword,
    role: UserRole.STUDENT,
    department: 'Computer Science',
  });

  const subjects = await Subject.insertMany([
    { code: 'EEMI', name: 'Embedded Electronics and Microprocessor Interfacing', department: 'Electronics', semester: 5 },
    { code: 'PE', name: 'Power Electronics', department: 'Electronics', semester: 5 },
    { code: 'MPMC', name: 'Microprocessor and Microcontroller', department: 'Electronics', semester: 5 },
    { code: 'PS-II', name: 'Problem Solving II', department: 'Computer Science', semester: 5 },
    { code: 'EoE', name: 'Essentials of Entrepreneurship', department: 'Management', semester: 5 },
    { code: 'ICS', name: 'Information and Cyber Security', department: 'Computer Science', semester: 5 },
  ]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    { period: 'Lecture 1', startTime: '8:40', endTime: '9:30', order: 1 },
    { period: 'Lecture 2', startTime: '9:30', endTime: '10:20', order: 2 },
    { period: 'Lecture 3', startTime: '10:20', endTime: '11:10', order: 3 },
    { period: 'Lecture 4', startTime: '11:10', endTime: '12:00', order: 4 },
    { period: 'Lecture 5', startTime: '12:00', endTime: '12:50', order: 5 },
    { period: 'Lecture 6', startTime: '12:50', endTime: '14:00', order: 6 },
    { period: 'Lecture 7', startTime: '14:00', endTime: '14:50', order: 7 },
    { period: 'Lecture 8', startTime: '14:50', endTime: '15:40', order: 8 },
  ];

  const timetableData: Array<Record<string, unknown>> = [];
  const daySubjects: Record<string, Array<[string, typeof subjects[0], typeof faculty1 | typeof faculty2]>> = {
    Monday: [['EEMI', subjects[0], faculty2], ['PE', subjects[1], faculty2], ['PS-II', subjects[3], faculty1], ['EoE', subjects[4], faculty1]],
    Tuesday: [['ICS', subjects[5], faculty1], ['EEMI', subjects[0], faculty2], ['PS-II', subjects[3], faculty1], ['MPMC', subjects[2], faculty2]],
    Wednesday: [['MPMC', subjects[2], faculty2], ['EEMI', subjects[0], faculty2], ['PE', subjects[1], faculty2], ['ICS', subjects[5], faculty1]],
    Thursday: [['EEMI', subjects[0], faculty2], ['PE', subjects[1], faculty2], ['PS-II', subjects[3], faculty1], ['EoE', subjects[4], faculty1]],
    Friday: [['MPMC', subjects[2], faculty2], ['PE', subjects[1], faculty2], ['PS-II', subjects[3], faculty1], ['ICS', subjects[5], faculty1]],
  };

  for (const day of days) {
    const subs = daySubjects[day] || [];
    for (let i = 0; i < subs.length; i++) {
      const [subName, sub, fac] = subs[i];
      const slot = timeSlots[i];
      timetableData.push({
        day,
        period: slot.period,
        periodOrder: slot.order,
        subject: subName,
        subjectId: sub._id,
        faculty: fac.name,
        facultyId: fac._id,
        room: i % 2 === 0 ? 'B 301' : 'B 302',
        section: 'A',
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
    }
  }

  const timetables = await Timetable.insertMany(timetableData);

  const today = new Date();
  const attendanceRecords = [];
  const statuses = [AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.LEAVE];

  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
    if (dayName === 'Saturday' || dayName === 'Sunday') continue;

    const dayTimetables = timetables.filter((t) => t.day === dayName);
    for (const tt of dayTimetables) {
      const status = statuses[Math.floor(Math.random() * statuses.length)] as AttendanceStatus;
      attendanceRecords.push({
        userId: student1._id,
        timetableId: tt._id,
        date,
        day: dayName,
        period: tt.period,
        subject: tt.subject,
        status,
        markedBy: faculty1._id,
      });
    }
  }

  if (attendanceRecords.length > 0) {
    await Attendance.insertMany(attendanceRecords);
  }

  res.json({
    success: true,
    message: 'Database seeded successfully',
    data: {
      users: { admin: admin.email, faculty: [faculty1.email, faculty2.email], student: student1.email },
      subjects: subjects.length,
      timetables: timetables.length,
      attendanceRecords: attendanceRecords.length,
    },
  });
});
