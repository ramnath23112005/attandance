import mongoose, { Schema, Document } from 'mongoose';

export interface TimetableDocument extends Document {
  day: string;
  period: string;
  periodOrder: number;
  subject: string;
  subjectId: mongoose.Types.ObjectId;
  faculty: string;
  facultyId: mongoose.Types.ObjectId;
  room: string;
  section: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const timetableSchema = new Schema<TimetableDocument>(
  {
    day: {
      type: String,
      required: [true, 'Day is required'],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    period: {
      type: String,
      required: [true, 'Period is required'],
    },
    periodOrder: {
      type: Number,
      required: [true, 'Period order is required'],
      min: [1, 'Period order must be at least 1'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject ID is required'],
    },
    faculty: {
      type: String,
      required: [true, 'Faculty name is required'],
      trim: true,
    },
    facultyId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty ID is required'],
    },
    room: {
      type: String,
      required: [true, 'Room is required'],
      trim: true,
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

timetableSchema.index({ day: 1, periodOrder: 1 });
timetableSchema.index({ facultyId: 1 });
timetableSchema.index({ subjectId: 1 });
timetableSchema.index({ section: 1 });
timetableSchema.index({ day: 1, facultyId: 1 });

export const Timetable = mongoose.model<TimetableDocument>('Timetable', timetableSchema);
