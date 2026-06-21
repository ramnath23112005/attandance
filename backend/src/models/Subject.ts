import mongoose, { Schema, Document } from 'mongoose';

export interface SubjectDocument extends Document {
  code: string;
  name: string;
  department: string;
  semester: number;
  isActive: boolean;
}

const subjectSchema = new Schema<SubjectDocument>(
  {
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be at least 1'],
      max: [8, 'Semester must not exceed 8'],
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

subjectSchema.index({ code: 1 });
subjectSchema.index({ department: 1, semester: 1 });

export const Subject = mongoose.model<SubjectDocument>('Subject', subjectSchema);
