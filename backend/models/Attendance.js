const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  day: { type: String, required: true },
  period: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Leave'], required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
