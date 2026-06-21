import mongoose, { Schema, Document } from 'mongoose';
import { AttendanceStatus } from '../types';

export interface AttendanceDocument extends Document {
  userId: mongoose.Types.ObjectId;
  timetableId: mongoose.Types.ObjectId;
  date: Date;
  day: string;
  period: string;
  subject: string;
  status: AttendanceStatus;
  markedBy: mongoose.Types.ObjectId;
}

const attendanceSchema = new Schema<AttendanceDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    timetableId: {
      type: Schema.Types.ObjectId,
      ref: 'Timetable',
      required: [true, 'Timetable ID is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    day: {
      type: String,
      required: [true, 'Day is required'],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    period: {
      type: String,
      required: [true, 'Period is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      required: [true, 'Status is required'],
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Marked by is required'],
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ userId: 1, date: -1 });
attendanceSchema.index({ userId: 1, subject: 1 });
attendanceSchema.index({ date: -1 });
attendanceSchema.index({ userId: 1, date: 1, period: 1 }, { unique: true });
attendanceSchema.index({ timetableId: 1, date: 1 });

export const Attendance = mongoose.model<AttendanceDocument>('Attendance', attendanceSchema);
